/* ============================================================
   ДВИЖОК ИМИТАЦИИ РАБОТЫ ОПЕРАТОРА
   Один на три экрана: хаб, панель оператора, Panopticon.

   Что умеет: водить курсор, «нажимать» кнопки, печатать в поля,
   выделять текст, подсвечивать блоки, прокручивать, крутить цифры
   в таблицах. Сценарий каждой страницы лежит в ней самой
   (window.SCENARIO) — движок его просто проигрывает по кругу.

   Ручной режим: любое живое касание мыши или клавиши ставит
   имитацию на паузу, чтобы актёр мог сам поработать в кадре.
   Пробел — продолжить.

   Скорость: ?speed=slow | normal | fast
   ============================================================ */

window.SIM = (function () {
  'use strict';

  /* ---------- скорости ---------- */
  var SPEEDS = {
    slow:   { char: 105, move: 1.5, gap: 900, jitter: 60 },
    normal: { char: 58,  move: 1.0, gap: 520, jitter: 40 },
    fast:   { char: 26,  move: .62, gap: 240, jitter: 18 },
  };
  var q = (location.search.match(/speed=(\w+)/) || [])[1];
  var SP = SPEEDS[q] || SPEEDS.normal;

  /* ---------- состояние ---------- */
  var steps = [];      // очередь шагов
  var idx = 0;         // текущий шаг
  var running = false;
  var timer = null;
  var cursor, ring, elControls, btnRun, btnRunLabel, hint;
  var page = {};       // настройки страницы
  var cx = 0, cy = 0;  // где сейчас курсор

  /* ---------- мелочи ---------- */
  function rnd(n) { return (Math.random() * 2 - 1) * n; }
  function el(sel) {
    if (!sel) return null;
    if (typeof sel === 'function') return sel();
    if (typeof sel === 'string') return document.querySelector(sel);
    return sel;
  }

  /* ============================================================
     КУРСОР
     ============================================================ */
  function buildCursor() {
    cursor = document.createElement('div');
    cursor.className = 'sim-cursor';
    cursor.innerHTML =
      '<svg viewBox="0 0 22 22"><path d="M3 2l14 7.4-6.2 1.6-1.6 6.2z" fill="#fff" stroke="#1a1a1a" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    document.body.appendChild(cursor);

    ring = document.createElement('div');
    ring.className = 'sim-ring';
    document.body.appendChild(ring);

    cx = window.innerWidth * .5;
    cy = window.innerHeight * .62;
    place(cx, cy, 0);
  }
  function place(x, y, ms) {
    cursor.style.transition = ms ? 'transform ' + ms + 'ms cubic-bezier(.33,.05,.28,1)' : 'none';
    cursor.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    cx = x; cy = y;
  }
  function pointOf(node) {
    var r = node.getBoundingClientRect();
    // целимся не строго в центр — живее выглядит
    return {
      x: r.left + r.width * (.35 + Math.random() * .3),
      y: r.top + r.height * (.4 + Math.random() * .25),
    };
  }
  function travelTime(x, y) {
    var d = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
    return Math.max(180, Math.min(1100, d * 1.15)) * SP.move;
  }

  /* ============================================================
     ШАГИ СЦЕНАРИЯ
     Каждый шаг: { d: пауза после, run: функция }
     ============================================================ */
  var S = {
    /* подвести курсор */
    to: function (sel) {
      steps.push({ run: function (done) {
        var n = el(sel);
        if (!n) return done(0);
        keepInView(n);
        var p = pointOf(n), t = travelTime(p.x, p.y);
        place(p.x, p.y, t);
        done(t + 90);
      }});
      return S;
    },

    /* нажать: колечко + вдавливание + настоящий click */
    click: function (sel) {
      S.to(sel);
      steps.push({ run: function (done) {
        var n = el(sel);
        ring.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
        ring.classList.remove('go'); void ring.offsetWidth; ring.classList.add('go');
        if (n) {
          n.classList.add('sim-press');
          setTimeout(function () { n.classList.remove('sim-press'); }, 170);
          setTimeout(function () { try { n.click(); } catch (e) {} }, 90);
        }
        done(SP.gap * .5);
      }});
      return S;
    },

    /* напечатать текст по буквам */
    type: function (sel, text) {
      S.to(sel);
      steps.push({ run: function (done) {
        var n = el(sel);
        if (!n) return done(0);
        try { n.focus({ preventScroll: true }); } catch (e) { n.focus(); }
        n.value = '';
        var i = 0;
        (function tick() {
          if (!running) { pendingResume = tick; return; }
          n.value += text.charAt(i++);
          n.scrollTop = n.scrollHeight;
          if (i < text.length) {
            timer = setTimeout(tick, Math.max(12, SP.char + rnd(SP.jitter)));
          } else {
            done(SP.gap);
          }
        })();
      }});
      return S;
    },

    /* выделить текст внутри элемента — обычное системное выделение */
    select: function (sel) {
      S.to(sel);
      steps.push({ run: function (done) {
        var n = el(sel);
        if (!n) return done(0);
        try {
          if (n.tagName === 'INPUT' || n.tagName === 'TEXTAREA') {
            n.focus(); n.setSelectionRange(0, n.value.length);
          } else {
            var r = document.createRange(); r.selectNodeContents(n);
            var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
          }
        } catch (e) {}
        done(SP.gap * 1.6);
      }});
      return S;
    },
    unselect: function () {
      steps.push({ run: function (done) {
        try { window.getSelection().removeAllRanges(); } catch (e) {}
        done(60);
      }});
      return S;
    },

    /* подсветить блок на время */
    hot: function (sel, ms) {
      S.to(sel);
      steps.push({ run: function (done) {
        var n = el(sel);
        if (!n) return done(0);
        n.classList.add('sim-hot');
        setTimeout(function () { n.classList.remove('sim-hot'); }, ms || 1400);
        done((ms || 1400) + 120);
      }});
      return S;
    },

    /* прокрутить к элементу */
    scroll: function (sel) {
      steps.push({ run: function (done) {
        var n = el(sel);
        if (n) n.scrollIntoView({ behavior: 'smooth', block: 'center' });
        done(700);
      }});
      return S;
    },
    top: function () {
      steps.push({ run: function (done) {
        window.scrollTo({ top: 0, behavior: 'smooth' }); done(600);
      }});
      return S;
    },

    /* пауза */
    wait: function (ms) {
      steps.push({ run: function (done) { done(ms); } });
      return S;
    },

    /* произвольное действие страницы */
    act: function (fn, after) {
      steps.push({ run: function (done) { try { fn(); } catch (e) {} done(after || SP.gap); } });
      return S;
    },
  };

  /* элемент вне экрана — подкрутим страницу, иначе курсор уедет в никуда */
  function keepInView(n) {
    var r = n.getBoundingClientRect();
    if (r.top < 70 || r.bottom > window.innerHeight - 70) {
      n.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /* ============================================================
     ПРОИГРЫВАТЕЛЬ
     ============================================================ */
  var pendingResume = null;

  function next() {
    if (!running) return;
    if (idx >= steps.length) { rebuild(); }
    var st = steps[idx++];
    if (!st) { stop(); return; }
    st.run(function (pause) {
      if (!running) return;
      timer = setTimeout(next, pause || 0);
    });
  }

  function rebuild() {
    steps = []; idx = 0;
    if (typeof window.SCENARIO === 'function') window.SCENARIO(S);
    if (!steps.length) S.wait(1500);
  }

  function start() {
    if (running) return;
    running = true;
    cursor.classList.add('on');
    btnRun.classList.add('running');
    btnRunLabel.textContent = 'Пауза';
    if (pendingResume) { var f = pendingResume; pendingResume = null; f(); return; }
    if (!steps.length) rebuild();
    next();
  }

  function stop() {
    running = false;
    clearTimeout(timer);
    btnRun.classList.remove('running');
    btnRunLabel.textContent = pendingResume || idx ? 'Продолжить' : 'Имитация';
  }

  function reset() {
    stop();
    steps = []; idx = 0; pendingResume = null;
    cursor.classList.remove('on');
    btnRunLabel.textContent = 'Имитация';
    try { window.getSelection().removeAllRanges(); } catch (e) {}
    Array.prototype.forEach.call(document.querySelectorAll('.sim-hot'),
      function (n) { n.classList.remove('sim-hot'); });
    if (page.onReset) page.onReset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ============================================================
     ПАНЕЛЬ УПРАВЛЕНИЯ
     ============================================================ */
  function buildControls() {
    elControls = document.createElement('div');
    elControls.className = 'controls';

    var back = '';
    if (page.back) {
      back = '<a class="btn" href="' + page.back.href + '">' + page.back.text + '</a>';
    }
    elControls.innerHTML =
      back +
      '<button class="btn btn-fill" id="simRun" title="Пробел — старт/пауза">' +
        '<span class="dot"></span><span id="simRunLabel">Имитация</span></button>' +
      '<button class="btn btn-reset" id="simReset" title="Esc — сброс">Сброс</button>' +
      '<button class="btn btn-icon" id="simHide" title="Спрятать панель (H — вернуть)">✕</button>';
    document.body.appendChild(elControls);

    hint = document.createElement('div');
    hint.className = 'hint';
    hint.innerHTML = 'Панель скрыта · <b>H</b> — вернуть · <b>Пробел</b> — старт/пауза · <b>Esc</b> — сброс';
    document.body.appendChild(hint);

    btnRun = document.getElementById('simRun');
    btnRunLabel = document.getElementById('simRunLabel');
    btnRun.addEventListener('click', function () { running ? stop() : start(); });
    document.getElementById('simReset').addEventListener('click', reset);
    document.getElementById('simHide').addEventListener('click', toggleBar);
  }

  function toggleBar() {
    elControls.classList.toggle('hidden');
    if (elControls.classList.contains('hidden')) {
      hint.classList.add('show');
      setTimeout(function () { hint.classList.remove('show'); }, 2600);
    }
  }

  /* ============================================================
     РУЧНОЙ РЕЖИМ
     Живое действие актёра важнее сценария: ставим на паузу.
     ============================================================ */
  function watchHuman() {
    function human(e) {
      if (!running) return;
      if (elControls.contains(e.target)) return;   // свои же кнопки не считаем
      stop();
    }
    document.addEventListener('mousedown', human, true);
    document.addEventListener('touchstart', human, true);
    document.addEventListener('wheel', human, { capture: true, passive: true });
  }

  function keys(e) {
    var t = e.target, tag = t && t.tagName;
    var inField = tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable);
    if (e.key === 'Escape') { e.preventDefault(); reset(); return; }
    if (inField) return;                       // в поле — просто печатаем
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); running ? stop() : start(); }
    else if (e.key === 'h' || e.key === 'H' || e.key === 'р' || e.key === 'Р') toggleBar();
  }

  /* ============================================================
     ВНЕШНИЙ ВХОД
     ============================================================ */
  function init(opts) {
    page = opts || {};
    buildCursor();
    buildControls();
    watchHuman();
    document.addEventListener('keydown', keys);
    if (page.autostart) setTimeout(start, 900);
  }

  return { init: init, start: start, stop: stop, reset: reset, speed: SP };
})();


