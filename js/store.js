// Stanje aplikacije: napredak, streak, ponavljanje s razmakom (Leitner).
import { BOOKS, PATH, GROUPS } from './data.js';

const KEY = 'bknjige.v1';
const INTERVALS = [0, 1, 2, 4, 7, 14, 30]; // dani po kutiji

export const dayStr = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
export const addDays = (str, n) => {
  const [y, m, d] = str.split('-').map(Number);
  return dayStr(new Date(y, m - 1, d + n));
};
export const today = () => dayStr();

const fresh = () => ({
  v: 1,
  done: {},            // id čvora -> datum prvog završetka
  lastNewDay: null,    // dan kad je zadnji put naučena nova lekcija
  books: {},           // indeks knjige -> { box, due }
  streak: { count: 0, last: null },
  day: { date: null, lesson: false, review: false, challenge: false },
  groups: {},          // id skupine -> { stars, crown, typedDay }
  settings: { free: false },
});

let state = fresh();
try {
  const raw = localStorage.getItem(KEY);
  if (raw) state = { ...fresh(), ...JSON.parse(raw) };
} catch { /* bez spremljenog stanja */ }

export const save = () => {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* privatni način */ }
};
export const get = () => state;
export const reset = () => { state = fresh(); save(); };

function rollDay() {
  if (state.day.date !== today()) {
    state.day = { date: today(), lesson: false, review: false, challenge: false };
  }
}

// ---- Put ----
export const knownCount = () => {
  let k = 0;
  for (const n of PATH) if (n.kind === 'learn' && state.done[n.id]) k = Math.max(k, n.to);
  return k;
};
export const nextNode = () => PATH.find((n) => !state.done[n.id]) || null;
export const isLockedToday = (node) =>
  node.kind === 'learn' && !state.settings.free && state.lastNewDay === today();
export const nodeStatus = (node) => {
  if (state.done[node.id]) return 'done';
  const nx = nextNode();
  if (nx && nx.id === node.id) return isLockedToday(node) ? 'tomorrow' : 'open';
  return 'locked';
};

// ---- Dnevni plan ----
export function dayTasks() {
  rollDay();
  const known = knownCount();
  const nx = nextNode();
  return {
    lesson: { applies: !!nx || state.day.lesson, done: state.day.lesson },
    review: { applies: known >= 3, done: state.day.review },
    challenge: { applies: known >= 5, done: state.day.challenge },
  };
}
export const dayComplete = () => Object.values(dayTasks()).every((t) => !t.applies || t.done);

export function currentStreak() {
  const { count, last } = state.streak;
  if (!last) return 0;
  return last === today() || last === addDays(today(), -1) ? count : 0;
}
function bumpStreak() {
  const t = today();
  if (state.streak.last === t) return false;
  state.streak.count = state.streak.last === addDays(t, -1) ? state.streak.count + 1 : 1;
  state.streak.last = t;
  return true;
}

// ---- Ponavljanje ----
export function dueBooks(limit = 8) {
  const t = today();
  const all = Object.entries(state.books).map(([i, b]) => ({ i: +i, ...b }));
  const due = all.filter((b) => b.due <= t).sort((a, b) => (a.due < b.due ? -1 : 1));
  const rest = all.filter((b) => b.due > t).sort((a, b) => a.box - b.box || (a.due < b.due ? -1 : 1));
  return [...due, ...rest].slice(0, limit).map((b) => b.i);
}
export const dueCount = () => Object.values(state.books).filter((b) => b.due <= today()).length;
export const solidCount = () => Object.values(state.books).filter((b) => b.box >= 4).length;

function applyResults(results) {
  const t = today();
  for (const [i, ok] of results) {
    const b = state.books[i];
    if (!b) continue;
    if (ok && b.up === t) continue; // najviše jedno napredovanje dnevno
    b.box = ok ? Math.min(b.box + 1, INTERVALS.length - 1) : 1;
    if (ok) b.up = t;
    b.due = addDays(t, Math.max(1, INTERVALS[b.box]));
  }
}

const setStars = (gid, n) => {
  const g = (state.groups[gid] ||= { stars: 0, crown: false, typedDay: null });
  g.stars = Math.max(g.stars, n);
  return g;
};

// Završetak sesije. Vraća { streakUp, dayDone }.
export function finishSession(session, outcome) {
  rollDay();
  const t = today();
  const wasComplete = dayComplete() && state.streak.last === t;
  const { kind, node } = session;
  if (kind !== 'practice' && kind !== 'type') applyResults(outcome.results);

  if (kind === 'node' && node && !state.done[node.id]) {
    state.done[node.id] = t;
    state.day.lesson = true;
    if (node.kind === 'learn') {
      state.lastNewDay = t;
      for (let i = node.from; i < node.to; i++) {
        state.books[i] ||= { box: 0, due: addDays(t, 1) };
      }
      const g = GROUPS.find((x) => x.id === node.g);
      if (knownCount() >= g.end) setStars(g.id, 1);
    } else if (!node.big) {
      setStars(node.g, 2);
    }
  }
  if (kind === 'review') state.day.review = true;
  if (kind === 'challenge') state.day.challenge = true;
  if (kind === 'type' && session.g && outcome.perfect) {
    const g = setStars(session.g, 3);
    if (g.typedDay && g.typedDay !== t) g.crown = true;
    g.typedDay ||= t;
  }
  let streakUp = false;
  if (dayComplete() && !wasComplete) streakUp = bumpStreak();
  save();
  return { streakUp, dayDone: dayComplete() };
}

export const groupMastery = (gid) => state.groups[gid] || { stars: 0, crown: false };
export const setFree = (v) => { state.settings.free = v; save(); };
export const total = BOOKS.length;
