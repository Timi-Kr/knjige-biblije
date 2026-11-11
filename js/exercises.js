// Generatori zadataka i izvođenje sesije.
import { BOOKS } from './data.js';
import { IC } from './icons.js';

const rnd = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const range = (from, to) => Array.from({ length: to - from }, (_, k) => from + k);
const sample = (a, n) => shuffle(a).slice(0, n);
const name = (i) => BOOKS[i].name;

// Bliske knjige kao teški ometači.
function near(i, exclude, count) {
  const out = [];
  for (let r = 5; out.length < count && r < 70; r += 4) {
    const c = range(Math.max(0, i - r), Math.min(66, i + r + 1))
      .filter((x) => !exclude.includes(x) && !out.includes(x));
    out.push(...sample(c, count - out.length));
  }
  return out;
}

// ---- Pojedini zadaci ----
const mc = (q, focus, target, answer, wrong, label = name) => ({
  type: 'mc', q, focus, target,
  options: shuffle([{ label: label(answer), ok: true }, ...wrong.map((w) => ({ label: label(w), ok: false }))]),
});
const mcNext = (i) => mc('Što dolazi poslije?', name(i), i, i + 1, near(i + 1, [i, i + 1], 3));
const mcPrev = (i) => mc('Što dolazi prije?', name(i), i, i - 1, near(i - 1, [i, i - 1], 3));
const mcBetween = (i) =>
  mc('Što dolazi između?', `${name(i - 1)} <span class="q">?</span> ${name(i + 1)}`, i, i, near(i, [i - 1, i, i + 1], 3));
function mcPos(i) {
  const n = i + 1;
  const wrong = sample([-3, -2, -1, 1, 2, 3].map((d) => n + d).filter((x) => x >= 1 && x <= 66), 3);
  return mc('Koja je po redu?', name(i), i, n, wrong, (x) => `${x}.`);
}
function mixedMC(i, lo, hi, allowPos) {
  const kinds = [];
  if (i + 1 < hi) kinds.push(mcNext);
  if (i - 1 >= lo) kinds.push(mcPrev);
  if (i - 1 >= lo && i + 1 < hi) kinds.push(mcBetween);
  if (allowPos) kinds.push(mcPos);
  return kinds[rnd(kinds.length)](i);
}

// seq: indeksi po redu; blanks: pozicije u seq koje treba popuniti.
function fill(q, seq, blanks, distractN = 0) {
  const need = blanks.map((p) => seq[p]);
  const extra = distractN ? near(seq[Math.floor(seq.length / 2)], seq, distractN) : [];
  return { type: 'fill', q, seq, blanks: [...blanks].sort((a, b) => a - b), chips: shuffle([...need, ...extra]) };
}
const fillAll = (q, from, to, distractN = 0, lead = false) => {
  const seq = range(lead && from > 0 ? from - 1 : from, to);
  const off = seq.length - (to - from);
  return fill(q, seq, range(off, seq.length), distractN);
};
function gaps(from, to, nBlanks = 3, distractN = 1) {
  const seq = range(from, to);
  const blanks = sample(range(0, seq.length), Math.min(nBlanks, seq.length - 1));
  return fill('Popuni praznine', seq, blanks, distractN);
}
function windows(from, to, size = 6) {
  const parts = Math.ceil((to - from) / size);
  const out = [];
  for (let k = 0; k < parts; k++) {
    out.push([from + Math.round(((to - from) * k) / parts), from + Math.round(((to - from) * (k + 1)) / parts)]);
  }
  return out;
}
const gapAround = (i, lo, hi) => {
  const len = Math.min(6, hi - lo);
  const start = Math.max(lo, Math.min(i - 2, hi - len));
  return gaps(start, start + len, Math.min(3, len - 1), 1);
};

