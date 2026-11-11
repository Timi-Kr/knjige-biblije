import { BOOKS, GROUPS, PATH, OT_END, names } from './data.js';
import * as store from './store.js';
import { IC, stars } from './icons.js';
import {
  runSession, lessonSession, checkSession, reviewSession, challengeSession, practiceSession, typeSession,
} from './exercises.js';

const app = document.getElementById('app');
const tabsEl = document.getElementById('tabs');
const toastEl = document.getElementById('toast');
let tab = 'home';

const TABS = [
  ['home', 'Početna', IC.home], ['path', 'Put', IC.path], ['practice', 'Vježba', IC.spark],
  ['books', 'Knjige', IC.books], ['me', 'Ti', IC.user],
];

const plural = (n, one, few, many) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};
const knjiga = (n) => `${n} ${plural(n, 'knjiga', 'knjige', 'knjiga')}`;

let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('on'), 2200);
}

const hero = (title, sub = '') => `
  <header class="hero small">
    <div class="hero-row"><span class="logo">${IC.logo}</span>${streakPill()}</div>
    <h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}
  </header>`;
const streakPill = () => {
  const n = store.currentStreak();
  return `<span class="streak ${n ? 'on' : ''}" aria-label="Niz: ${n} dana">${IC.flame}<b>${n}</b></span>`;
};

// ---------- Početna ----------
function viewHome() {
  const known = store.knownCount();
  const tasks = store.dayTasks();
  const nx = store.nextNode();
  const st = nx ? store.nodeStatus(nx) : null;
  const h = new Date().getHours();
  const night = h >= 19 || h < 6;

  let lesson;
  if (!nx) lesson = { title: 'Sve lekcije završene', sub: 'Ponavljaj da ostane u glavi', act: '' };
  else if (st === 'tomorrow') lesson = { title: 'Lekcija završena', sub: 'Nova lekcija čeka te sutra', act: '' };
  else if (nx.kind === 'learn') lesson = { title: 'Današnja lekcija', sub: names(nx.from, nx.to).join(', '), act: `node:${nx.id}` };
  else lesson = { title: nx.title, sub: nx.big ? 'Velika provjera' : GROUPS.find((g) => g.id === nx.g).name, act: `node:${nx.id}` };

  const due = store.dueCount();
  const review = tasks.review.applies
    ? { title: 'Ponavljanje', sub: due ? `${knjiga(due)} za ponoviti` : 'Kratko osvježi što znaš', act: 'review' }
    : { title: 'Ponavljanje', sub: 'Otključava se nakon prve lekcije', act: '', locked: true };
  const challenge = tasks.challenge.applies
    ? { title: 'Level Up', sub: 'Redni brojevi i tipkanje napamet', act: 'challenge' }
    : { title: 'Level Up', sub: 'Otključava se nakon druge lekcije', act: '', locked: true };

  const card = (t, done, art) => `
    <button class="card task ${done ? 'done' : ''} ${t.locked ? 'locked' : ''}" data-act="${t.act}" ${t.act ? '' : 'aria-disabled="true"'}>
      <span class="txt"><b>${t.title}</b><span>${t.sub}</span></span>
      <span class="art ${art}">${done ? IC.check : t.locked ? IC.lock : artSvg[art]}</span>
    </button>`;

  const g = nx ? GROUPS.find((x) => x.id === nx.g) : GROUPS[GROUPS.length - 1];
  const gKnown = Math.max(0, Math.min(known, g.end) - g.start);
  const nextUp = known < 66 ? `Sljedeća: ${BOOKS[known].name}` : 'Znaš svih 66 knjiga!';
  const all = store.dayComplete() && store.get().streak.last === store.today();

  return `
  <header class="hero">
    <div class="hero-row"><span class="logo">${IC.logo}</span>${streakPill()}</div>
    <div class="orb">${night ? IC.moon : IC.sun}</div>
    <p class="eyebrow">Znaš po redu</p>
    <h1>${known} <span>/ 66</span></h1>
    <p>${nextUp}</p>
    <div class="meter"><i style="width:${(known / 66) * 100}%"></i></div>
  </header>
  <main class="sheet">
    <h2>Danas</h2>
    ${all ? '<p class="note ok">Dnevni plan je ispunjen. Vidimo se sutra!</p>' : ''}
    ${card(lesson, tasks.lesson.done, 'a-lesson')}
    ${card(review, tasks.review.done, 'a-review')}
    ${card(challenge, tasks.challenge.done, 'a-level')}
    <h2>Nastavi</h2>
    <button class="card cont" data-tab="path" style="--tint:${g.tint}">
      <span class="txt"><b>${g.name}</b><span>${gKnown} od ${knjiga(g.end - g.start)}</span>
        <span class="meter dark"><i style="width:${(gKnown / (g.end - g.start)) * 100}%"></i></span></span>
    </button>
  </main>`;
}