/* ============================================================
   ИКОНКИ ПЛИТОК (инлайн, ничего не тянем из сети)
   ============================================================ */
window.ZXC_ICONS = (function () {
  function g(id, a, b) {
    return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/>' +
      '</linearGradient></defs>';
  }
  var S = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">';
  return {
    eye: S + g('ge', '#4a5a6b', '#0d1420') +
      '<circle cx="32" cy="32" r="32" fill="url(#ge)"/>' +
      '<ellipse cx="32" cy="32" rx="24" ry="15" fill="#eef3f8"/>' +
      '<circle cx="32" cy="32" r="11" fill="#12212f"/>' +
      '<circle cx="32" cy="32" r="4.5" fill="#000"/>' +
      '<circle cx="27" cy="27" r="3" fill="#fff" opacity=".9"/></svg>',

    rune: S +
      '<circle cx="32" cy="32" r="32" fill="#0a0a0a"/>' +
      '<circle cx="32" cy="32" r="26" fill="none" stroke="#e8e8e8" stroke-width="1"/>' +
      '<circle cx="32" cy="32" r="21" fill="none" stroke="#8a8a8a" stroke-width="1" stroke-dasharray="3 3"/>' +
      '<path d="M26 20h7a7 7 0 010 14h-7zM26 34l11 11M26 20v25" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',

    plane: S + g('gp', '#3fa9e8', '#1878c4') +
      '<circle cx="32" cy="32" r="32" fill="url(#gp)"/>' +
      '<path d="M47 21L17 33l9 3 3 10 5-7 9 6z" fill="#fff"/>' +
      '<path d="M26 36l17-11-13 15z" fill="#cfe6f7"/></svg>',

    chat: S + g('gc', '#3d3f8f', '#2bb3a3') +
      '<circle cx="32" cy="32" r="32" fill="url(#gc)"/>' +
      '<path d="M20 23h24a4 4 0 014 4v12a4 4 0 01-4 4H31l-8 7v-7h-3a4 4 0 01-4-4V27a4 4 0 014-4z" fill="#fff"/>' +
      '<circle cx="27" cy="33" r="2.4" fill="#3d3f8f"/><circle cx="34" cy="33" r="2.4" fill="#3d3f8f"/>' +
      '<circle cx="41" cy="33" r="2.4" fill="#3d3f8f"/></svg>',

    clock: S + g('gk', '#3fa0e8', '#1565c0') +
      '<circle cx="32" cy="32" r="32" fill="url(#gk)"/>' +
      '<circle cx="32" cy="32" r="19" fill="#fff"/>' +
      '<path d="M32 20v13l9 5" stroke="#1565c0" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',

    search: S + g('gs', '#35b7d0', '#1b8fb0') +
      '<circle cx="32" cy="32" r="32" fill="url(#gs)"/>' +
      '<rect x="14" y="21" width="24" height="4.5" rx="2.2" fill="#fff"/>' +
      '<rect x="14" y="30" width="17" height="4.5" rx="2.2" fill="#fff"/>' +
      '<rect x="14" y="39" width="21" height="4.5" rx="2.2" fill="#fff"/>' +
      '<circle cx="42" cy="36" r="9" fill="none" stroke="#fff" stroke-width="4"/>' +
      '<path d="M49 43l6 6" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/></svg>',

    book: S +
      '<rect x="2" y="2" width="60" height="60" rx="12" fill="#fdfdff"/>' +
      '<path d="M14 18h15a5 5 0 015 5v25a5 5 0 00-5-4H14z" fill="none" stroke="#8b3fd6" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M50 18H35a5 5 0 00-5 5v25a5 5 0 015-4h15z" fill="none" stroke="#8b3fd6" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M39 24h7M39 31h7" stroke="#2bb3e8" stroke-width="3" stroke-linecap="round"/></svg>',

    floppy: S + g('gf', '#eaf3ff', '#bcd6f5') +
      '<circle cx="32" cy="32" r="32" fill="url(#gf)"/>' +
      '<circle cx="32" cy="32" r="26" fill="none" stroke="#2f6fd0" stroke-width="3"/>' +
      '<path d="M20 20h20l6 6v18H20z" fill="#2f6fd0"/>' +
      '<rect x="25" y="20" width="11" height="9" fill="#eaf3ff"/>' +
      '<rect x="24" y="33" width="16" height="11" fill="#eaf3ff"/></svg>',

    face1: S + g('g1', '#c9a227', '#6b4f12') +
      '<circle cx="32" cy="32" r="32" fill="url(#g1)"/>' +
      '<circle cx="32" cy="27" r="11" fill="#f0d9b5"/>' +
      '<path d="M12 58c2-13 10-19 20-19s18 6 20 19z" fill="#2f5d74"/>' +
      '<path d="M21 24c4-9 18-9 22 0" fill="none" stroke="#2f5d74" stroke-width="4" stroke-linecap="round"/></svg>',

    face2: S + g('g2', '#2b2f5e', '#0d0f22') +
      '<circle cx="32" cy="32" r="32" fill="url(#g2)"/>' +
      '<circle cx="32" cy="26" r="10" fill="#e9d3c0"/>' +
      '<path d="M13 58c2-12 10-18 19-18s17 6 19 18z" fill="#3d4a86"/>' +
      '<path d="M22 22c3-8 17-8 20 0l-3 3H25z" fill="#141733"/></svg>',
  };
})();
