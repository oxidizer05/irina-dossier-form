/* ============================================================
   Анкета-досье — движок «печати в кадре».
   Автозаполнение, режим клавиш, сброс, тема.
   ============================================================ */
(function () {
  'use strict';

  var D = window.DOSSIER_DATA;
  var params = new URLSearchParams(location.search);
  var SPEED = window.DOSSIER_SPEED[params.get('speed')] || window.DOSSIER_SPEED.normal;
  var TYPOS = params.get('typos') === '1';          // ?typos=1 — печатать с опечатками и правками

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- элементы ---------- */
  var el = {
    fill: $('btnFill'), fillLabel: $('btnFillLabel'), reset: $('btnReset'),
    keys: $('btnKeys'), theme: $('btnTheme'), hide: $('btnHide'),
    controls: $('controls'), hint: $('hint'),
    status: $('hStatus'), bar: $('progressBar'),
    photo: $('photo'), photoImg: $('photoImg'), photoInput: $('photoInput'),
    relatives: $('f_relatives'),
  };

  /* ---------- шапка ---------- */
  $('hSystem').textContent = D.meta.system;
  $('hTitle').textContent = D.meta.title;
  $('hCase').textContent = D.meta.caseNo;
  $('hDate').textContent = new Date().toLocaleDateString('ru-RU');

  /* ---------- чипы ---------- */
  function buildChips(host, list) {
    host.innerHTML = '';
    list.forEach(function (name) {
      var c = document.createElement('div');
      c.className = 'chip';
      c.dataset.value = name;
      c.innerHTML = '<i class="box"></i><span></span>';
      c.querySelector('span').textContent = name;
      c.addEventListener('click', function () { c.classList.toggle('on'); });
      host.appendChild(c);
    });
  }
  buildChips($('chips_social'), D.social);
  buildChips($('chips_banks'), D.banks);

  /* ---------- фото ---------- */
  var photoSrc = null;

  function setPhotoSrc(src) {
    photoSrc = src;
    el.photoImg.src = src;
  }
  function showPhoto(withScan) {
    if (!photoSrc) return;
    el.photo.classList.add('has');
    if (withScan) {
      el.photo.classList.remove('scanning');
      void el.photo.offsetWidth;               // перезапуск анимации
      el.photo.classList.add('scanning');
      setTimeout(function () { el.photo.classList.remove('scanning'); }, 1200);
    }
  }
  function hidePhoto() {
    el.photo.classList.remove('has', 'scanning');
  }

  // пробуем подхватить файл из data.js, иначе — заглушку из assets/
  (function loadPhoto() {
    var candidates = [D.photo, 'assets/placeholder.svg'].filter(Boolean);
    (function next(i) {
      if (i >= candidates.length) return;
      var probe = new Image();
      probe.onload = function () { setPhotoSrc(candidates[i]); };
      probe.onerror = function () { next(i + 1); };
      probe.src = candidates[i];
    })(0);
  })();

  el.photo.addEventListener('click', function () { el.photoInput.click(); });
  el.photo.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); el.photoInput.click(); }
  });
  el.photoInput.addEventListener('change', function () {
    var f = el.photoInput.files && el.photoInput.files[0];
    if (f) readPhoto(f);
  });
  ['dragenter', 'dragover'].forEach(function (t) {
    el.photo.addEventListener(t, function (e) { e.preventDefault(); el.photo.classList.add('drag'); });
  });
  ['dragleave', 'drop'].forEach(function (t) {
    el.photo.addEventListener(t, function (e) { e.preventDefault(); el.photo.classList.remove('drag'); });
  });
  el.photo.addEventListener('drop', function (e) {
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) readPhoto(f);
  });
  function readPhoto(file) {
    if (!/^image\//.test(file.type)) return;
    var r = new FileReader();
    r.onload = function () { setPhotoSrc(r.result); showPhoto(false); };
    r.readAsDataURL(file);
  }

  /* ---------- сценарий: список «атомов» ---------- */
  // Атом = один видимый шаг: символ, галочка, фото.
  var atoms = [];
  var pos = 0;

  function fieldEl(name) { return document.querySelector('[data-field="' + name + '"]'); }

  function pushText(name, text) {
    var node = fieldEl(name);
    if (!node) return;
    atoms.push({ delay: SPEED.field, run: function () {
      node.classList.add('typing');
      node.focus({ preventScroll: false });
      node.scrollIntoView({ block: 'center', behavior: 'smooth' });
      node.value = '';
    }});
    var chars = Array.from(text);
    chars.forEach(function (ch, i) {
      // изредка — опечатка с последующей правкой (включается через ?typos=1)
      if (TYPOS && i > 2 && ch !== '\n' && Math.random() < 0.035) {
        var wrong = 'ывапролджэ'[Math.floor(Math.random() * 10)];
        atoms.push({ delay: SPEED.char, run: function () { node.value += wrong; caretEnd(node); } });
        atoms.push({ delay: SPEED.char * 3, run: function () { node.value = node.value.slice(0, -1); caretEnd(node); } });
      }
      atoms.push({
        delay: ch === '\n' ? SPEED.char * 5 : (ch === ' ' ? SPEED.char * 1.5 : SPEED.char),
        run: function () { node.value += ch; caretEnd(node); }
      });
    });
    atoms.push({ delay: 90, run: function () {
      node.classList.remove('typing');
      node.classList.add('done');
      node.blur();
    }});
  }

  function caretEnd(node) {
    try { node.selectionStart = node.selectionEnd = node.value.length; } catch (e) {}
    if (node.tagName === 'TEXTAREA') node.scrollTop = node.scrollHeight;
  }

  function pushChips(name) {
    var host = fieldEl(name);
    if (!host) return;
    atoms.push({ delay: SPEED.field, run: function () {
      host.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }});
    Array.prototype.forEach.call(host.children, function (chip) {
      atoms.push({ delay: Math.max(160, SPEED.char * 4), run: function () {
        chip.classList.add('on', 'pop');
        setTimeout(function () { chip.classList.remove('pop'); }, 300);
      }});
    });
  }

  function pushPhoto() {
    atoms.push({ delay: 1250, run: function () { showPhoto(true); } });
  }

  function buildScript() {
    atoms = []; pos = 0;
    D.order.forEach(function (key) {
      if (key === 'photo') return pushPhoto();
      if (key === 'social' || key === 'banks') return pushChips(key);
      if (key === 'relatives') return pushText('relatives', D.relatives.join('\n'));
      if (typeof D[key] === 'string') return pushText(key, D[key]);
    });
  }
  buildScript();

  /* ---------- состояние ---------- */
  var running = false, keysMode = false, timer = null;

  function setStatus(text, cls) {
    el.status.textContent = text;
    el.status.className = 'st ' + cls;
  }
  function updateProgress() {
    el.bar.style.width = (atoms.length ? (pos / atoms.length * 100) : 0) + '%';
  }

  function step() {
    if (pos >= atoms.length) { finish(); return null; }
    var a = atoms[pos++];
    a.run();
    updateProgress();
    return a;
  }

  function finish() {
    stop();
    setStatus('ЗАПОЛНЕНО', 'st-done');
    el.bar.style.width = '100%';
  }

  function tick() {
    var a = step();
    if (!a) return;
    var d = a.delay + (Math.random() * SPEED.jitter - SPEED.jitter / 2);
    timer = setTimeout(tick, Math.max(12, d));
  }

  function start() {
    if (pos >= atoms.length) return;
    running = true;
    el.fill.classList.add('running');
    el.fillLabel.textContent = 'Пауза';
    setStatus('ЗАПОЛНЯЕТСЯ', 'st-run');
    tick();
  }

  function stop() {
    running = false;
    clearTimeout(timer);
    el.fill.classList.remove('running');
    el.fillLabel.textContent = pos > 0 && pos < atoms.length ? 'Продолжить' : 'Автозаполнение';
    document.querySelectorAll('.inp.typing').forEach(function (n) { n.classList.remove('typing'); });
  }

  function toggleFill() { running ? stop() : start(); }

  function resetAll() {
    stop();
    pos = 0;
    document.querySelectorAll('.inp').forEach(function (n) {
      n.value = '';
      n.classList.remove('typing', 'done');
    });
    document.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on', 'pop'); });
    hidePhoto();
    el.fillLabel.textContent = 'Автозаполнение';
    setStatus('НЕ ЗАПОЛНЕНО', 'st-empty');
    updateProgress();
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- режим клавиш ---------- */
  // Актёр реально нажимает клавиши — на экране появляется следующий символ анкеты.
  function setKeysMode(on) {
    keysMode = on;
    el.keys.classList.toggle('on', on);
    el.keys.title = on ? 'Режим клавиш ВКЛ: любая клавиша печатает следующий символ'
                       : 'Режим клавиш: печатает по нажатию любой клавиши';
    if (on) { stop(); setStatus('РУЧНОЙ ВВОД', 'st-run'); }
    else if (pos > 0 && pos < atoms.length) setStatus('ПАУЗА', 'st-run');
  }

  /* ---------- кнопки ---------- */
  el.fill.addEventListener('click', function () { el.fill.blur(); toggleFill(); });
  el.reset.addEventListener('click', function () { el.reset.blur(); resetAll(); });
  el.keys.addEventListener('click', function () { el.keys.blur(); setKeysMode(!keysMode); });

  el.theme.addEventListener('click', function () {
    var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('dossier-theme', next); } catch (e) {}
    el.theme.blur();
  });
  try {
    var saved = localStorage.getItem('dossier-theme');
    if (saved) document.documentElement.dataset.theme = saved;
  } catch (e) {}

  function setPanel(hidden) {
    el.controls.classList.toggle('hidden', hidden);
    el.hint.classList.toggle('show', hidden);
    if (hidden) setTimeout(function () { el.hint.classList.remove('show'); }, 2600);
  }
  el.hide.addEventListener('click', function () { setPanel(true); });

  /* ---------- клавиатура ---------- */
  document.addEventListener('keydown', function (e) {
    var inField = /^(INPUT|TEXTAREA)$/.test(e.target.tagName);

    if (e.key === 'Escape') { e.preventDefault(); resetAll(); return; }

    // Режим клавиш: любая «печатная» клавиша выдаёт следующий символ сценария
    if (keysMode && !e.metaKey && !e.ctrlKey && !e.altKey) {
      if (e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Tab') {
        e.preventDefault();
        step();
        return;
      }
    }

    if (inField) return;                       // не мешаем ручному вводу

    if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); toggleFill(); return; }
    if (e.key === 'h' || e.key === 'H' || e.key === 'р' || e.key === 'Р') {
      setPanel(!el.controls.classList.contains('hidden'));
    }
  });

  updateProgress();
})();
