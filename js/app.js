import { BOOKS, GROUPS, PATH, OT_END, names } from './data.js';
import * as store from './store.js';
import { IC } from './icons.js';
import {
  runSession, lessonSession, checkSession, reviewSession, challengeSession, practiceSession, typeSession,
} from './exercises.js';

const app = document.getElementById('app');
const tabsEl = document.getElementById('tabs');
const toastEl = document.getElementById('toast');
const sheetEl = document.getElementById('sheet');
const themeMeta = document.querySelector('meta[name="theme-color"]');
let tab = 'home';
const PLAIN = ['path', 'practice', 'books']; // tabovi s malim naslovom umjesto obojanog zaglavlja
const topbar = (title) => `<header class="topbar"><h1>${title}</h1></header>`;

// Dan / noć prati postavku sustava: svijetli način = sunce, tamni način = mjesec.
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const forcedSky = new URLSearchParams(location.search).get('sky');
function isNight() {
  return forcedSky ? forcedSky === 'night' : darkQuery.matches;
}
function applySky() {
  const night = isNight();
  const plain = PLAIN.includes(tab);
  document.documentElement.classList.toggle('night', night && !plain);
  document.documentElement.classList.toggle('plain', plain);
  themeMeta.content = document.body.classList.contains('in-session') ? '#4a3550' : plain ? '#ffffff' : night ? '#1f2a44' : '#fdf0e1';
  return night;
}

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
  return `<button class="streak ${n ? 'on' : ''}" data-streak aria-label="Niz: ${n} dana. Otvori pregled niza">${IC.flame}<b>${n}</b></button>`;
};

// ---------- Početna ----------
function viewHome() {
  const known = store.knownCount();
  const tasks = store.dayTasks();
  const nx = store.nextNode();
  const st = nx ? store.nodeStatus(nx) : null;
  const night = isNight();

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

  const card = (t, done, icon) => `
    <button class="card task ${done ? 'done' : ''} ${t.locked ? 'locked' : ''}" data-act="${t.act}" ${t.act ? '' : 'aria-disabled="true"'}>
      <span class="ico">${icon}</span>
      <span class="txt"><b>${t.title}</b><span>${t.sub}</span></span>
      ${done || t.locked ? `<span class="art">${done ? IC.check : IC.lock}</span>` : ''}
    </button>`;

  const g = nx ? GROUPS.find((x) => x.id === nx.g) : GROUPS[GROUPS.length - 1];
  const gKnown = Math.max(0, Math.min(known, g.end) - g.start);
  const nextUp = known < 66 ? `Sljedeća: ${BOOKS[known].name}` : 'Znaš svih 66 knjiga!';
  const all = store.dayComplete() && store.get().streak.last === store.today();

  return `
  <header class="hero">
    <div class="hero-row"><span class="logo">${IC.logo}</span>${streakPill()}</div>
    ${SCENE}
    <div class="orb">${night ? IC.moon : IC.sun}</div>
    <p class="eyebrow">Znaš po redu</p>
    <h1>${known} <span>/ 66</span></h1>
    <p>${nextUp}</p>
    <div class="meter"><i style="width:${(known / 66) * 100}%"></i></div>
  </header>
  <main class="sheet">
    <h2>Danas</h2>
    ${all ? '<p class="note ok">Dnevni plan je ispunjen. Vidimo se sutra!</p>' : ''}
    ${card(lesson, tasks.lesson.done, IC.spark)}
    ${card(review, tasks.review.done, IC.star5)}
    ${card(challenge, tasks.challenge.done, IC.crownO)}
    <h2>Nastavi</h2>
    <button class="card cont" data-tab="path" style="--tint:${g.tint}">
      <span class="txt"><b>${g.name}</b><span>${gKnown} od ${knjiga(g.end - g.start)}</span>
        <span class="meter dark"><i style="width:${(gKnown / (g.end - g.start)) * 100}%"></i></span></span>
    </button>
  </main>`;
}

// Oblaci (i zvijezde noću) iza sunca / mjeseca.
const SCENE = `<svg class="scene" viewBox="0 0 390 110" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <g class="cloud" stroke-width="15" stroke-linecap="round"><path d="M88 22h36M34 50h70M20 76h10M58 76h44"/><path d="M294 24h66M318 50h44M278 50h10M308 74h14"/></g>
  <g class="stars"><circle cx="150" cy="16" r="2"/><circle cx="248" cy="30" r="1.600"/><circle cx="132" cy="84" r="1.600"/><circle cx="262" cy="88" r="2"/><circle cx="200" cy="4" r="1.400"/></g>
</svg>`;