const artSvg = {
  'a-lesson': `<svg viewBox="0 0 80 60" aria-hidden="true"><rect x="8" y="14" width="16" height="40" rx="4" fill="#c8f03c"/><rect x="28" y="6" width="16" height="48" rx="4" fill="#f3bdfb"/><rect x="48" y="20" width="16" height="34" rx="4" fill="#1f2a44"/></svg>`,
  'a-review': `<svg viewBox="0 0 80 60" aria-hidden="true"><circle cx="28" cy="32" r="20" fill="#c8f03c"/><path d="M19 32q4 5 8 0M31 32q4 5 8 0" stroke="#1f2a44" stroke-width="2.500" fill="none" stroke-linecap="round"/><rect x="48" y="30" width="26" height="22" rx="6" fill="#0f8a96"/><path d="M54 40h5M63 40h5" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`,
  'a-level': `<svg viewBox="0 0 80 60" aria-hidden="true"><path d="M12 44 30 22l16 18 18-22" stroke="#cfcfcf" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="1 7"/><circle cx="12" cy="44" r="9" fill="#f3bdfb"/><circle cx="30" cy="22" r="7" fill="#d9d9d9"/><circle cx="46" cy="40" r="7" fill="#d9d9d9"/><circle cx="64" cy="18" r="7" fill="#d9d9d9"/></svg>`,
};

// ---------- Put ----------
function viewPath() {
  const sections = GROUPS.map((g) => {
    const cards = g.nodes.map((n) => {
      const st = store.nodeStatus(n);
      const badge = { done: IC.check, open: IC.play, tomorrow: IC.lock, locked: IC.lock }[st];
      const big = n.kind === 'learn' ? `${n.from + 1}–${n.to}` : IC.star;
      const cap = n.kind === 'learn' ? names(n.from, n.to).join(', ') : n.title;
      return `
        <button class="node ${st} ${n.kind}" data-node="${n.id}" style="--tint:${g.tint}">
          <span class="tile"><span class="num">${big}</span><span class="badge">${badge}</span></span>
          <span class="cap">${cap}${st === 'tomorrow' ? '<small>Sutra</small>' : ''}</span>
        </button>`;
    }).join('');
    return `<section><div class="sec-head"><h3>${g.name}</h3>${stars(store.groupMastery(g.id))}</div>
      <div class="scroller">${cards}</div></section>`;
  }).join('');
  const done = PATH.filter((n) => store.get().done[n.id]).length;
  return hero('Put', `${done} od ${PATH.length} lekcija`) + `<main class="sheet path">${sections}</main>`;
}

// ---------- Vježba ----------
function viewPractice() {
  const row = (title, sub, from, to, gid, m) => `
    <div class="card prac">
      <div class="txt"><b>${title}</b><span>${sub}</span>${m ? stars(m) : ''}</div>
      <div class="acts">
        <button class="pill" data-quiz="${from},${to}" data-title="${title}">Kviz</button>
        <button class="pill dark" data-type="${from},${to},${gid}" data-title="${title}">Upiši napamet</button>
      </div>
    </div>`;
  return hero('Vježba', 'Slobodno, bez utjecaja na dnevni plan') + `
  <main class="sheet">
    <h2>Velike cjeline</h2>
    ${row('Svih 66 knjiga', 'Postanak → Otkrivenje', 0, 66, '')}
    ${row('Stari zavjet', '39 knjiga', 0, OT_END, '')}
    ${row('Novi zavjet', '27 knjiga', OT_END, 66, '')}
    <h2>Po skupinama</h2>
    <p class="note">Treća zvjezdica: upiši skupinu napamet bez pomoći. Kruna: ponovi to neki drugi dan.</p>
    ${GROUPS.map((g) => row(g.name, `${BOOKS[g.start].name} → ${BOOKS[g.end - 1].name}`, g.start, g.end, g.id, store.groupMastery(g.id))).join('')}
  </main>`;
}

