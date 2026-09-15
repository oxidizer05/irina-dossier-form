/* ============================================================
   Иконки приложений — векторные копии iOS-стиля (60×60, свои
   фоны и скругления). Реквизит для съёмки. __DAY__/__DOW__ в
   «Календаре» подставляются при отрисовке.
   ============================================================ */
window.PHONE_ICONS = {

  facetime:
    '<svg viewBox="0 0 60 60"><defs><linearGradient id="ft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4ce06a"/><stop offset="1" stop-color="#1db954"/></linearGradient></defs>' +
    '<rect width="60" height="60" rx="13.5" fill="url(#ft)"/>' +
    '<g fill="#fff"><rect x="13" y="20" width="25" height="20" rx="5"/><path d="M40 27l8-5v16l-8-5z"/></g></svg>',

  calendar:
    '<svg viewBox="0 0 60 60"><rect width="60" height="60" rx="13.5" fill="#fff"/>' +
    '<text x="30" y="21" font-size="10" font-weight="800" fill="#ff3b30" text-anchor="middle" font-family="Inter,sans-serif">__DOW__</text>' +
    '<text x="30" y="47" font-size="30" font-weight="700" fill="#1c1c1e" text-anchor="middle" font-family="Inter,sans-serif">__DAY__</text></svg>',

  photos:
    '<svg viewBox="0 0 60 60"><rect width="60" height="60" rx="13.5" fill="#fff"/>' +
    '<g transform="translate(30 30)">' +
    '<g><ellipse rx="5.5" ry="11" fill="#f9c60f"/><ellipse rx="5.5" ry="11" fill="#4ab84a" transform="rotate(51)"/>' +
    '<ellipse rx="5.5" ry="11" fill="#12a0e0" transform="rotate(102)"/><ellipse rx="5.5" ry="11" fill="#8a4fd0" transform="rotate(154)"/>' +
    '<ellipse rx="5.5" ry="11" fill="#e0489a" transform="rotate(206)"/><ellipse rx="5.5" ry="11" fill="#f0602f" transform="rotate(257)"/>' +
    '<ellipse rx="5.5" ry="11" fill="#f59a12" transform="rotate(309)"/></g>' +
    '<circle r="4.5" fill="#fff"/></g></svg>',

  camera:
    '<svg viewBox="0 0 60 60"><defs><linearGradient id="cm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a5a5c"/><stop offset="1" stop-color="#2b2b2d"/></linearGradient></defs>' +
    '<rect width="60" height="60" rx="13.5" fill="url(#cm)"/>' +
    '<rect x="19" y="17" width="10" height="5" rx="2.5" fill="#cfcfd1"/>' +
    '<circle cx="30" cy="33" r="11" fill="none" stroke="#d6d6d8" stroke-width="3"/><circle cx="30" cy="33" r="6" fill="#9a9a9c"/>' +
    '<circle cx="43" cy="21" r="2.4" fill="#ffd60a"/></svg>',

  mail:
    '<svg viewBox="0 0 60 60"><defs><linearGradient id="ml" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#37b0ff"/><stop offset="1" stop-color="#0a78f0"/></linearGradient></defs>' +
    '<rect width="60" height="60" rx="13.5" fill="url(#ml)"/>' +
    '<rect x="13" y="19" width="34" height="22" rx="4.5" fill="#fff"/>' +
    '<path d="M14.5 21.5L30 33l15.5-11.5" fill="none" stroke="#0a78f0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',

  notes:
    '<svg viewBox="0 0 60 60"><rect width="60" height="60" rx="13.5" fill="#fff"/>' +
    '<path d="M0 13.5A13.5 13.5 0 0 1 13.5 0h33A13.5 13.5 0 0 1 60 13.5V18H0z" fill="#ffd426"/>' +
    '<g stroke="#cfcfcf" stroke-width="2.6" stroke-linecap="round"><path d="M14 28h32"/><path d="M14 35h32"/><path d="M14 42h20"/></g></svg>',

  reminders:
    '<svg viewBox="0 0 60 60"><rect width="60" height="60" rx="13.5" fill="#fff"/>' +
    '<g><circle cx="19" cy="22" r="3.6" fill="#12a0e0"/><circle cx="19" cy="32" r="3.6" fill="#fb2c53"/><circle cx="19" cy="42" r="3.6" fill="#ff9500"/>' +
    '<g stroke="#c8c8c8" stroke-width="2.6" stroke-linecap="round"><path d="M27 22h16"/><path d="M27 32h16"/><path d="M27 42h13"/></g></g></svg>',

  clock:
    '<svg viewBox="0 0 60 60"><rect width="60" height="60" rx="13.5" fill="#0b0b0c"/>' +
    '<circle cx="30" cy="30" r="18" fill="#fff"/>' +
    '<g stroke="#111" stroke-width="2.6" stroke-linecap="round"><path d="M30 30V19"/><path d="M30 30l8 4"/></g>' +
    '<path d="M30 30l9-6" stroke="#ff9500" stroke-width="1.8" stroke-linecap="round"/><circle cx="30" cy="30" r="1.8" fill="#111"/></svg>',

  tv:
    '<svg viewBox="0 0 60 60"><rect width="60" height="60" rx="13.5" fill="#050505"/>' +
    '<text x="30" y="39" font-size="23" font-weight="700" fill="#fff" text-anchor="middle" font-family="Inter,sans-serif">tv</text></svg>',

  podcasts:
    '<svg viewBox="0 0 60 60"><defs><linearGradient id="pc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c874f5"/><stop offset="1" stop-color="#8a2be2"/></linearGradient></defs>' +
    '<rect width="60" height="60" rx="13.5" fill="url(#pc)"/>' +
    '<circle cx="30" cy="24" r="6.5" fill="#fff"/><path d="M18 44c1.5-8 5.5-12 12-12s10.5 4 12 12z" fill="#fff"/>' +
    '<path d="M20 20a12 12 0 0 1 20 0" fill="none" stroke="#fff" stroke-width="2" opacity=".55"/></svg>',

  appstore:
    '<svg viewBox="0 0 60 60"><defs><linearGradient id="as" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2aa8ff"/><stop offset="1" stop-color="#0a6ff0"/></linearGradient></defs>' +
    '<rect width="60" height="60" rx="13.5" fill="url(#as)"/>' +
    '<g fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 41l11-19 11 19"/><path d="M24 35h12"/></g></svg>',

  maps:
    '<svg viewBox="0 0 60 60"><rect width="60" height="60" rx="13.5" fill="#edeae2"/>' +
    '<path d="M0 44q16-10 30 2t30-2V60H0z" fill="#9fd0ec"/>' +
    '<path d="M0 0h24v20H0z" fill="#aed88f"/>' +
    '<path d="M6 6L54 54" stroke="#fff" stroke-width="4"/><path d="M0 33h60" stroke="#f2b23a" stroke-width="4"/>' +
    '<circle cx="41" cy="22" r="5.5" fill="#2a7cff" stroke="#fff" stroke-width="1.6"/></svg>',

  health:
    '<svg viewBox="0 0 60 60"><rect width="60" height="60" rx="13.5" fill="#fff"/>' +
    '<path d="M30 43c-10-6.5-15-13-15-19a7.5 7.5 0 0 1 15-2 7.5 7.5 0 0 1 15 2c0 6-5 12.5-15 19z" fill="#fb2c53"/></svg>',

  wallet:
    '<svg viewBox="0 0 60 60"><rect width="60" height="60" rx="13.5" fill="#0d0d0d"/>' +
    '<g><rect x="14" y="17" width="32" height="9" rx="3.5" fill="#ff9f0a"/><rect x="14" y="24" width="32" height="9" rx="3.5" fill="#30d158"/>' +
    '<rect x="14" y="31" width="32" height="14" rx="3.5" fill="#fff"/></g></svg>',

  settings:
    '<svg viewBox="0 0 60 60"><defs><linearGradient id="st" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d3d3d5"/><stop offset="1" stop-color="#9a9a9c"/></linearGradient></defs>' +
    '<rect width="60" height="60" rx="13.5" fill="url(#st)"/>' +
    '<circle cx="30" cy="30" r="12.5" fill="none" stroke="#6c6c6e" stroke-width="6" stroke-dasharray="4.2 3.4"/>' +
    '<circle cx="30" cy="30" r="5.5" fill="#f2f2f4" stroke="#6c6c6e" stroke-width="2.4"/></svg>',

  sber:
    '<svg viewBox="0 0 60 60"><rect width="60" height="60" rx="13.5" fill="var(--bkc)"/>' +
    '<path d="M18 30a12 12 0 1 1 4 9" fill="none" stroke="#fff" stroke-width="4.6" stroke-linecap="round"/>' +
    '<path d="M20 27l7 7 14-15" fill="none" stroke="#fff" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',

  /* ---- док ---- */
  phone:
    '<svg viewBox="0 0 60 60"><defs><linearGradient id="ph" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4ce06a"/><stop offset="1" stop-color="#1db954"/></linearGradient></defs>' +
    '<rect width="60" height="60" rx="13.5" fill="url(#ph)"/>' +
    '<path d="M23 16c-3 0-6 3-6 7 0 11 9 20 20 20 4 0 7-3 7-6 0-2-1-3-3-4l-5-2c-1 0-3 0-4 1l-1 1c-4-2-7-5-9-9l1-1c1-1 1-3 1-4l-2-5c-1-2-2-3-4-3z" fill="#fff"/></svg>',

  safari:
    '<svg viewBox="0 0 60 60"><defs><radialGradient id="sf" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stop-color="#4aa8ff"/><stop offset="1" stop-color="#0a63d8"/></radialGradient></defs>' +
    '<rect width="60" height="60" rx="13.5" fill="url(#sf)"/>' +
    '<circle cx="30" cy="30" r="19" fill="#0d5cc0"/><circle cx="30" cy="30" r="19" fill="none" stroke="#fff" stroke-width="1.5" opacity=".85"/>' +
    '<path d="M30 30L41 19 34 30z" fill="#ff3b30"/><path d="M30 30L19 41 26 30z" fill="#fff"/></svg>',

  messages:
    '<svg viewBox="0 0 60 60"><defs><linearGradient id="ms" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4ce06a"/><stop offset="1" stop-color="#1db954"/></linearGradient></defs>' +
    '<rect width="60" height="60" rx="13.5" fill="url(#ms)"/>' +
    '<path d="M30 15c-10 0-18 6.7-18 15 0 4.6 2.5 8.7 6.4 11.4-.8 3-2.4 5.3-4.4 6.6 4 .3 7.8-.9 10.9-3 1.6.4 3.3.6 5.1.6 10 0 18-6.7 18-15S40 15 30 15z" fill="#fff"/></svg>',

  music:
    '<svg viewBox="0 0 60 60"><defs><linearGradient id="mu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fb5c74"/><stop offset="1" stop-color="#fa233b"/></linearGradient></defs>' +
    '<rect width="60" height="60" rx="13.5" fill="url(#mu)"/>' +
    '<path d="M27 19l16-3.4v20.3a5.4 5.4 0 1 1-3-4.9V23.5l-10 2.1V40a5.4 5.4 0 1 1-3-4.9z" fill="#fff"/></svg>',
};
