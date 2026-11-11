// 66 knjiga Biblije po redu, skupine i put učenja.

export const GROUPS = [
  { id: 'pet', name: 'Petoknjižje', t: 'SZ', tint: '#cfe3fb', chunks: [3, 2] },
  { id: 'pov', name: 'Povijesne knjige', t: 'SZ', tint: '#e3ecb4', chunks: [4, 4, 4] },
  { id: 'mud', name: 'Mudrosne knjige', t: 'SZ', tint: '#ecd3ee', chunks: [3, 2] },
  { id: 'vel', name: 'Veliki proroci', t: 'SZ', tint: '#fbdcc0', chunks: [3, 2] },
  { id: 'mal', name: 'Mali proroci', t: 'SZ', tint: '#c9ecdf', chunks: [4, 4, 4] },
  { id: 'eva', name: 'Evanđelja i Djela', t: 'NZ', tint: '#cfe3fb', chunks: [3, 2] },
  { id: 'pav', name: 'Pavlove poslanice', t: 'NZ', tint: '#e3ecb4', chunks: [4, 3, 3, 3] },
  { id: 'ost', name: 'Ostale poslanice i Otkrivenje', t: 'NZ', tint: '#ecd3ee', chunks: [4, 3, 2] },
];

const RAW = {
  pet: ['Postanak', 'Izlazak', 'Levitski zakonik', 'Brojevi', 'Ponovljeni zakon'],
  pov: ['Jošua', 'Suci', 'Ruta', '1. Samuelova', '2. Samuelova', '1. Kraljevima', '2. Kraljevima',
    '1. Ljetopisa', '2. Ljetopisa', 'Ezra', 'Nehemija', 'Estera'],
  mud: ['Job', 'Psalmi', 'Izreke', 'Propovjednik', 'Pjesma nad pjesmama'],
  vel: ['Izaija', 'Jeremija', 'Tužaljke', 'Ezekiel', 'Daniel'],
  mal: ['Hošea', 'Joel', 'Amos', 'Obadija', 'Jona', 'Mihej', 'Nahum', 'Habakuk', 'Sefanija',
    'Hagaj', 'Zaharija', 'Malahija'],
  eva: ['Matej', 'Marko', 'Luka', 'Ivan', 'Djela apostolska'],
  pav: ['Rimljanima', '1. Korinćanima', '2. Korinćanima', 'Galaćanima', 'Efežanima', 'Filipljanima',
    'Kološanima', '1. Solunjanima', '2. Solunjanima', '1. Timoteju', '2. Timoteju', 'Titu', 'Filemonu'],
  ost: ['Hebrejima', 'Jakovljeva', '1. Petrova', '2. Petrova', '1. Ivanova', '2. Ivanova',
    '3. Ivanova', 'Judina', 'Otkrivenje'],
};

// Dodatni prihvaćeni oblici kod tipkanja (normalizirani).
const ALIASES = {
  'Psalmi': ['psalam'], 'Ruta': ['rut'], 'Judina': ['juda'], 'Hagaj': ['agej'],
  'Sefanija': ['sofonija'], 'Mihej': ['miha'], 'Djela apostolska': ['djela', 'dj'],
  'Pjesma nad pjesmama': ['pjesma', 'pnp'], 'Otkrivenje': ['otk'], 'Job': ['jov'],
  '1. Kraljevima': ['1kraljeva'], '2. Kraljevima': ['2kraljeva'],
  'Izreke': ['mudreizreke'], 'Jošua': ['jozua'],
};

export const BOOKS = [];
for (const g of GROUPS) {
  g.start = BOOKS.length;
  for (const name of RAW[g.id]) {
    BOOKS.push({ i: BOOKS.length, n: BOOKS.length + 1, name, g: g.id, alias: ALIASES[name] || [] });
  }
  g.end = BOOKS.length; // ekskluzivno
}

export const OT_END = 39;

// Put: lekcije s novim knjigama ('learn') i provjere ('check').
export const PATH = [];
for (const g of GROUPS) {
  let at = g.start;
  g.nodes = [];
  g.chunks.forEach((size, k) => {
    const node = { id: `${g.id}-${k + 1}`, kind: 'learn', g: g.id, from: at, to: at + size };
    at += size;
    PATH.push(node); g.nodes.push(node);
  });
  const chk = { id: `${g.id}-chk`, kind: 'check', g: g.id, from: g.start, to: g.end, title: 'Provjera skupine' };
  PATH.push(chk); g.nodes.push(chk);
  if (g.id === 'mal') {
    const n = { id: 'sz-chk', kind: 'check', g: g.id, from: 0, to: OT_END, title: 'Cijeli Stari zavjet', big: true };
    PATH.push(n); g.nodes.push(n);
  }
  if (g.id === 'ost') {
    const n1 = { id: 'nz-chk', kind: 'check', g: g.id, from: OT_END, to: 66, title: 'Cijeli Novi zavjet', big: true };
    const n2 = { id: 'all-chk', kind: 'check', g: g.id, from: 0, to: 66, title: 'Svih 66 knjiga', big: true };
    PATH.push(n1, n2); g.nodes.push(n1, n2);
  }
}

export const groupOf = (i) => GROUPS.find((g) => g.id === BOOKS[i].g);
export const names = (from, to) => BOOKS.slice(from, to).map((b) => b.name);
