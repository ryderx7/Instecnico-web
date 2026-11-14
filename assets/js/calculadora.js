(function () {
  'use strict';

  var KEY = 'instecnico_calc_v1';
  var PASS = 3;
  var OBJ = '3.0';
  var EPS = 1e-9;
  var MAX_NOTES = 11;
  var DELAY = 150;
  var DEFAULT_M1 = { p1: '', p2: '', pct1: '33', pct2: '33', pct3: '34', obj: OBJ };
  var HELP_OFF = 'Se suman todas las notas y se divide entre la cantidad. Modo normal.';
  var HELP_ON = 'Cada nota tiene un peso. Deben sumar 100%. Útil cuando el profe asigna porcentajes.';
  var NUM_PATTERN = '[0-9]*[.,]?[0-9]*';
  var CONFETTI_COLORS = ['#C9A227', '#DFB93F', '#2E563E', '#8FD19E', '#1B3A2A'];
  var SOUNDS = {
    success: { notes: [523.25, 659.25, 783.99], step: 0.14, dur: 0.22 },
    excellent: { notes: [523.25, 659.25, 783.99, 1046.5], step: 0.17, dur: 0.3 },
    fail: { notes: [329.63, 261.63], step: 0.22, dur: 0.3 },
    tick: { notes: [880], step: 0, dur: 0.08 }
  };
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  function parseNum(v) {
    if (v === null || v === undefined) return NaN;
    var s = String(v).trim().replace(',', '.');
    if (s === '') return NaN;
    var n = Number(s);
    return isFinite(n) ? n : NaN;
  }
  function trimNum(n, d) { return String(parseFloat(n.toFixed(d))); }
  function fix2(n) { return n.toFixed(2); }
  function up2(n) { return Math.ceil(n * 100 - 1e-7) / 100; }
  function fmtGrade(n) {
    var t = trimNum(n, 2);
    return t.indexOf('.') < 0 ? t + '.0' : t;
  }
  function debounce(fn, ms) {
    var t = 0;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function cleanNum(v) {
    var s = String(v).replace(/[^0-9.,]/g, '').replace(/,/g, '.');
    var i = s.indexOf('.');
    if (i > -1) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '');
    return s;
  }

  function sanitize(inp) {
    var before = inp.value;
    var after = cleanNum(before);
    if (after === before) return;
    var pos = inp.selectionStart;
    inp.value = after;
    if (pos !== null && inp.setSelectionRange) {
      var p = Math.max(0, pos - (before.length - after.length));
      try { inp.setSelectionRange(p, p); } catch (e) {}
    }
  }

  function freshNotes() {
    return [{ grade: '', pct: '' }, { grade: '', pct: '' }, { grade: '', pct: '' }];
  }

  function freshState() {
    return { tab: 'm1', sound: true, m1: Object.assign({}, DEFAULT_M1), m2: { weighted: false, notes: freshNotes() } };
  }

  function load() {
    var s = freshState();
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return s;
      var d = JSON.parse(raw);
      if (d && typeof d === 'object') {
        if (d.tab === 'm2') s.tab = 'm2';
        if (typeof d.sound === 'boolean') s.sound = d.sound;
        if (d.m1 && typeof d.m1 === 'object') {
          Object.keys(DEFAULT_M1).forEach(function (k) {
            if (k !== 'obj' && typeof d.m1[k] === 'string') s.m1[k] = cleanNum(d.m1[k]);
          });
        }
        if (d.m2 && typeof d.m2 === 'object') {
          s.m2.weighted = d.m2.weighted === true;
          if (Array.isArray(d.m2.notes) && d.m2.notes.length) {
            s.m2.notes = d.m2.notes.slice(0, MAX_NOTES).map(function (n) {
              return {
                grade: n && typeof n.grade === 'string' ? cleanNum(n.grade) : '',
                pct: n && typeof n.pct === 'string' ? cleanNum(n.pct) : ''
              };
            });
          }
        }
      }
    } catch (e) {}
    return s;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  var state = load();
  var touched1 = false;
  var touched2 = false;
  var audioCtx = null;
  var edgeTimer = 0;
  var lastTierM2 = null;
  var lastCelebrateAt = 0;
  var CELEBRATE_COOLDOWN = 1500;

  var el = {
    tabs: $$('[role="tab"]'),
    panels: { m1: $('#panel-m1'), m2: $('#panel-m2') },
    m1Form: $('#m1Form'),
    m1Inputs: $$('[data-m1]'),
    m1Sum: $('#m1Sum'),
    m1Reset: $('#m1Reset'),
    m1Result: $('#m1Result'),
    m2Form: $('#m2Form'),
    m2Switch: $('#m2Switch'),
    m2Help: $('#m2SwitchHelp'),
    m2List: $('#m2List'),
    m2Sum: $('#m2Sum'),
    m2Add: $('#m2Add'),
    m2Reset: $('#m2Reset'),
    m2Result: $('#m2Result'),
    confetti: $('#confetti'),
    edge: $('#edgeGlow'),
    soundBtn: $('#soundToggle'),
    soundLabel: $('#soundLabel')
  };

  function getCtx() {
    if (audioCtx) return audioCtx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { audioCtx = new AC(); } catch (e) { audioCtx = null; }
    return audioCtx;
  }

  function playSound(type) {
    if (!state.sound || reduceMQ.matches) return;
    var def = SOUNDS[type];
    if (!def) return;
    var ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
    var t0 = ctx.currentTime + 0.01;
    def.notes.forEach(function (freq, i) {
      var start = t0 + i * def.step;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.06, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + def.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + def.dur + 0.02);
    });
  }

  function syncSound() {
    el.soundBtn.setAttribute('aria-pressed', String(state.sound));
    el.soundLabel.textContent = 'Sonido: ' + (state.sound ? 'ON' : 'OFF');
  }

  function calcM1(m) {
    var f = {
      p1: parseNum(m.p1), p2: parseNum(m.p2), obj: parseNum(m.obj),
      pct1: parseNum(m.pct1), pct2: parseNum(m.pct2), pct3: parseNum(m.pct3)
    };
    var empty = Object.keys(f).filter(function (k) { return isNaN(f[k]); });
    if (empty.length) return { type: 'empty', text: 'Completa los campos para calcular.', bad: empty, soft: true };

    var range = ['p1', 'p2', 'obj'].filter(function (k) { return f[k] < 0 || f[k] > 5; });
    if (range.length) return { type: 'error', text: 'Las notas deben estar entre 0.0 y 5.0.', bad: range };

    var pcts = ['pct1', 'pct2', 'pct3'];
    var negative = pcts.filter(function (k) { return f[k] < 0; });
    if (negative.length) return { type: 'error', text: 'Los porcentajes no pueden ser negativos.', bad: negative };

    var sum = f.pct1 + f.pct2 + f.pct3;
    if (Math.abs(sum - 100) > 0.005) {
      return { type: 'error', text: 'Los porcentajes deben sumar 100%. Ahora suman ' + trimNum(sum, 2) + '%.', bad: pcts };
    }
    if (f.pct3 <= 0) return { type: 'error', text: 'El porcentaje del P3 debe ser mayor que 0.', bad: ['pct3'] };

    var acc = f.p1 * f.pct1 / 100 + f.p2 * f.pct2 / 100;
    var need = (f.obj - acc) / (f.pct3 / 100);
    return { type: 'ok', need: need, acc: acc, obj: f.obj, bad: [] };
  }

  function tierM1(need) {
    if (need <= EPS) return 'safe';
    if (need > 5 + EPS) return 'impossible';
    var n = Math.round(need * 1e6) / 1e6;
    if (n < 1) return 'relaxed';
    if (n < 2) return 'comfy';
    if (n < 3) return 'moderate';
    if (n <= 4) return 'challenge';
    return 'demanding';
  }

  function m1Html(r) {
    if (r.type === 'empty') {
      return '<div class="res res--dark"><p class="res-label">Resultado</p><p class="res-msg">' + r.text + '</p></div>';
    }
    if (r.type === 'error') {
      return '<div class="res res--dark is-error"><p class="res-label">Revisa los datos</p><p class="res-msg">' + r.text + '</p></div>';
    }
    var need = r.need;
    var tier = tierM1(need);
    if (tier === 'safe') {
      return '<div class="res res--dark"><p class="res-label">Resultado</p>' +
        '<p class="res-big">Vas sobrado con las notas que llevas. Respira, ya tienes la materia asegurada. 🏆</p>' +
        '<p class="res-note">Con el P1 y el P2 ya sumas ' + fix2(r.acc) + ' puntos para tu objetivo de ' + fmtGrade(r.obj) + '.</p></div>';
    }

    var shown = fix2(Math.min(5, up2(need)));
    var rec = fix2(Math.min(5, up2(need + 0.15)));
    var msg = '';
    var sub = '';
    if (tier === 'relaxed') {
      msg = 'Con esto la sacas sin despeinarte. Relájate, tú puedes. 😎';
      sub = 'Pero igual no dejes de ir a clase, ¿eh?';
    } else if (tier === 'comfy') {
      msg = 'Tienes la materia casi ganada. Un esfuerzo pequeño y listo.';
      sub = 'Aprovecha que vas bien, no te duermas en los laureles.';
    } else if (tier === 'moderate') {
      msg = 'Necesitas una nota decente, no te confíes. Con esfuerzo lo sacas.';
      sub = 'Apunta a <strong>' + rec + '</strong> o más para no quedar al filo.';
    } else if (tier === 'challenge') {
      msg = 'Toca esforzarse en serio. Necesitas <strong>' + shown + '</strong> en el P3.';
      sub = 'Es alcanzable. Organiza tu tiempo y dale.';
    } else if (tier === 'demanding') {
      msg = 'Necesitas casi la perfección. <strong>' + shown + '</strong> en el P3.';
      sub = 'Es difícil pero no imposible. Habla con el profe, pregunta, participa.';
    } else {
      msg = 'Matemáticamente no alcanza. Necesitas recuperación u otra estrategia.';
      sub = 'No es el fin del mundo. Habla con tu profe para ver opciones.';
    }

    if (tier === 'impossible') {
      return '<div class="res res--dark is-error"><p class="res-label">Tercer periodo</p>' +
        '<p class="res-num is-fail">' + shown + '</p>' +
        '<p class="res-msg">' + msg + '</p><p class="res-sub">' + sub + '</p>' +
        '<p class="res-note">Necesitarías ' + fix2(need) + ' en el P3 y la nota máxima es 5.0.</p></div>';
    }

    var exact = trimNum(need, 4);
    var exactHtml = exact !== trimNum(parseFloat(shown), 4) ? '<p class="res-note">(valor exacto: ' + exact + ')</p>' : '';
    var cls = need >= 4 - EPS ? 'is-high' : 'is-ok';
    return '<div class="res res--dark"><p class="res-label">Tercer periodo</p>' +
      '<p class="res-num ' + cls + '">' + shown + '</p>' +
      '<p class="res-msg">' + msg + '</p><p class="res-sub">' + sub + '</p>' +
      exactHtml +
      '<p class="res-rec">Recomendado apuntar a <strong>' + rec + '</strong> o más (para evitar redondeos).</p></div>';
  }

  function sumPct(notes) {
    return notes.reduce(function (a, n) {
      var p = parseNum(n.pct);
      return a + (isNaN(p) ? 0 : p);
    }, 0);
  }

  function calcM2(m) {
    var grades = m.notes.map(function (n) { return parseNum(n.grade); });
    var emptyG = [];
    grades.forEach(function (g, i) { if (isNaN(g)) emptyG.push('grade:' + i); });
    if (emptyG.length) return { type: 'empty', text: 'Completa todas las notas.', bad: emptyG, soft: true };

    var badG = [];
    grades.forEach(function (g, i) { if (g < 0 || g > 5) badG.push('grade:' + i); });
    if (badG.length) return { type: 'error', text: 'Las notas deben estar entre 0.0 y 5.0.', bad: badG };

    var def;
    if (!m.weighted) {
      def = grades.reduce(function (a, b) { return a + b; }, 0) / grades.length;
    } else {
      var pcts = m.notes.map(function (n) { return parseNum(n.pct); });
      var emptyP = [];
      pcts.forEach(function (p, i) { if (isNaN(p)) emptyP.push('pct:' + i); });
      if (emptyP.length) return { type: 'empty', text: 'Completa todos los porcentajes.', bad: emptyP, soft: true };

      var badP = [];
      pcts.forEach(function (p, i) { if (p < 0 || p > 100) badP.push('pct:' + i); });
      if (badP.length) return { type: 'error', text: 'Los porcentajes deben estar entre 0 y 100.', bad: badP };

      var sum = pcts.reduce(function (a, b) { return a + b; }, 0);
      if (Math.abs(sum - 100) > 0.005) {
        return {
          type: 'error',
          text: 'Los porcentajes deben sumar 100%. Ahora suman ' + trimNum(sum, 2) + '%.',
          bad: pcts.map(function (p, i) { return 'pct:' + i; })
        };
      }
      def = grades.reduce(function (a, g, i) { return a + g * pcts[i] / 100; }, 0);
    }
    return { type: 'ok', def: def, pass: def >= PASS - EPS, bad: [] };
  }

  var M2_TIERS = {
    lose: {
      card: 'res res--light res--lose', num: 'is-fail', status: 'is-fail', bar: ' is-fail',
      label: 'No aprobado ✗',
      msg: 'Esta vez no fue. Pero siempre hay revancha.',
      sub: 'Habla con tu profe, revisa qué falló y prepárate para la próxima.'
    },
    edge: {
      card: 'res res--light res--edge', num: 'is-high', status: 'is-close', bar: ' is-gold',
      label: 'Aprobado ✓ por un pelito 😅',
      msg: 'Pasaste. Por un pelito, pero pasaste. Pasar es pasar. 🎉',
      sub: 'No te confíes para la próxima, pero hoy se celebra.'
    },
    good: {
      card: 'res res--light res--good', num: 'is-pass', status: 'is-pass', bar: '',
      label: 'Aprobado ✓',
      msg: 'Bien. Aprobaste con lo justo y necesario.',
      sub: 'Con un poquito más de constancia, la próxima es sobresaliente.'
    },
    great: {
      card: 'res res--light res--great', num: 'is-pass', status: 'is-great', bar: '',
      label: '¡Excelente! ✓✓',
      msg: '¡Felicidades! Un muy buen resultado.',
      sub: 'Se nota el esfuerzo. Sigue así.'
    },
    star: {
      card: 'res res--star', num: 'is-high', status: 'is-star', bar: ' is-gold',
      label: '¡Excelencia! ⭐',
      msg: '¡Felicitaciones enormes! Esto es excelencia.',
      sub: 'Pocos llegan hasta aquí. Guarda este momento.'
    }
  };

  function tierM2(r) {
    if (!r.pass) return 'lose';
    if (r.def < 3.1 - EPS) return 'edge';
    if (r.def < 4 - EPS) return 'good';
    if (r.def < 4.6 - EPS) return 'great';
    return 'star';
  }

  function m2Html(r) {
    if (r.type === 'empty') {
      return '<div class="res res--light"><p class="res-label">Resultado</p><p class="res-msg">' + r.text + '</p></div>';
    }
    if (r.type === 'error') {
      return '<div class="res res--light is-error"><p class="res-label">Revisa los datos</p><p class="res-msg">' + r.text + '</p></div>';
    }
    var t = M2_TIERS[tierM2(r)];
    var shown = fix2(r.def);
    var exact = trimNum(r.def, 4);
    var exactHtml = exact !== trimNum(parseFloat(shown), 4) ? '<p class="res-note">(valor exacto: ' + exact + ')</p>' : '';
    var width = Math.max(0, Math.min(100, r.def / 5 * 100)).toFixed(1);
    return '<div class="' + t.card + '"><p class="res-label">Tu nota definitiva</p>' +
      '<p class="res-num ' + t.num + '">' + shown + '</p>' +
      '<p class="res-status ' + t.status + '">' + t.label + '</p>' +
      '<p class="res-msg">' + t.msg + '</p><p class="res-sub">' + t.sub + '</p>' +
      exactHtml +
      '<div class="bar' + t.bar + '" data-w="' + width + '" role="img" aria-label="Nota ' + shown + ' de 5.0. El mínimo para aprobar es 3.0.">' +
      '<span class="bar-fill"></span><span class="bar-mark"><span>3.0 mínimo</span></span></div>' +
      '<div class="bar-scale"><span>0.0</span><span>5.0</span></div></div>';
  }

  function paint(target, type, html) {
    var changed = target.getAttribute('data-type') !== type;
    target.setAttribute('data-type', type);
    target.innerHTML = html;
    var card = target.firstElementChild;
    if (card && changed && !reduceMQ.matches) card.classList.add('fade-up');
    var bar = $('.bar', target);
    if (bar) {
      var w = bar.getAttribute('data-w') + '%';
      if (reduceMQ.matches) bar.style.setProperty('--w', w);
      else requestAnimationFrame(function () { requestAnimationFrame(function () { bar.style.setProperty('--w', w); }); });
    }
  }

  function applyInvalid(inputs, keyOf, r, touched) {
    inputs.forEach(function (inp) {
      var hit = r.bad && r.bad.indexOf(keyOf(inp)) > -1 && (!r.soft || touched);
      inp.setAttribute('aria-invalid', hit ? 'true' : 'false');
    });
  }

  function focusFirstBad(inputs, keyOf, r) {
    if (!r.bad || !r.bad.length) return;
    for (var i = 0; i < inputs.length; i++) {
      if (r.bad.indexOf(keyOf(inputs[i])) > -1) { inputs[i].focus(); return; }
    }
  }

  function confetti(count) {
    if (reduceMQ.matches || !el.confetti) return;
    var frag = document.createDocumentFragment();
    el.confetti.innerHTML = '';
    for (var i = 0; i < count; i++) {
      var s = document.createElement('span');
      var size = 6 + Math.random() * 6;
      var round = i % 2 === 0;
      s.style.left = (4 + Math.random() * 92).toFixed(1) + '%';
      s.style.width = size.toFixed(1) + 'px';
      s.style.height = (round ? size : size * 0.7).toFixed(1) + 'px';
      s.style.borderRadius = round ? '50%' : '2px';
      s.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      s.style.setProperty('--dx', (Math.random() * 200 - 100).toFixed(0) + 'px');
      s.style.setProperty('--rot', (Math.random() * 900 - 450).toFixed(0) + 'deg');
      s.style.animationDelay = (Math.random() * 0.2).toFixed(2) + 's';
      s.style.animationDuration = (1.5 + Math.random() * 0.5).toFixed(2) + 's';
      frag.appendChild(s);
    }
    el.confetti.appendChild(frag);
    setTimeout(function () { el.confetti.innerHTML = ''; }, 2400);
  }

  function edgeGlow() {
    if (reduceMQ.matches || !el.edge) return;
    el.edge.classList.remove('is-on');
    void el.edge.offsetWidth;
    el.edge.classList.add('is-on');
    clearTimeout(edgeTimer);
    edgeTimer = setTimeout(function () { el.edge.classList.remove('is-on'); }, 3100);
  }

  function celebrate(newTier, prevTier) {
    var now = Date.now();
    if (now - lastCelebrateAt < CELEBRATE_COOLDOWN) return;
    var order = ['lose', 'edge', 'good', 'great', 'star'];
    var newIdx = order.indexOf(newTier);
    var prevIdx = order.indexOf(prevTier);
    if (newIdx <= prevIdx) {
      if (newTier === 'lose' && prevTier !== 'lose') {
        lastCelebrateAt = now;
        playSound('fail');
      }
      return;
    }
    lastCelebrateAt = now;
    if (newTier === 'star') {
      confetti(80);
      edgeGlow();
      playSound('excellent');
    } else if (newTier === 'great' || newTier === 'good') {
      confetti(40);
      playSound('success');
    } else if (newTier === 'edge') {
      confetti(16);
      playSound('success');
    }
  }

  function m1Key(inp) { return inp.getAttribute('data-m1'); }

  function isDirty1() {
    return Object.keys(DEFAULT_M1).some(function (k) { return state.m1[k] !== DEFAULT_M1[k]; });
  }

  function updateM1(explicit) {
    if (explicit) touched1 = true;
    var m = state.m1;
    var r = calcM1(m);
    applyInvalid(el.m1Inputs, m1Key, r, touched1);

    var sum = ['pct1', 'pct2', 'pct3'].reduce(function (a, k) {
      var p = parseNum(m[k]);
      return a + (isNaN(p) ? 0 : p);
    }, 0);
    var okSum = Math.abs(sum - 100) <= 0.005;
    el.m1Sum.textContent = 'Suma: ' + trimNum(sum, 2) + '%';
    el.m1Sum.classList.toggle('is-ok', okSum);
    el.m1Sum.classList.toggle('is-bad', !okSum);

    el.m1Reset.hidden = !isDirty1();
    paint(el.m1Result, r.type + (r.type === 'ok' ? '-' + tierM1(r.need) : ''), m1Html(r));
    return r;
  }

  var liveM1 = debounce(function () { updateM1(false); }, DELAY);

  function m2Key(inp) { return inp.getAttribute('data-kind') + ':' + inp.getAttribute('data-row'); }
  function m2Inputs() { return $$('input[data-kind]', el.m2List); }

  function noteName(i) { return 'Nota ' + (i + 1); }

  function makeField(id, label, cls) {
    var d = document.createElement('div');
    d.className = 'field ' + cls;
    var l = document.createElement('label');
    l.htmlFor = id;
    l.textContent = label;
    d.appendChild(l);
    return d;
  }

  function makeInput(id, kind, i, val, ph) {
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.id = id;
    inp.setAttribute('inputmode', 'decimal');
    inp.setAttribute('pattern', NUM_PATTERN);
    inp.placeholder = ph;
    inp.value = val;
    inp.autocomplete = 'off';
    inp.setAttribute('data-kind', kind);
    inp.setAttribute('data-row', String(i));
    inp.setAttribute('aria-invalid', 'false');
    return inp;
  }

  function renderRows() {
    var notes = state.m2.notes;
    el.m2List.innerHTML = '';
    el.m2List.classList.toggle('is-weighted', state.m2.weighted);
    notes.forEach(function (n, i) {
      var li = document.createElement('li');
      li.className = 'note-row';

      var fg = makeField('m2-grade-' + i, noteName(i), 'field-grade');
      fg.appendChild(makeInput('m2-grade-' + i, 'grade', i, n.grade, '3.5'));
      li.appendChild(fg);

      var fp = makeField('m2-pct-' + i, 'Porcentaje', 'field-pct');
      var pi = makeInput('m2-pct-' + i, 'pct', i, n.pct, '30');
      pi.setAttribute('aria-label', 'Porcentaje de ' + noteName(i));
      fp.appendChild(pi);
      fp.hidden = !state.m2.weighted;
      li.appendChild(fp);

      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'icon-btn';
      rm.setAttribute('data-remove', String(i));
      rm.setAttribute('aria-label', 'Eliminar ' + noteName(i));
      rm.textContent = '×';
      rm.hidden = notes.length <= 1;
      li.appendChild(rm);

      el.m2List.appendChild(li);
    });
  }

  function syncSwitch() {
    el.m2Switch.setAttribute('aria-checked', String(state.m2.weighted));
    el.m2Help.textContent = state.m2.weighted ? HELP_ON : HELP_OFF;
  }

  function updateM2(explicit) {
    if (explicit) touched2 = true;
    var m = state.m2;
    var r = calcM2(m);
    var inputs = m2Inputs();
    applyInvalid(inputs, m2Key, r, touched2);

    var sum = sumPct(m.notes);
    var okSum = Math.abs(sum - 100) <= 0.005;
    el.m2Sum.hidden = !m.weighted;
    el.m2Sum.textContent = 'Suma de porcentajes: ' + trimNum(sum, 2) + '%';
    el.m2Sum.classList.toggle('is-ok', okSum);
    el.m2Sum.classList.toggle('is-bad', !okSum);

    el.m2Add.hidden = m.notes.length >= MAX_NOTES || (m.weighted && !okSum);

    var newTier = r.type === 'ok' ? tierM2(r) : null;
    paint(el.m2Result, r.type + (newTier ? '-' + newTier : ''), m2Html(r));

    if (r.type === 'ok') {
      if (lastTierM2 !== null && newTier !== lastTierM2) {
        celebrate(newTier, lastTierM2);
      }
      lastTierM2 = newTier;
    }
    return r;
  }

  var liveM2 = debounce(function () { updateM2(false); }, DELAY);

  function splitEvenly(n) {
    var base = Math.floor(10000 / n) / 100;
    var out = [];
    for (var i = 0; i < n - 1; i++) out.push(trimNum(base, 2));
    out.push(trimNum(100 - base * (n - 1), 2));
    return out;
  }

  function toggleWeighted() {
    state.m2.weighted = !state.m2.weighted;
    if (state.m2.weighted && state.m2.notes.every(function (n) { return n.pct === ''; })) {
      var parts = splitEvenly(state.m2.notes.length);
      state.m2.notes.forEach(function (n, i) { n.pct = parts[i]; });
    }
    renderRows();
    syncSwitch();
    save();
    updateM2(false);
    playSound('tick');
  }

  function selectTab(id, focus) {
    state.tab = id;
    el.tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    el.panels.m1.hidden = id !== 'm1';
    el.panels.m2.hidden = id !== 'm2';
    save();
  }

  function initNav() {
    var fab = $('[data-nav-toggle]');
    var drawer = $('[data-nav-drawer]');
    var closeBtn = $('[data-nav-close]');
    var backdrop = $('[data-nav-backdrop]');
    var open = false;
    if (!fab || !drawer) return;

    function setMenu(next, restore) {
      open = next;
      fab.classList.toggle('is-open', next);
      fab.setAttribute('aria-expanded', String(next));
      fab.setAttribute('aria-label', next ? 'Cerrar menú' : 'Abrir menú');
      drawer.classList.toggle('is-open', next);
      drawer.setAttribute('aria-hidden', String(!next));
      if (backdrop) backdrop.classList.toggle('is-visible', next);
      document.body.classList.toggle('no-scroll', next);
      if (next && closeBtn) setTimeout(function () { closeBtn.focus(); }, 120);
      else if (restore) fab.focus();
    }

    fab.addEventListener('click', function () { setMenu(!open); });
    if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false, true); });
    if (backdrop) backdrop.addEventListener('click', function () { setMenu(false, true); });
    $$('a[href]', drawer).forEach(function (a) {
      a.addEventListener('click', function () { if (open) setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) setMenu(false, true);
    });
    var mq = window.matchMedia('(min-width: 861px)');
    var onChange = function (e) { if (e.matches && open) setMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  function bind() {
    el.tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        selectTab(t.getAttribute('data-tab'), false);
        playSound('tick');
      });
      t.addEventListener('keydown', function (e) {
        var next = -1;
        if (e.key === 'ArrowRight') next = (i + 1) % el.tabs.length;
        else if (e.key === 'ArrowLeft') next = (i - 1 + el.tabs.length) % el.tabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = el.tabs.length - 1;
        if (next < 0) return;
        e.preventDefault();
        selectTab(el.tabs[next].getAttribute('data-tab'), true);
      });
    });

    el.soundBtn.addEventListener('click', function () {
      state.sound = !state.sound;
      save();
      syncSound();
      playSound('tick');
    });

    el.panels.m1.addEventListener('input', function (e) {
      var k = e.target.getAttribute('data-m1');
      if (!k || k === 'obj') return;
      sanitize(e.target);
      state.m1[k] = e.target.value;
      save();
      el.m1Reset.hidden = !isDirty1();
      liveM1();
    });

    el.m1Form.addEventListener('submit', function (e) {
      e.preventDefault();
      var r = updateM1(true);
      if (r.type === 'empty' || r.type === 'error') focusFirstBad(el.m1Inputs, m1Key, r);
      else playSound('tick');
    });

    el.m1Reset.addEventListener('click', function () {
      state.m1 = Object.assign({}, DEFAULT_M1);
      touched1 = false;
      el.m1Inputs.forEach(function (inp) { inp.value = state.m1[m1Key(inp)]; });
      save();
      updateM1(false);
      el.m1Inputs[0].focus();
    });

    el.m2List.addEventListener('input', function (e) {
      var kind = e.target.getAttribute('data-kind');
      if (!kind) return;
      var i = parseInt(e.target.getAttribute('data-row'), 10);
      if (!state.m2.notes[i]) return;
      sanitize(e.target);
      state.m2.notes[i][kind] = e.target.value;
      save();
      liveM2();
    });

    el.m2List.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-remove]');
      if (!btn || state.m2.notes.length <= 1) return;
      var i = parseInt(btn.getAttribute('data-remove'), 10);
      state.m2.notes.splice(i, 1);
      renderRows();
      save();
      updateM2(false);
      playSound('tick');
      var inputs = $$('input[data-kind="grade"]', el.m2List);
      var target = inputs[Math.min(i, inputs.length - 1)];
      if (target) target.focus();
    });

    el.m2Add.addEventListener('click', function () {
      if (state.m2.notes.length >= MAX_NOTES) return;
      state.m2.notes.push({ grade: '', pct: '' });
      renderRows();
      save();
      updateM2(false);
      playSound('tick');
      var inputs = $$('input[data-kind="grade"]', el.m2List);
      if (inputs.length) inputs[inputs.length - 1].focus();
    });

    el.m2Switch.addEventListener('click', toggleWeighted);
    $('#m2SwitchLabel').addEventListener('click', toggleWeighted);

    el.m2Form.addEventListener('submit', function (e) {
      e.preventDefault();
      var r = updateM2(true);
      if (r.type === 'empty' || r.type === 'error') {
        focusFirstBad(m2Inputs(), m2Key, r);
      }
    });

    el.m2Reset.addEventListener('click', function () {
      lastTierM2 = null;
      lastCelebrateAt = 0;
      state.m2 = { weighted: false, notes: freshNotes() };
      touched2 = false;
      renderRows();
      syncSwitch();
      save();
      updateM2(false);
      var first = $('input[data-kind="grade"]', el.m2List);
      if (first) first.focus();
    });
  }

  function init() {
    el.m1Inputs.forEach(function (inp) { inp.value = state.m1[m1Key(inp)]; });
    renderRows();
    syncSwitch();
    syncSound();
    selectTab(state.tab, false);
    updateM1(false);
    updateM2(false);
    bind();
    initNav();
    var year = $('[data-current-year]');
    if (year) year.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();