// ---------- Knjige ----------
function viewBooks() {
  const known = store.knownCount();
  const grp = (g) => `
    <section class="blist"><h3><i style="background:${g.tint}"></i>${g.name}</h3><ol>
      ${BOOKS.slice(g.start, g.end).map((b) => `<li class="${b.i < known ? 'known' : ''}"><span>${b.n}</span>${b.name}</li>`).join('')}
    </ol></section>`;
  return hero('Knjige', 'Svih 66 po redu') + `
  <main class="sheet">
    <h2>Stari zavjet</h2>${GROUPS.filter((g) => g.t === 'SZ').map(grp).join('')}
    <h2>Novi zavjet</h2>${GROUPS.filter((g) => g.t === 'NZ').map(grp).join('')}
  </main>`;
}

// ---------- Ti ----------
function viewMe() {
  const s = store.get();
  const known = store.knownCount();
  const done = PATH.filter((n) => s.done[n.id]).length;
  const stat = (v, l) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`;
  return hero('Ti', 'Tvoj napredak') + `
  <main class="sheet">
    <div class="stats">
      ${stat(store.currentStreak(), 'dana zaredom')}
      ${stat(`${known}/66`, 'naučeno')}
      ${stat(store.solidCount(), 'čvrsto znaš')}
      ${stat(`${done}/${PATH.length}`, 'lekcija')}
    </div>
    <h2>Skupine</h2>
    ${GROUPS.map((g) => `<div class="card mast">${stars(store.groupMastery(g.id))}<b>${g.name}</b></div>`).join('')}
    <h2>Postavke</h2>
    <label class="card toggle"><span class="txt"><b>Više lekcija dnevno</b><span>Bez čekanja do sutra na novu lekciju</span></span>
      <input type="checkbox" data-free ${s.settings.free ? 'checked' : ''}><i></i></label>
    <button class="pill danger" data-reset>Obriši sav napredak</button>
  </main>`;
}

const VIEWS = { home: viewHome, path: viewPath, practice: viewPractice, books: viewBooks, me: viewMe };

function render(keepScroll = false) {
  const y = window.scrollY;
  app.innerHTML = VIEWS[tab]();
  tabsEl.innerHTML = TABS.map(([id, label, icon]) =>
    `<button data-tab="${id}" class="${id === tab ? 'on' : ''}" ${id === tab ? 'aria-current="page"' : ''}>${icon}<span>${label}</span></button>`).join('');
  window.scrollTo(0, keepScroll ? y : 0);
}

// ---------- Sesije ----------
function start(session) {
  runSession(session, {
    onFinish(sess, outcome) {
      const r = store.finishSession(sess, outcome);
      let note = 'točno iz prve';
      if (sess.kind === 'type') {
        note = outcome.perfect ? 'Sve upisano bez pomoći' : 'Pokušaj bez „Ne znam” za zvjezdicu';
      }
      const extra = r.streakUp ? '<p class="note ok">Dnevni plan je ispunjen!</p>' : '';
      return { streakUp: r.streakUp, streak: store.currentStreak(), note, extra };
    },
    onExit: () => render(true),
  });
}

function startNode(id) {
  const node = PATH.find((n) => n.id === id);
  const st = store.nodeStatus(node);
  if (st === 'locked') return toast('Prvo završi prethodne lekcije');
  if (st === 'tomorrow') return toast('Nova lekcija otključava se sutra');
  start(node.kind === 'learn' ? lessonSession(node) : checkSession(node));
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-tab],[data-act],[data-node],[data-quiz],[data-type],[data-reset]');
  if (!t || t.closest('#session')) return;
  if (t.dataset.tab) { tab = t.dataset.tab; return render(); }
  if (t.dataset.node) return startNode(t.dataset.node);
  if ('act' in t.dataset) {
    const a = t.dataset.act;
    if (a.startsWith('node:')) return startNode(a.slice(5));
    if (a === 'review') return start(reviewSession(store.dueBooks(8), store.knownCount()));
    if (a === 'challenge') return start(challengeSession(store.knownCount()));
    return;
  }
  if (t.dataset.quiz) {
    const [a, b] = t.dataset.quiz.split(',').map(Number);
    return start(practiceSession(a, b, t.dataset.title));
  }
  if (t.dataset.type) {
    const [a, b, g] = t.dataset.type.split(',');
    return start(typeSession(+a, +b, t.dataset.title, g || null));
  }
  if ('reset' in t.dataset && confirm('Stvarno obrisati sav napredak? Ovo se ne može poništiti.')) {
    store.reset(); tab = 'home'; render();
  }
});
document.addEventListener('change', (e) => {
  if (e.target.matches('[data-free]')) store.setFree(e.target.checked);
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && document.getElementById('session').hidden) render(true);
});

render();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