// ---------- Put ----------
const WAVE = [0, 40, 62, 40, 0, -40, -62, -40];
function viewPath() {
  let k = 0;
  const sections = GROUPS.map((g, gi) => {
    const nodes = g.nodes.map((n) => {
      const st = store.nodeStatus(n);
      const type = n.kind === 'learn' ? IC.book : n.big ? IC.crown : IC.star;
      const icon = st === 'done' ? IC.check : st === 'tomorrow' ? IC.lock : type;
      const cap = n.kind === 'learn' ? names(n.from, n.to).join(', ').replace(/\. /g, '.\u00a0') : n.title;
      const label = n.kind === 'learn' ? `Lekcija: ${cap}` : cap;
      const x = WAVE[k++ % WAVE.length];
      const bub = st === 'open' ? '<span class="bub">Počni</span>' : st === 'tomorrow' ? '<span class="bub wait">Sutra</span>' : '';
      return `
        <button class="pn ${st} ${n.kind} ${n.big ? 'big' : ''} ${x < 0 ? 'capr' : 'capl'}" data-node="${n.id}" style="--x:${x}px" aria-label="${label}">
          ${bub}<span class="coin">${icon}</span><span class="cap">${cap}</span>
        </button>`;
    }).join('');
    return `<section class="unit" style="--tint:${g.tint}">
      <div class="unit-head"><div><small>Skupina ${gi + 1} · ${g.t === 'SZ' ? 'Stari zavjet' : 'Novi zavjet'}</small><b>${g.name}</b></div></div>
      <div class="trail">${nodes}</div></section>`;
  }).join('');
  return topbar('Put') + `<main class="sheet flat path">${sections}</main>`;
}

// ---------- Niz (bottom sheet) ----------
const MONTHS = ['Siječanj', 'Veljača', 'Ožujak', 'Travanj', 'Svibanj', 'Lipanj', 'Srpanj', 'Kolovoz', 'Rujan', 'Listopad', 'Studeni', 'Prosinac'];
let calY, calM;
const dana = (n) => `${n} ${plural(n, 'dan', 'dana', 'dana')}`;

function streakSheet() {
  const n = store.currentStreak();
  const today = store.today();
  const doneToday = store.dayLevel(today) === 2;
  const tip = doneToday ? 'Današnji plan je ispunjen. Niz je siguran do sutra.'
    : n ? 'Riješi današnji plan da produžiš niz.' : 'Riješi današnji plan i započni niz.';

  const first = new Date(calY, calM, 1);
  const lead = (first.getDay() + 6) % 7; // ponedjeljak prvi
  const count = new Date(calY, calM + 1, 0).getDate();
  const key = (d) => store.dayStr(new Date(calY, calM, d));
  let cells = '<i></i>'.repeat(lead);
  for (let d = 1; d <= count; d++) {
    const ds = key(d), lv = store.dayLevel(ds), col = (lead + d - 1) % 7;
    const cls = [];
    if (lv === 2) {
      cls.push('full');
      if (d > 1 && col > 0 && store.dayLevel(key(d - 1)) === 2) cls.push('jl');
      if (d < count && col < 6 && store.dayLevel(key(d + 1)) === 2) cls.push('jr');
    } else if (lv === 1) cls.push('some');
    if (ds === today) cls.push('today');
    if (ds > today) cls.push('future');
    cells += `<i class="${cls.join(' ')}"><b>${d}</b></i>`;
  }
  const now = new Date();
  const atNow = calY === now.getFullYear() && calM === now.getMonth();
  const weeks = store.perfectWeeks();

  return `
  <div class="sh-back" data-close></div>
  <div class="sh-card" role="dialog" aria-modal="true" aria-label="Pregled niza">
    <button class="sh-x" data-close aria-label="Zatvori">${IC.close}</button>
    <div class="sh-top ${n ? 'on' : ''}">
      <div><b class="sh-num">${n}</b><span class="sh-lab">${plural(n, 'dan', 'dana', 'dana')} zaredom</span></div>${IC.flame}
    </div>
    <p class="sh-tip">${IC.bulb}<span>${tip}</span></p>
    <h3>Kalendar</h3>
    <div class="cal">
      <div class="cal-nav">
        <button data-month="-1" aria-label="Prethodni mjesec">${IC.left}</button>
        <b>${MONTHS[calM]} ${calY}</b>
        <button data-month="1" aria-label="Sljedeći mjesec" ${atNow ? 'disabled' : ''}>${IC.right}</button>
      </div>
      <div class="cal-grid head">${['P', 'U', 'S', 'Č', 'P', 'S', 'N'].map((d) => `<span>${d}</span>`).join('')}</div>
      <div class="cal-grid">${cells}</div>
      <p class="cal-key"><span class="k full"></span>dnevni plan ispunjen<span class="k some"></span>nešto riješeno</p>
    </div>
    <div class="sh-stats">
      <div class="sh-stat">${IC.medal}<div><span>Najduži niz</span><b>${dana(store.bestStreak())}</b></div></div>
      <div class="sh-stat">${IC.cal}<div><span>Savršeni tjedni</span><b>${weeks}</b></div></div>
    </div>
  </div>`;
}
function openStreak() {
  const now = new Date();
  calY = now.getFullYear(); calM = now.getMonth();
  sheetEl.innerHTML = streakSheet();
  sheetEl.hidden = false;
  document.body.classList.add('sheet-open');
  requestAnimationFrame(() => sheetEl.classList.add('on'));
  sheetEl.querySelector('.sh-x').focus({ preventScroll: true });
}
function closeStreak() {
  sheetEl.classList.remove('on');
  document.body.classList.remove('sheet-open');
  setTimeout(() => { if (!sheetEl.classList.contains('on')) sheetEl.hidden = true; }, 300);
}
sheetEl.addEventListener('click', (e) => {
  const t = e.target.closest('[data-close],[data-month]');
  if (!t) return;
  if ('close' in t.dataset) return closeStreak();
  const d = new Date(calY, calM + Number(t.dataset.month), 1);
  calY = d.getFullYear(); calM = d.getMonth();
  const y = sheetEl.querySelector('.sh-card').scrollTop;
  sheetEl.innerHTML = streakSheet();
  sheetEl.querySelector('.sh-card').scrollTop = y;
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheetEl.hidden) closeStreak(); });

