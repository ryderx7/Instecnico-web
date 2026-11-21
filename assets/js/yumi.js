// FILE: assets/js/yumi.engine.js
// Yumi — Núcleo de fluidez y defensa web
// v2.1.0 · Instituto Técnico de Santander de Quilichao
/* ╔══════════════════════════════════════════════════════════════╗
   ║  Y U M I                                                    ║
   ║  NÚCLEO DE FLUIDEZ · ADAPTACIÓN · DEFENSA WEB               ║
   ║  Lightweight browser engine · v2.1.0                        ║
   ╚══════════════════════════════════════════════════════════════╝ */
(function (global) {
  'use strict';

  var VERSION = '2.1.0';
  if (global.Yumi && global.Yumi.version === VERSION) return;

  var doc = global.document;
  var nav = global.navigator || {};
  var uid = 0;
  var debugOn = null;
  var passiveOK = false;

  var SANDBOX = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox';
  var FOCUSABLE = 'a[href],area[href],input:not([disabled]),select:not([disabled]),' +
    'textarea:not([disabled]),button:not([disabled]),iframe,[tabindex]:not([tabindex="-1"])';
  var EXEMPT = /^(maps\.google\.com|www\.google\.com\/maps|www\.youtube-nocookie\.com\/embed|www\.youtube\.com\/embed|player\.vimeo\.com\/video)(\/|$)/;
  var DROP = /^(script|style|iframe|frame|frameset|object|embed|applet|template|noscript|svg|math|link|meta|base|title|head|xmp|plaintext)$/;
  var ALLOW = ' a abbr b blockquote br caption cite code dd div dl dt em figcaption figure h1 h2 h3 h4 h5 h6 hr i img kbd li mark ol p pre q s small span strong sub sup table tbody td tfoot th thead time tr u ul ';
  var ATTR = ' href src alt title class lang dir colspan rowspan width height ';
  var URLA = /^(href|src|xlink:href|formaction|action|poster)$/;
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  function noop() {}

  function toArr(list) {
    var a = [], i = 0;
    for (; list && i < list.length; i++) a.push(list[i]);
    return a;
  }

  function each(list, fn) {
    if (!list) return;
    for (var i = 0; i < list.length; i++) fn(list[i], i);
  }

  function matches(el, sel) {
    var fn = el && (el.matches || el.msMatchesSelector || el.webkitMatchesSelector);
    return !!(fn && fn.call(el, sel));
  }

  /* Map débil con respaldo por propiedad expando si falta WeakMap. */
  function wm() {
    var m = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
    var keys = [];
    var k = '__yumi' + (uid++);
    return {
      get: function (o) { return m ? m.get(o) : o[k]; },
      set: function (o, v) {
        if (m) m.set(o, v);
        else { if (!(k in o)) keys.push(o); o[k] = v; }
      },
      del: function (o) { if (m) m['delete'](o); else delete o[k]; },
      clear: function () {
        if (m) { m = new WeakMap(); return; }
        for (var i = 0; i < keys.length; i++) delete keys[i][k];
        keys.length = 0;
      }
    };
  }

  /* Set con respaldo en array si falta Set. */
  function st() {
    var s = typeof Set !== 'undefined' ? new Set() : null;
    var a = [];
    return {
      has: function (v) { return s ? s.has(v) : a.indexOf(v) !== -1; },
      add: function (v) { if (s) s.add(v); else if (a.indexOf(v) === -1) a.push(v); },
      del: function (v) {
        if (s) s['delete'](v);
        else { var i = a.indexOf(v); if (i !== -1) a.splice(i, 1); }
      },
      clear: function () { if (s) s.clear(); else a.length = 0; },
      all: function () {
        var r = [];
        if (s) s.forEach(function (v) { r.push(v); });
        else r = a.slice();
        return r;
      }
    };
  }

  /* Estado mutable privado: nunca forma parte del objeto congelado. */
  var S = {
    ready: false, q: [],
    rq: [], rid: null, rsch: false, paused: false,
    mobile: false, reduced: false,
    io: null, rv: wm(), dom: null,
    pre: st(), tt: null, ttTried: false,
    offs: [], lk: null, traps: [], ft: null,
    cl: [], cls: st(), own: st(), owm: wm()
  };

  function log(level, args) {
    try {
      if (debugOn === null) {
        debugOn = !!(global.location && /[?&]debug=1(?:&|$)/.test(global.location.search));
      }
      var c = global.console;
      if (!debugOn || !c || typeof c[level] !== 'function') return;
      c[level].apply(c, ['[Yumi]'].concat(args || []));
    } catch (e) {}
  }

  function safeCall(fn, args, level) {
    try {
      return fn.apply(null, args || []);
    } catch (e) {
      log(level || 'warn', [e]);
      return null;
    }
  }

  try {
    var probe = Object.defineProperty({}, 'passive', {
      get: function () { passiveOK = true; return false; }
    });
    global.addEventListener('yumi-t', noop, probe);
    global.removeEventListener('yumi-t', noop, probe);
  } catch (e) {}

  function listen(target, type, fn, pas) {
    var opt = pas && passiveOK ? { passive: true } : false;
    target.addEventListener(type, fn, opt);
    return function () { target.removeEventListener(type, fn, opt); };
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return ESC[c];
    });
  }

  function safeURL(url, base) {
    try {
      var value = String(url == null ? '' : url).replace(/^\s+|\s+$/g, '');
      if (!value || /[\u0000-\u001f\u007f]/.test(value)) return '#';
      if (global.URL) {
        var p = new global.URL(value, base || (global.location && global.location.href));
        return ['http:', 'https:', 'mailto:', 'tel:'].indexOf(p.protocol) !== -1 ? p.href : '#';
      }
      if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
      if (/^(\/|\.\/|\.\.\/|#|\?)/.test(value)) return value;
    } catch (e) {
      log('warn', [e]);
    }
    return '#';
  }

  /* ───────── Entorno ───────── */

  function conn() {
    return nav.connection || nav.mozConnection || nav.webkitConnection || null;
  }

  function mm(q) {
    try { return global.matchMedia ? global.matchMedia(q) : null; } catch (e) { return null; }
  }

  function onMQ(m, fn) {
    if (m.addEventListener) {
      m.addEventListener('change', fn);
      return function () { m.removeEventListener('change', fn); };
    }
    if (m.addListener) {
      m.addListener(fn);
      return function () { m.removeListener(fn); };
    }
    return noop;
  }

  function updateMedia() {
    var a = mm('(max-width: 860px)');
    var b = mm('(prefers-reduced-motion: reduce)');
    var r = doc && doc.documentElement;
    S.mobile = a ? a.matches : (!!global.innerWidth && global.innerWidth <= 860);
    S.reduced = !!(b && b.matches);
    if (r) {
      r.classList.toggle('yumi-mobile', S.mobile);
      r.classList.toggle('yumi-reduce', S.reduced);
    }
  }

  function isSaveData() {
    var c = conn();
    return !!(c && (c.saveData === true || /(^|-)2g$/i.test(c.effectiveType || '')));
  }

  function isLowEnd() {
    if (S.mobile) {
      if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) return true;
      if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 2) return true;
    }
    return isSaveData();
  }

  function adaptive() {
    if (!doc || !doc.documentElement) return;
    updateMedia();
    doc.documentElement.classList.toggle('yumi-lite', isLowEnd());
  }

  /* ───────── Planificación ───────── */

  function idle(fn, timeout) {
    if (typeof fn !== 'function') return null;
    if (global.requestIdleCallback) {
      return global.requestIdleCallback(fn, { timeout: timeout || 1200 });
    }
    return global.setTimeout(function () {
      fn({ didTimeout: false, timeRemaining: function () { return 16; } });
    }, 1);
  }

  function cancelRAF() {
    if (S.rid !== null) {
      if (global.requestAnimationFrame) global.cancelAnimationFrame(S.rid);
      else global.clearTimeout(S.rid);
    }
    S.rid = null;
    S.rsch = false;
  }

  function pump() {
    if (S.rsch || S.paused || !S.rq.length) return;
    S.rsch = true;
    var cb = function (t) {
      S.rid = null;
      S.rsch = false;
      if (S.paused) return;
      var q = S.rq, i;
      S.rq = [];
      for (i = 0; i < q.length; i++) safeCall(q[i], [t], 'error');
      pump();
    };
    S.rid = global.requestAnimationFrame
      ? global.requestAnimationFrame(cb)
      : global.setTimeout(function () { cb(Date.now()); }, 16);
  }

  function schedule(fn) {
    if (typeof fn !== 'function') return null;
    S.rq.push(fn);
    pump();
    return S.rid;
  }

  /* ───────── Reveal ───────── */

  function onReveal(entries, io) {
    each(entries, function (en) {
      var t = en.target, m = S.rv.get(t);
      if (!m) { io.unobserve(t); return; }
      if (en.isIntersecting &&
          (en.intersectionRatio >= 0.08 ||
           en.intersectionRect.height >= global.innerHeight * 0.28)) {
        t.classList.add(m.c);
        if (m.once) {
          io.unobserve(t);
          S.rv.del(t);
          if (m.u) m.u(t);
        }
      } else if (!m.once && !en.isIntersecting) {
        t.classList.remove(m.c);
      }
    });
  }

  /* Pool compartido: threshold y rootMargin los fija el primer uso. */
  function getIO(o) {
    if (!S.io && global.IntersectionObserver) {
      try {
        S.io = new global.IntersectionObserver(onReveal, {
          threshold: o.threshold !== undefined ? o.threshold : [0, 0.08, 0.15, 0.3],
          rootMargin: o.rootMargin || '0px 0px -8% 0px'
        });
      } catch (e) {
        log('warn', [e]);
      }
    }
    return S.io;
  }

  function createReveal(o) {
    o = o || {};
    var cls = o.className || 'is-in';
    var once = o.once !== false;
    var mine = [];
    function drop(el) {
      var i = mine.indexOf(el);
      if (i !== -1) mine.splice(i, 1);
    }
    function unobserve(el) {
      if (!el) return;
      if (S.io) S.io.unobserve(el);
      S.rv.del(el);
      drop(el);
    }
    return {
      observe: function (el) {
        if (!el || !el.classList) return;
        var io = S.reduced ? null : getIO(o);
        if (!io) { el.classList.add(cls); return; }
        if (!once) el.classList.remove(cls);
        S.rv.set(el, { c: cls, once: once, u: drop });
        if (mine.indexOf(el) === -1) mine.push(el);
        io.observe(el);
      },
      unobserve: unobserve,
      disconnect: function () {
        var l = mine.slice(), i;
        for (i = 0; i < l.length; i++) unobserve(l[i]);
        mine.length = 0;
      }
    };
  }

  function observe(el, cls, o) {
    o = o || {};
    var v = createReveal({
      className: cls || o.className,
      once: o.once,
      threshold: o.threshold,
      rootMargin: o.rootMargin
    });
    var add = function (n) { v.observe(n); };
    if (!el) { if (doc) each(doc.querySelectorAll('.reveal-up'), add); }
    else if (el.nodeType || typeof el.length !== 'number') add(el);
    else each(el, add);
    return v;
  }

  function observeReveals() {
    if (doc) observe();
  }

  /* ───────── Recursos ───────── */

  function addLink(rel, url, key) {
    if (!doc || !doc.head || url === '#' || S.pre.has(key)) return null;
    S.pre.add(key);
    var l = doc.createElement('link');
    l.rel = rel;
    l.href = url;
    doc.head.appendChild(l);
    return l;
  }

  function preload(href, asType, attrs) {
    if (!href || isSaveData() || isLowEnd()) return null;
    var url = safeURL(href);
    var link = addLink('preload', url, url);
    if (!link) return null;
    if (asType) link.as = asType;
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (/^(on|href$|rel$)/i.test(k)) return;
        link.setAttribute(k, String(attrs[k]));
      });
    }
    return link;
  }

  function preconnect(origin) {
    if (!origin || isSaveData()) return null;
    var url = safeURL(origin);
    return addLink('preconnect', url, 'pc:' + url);
  }

  function prefetch(url) {
    if (!url || isSaveData() || isLowEnd()) return null;
    var safe = safeURL(url);
    return addLink('prefetch', safe, 'pf:' + safe);
  }

  function revokeObjectURLs(urls) {
    if (!urls || !global.URL || !global.URL.revokeObjectURL) return;
    if (typeof urls === 'string') urls = [urls];
    for (var i = 0; i < urls.length; i++) {
      try { global.URL.revokeObjectURL(urls[i]); } catch (e) { log('warn', [e]); }
    }
  }

  function memory() {
    return global.performance && global.performance.memory ? global.performance.memory : null;
  }

  function passive(el, type, handler) {
    if (!el || !el.addEventListener || typeof handler !== 'function') return noop;
    try { return listen(el, type, handler, true); } catch (e) { log('warn', [e]); return noop; }
  }

  /* ───────── Seguridad ───────── */

  /* createHTML identidad: solo alimenta el parseo inerte; la policy nunca se expone. */
  function policy() {
    if (!S.tt && !S.ttTried && global.trustedTypes &&
        typeof global.trustedTypes.createPolicy === 'function') {
      S.ttTried = true;
      try {
        S.tt = global.trustedTypes.createPolicy('yumi-html', {
          createHTML: function (v) { return v; }
        });
      } catch (e) {
        log('warn', [e]);
      }
    }
    return S.tt;
  }

  function safeText(el, text) {
    if (el) el.textContent = String(text == null ? '' : text);
    return el;
  }

  function exempt(frame) {
    try {
      var u = new global.URL(frame.getAttribute('src') || '', global.location.href);
      return u.protocol === 'https:' && EXEMPT.test(u.host + u.pathname);
    } catch (e) {
      return false;
    }
  }

  function cleanAttrs(el, mode) {
    var a = toArr(el.attributes), i, n, v;
    for (i = 0; i < a.length; i++) {
      n = a[i].name.toLowerCase();
      v = a[i].value;
      if (/^on/.test(n) || n === 'srcdoc' ||
          (mode === 'strict'
            ? !(ATTR.indexOf(' ' + n + ' ') !== -1 || /^(aria-[\w-]+|role)$/.test(n))
            : URLA.test(n) && /^(javascript|vbscript):/i.test(v.replace(/[\u0000-\u0020]/g, '')))) {
        el.removeAttribute(a[i].name);
      } else if (mode === 'strict' && (n === 'href' || n === 'src')) {
        el.setAttribute(a[i].name, safeURL(v));
      }
    }
  }

  /* mode: undefined (blando) | 'strict' (lista blanca) | 'dom' (observador). */
  function scrub(el, mode) {
    var tag = (el.tagName || '').toLowerCase();
    var p = el.parentNode;
    var bad = mode === 'strict' ? DROP.test(tag)
      : tag === 'script' ? !(mode === 'dom' && el.hasAttribute('src'))
      : tag === 'iframe' && mode !== 'dom' && !el.hasAttribute('sandbox') && !exempt(el);
    if (bad) {
      if (p) p.removeChild(el);
      return false;
    }
    if (mode === 'strict' && ALLOW.indexOf(' ' + tag + ' ') === -1) {
      sanitizeNode(el, mode);
      if (p) {
        while (el.firstChild) p.insertBefore(el.firstChild, el);
        p.removeChild(el);
      }
      return false;
    }
    cleanAttrs(el, mode);
    sanitizeNode(el, mode);
    return true;
  }

  function sanitizeNode(node, mode) {
    if (!node || !node.childNodes) return node;
    var kids = toArr(node.childNodes), i, c;
    for (i = 0; i < kids.length; i++) {
      c = kids[i];
      if (c.nodeType === 1) scrub(c, mode);
      else if (c.nodeType === 8 && mode === 'strict') node.removeChild(c);
    }
    return node;
  }

  function safeHTML(el, html) {
    if (!el) return el;
    var v = String(html == null ? '' : html);
    try {
      var p = policy();
      var t = doc.createElement('template');
      if (!('content' in t)) throw new Error('no template');
      t.innerHTML = p ? p.createHTML(v) : v;
      sanitizeNode(t.content, 'strict');
      el.textContent = '';
      el.appendChild(t.content);
    } catch (e) {
      log('warn', [e]);
      el.textContent = v;
    }
    return el;
  }

  function setInnerHTMLTrusted(el, html) {
    if (!el) return el;
    var v = String(html == null ? '' : html);
    try {
      var p = policy();
      el.innerHTML = p ? p.createHTML(v) : v;
    } catch (e) {
      log('warn', [e]);
      el.textContent = v;
    }
    return el;
  }

  function applyReferrerPolicy() {
    if (!doc || !doc.head || doc.querySelector('meta[name="referrer"]')) return;
    var m = doc.createElement('meta');
    m.name = 'referrer';
    m.content = 'strict-origin-when-cross-origin';
    doc.head.appendChild(m);
  }

  function hardenIframes(root) {
    root = root || doc;
    if (!root || !root.querySelectorAll) return;
    var frames = matches(root, 'iframe') ? [root] : [];
    each(root.querySelectorAll('iframe'), function (f) { frames.push(f); });
    each(frames, function (f) {
      if (!f.hasAttribute('sandbox') && !exempt(f)) f.setAttribute('sandbox', SANDBOX);
      if (!f.hasAttribute('loading')) f.setAttribute('loading', 'lazy');
      if (!f.hasAttribute('referrerpolicy')) {
        f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      }
      if (!f.hasAttribute('title')) f.setAttribute('title', 'Contenido integrado');
    });
  }

  function hardenForms(root) {
    root = root || doc;
    if (!root || !root.querySelectorAll) return;
    var forms = matches(root, 'form') ? [root] : [];
    each(root.querySelectorAll('form'), function (f) { forms.push(f); });
    each(forms, function (form) {
      if (!form.hasAttribute('method')) form.setAttribute('method', 'POST');
      if (!form.hasAttribute('action')) form.setAttribute('action', '/');
      if (!form.hasAttribute('autocomplete')) form.setAttribute('autocomplete', 'on');
      each(form.querySelectorAll('input'), function (input) {
        var type = (input.type || '').toLowerCase();
        if (type !== 'email' && type !== 'tel') return;
        if (!input.hasAttribute('inputmode')) input.setAttribute('inputmode', type);
        if (!input.hasAttribute('autocomplete')) input.setAttribute('autocomplete', type);
      });
    });
  }

  function watchDOM() {
    if (!doc || !doc.documentElement || !global.MutationObserver || S.dom) return;
    S.dom = new global.MutationObserver(function (records) {
      each(records, function (r) {
        if (r.type === 'attributes') {
          if (r.target.nodeType === 1) cleanAttrs(r.target, 'dom');
          return;
        }
        each(r.addedNodes, function (n) {
          if (n.nodeType !== 1) return;
          if (scrub(n, 'dom')) { hardenIframes(n); hardenForms(n); }
        });
      });
    });
    S.dom.observe(doc.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href', 'src', 'onclick', 'onload', 'onerror']
    });
  }

  /* ───────── UI: scroll lock y foco ───────── */

  function lock() {
    var b = doc && doc.body;
    if (!b || S.lk) return;
    var de = doc.documentElement, s = b.style;
    var y = global.pageYOffset || de.scrollTop || 0;
    var gutter = Math.max(0, global.innerWidth - de.clientWidth);
    S.lk = { y: y, p: s.position, t: s.top, w: s.width, o: s.overflow, r: s.paddingRight };
    s.position = 'fixed';
    s.top = -y + 'px';
    s.width = '100%';
    s.overflow = 'hidden';
    if (gutter) s.paddingRight = gutter + 'px';
    b.classList.add('yumi-locked');
  }

  function unlock() {
    var k = S.lk, b = doc && doc.body;
    if (!k) return;
    S.lk = null;
    if (b) {
      b.style.position = k.p;
      b.style.top = k.t;
      b.style.width = k.w;
      b.style.overflow = k.o;
      b.style.paddingRight = k.r;
      b.classList.remove('yumi-locked');
    }
    try { global.scrollTo(0, k.y); } catch (e) {}
  }

  function focusEl(el) {
    try { if (el && el.focus) el.focus(); } catch (e) {}
  }

  function focusTrap(box) {
    if (!box || !doc) return noop;
    var rec = { prev: doc.activeElement, done: false };
    rec.key = function (ev) {
      if ((ev.key !== 'Tab' && ev.keyCode !== 9) || S.traps[S.traps.length - 1] !== rec) return;
      var a = doc.activeElement, vis = [], f, l;
      each(box.querySelectorAll(FOCUSABLE), function (el) {
        if (el.offsetWidth || el.offsetHeight || el === a) vis.push(el);
      });
      if (!vis.length) { ev.preventDefault(); focusEl(box); return; }
      f = vis[0];
      l = vis[vis.length - 1];
      if (!box.contains(a)) { ev.preventDefault(); f.focus(); }
      else if (ev.shiftKey && (a === f || a === box)) { ev.preventDefault(); l.focus(); }
      else if (!ev.shiftKey && a === l) { ev.preventDefault(); f.focus(); }
    };
    rec.rel = function () {
      if (rec.done) return;
      rec.done = true;
      doc.removeEventListener('keydown', rec.key, true);
      var i = S.traps.indexOf(rec);
      if (i !== -1) S.traps.splice(i, 1);
      focusEl(rec.prev);
    };
    doc.addEventListener('keydown', rec.key, true);
    S.traps.push(rec);
    S.ft = rec.prev;
    focusEl(box.querySelector(FOCUSABLE) || box);
    return rec.rel;
  }

  function restoreFocus() {
    var t = S.ft;
    S.ft = null;
    focusEl(t);
  }

  function releaseTraps() {
    var t;
    while ((t = S.traps.pop())) t.rel();
  }

  /* ───────── Almacenamiento ───────── */

  function storageArea(area, prefix) {
    var mem = {};

    function store() {
      try { return global[area] || null; } catch (e) { return null; }
    }
    function nm(key, o) { return (o && o.ns === false ? '' : prefix) + String(key); }
    function isQuota(e) {
      return !!e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        e.code === 22 || e.code === 1014);
    }
    function purge() {
      var s = store(), i, k, r;
      if (!s) return;
      try {
        for (i = s.length - 1; i >= 0; i--) {
          k = s.key(i);
          if (!k || k.indexOf(prefix) !== 0) continue;
          try {
            r = JSON.parse(s.getItem(k));
            if (r && typeof r._yx === 'number' && r._yx <= Date.now()) s.removeItem(k);
          } catch (e) {}
        }
      } catch (e) {}
    }
    function drop(n) {
      delete mem[n];
      try { var s = store(); if (s) s.removeItem(n); } catch (e) { log('warn', [e]); }
    }

    function get(key, fallback, o) {
      var n = nm(key, o), s = store(), raw = null, rec, m;
      var def = fallback === undefined ? null : fallback;
      try { raw = s ? s.getItem(n) : null; } catch (e) { log('warn', [e]); }
      if (raw === null || raw === undefined) {
        m = mem[n];
        if (m && (!m.x || m.x > Date.now())) return m.v;
        if (m) delete mem[n];
        return def;
      }
      try { rec = JSON.parse(raw); } catch (e) { return def; }
      if (rec && typeof rec === 'object' && typeof rec._yx === 'number') {
        if (rec._yx <= Date.now()) { drop(n); return def; }
        return rec.v;
      }
      return rec;
    }

    function set(key, value, o) {
      var n = nm(key, o), s = store(), json;
      var x = o && o.ttl > 0 ? Date.now() + o.ttl : 0;
      mem[n] = { x: x, v: value };
      try { json = JSON.stringify(x ? { _yx: x, v: value } : value); } catch (e) { return false; }
      if (json === undefined || !s) return false;
      try {
        s.setItem(n, json);
        delete mem[n];
        return true;
      } catch (e) {
        if (isQuota(e)) {
          purge();
          try { s.setItem(n, json); delete mem[n]; return true; } catch (e2) {}
        }
        log('warn', [e]);
        return false;
      }
    }

    return {
      /** Lee un valor (JSON) o devuelve el fallback; nunca lanza. */
      get: get,
      /** Guarda un valor con TTL opcional ({ ttl: ms }); devuelve false si solo quedó en memoria. */
      set: set,
      /** Elimina un valor de almacenamiento y memoria; nunca lanza. */
      remove: function (key, o) { drop(nm(key, o)); }
    };
  }

  var storage = storageArea('localStorage', 'yumi:');
  storage.session = storageArea('sessionStorage', 'yumi:');

  /* ───────── Ciclo de vida ───────── */

  function runList(list) {
    for (var i = 0; list && i < list.length; i++) safeCall(list[i], [], 'error');
  }

  function runOwner(owner) {
    var l = S.owm.get(owner);
    S.owm.del(owner);
    S.own['del'](owner);
    runList(l);
  }

  var lifecycle = {
    /** Registra una limpieza única por función, opcionalmente ligada a un owner. */
    onCleanup: function (fn, owner) {
      if (typeof fn !== 'function') return;
      if (owner && typeof owner === 'object') {
        var l = S.owm.get(owner);
        if (!l) {
          l = [];
          S.owm.set(owner, l);
          S.own.add(owner); /* referencia fuerte hasta clean/cleanAll: necesaria para enumerar */
        }
        if (l.indexOf(fn) === -1) l.push(fn);
      } else if (!S.cls.has(fn)) {
        S.cls.add(fn);
        S.cl.push(fn);
      }
    },
    /** Ejecuta y descarta las limpiezas ligadas a un owner. */
    clean: function (owner) { if (owner && typeof owner === 'object') runOwner(owner); },
    /** Ejecuta y descarta todas las limpiezas registradas. */
    cleanAll: function () {
      var l = S.cl;
      S.cl = [];
      S.cls.clear();
      runList(l);
      each(S.own.all(), function (o) { runOwner(o); });
    }
  };

  /* ───────── Ciclo de vida del motor ───────── */

  function clearListeners() {
    var offs = S.offs, i;
    S.offs = [];
    for (i = 0; i < offs.length; i++) safeCall(offs[i]);
  }

  function onVis() {
    S.paused = !!(doc && doc.hidden);
    if (S.paused) cancelRAF();
    else pump();
  }

  function dropReveal() {
    if (S.io) S.io.disconnect();
    S.io = null;
    S.rv.clear();
  }

  function dropDOM() {
    if (S.dom) S.dom.disconnect();
    S.dom = null;
  }

  function init() {
    if (S.ready) return Yumi;
    S.ready = true;
    clearListeners();
    S.paused = !!(doc && doc.hidden);
    var steps = [policy, applyReferrerPolicy, hardenIframes, hardenForms, watchDOM,
      adaptive, observeReveals];
    var i, c = conn(), q;
    for (i = 0; i < steps.length; i++) safeCall(steps[i]);
    if (doc) S.offs.push(listen(doc, 'visibilitychange', onVis));
    each(['(max-width: 860px)', '(prefers-reduced-motion: reduce)'], function (query) {
      var m = mm(query);
      if (m) S.offs.push(onMQ(m, adaptive));
    });
    if (c && c.addEventListener) S.offs.push(listen(c, 'change', adaptive));
    q = S.q;
    S.q = [];
    for (i = 0; i < q.length; i++) safeCall(q[i], [Yumi], 'error');
    return Yumi;
  }

  function readyThen(fn) {
    if (typeof fn !== 'function') return;
    if (S.ready) safeCall(fn, [Yumi], 'error');
    else S.q.push(fn);
  }

  function dispose() {
    safeCall(unlock);
    safeCall(releaseTraps);
    safeCall(cancelRAF);
    S.rq = [];
    safeCall(dropReveal);
    safeCall(dropDOM);
    safeCall(clearListeners);
    S.ready = false;
    return Yumi;
  }

  /* ───────── Fachada pública ───────── */

  var security = {
    /** Asigna texto sin interpretar HTML. */
    safeText: safeText,
    /** Sanitiza con lista blanca en un template inerte y lo inserta como nodos. */
    safeHTML: safeHTML,
    /** Asigna innerHTML crudo: solo para plantillas internas, jamás input de usuario. */
    setInnerHTMLTrusted: setInnerHTMLTrusted,
    /** Valida protocolos de URL permitidos. */
    safeURL: safeURL,
    /** Elimina in situ scripts, iframes sin sandbox y atributos peligrosos de un árbol. */
    sanitizeNode: function (node) { return sanitizeNode(node); },
    /** Registra la policy Trusted Types privada; devuelve true si existe. */
    registerTrustedTypesPolicy: function () { return !!policy(); },
    /** Añade una política de referrer si falta. */
    applyReferrerPolicy: applyReferrerPolicy,
    /** Aplica sandbox, lazy y referrer a iframes, salvo dominios exentos. */
    hardenIframes: hardenIframes,
    /** Completa atributos de formularios sin validar sus datos. */
    hardenForms: hardenForms,
    /** Vigila inserciones y atributos peligrosos hasta dispose(). */
    watchDOM: watchDOM
  };

  var perf = {
    /** Programa trabajo para el siguiente frame (se pausa con la pestaña oculta). */
    raf: schedule,
    /** Programa trabajo de baja prioridad. */
    idle: idle,
    /** Revela elementos (o todos los .reveal-up) con un IntersectionObserver compartido. */
    observe: observe,
    /** Registra un listener pasivo y devuelve la función que lo retira. */
    passive: passive,
    /** Preconecta un origen una sola vez si no hay ahorro de datos. */
    preconnect: preconnect,
    /** Precarga en segundo plano si el dispositivo lo permite. */
    prefetch: prefetch,
    /** Devuelve estadísticas de memoria si el navegador las expone. */
    memory: memory
  };

  var ui = {
    /** Bloquea el scroll conservando posición y estilos previos del body. */
    lock: lock,
    /** Restaura exactamente el scroll y los estilos previos al lock. */
    unlock: unlock,
    /** Atrapa el foco en el contenedor (apilable); devuelve release(). */
    focusTrap: focusTrap,
    /** Devuelve el foco al elemento guardado por el último focusTrap. */
    restoreFocus: restoreFocus,
    /** Consulta la preferencia de movimiento reducido del sistema. */
    prefersReducedMotion: function () {
      var b = mm('(prefers-reduced-motion: reduce)');
      return !!(b && b.matches);
    }
  };

  var Yumi = {
    name: 'Yumi',
    version: VERSION,
    security: security,
    perf: perf,
    ui: ui,
    storage: storage,
    lifecycle: lifecycle,
    /** Inicializa el motor de forma idempotente. */
    init: init,
    /** Ejecuta fn cuando el motor esté listo. */
    readyThen: readyThen,
    /** Recalcula clases adaptativas (móvil, movimiento reducido, modo ligero). */
    adaptive: adaptive,
    /** Libera scroll lock, trampas de foco, observadores y listeners; idempotente. */
    dispose: dispose,
    /** Escapa HTML para interpolar texto en plantillas. */
    escape: escapeHTML,
    /** Valida protocolos de URL permitidos. */
    safeURL: safeURL,
    /** Programa trabajo para el siguiente frame. */
    schedule: schedule,
    /** Programa trabajo de baja prioridad. */
    idle: idle,
    /** Crea una vista de reveal; once y className son por elemento. */
    createReveal: createReveal,
    /** Precarga un recurso si el dispositivo lo permite. */
    preload: preload,
    /** Revoca ObjectURLs sin lanzar. */
    revoke: revokeObjectURLs,
    /** Indica si el viewport es móvil (≤860px). */
    isMobile: function () { return S.mobile; },
    /** Indica si el usuario prefiere movimiento reducido. */
    reducedMotion: function () { return S.reduced; },
    /** Indica ahorro de datos o conexión 2G. */
    saveData: isSaveData,
    /** Indica dispositivo de gama baja o ahorro de datos. */
    lowEnd: isLowEnd,
    _log: log
  };

  Object.defineProperty(Yumi, 'ready', {
    enumerable: true,
    get: function () { return S.ready; }
  });

  if (global.addEventListener) {
    listen(global, 'pagehide', function () {
      dispose();
      lifecycle.cleanAll();
    });
    listen(global, 'pageshow', function (e) {
      if (e && e.persisted) init();
    });
  }

  global.Yumi = Yumi;
  if (typeof module !== 'undefined' && module.exports) module.exports = Yumi;

  if (doc) {
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
    else init();
  }

  /* Estado mutable vive en S (privado): se congela solo la fachada y sus namespaces. */
  if (Object.freeze) {
    Object.freeze(security);
    Object.freeze(perf);
    Object.freeze(ui);
    Object.freeze(storage.session);
    Object.freeze(storage);
    Object.freeze(lifecycle);
    Object.freeze(Yumi);
  }
})(typeof window !== 'undefined' ? window : this);