// ---- Sesije ----
export function lessonSession(node) {
  const { from, to } = node;
  const items = [{ type: 'intro', from, to }];
  items.push(fillAll('Složi nove knjige po redu', from, to, 0, true));
  if (from > 0) items.push(mcNext(from - 1));
  for (let i = from; i < to - 1; i++) items.push(mcNext(i));
  for (const i of sample(range(from + 1, to), 2)) items.push(mcPrev(i));
  items.push(gaps(Math.max(0, to - 6), to, 3, 1));
  if (to - from >= 3) items.push(mcBetween(from + 1));
  items.push(fillAll('Još jednom, s ometačima', from, to, 2));
  return { kind: 'node', node, title: 'Nova lekcija', items };
}

export function checkSession(node) {
  const { from, to } = node;
  const items = [];
  if (node.big) {
    const nWin = to - from > 40 ? 6 : 5;
    const starts = sample(range(from, to - 5), nWin).sort((a, b) => a - b);
    starts.forEach((s, k) => {
      items.push(gaps(s, s + 6, 3, 2));
      for (const i of sample(range(from, to), 2)) items.push(mixedMC(i, from, to, k % 2 === 0));
    });
  } else {
    for (const [a, b] of windows(from, to)) items.push(fillAll('Složi po redu', a, b, 2));
    for (const i of sample(range(from, to), Math.min(5, to - from))) items.push(mixedMC(i, Math.max(0, from - 1), to, true));
    if (from > 0) items.push(gaps(from - 2, Math.min(to, from + 4), 3, 1));
  }
  return { kind: 'node', node, title: node.title, items };
}

export function reviewSession(targets, known) {
  let items = targets.map((i) => mixedMC(i, 0, known, false));
  items = shuffle(items);
  const g1 = gapAround(targets[0], 0, known);
  const g2 = gapAround(targets[targets.length - 1], 0, known);
  items.splice(Math.ceil(items.length / 2), 0, g1);
  items.push(g2);
  return { kind: 'review', title: 'Ponavljanje', items };
}

export function challengeSession(known) {
  const len = Math.min(6, known);
  const s = rnd(known - len + 1);
  const t = rnd(known - 3);
  const items = [
    fillAll('Složi po redu', s, s + len, 3),
    ...sample(range(0, known), 3).map(mcPos),
    { type: 'type', from: t, to: t + 4, q: t ? `Upiši 4 knjige koje dolaze poslije: ${name(t - 1)}` : 'Upiši prve 4 knjige Biblije' },
  ];
  return { kind: 'challenge', title: 'Level Up', items };
}

export function practiceSession(from, to, title) {
  const items = [];
  const ws = windows(from, to);
  for (const [a, b] of sample(ws, Math.min(2, ws.length))) items.push(fillAll('Složi po redu', a, b, 2));
  for (const i of sample(range(from, to), Math.min(6, to - from))) items.push(mixedMC(i, Math.max(0, from - 1), Math.min(66, to + 1), true));
  if (to - from >= 6) { const s = from + rnd(to - from - 5); items.push(gaps(s, s + 6, 3, 2)); }
  return { kind: 'practice', title, items: shuffle(items) };
}

export function typeSession(from, to, title, g) {
  return { kind: 'type', g, title, items: [{ type: 'type', from, to, q: `Upiši po redu: ${title}` }] };
}

// ---- Provjera utipkanog ----
export const norm = (s) =>
  s.toLowerCase().replace(/đ/g, 'd').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
export function matches(input, book) {
  const a = norm(input);
  if (!a) return false;
  const full = norm(book.name);
  if (a === full || book.alias.includes(a)) return true;
  return a.length >= 4 && full.startsWith(a);
}

// ---- Izvođenje ----
const steps = (it) => (it.type === 'fill' ? it.blanks.length : it.type === 'type' ? it.to - it.from : it.type === 'mc' ? 1 : 0);