// ---------- Vježba ----------
function viewPractice() {
  const row = (title, sub, from, to, gid) => `
    <div class="card prac">
      <div class="txt"><b>${title}</b><span>${sub}</span></div>
      <div class="acts">
        <button class="pill" data-quiz="${from},${to}" data-title="${title}">Kviz</button>
        <button class="pill dark" data-type="${from},${to},${gid}" data-title="${title}">Upiši napamet</button>
      </div>
    </div>`;
  return topbar('Vježba') + `
  <main class="sheet flat">
    <p class="note">Slobodna vježba, bez utjecaja na dnevni plan.</p>
    <h2>Velike cjeline</h2>
    ${row('Svih 66 knjiga', 'Postanak → Otkrivenje', 0, 66, '')}
    ${row('Stari zavjet', '39 knjiga', 0, OT_END, '')}
    ${row('Novi zavjet', '27 knjiga', OT_END, 66, '')}
    <h2>Po skupinama</h2>
    ${GROUPS.map((g) => row(g.name, `${BOOKS[g.start].name} → ${BOOKS[g.end - 1].name}`, g.start, g.end, g.id)).join('')}
  </main>`;
}

// ---------- Knjige ----------
function viewBooks() {
  const known = store.knownCount();
  const grp = (g) => `
    <section class="blist"><h3><i style="background:${g.tint}"></i>${g.name}</h3><ol>
      ${BOOKS.slice(g.start, g.end).map((b) => `<li class="${b.i < known ? 'known' : ''}"><span>${b.n}</span>${b.name}</li>`).join('')}
    </ol></section>`;
  return topbar('Knjige') + `
  <main class="sheet flat">
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
    <h2>Postavke</h2>
    <label class="card toggle"><span class="txt"><b>Više lekcija dnevno</b><span>Bez čekanja do sutra na novu lekciju</span></span>
      <input type="checkbox" data-free ${s.settings.free ? 'checked' : ''}><i></i></label>
    <button class="pill danger" data-reset>Obriši sav napredak</button>
  </main>`;
}

const VIEWS = { home: viewHome, path: viewPath, practice: viewPractice, books: viewBooks, me: viewMe };

function render(keepScroll = false) {
  const y = app.scrollTop;
  applySky();
  app.innerHTML = VIEWS[tab]();
  if (!tabsEl.children.length) {
    tabsEl.innerHTML = '<i class="ind"></i>' + TABS.map(([id, label, icon]) =>
      `<button data-tab="${id}">${icon}<span>${label}</span></button>`).join('');
  }
  tabsEl.style.setProperty('--i', TABS.findIndex(([id]) => id === tab));
  for (const b of tabsEl.querySelectorAll('button')) {
    const on = b.dataset.tab === tab;
    b.classList.toggle('on', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  }
  app.scrollTop = keepScroll ? y : 0;
  if (keepScroll) return;
  if (tab === 'path') app.querySelector('.pn.open, .pn.tomorrow')?.scrollIntoView({ block: 'center' });
}

// ---------- Sesije ----------
function start(session) {
  setTimeout(applySky); // nakon što sesija postavi body.in-session
  runSession(session, {
    onFinish(sess, outcome) {
      const r = store.finishSession(sess, outcome);
      let note = 'točno iz prve';
      if (sess.kind === 'type') {
        note = outcome.perfect ? 'Sve upisano bez pomoći' : 'Pokušaj ponovno bez „Ne znam”';
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
  const t = e.target.closest('[data-tab],[data-act],[data-node],[data-quiz],[data-type],[data-reset],[data-streak]');
  if (!t || t.closest('#session')) return;
  if ('streak' in t.dataset) return openStreak();
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
darkQuery.addEventListener('change', () => {
  if (document.getElementById('session').hidden) render(true); else applySky();
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && document.getElementById('session').hidden) render(true);
});

render();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
