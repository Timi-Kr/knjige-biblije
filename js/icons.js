// Vlastite SVG ikone (stroke = currentColor).
const s = (body, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;

export const IC = {
  home: s('<path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z"/>'),
  path: s('<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.2 18H14a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h5.8"/>'),
  spark: s('<path d="M12 3c.6 4.6 2.4 6.4 9 9-6.6 2.600-8.4 4.400-9 9-.6-4.600-2.400-6.400-9-9 6.600-2.600 8.400-4.400 9-9z"/>'),
  books: s('<rect x="4" y="4" width="4" height="16" rx="1"/><rect x="10" y="4" width="4" height="16" rx="1"/><path d="m16.500 6.200 2.900-.8 3 13.400-2.900.8z"/>'),
  user: s('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.500 18.500a6.500 6.500 0 0 1 11 0"/>'),
  lock: s('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  check: s('<path d="m5 12.500 4.500 4.500L19 7.500"/>', 'stroke-width="2.6"'),
  close: s('<path d="M6 6l12 12M18 6 6 18"/>'),
  play: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.500v13a1 1 0 0 0 1.500.86l10.500-6.500a1 1 0 0 0 0-1.720L9.500 4.640A1 1 0 0 0 8 5.500z"/></svg>`,
  flame: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.600 2.500c.5 3.300-1.100 4.800-2.600 6.600C8.300 11.100 7 12.900 7 15.300A5.600 5.600 0 0 0 12.500 21a5.500 5.500 0 0 0 5.500-5.600c0-2.300-1-3.900-2-5.300-.4 1.300-1 2-2 2.500.5-3.600-.3-7.300-1.400-10.100z"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.500c.7 5.300 2.700 7.300 9.500 9.500-6.800 2.200-8.800 4.200-9.500 9.500-.7-5.300-2.700-7.300-9.500-9.500 6.800-2.200 8.800-4.200 9.500-9.500z"/></svg>`,
  crown: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 8.500 7.500 12 12 5l4.500 7L21 8.500 19.500 19h-15z"/></svg>`,
  moon: `<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M40 6a27 27 0 1 0 19 39.500A22 22 0 0 1 40 6z"/></svg>`,
  sun: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="14" fill="currentColor"/><g stroke="currentColor" stroke-width="5" stroke-linecap="round"><path d="M32 5v7M32 52v7M5 32h7M52 32h7M13 13l5 5M46 46l5 5M13 51l5-5M46 18l5-5"/></g></svg>`,
  logo: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c-4-3-9-3.500-14-2.500v22c5-1 10-.5 14 2.500 4-3 9-3.500 14-2.500v-22c-5-1-10-.5-14 2.500zM20 10v22"/></svg>`,
};

export const stars = (m) =>
  `<span class="stars" aria-label="${m.stars} od 3 zvjezdice${m.crown ? ', kruna' : ''}">` +
  [1, 2, 3].map((n) => `<i class="${m.stars >= n ? 'on' : ''}">${IC.star}</i>`).join('') +
  `<i class="crown ${m.crown ? 'on' : ''}">${IC.crown}</i></span>`;
