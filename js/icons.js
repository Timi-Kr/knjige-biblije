// Vlastite SVG ikone (stroke = currentColor).
const s = (body, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;

// Valoviti krug (sunce).
function scallop(cx, cy, r, lobes, amp) {
  const pts = [];
  for (let k = 0; k < 120; k++) {
    const a = (k / 120) * Math.PI * 2;
    const rr = r * (1 + amp * Math.cos(lobes * a));
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

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
  flame: `<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" aria-hidden="true"><path d="M11.800 1.700Q12.200 1.350 12.600 1.700C14 3.200 15.600 4.200 17.200 5.200 20.200 7 21.800 9.800 21.800 13A9.800 9.800 0 0 1 2.200 13C2.200 10.400 3.400 8 5.300 6.300Q5.800 5.900 6.200 6.400L8.300 8.400C8.900 5.600 10.200 3.300 11.800 1.700ZM12.950 10.600A4.100 4.100 0 1 1 8.250 13.700L10.600 14.350Z"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11 6.200C8.900 4.900 6.200 4.500 3.300 5A1 1 0 0 0 2.500 6v11.300a1 1 0 0 0 1.200 1c2.600-.5 5-.1 7.300 1.300zM13 6.200c2.100-1.300 4.800-1.700 7.700-1.200a1 1 0 0 1 .8 1v11.300a1 1 0 0 1-1.200 1c-2.600-.5-5-.1-7.300 1.300z"/></svg>`,
  star5: s('<path d="M12.00 2.70L14.70 8.58L21.13 9.33L16.37 13.72L17.64 20.07L12.00 16.90L6.36 20.07L7.63 13.72L2.87 9.33L9.30 8.58Z"/>', 'stroke-width="1.800"'),
  crownO: s('<path d="M4.500 9.500 8.500 13 12 7l3.500 6 4-3.500-1.300 9.500H5.800z"/><circle cx="4.300" cy="7" r=".9" fill="currentColor"/><circle cx="12" cy="4.300" r=".9" fill="currentColor"/><circle cx="19.700" cy="7" r=".9" fill="currentColor"/>', 'stroke-width="1.800"'),
  left: s('<path d="m14.500 5-7 7 7 7"/>', 'stroke-width="2.600"'),
  right: s('<path d="m9.500 5 7 7-7 7"/>', 'stroke-width="2.600"'),
  medal: s('<circle cx="12" cy="15" r="5.500"/><path d="M8 4h8l-1.500 5.500h-5z"/>'),
  cal: s('<rect x="4" y="5.500" width="16" height="14.500" rx="3"/><path d="M8 3.500v4M16 3.500v4M4 10.500h16"/>'),
  bulb: s('<path d="M9 17.500h6M10 20.500h4M12 3.500a6 6 0 0 0-3.500 10.900c.6.5 1 1.100 1 1.900h5c0-.8.4-1.400 1-1.900A6 6 0 0 0 12 3.500z"/>'),
  star: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.500c.7 5.300 2.700 7.300 9.500 9.500-6.800 2.200-8.800 4.200-9.500 9.500-.7-5.300-2.700-7.300-9.500-9.500 6.800-2.200 8.800-4.200 9.500-9.500z"/></svg>`,
  crown: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 8.500 7.500 12 12 5l4.500 7L21 8.500 19.500 19h-15z"/></svg>`,
  moon: `<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M40 6a27 27 0 1 0 19 39.500A22 22 0 0 1 40 6z"/></svg>`,
  sun: `<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="${scallop(32, 32, 27, 8, 0.075)}"/></svg>`,
  logo: `<svg viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" rx="32" fill="#1f2a44"/><path d="M32 90C32 62 60 78 60 60S88 58 88 30" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="8" stroke-linecap="round"/><circle cx="32" cy="90" r="12" fill="#f3bdfb"/><circle cx="60" cy="60" r="12" fill="#c8f03c"/><path d="M88 12c1.300 9.500 4.800 13 17 18-12.200 5-15.700 8.500-17 18-1.300-9.500-4.800-13-17-18 12.200-5 15.700-8.500 17-18z" fill="#ffc247"/></svg>`,
};
