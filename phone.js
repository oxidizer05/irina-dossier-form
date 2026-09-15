/* ============================================================
   ДВИЖОК ЭКРАНА ТЕЛЕФОНА
   Ведёт «палец», нажимает, листает, переключает экраны.
   Работает и сам (авто), и вручную: любое реальное касание
   ставит авто на паузу — актриса тапает сама. Пробел/тап по
   «▶» — старт/пауза, Esc — сброс, H — спрятать пульт.
   ?auto=1 — запуск сразу, ?speed=slow|normal|fast, ?frame=1 — рамка.
   ============================================================ */

window.PHONESIM = (function () {
  'use strict';

  var SPEEDS = {
    slow:   { move: 1.5, gap: 1100 },
    normal: { move: 1.0, gap: 720 },
    fast:   { move: .6,  gap: 400 },
  };
  var q = (location.search.match(/speed=(\w+)/) || [])[1];
  var SP = SPEEDS[q] || SPEEDS.normal;

  var steps = [], idx = 0, running = false, timer = null, pending = null;
  var screenEl, finger, tapfx, remote, ctl, btnRun, btnLabel, page = {};
  var fx = 0, fy = 0, takeover = false, scenarioFn = null;

  function el(sel) {
    if (!sel) return null;
    if (typeof sel === 'function') return sel();
    if (typeof sel === 'string') return screenEl.querySelector(sel);
    return sel;
  }
  function srect() { return screenEl.getBoundingClientRect(); }
  function pointOf(node) {
    var r = node.getBoundingClientRect(), s = srect();
    return { x: r.left - s.left + r.width * (.4 + Math.random() * .2),
             y: r.top - s.top + r.height * (.42 + Math.random() * .18) };
  }
  function place(x, y, ms) {
    finger.style.transition = ms ? 'transform ' + ms + 'ms cubic-bezier(.33,.05,.28,1)' : 'none';
    finger.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    fx = x; fy = y;
  }
  function travel(x, y) {
    var d = Math.hypot(x - fx, y - fy);
    return Math.max(220, Math.min(1200, d * 1.2)) * SP.move;
  }

  /* ---------- шаги ---------- */
  var S = {
    to: function (sel) {
      steps.push({ run: function (done) {
        var n = el(sel); if (!n) return done(0);
        var p = pointOf(n), t = travel(p.x, p.y);
        place(p.x, p.y, t); done(t + 90);
      }});
      return S;
    },
    hover: function (sel, ms) {          // «палец завис над…»
      S.to(sel);
      steps.push({ run: function (done) { done(ms || 1400); } });
      return S;
    },
    tap: function (sel, andClick) {
      S.to(sel);
      steps.push({ run: function (done) {
        var n = el(sel);
        tapfx.className = 'tapfx' + (takeover ? ' take' : '');
        tapfx.style.transform = 'translate(' + fx + 'px,' + fy + 'px)';
        void tapfx.offsetWidth; tapfx.classList.add('go');
        finger.style.transform = 'translate(' + fx + 'px,' + fy + 'px) scale(.86)';
        setTimeout(function () { place(fx, fy, 0); }, 150);
        if (n && andClick !== false) setTimeout(function () { try { n.click(); } catch (e) {} }, 80);
        done(SP.gap * .7);
      }});
      return S;
    },
    show: function (id) {
      steps.push({ run: function (done) {
        Array.prototype.forEach.call(screenEl.querySelectorAll('.scr'),
          function (s) { s.classList.toggle('on', s.id === 'scr-' + id); });
        done(SP.gap * .7);
      }});
      return S;
    },
    scroll: function (sel, y) {
      steps.push({ run: function (done) {
        var n = el(sel); if (n) n.scrollTo({ top: y, behavior: 'smooth' });
        done(700 * SP.move + 150);
      }});
      return S;
    },
    take: function (on) {
      steps.push({ run: function (done) {
        takeover = on;
        finger.classList.toggle('on', on);     // палец появляется/исчезает вместе с «чужим»
        finger.classList.toggle('take', on);
        remote.classList.toggle('on', on);
        done(on ? 500 : 120);
      }});
      return S;
    },
    wait: function (ms) { steps.push({ run: function (d) { d(ms); } }); return S; },
    act:  function (fn, after) { steps.push({ run: function (d) { try { fn(); } catch (e) {} d(after || SP.gap); } }); return S; },
  };

  /* ---------- проигрыватель ---------- */
  function next() {
    if (!running) return;
    if (idx >= steps.length) rebuild();
    var st = steps[idx++];
    if (!st) { stop(); return; }
    st.run(function (pause) { if (running) timer = setTimeout(next, pause || 0); });
  }
  function rebuild() {
    steps = []; idx = 0;
    var fn = scenarioFn || window.SCENARIO;
    if (typeof fn === 'function') fn(S);
    if (!steps.length) S.wait(1500);
  }
  // проиграть отдельный кусок (например, только «чужую активность»)
  function play(fn) { stop(); steps = []; idx = 0; scenarioFn = fn; start(); }
  function start() {
    if (running) return;
    running = true;
    finger.classList.toggle('on', takeover);   // палец виден только в фазе «чужого»
    btnRun.classList.add('running'); btnLabel.textContent = 'Пауза';
    ctl.classList.add('hidden');        // прячем пульт, чтобы не попадал в кадр
    if (!steps.length) rebuild();
    next();
  }
  function stop() {
    running = false; clearTimeout(timer);
    finger.classList.remove('on');
    btnRun.classList.remove('running');
    btnLabel.textContent = idx ? 'Продолжить' : 'Имитация';
  }
  function reset() {
    stop(); steps = []; idx = 0; takeover = false; scenarioFn = null;
    finger.classList.remove('take'); remote.classList.remove('on');
    btnLabel.textContent = 'Имитация';
    if (page.onReset) page.onReset();
  }

  /* ---------- пульт (вне кадра) ---------- */
  function buildCtl() {
    ctl = document.createElement('div');
    ctl.className = 'ctl';
    ctl.innerHTML =
      '<button class="run" id="pRun"><span id="pRunL">Имитация</span></button>' +
      '<button class="g" id="pReset">Сброс</button>' +
      '<button class="g" id="pHide">✕</button>';
    document.body.appendChild(ctl);
    var rev = document.createElement('div');
    rev.className = 'reveal'; document.body.appendChild(rev);

    btnRun = document.getElementById('pRun');
    btnLabel = document.getElementById('pRunL');
    btnRun.addEventListener('click', function () { running ? stop() : start(); });
    document.getElementById('pReset').addEventListener('click', reset);
    document.getElementById('pHide').addEventListener('click', hide);
    rev.addEventListener('click', function () { ctl.classList.remove('hidden'); });
  }
  function hide() { ctl.classList.add('hidden'); }

  /* ---------- ручной режим ---------- */
  function watchHuman() {
    function human(e) {
      if (!running) return;
      if (ctl.contains(e.target)) return;
      stop();
    }
    document.addEventListener('pointerdown', human, true);
    document.addEventListener('wheel', human, { capture: true, passive: true });
  }
  function keys(e) {
    if (e.key === 'Escape') { e.preventDefault(); reset(); return; }
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); running ? stop() : start(); }
    else if (e.key === 'h' || e.key === 'H' || e.key === 'р' || e.key === 'Р') {
      ctl.classList.toggle('hidden');
    }
  }

  function init(opts) {
    page = opts || {};
    screenEl = document.querySelector('.screen');
    finger = document.querySelector('.finger');
    tapfx  = document.querySelector('.tapfx');
    remote = document.querySelector('.remote');
    place(srect().width * .5, srect().height * .62, 0);
    buildCtl(); watchHuman();
    document.addEventListener('keydown', keys);
    if (/auto=1/.test(location.search)) setTimeout(start, 1000);
  }

  return { init: init, start: start, stop: stop, reset: reset,
           play: play, isRunning: function () { return running; },
           take: function (on) { takeover = on; finger.classList.toggle('on', on); finger.classList.toggle('take', on); remote.classList.toggle('on', on); } };
})();