export function runSession(session, { onFinish, onExit }) {
  const root = document.getElementById('session');
  const queue = [...session.items];
  const totalSteps = queue.reduce((n, it) => n + steps(it), 0);
  const results = new Map();
  let okSteps = 0, reveals = 0, pos = 0, timer = null;

  const mark = (i, ok) => results.set(i, (results.get(i) ?? true) && ok);
  const pct = () => Math.round((okSteps / totalSteps) * 100);
  const later = (fn, ms) => { timer = setTimeout(fn, ms); };

  root.hidden = false;
  document.body.classList.add('in-session');

  function close() {
    clearTimeout(timer);
    root.hidden = true;
    root.innerHTML = '';
    document.body.classList.remove('in-session');
  }

  function frame(q, body, panel, hint = '') {
    root.innerHTML = `
      <div class="s-top">
        <button class="s-close" data-x aria-label="Zatvori">${IC.close}</button>
        <div class="s-bar"><i style="width:${(pos / queue.length) * 100}%"></i></div>
        <div class="s-score"><small>Rezultat</small><b>${pct()}%</b></div>
      </div>
      <div class="s-body">
        <h1 class="s-q">${q}</h1>
        ${body}
      </div>
      ${hint ? `<p class="s-hint">${hint}</p>` : ''}
      <div class="s-panel">${panel}</div>`;
    root.querySelector('[data-x]').onclick = () => {
      if (pos === 0 || confirm('Prekinuti? Napredak u ovoj lekciji se neće spremiti.')) { close(); onExit(); }
    };
  }
  const setScore = () => { root.querySelector('.s-score b').textContent = `${pct()}%`; };
  const next = () => { pos++; pos < queue.length ? show() : end(); };

  function show() {
    const it = queue[pos];
    ({ intro, fill: fillView, mc: mcView, type: typeView })[it.type](it);
  }

  function intro(it) {
    const lead = it.from > 0 ? `<li class="lead"><span>${it.from}</span>${name(it.from - 1)}</li>` : '';
    const rows = range(it.from, it.to).map((i, k) =>
      `<li style="--d:${k}"><span>${i + 1}</span>${name(i)}</li>`).join('');
    frame('Nove knjige', `<ol class="intro">${lead}${rows}</ol>`,
      `<button class="btn-main" data-go>Idemo</button>`, 'Pročitaj ih naglas par puta, redom.');
    root.querySelector('[data-go]').onclick = next;
  }

  function fillView(it) {
    const blankSet = new Set(it.blanks);
    let cur = 0, missed = false, slotMiss = false;
    const seqHtml = it.seq.map((b, p) => {
      const w = Math.max(4, name(b).length * 0.56 + 1.4);
      return blankSet.has(p)
        ? `<span class="slot" data-p="${p}" style="min-width:${w}em"></span>`
        : `<span class="fixed">${name(b)}</span>`;
    }).join('<span class="sep">›</span>');
    frame(it.q, `<div class="seq">${seqHtml}</div>`,
      `<div class="chips">${it.chips.map((b) => `<button class="chip" data-b="${b}">${name(b)}</button>`).join('')}</div>`,
      'Dodirni knjige da popuniš praznine');
    const slot = (k) => root.querySelector(`.slot[data-p="${it.blanks[k]}"]`);
    slot(0).classList.add('active');
    root.querySelector('.chips').onclick = (e) => {
      const chip = e.target.closest('.chip');
      if (!chip || chip.disabled || cur >= it.blanks.length) return;
      const want = it.seq[it.blanks[cur]];
      if (+chip.dataset.b !== want) {
        chip.classList.remove('shake'); void chip.offsetWidth; chip.classList.add('shake');
        slotMiss = missed = true;
        mark(want, false);
        return;
      }
      if (!slotMiss) { mark(want, true); if (!it.retry) okSteps++; }
      slotMiss = false;
      chip.disabled = true; chip.classList.add('used');
      const s = slot(cur);
      s.textContent = name(want); s.classList.remove('active'); s.classList.add('filled');
      cur++;
      setScore();
      if (cur < it.blanks.length) slot(cur).classList.add('active');
      else {
        root.querySelector('.seq').classList.add('good');
        if (missed && !it.retry) queue.push({ ...it, chips: shuffle(it.chips), retry: true });
        later(next, 750);
      }
    };
  }

  function mcView(it) {
    frame(it.q, `<div class="focus">${it.focus}</div>`,
      `<div class="opts">${it.options.map((o, k) => `<button class="opt" data-k="${k}">${o.label}</button>`).join('')}</div>`);
    const box = root.querySelector('.opts');
    box.onclick = (e) => {
      const b = e.target.closest('.opt');
      if (!b || box.dataset.lock) return;
      box.dataset.lock = 1;
      const ok = it.options[+b.dataset.k].ok;
      mark(it.target, ok);
      if (ok) { b.classList.add('right'); if (!it.retry) okSteps++; setScore(); later(next, 650); }
      else {
        b.classList.add('wrong');
        box.children[it.options.findIndex((o) => o.ok)].classList.add('right');
        if (!it.retry) queue.push({ ...it, options: shuffle(it.options), retry: true });
        later(next, 1600);
      }
    };
  }

  function typeView(it) {
    let cur = it.from, slotMiss = false, tries = 0;
    const n = it.to - it.from;
    frame(it.q, `
      <form class="type" autocomplete="off">
        <input type="text" inputmode="text" autocapitalize="words" autocorrect="off" spellcheck="false"
          enterkeyhint="done" aria-label="Naziv knjige" placeholder="Upiši naziv…">
        <button type="submit" class="btn-main small">OK</button>
      </form>
      <div class="type-meta"><span data-count>0 / ${n}</span><button type="button" class="link" data-skip>Ne znam</button></div>
      <ol class="typed" reversed></ol>`, '');
    root.querySelector('.s-panel').remove();
    const form = root.querySelector('.type');
    const input = form.querySelector('input');
    const list = root.querySelector('.typed');
    const accept = (revealed) => {
      const b = BOOKS[cur];
      if (revealed) { reveals++; mark(cur, false); }
      else if (!slotMiss) { mark(cur, true); okSteps++; }
      list.insertAdjacentHTML('afterbegin', `<li class="${revealed ? 'rev' : ''}"><span>${b.n}</span>${b.name}</li>`);
      cur++; slotMiss = false; tries = 0;
      input.value = '';
      root.querySelector('[data-count]').textContent = `${cur - it.from} / ${n}`;
      setScore();
      if (cur >= it.to) { input.blur(); input.disabled = true; later(next, 700); }
    };
    input.oninput = () => {
      if (cur < it.to && norm(input.value) === norm(BOOKS[cur].name)) accept(false);
    };
    form.onsubmit = (e) => {
      e.preventDefault();
      if (cur >= it.to || !input.value.trim()) return;
      if (matches(input.value, BOOKS[cur])) return accept(false);
      slotMiss = true; tries++;
      mark(cur, false);
      form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
      input.select();
    };
    root.querySelector('[data-skip]').onclick = () => { if (cur < it.to) { accept(true); input.focus(); } };
    input.focus();
  }

  function end() {
    const perfect = reveals === 0 && pct() === 100;
    const outcome = { pct: pct(), perfect: session.kind === 'type' ? reveals === 0 : perfect, results };
    const info = onFinish(session, outcome) || {};
    const head = outcome.pct === 100 ? 'Savršeno!' : outcome.pct >= 70 ? 'Bravo!' : 'Gotovo!';
    root.innerHTML = `
      <div class="s-end">
        <div class="burst">${IC.star}</div>
        <h1>${head}</h1>
        <p class="big">${outcome.pct}%</p>
        <p>${info.note || 'točno iz prve'}</p>
        ${info.streakUp ? `<p class="streak-up">${IC.flame}<b>${info.streak}</b> ${info.streak === 1 ? 'dan' : 'dana'} zaredom</p>` : ''}
        ${info.extra || ''}
      </div>
      <div class="s-panel"><button class="btn-main" data-go>Nastavi</button></div>`;
    root.querySelector('[data-go]').onclick = () => { close(); onExit(); };
  }

  show();
}
