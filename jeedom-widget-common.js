/* ============================================================
   JEEDOM WIDGET COMMON — Helpers JS partagés
   Dernière modification : 2026-04-15

   À déposer dans : /data/customjs/jeedom-widget-common.js
   Référencer via : <script src="/data/customjs/jeedom-widget-common.js"></script>

   Expose un objet global JW avec les helpers communs aux widgets.
   ============================================================ */

(function (global) {
  'use strict';
  if (global.JW) return; // idempotent

  var JW = {};

  /* ---- Lecture d'une commande Jeedom (avec error callback obligatoire) ---- */
  JW.readCmd = function (id, cb) {
    if (id == null) { cb(null); return; }
    try {
      jeedom.cmd.execute({
        id: id,
        cache: 0,
        notify: false,
        success: function (res) {
          var v = (res && typeof res === 'object' && 'state' in res) ? res.state : res;
          cb(v);
        },
        error: function () { cb(null); }
      });
    } catch (e) { cb(null); }
  };

  /* ---- Lecture groupée (un callback unique) ---- */
  JW.readBatch = function (idMap, cb) {
    var keys = Object.keys(idMap);
    var out = {};
    var pending = keys.length;
    if (pending === 0) { cb(out); return; }
    keys.forEach(function (k) {
      JW.readCmd(idMap[k], function (v) {
        out[k] = v;
        pending--;
        if (pending === 0) cb(out);
      });
    });
  };

  /* ---- Attente de dispo de jeedom.cmd ---- */
  JW.waitJeedom = function (cb, maxTries) {
    var max = maxTries || 50;
    var tries = 0;
    function check() {
      if (typeof jeedom !== 'undefined' && jeedom.cmd && jeedom.cmd.execute) { cb(); return; }
      tries++;
      if (tries > max) { cb(); return; }
      setTimeout(check, 100);
    }
    check();
  };

  /* ---- Classification % batterie UPS (0=plein, 100=plein) ---- */
  JW.batClass = function (pct) {
    if (pct == null) return '';
    if (pct < 20) return 'jw-c-c';
    if (pct < 50) return 'jw-c-w';
    return 'jw-c-ok';
  };
  JW.batBgClass = function (pct) {
    if (pct == null) return '';
    if (pct < 20) return 'jw-bg-c';
    if (pct < 50) return 'jw-bg-w';
    return 'jw-bg-ok';
  };

  /* ---- Classification % charge onduleur (0=vide, 100=saturé) ---- */
  JW.loadClass = function (pct) {
    if (pct == null) return '';
    if (pct > 80) return 'jw-c-c';
    if (pct >= 50) return 'jw-c-w';
    return 'jw-c-ok';
  };
  JW.loadBgClass = function (pct) {
    if (pct == null) return '';
    if (pct > 80) return 'jw-bg-c';
    if (pct >= 50) return 'jw-bg-w';
    return 'jw-bg-ok';
  };

  /* ---- Classification statut onduleur ---- */
  JW.classifyUpsStatus = function (statutStr, batPct) {
    if (statutStr == null) return 'offline';
    var s = String(statutStr).toLowerCase();
    if (s.indexOf('batter') !== -1) return 'warn';
    if (s.indexOf('ob') !== -1 && s.indexOf('ol') === -1) return 'warn';
    if (s.indexOf('secteur') !== -1 || s.indexOf('ol') !== -1 || s.indexOf('online') !== -1) {
      if (batPct != null && batPct < 20) return 'crit';
      return 'ok';
    }
    return 'offline';
  };

  /* ---- Format numérique ---- */
  JW.fmt = function (v, digits) {
    if (v == null || v === '' || isNaN(v)) return '—';
    var n = Number(v);
    if (digits != null) return n.toFixed(digits);
    return (Math.round(n * 10) / 10).toString();
  };

  JW.fmtInt = function (v) {
    if (v == null || v === '' || isNaN(v)) return '—';
    return String(Math.round(Number(v)));
  };

  /* ---- Horloge HH:MM:SS ---- */
  JW.tickClock = function (el) {
    if (!el) return;
    var d = new Date();
    var pad = function (n) { return n < 10 ? '0' + n : n; };
    el.innerHTML = pad(d.getHours()) + '<span>:</span>' + pad(d.getMinutes()) + '<span>:</span>' + pad(d.getSeconds());
  };
  JW.startClock = function (el) {
    if (!el) return;
    JW.tickClock(el);
    return setInterval(function () { JW.tickClock(el); }, 1000);
  };

  /* ---- Responsive scaling via ResizeObserver ----
     Met à jour --jw-scale sur `rootEl` pour qu'il remplisse son conteneur
     sans dépasser. Si opts.designHeight est fourni, le scale prend le min
     des deux ratios (largeur/hauteur) : le contenu grossit en suivant la
     plus petite dimension, donc zéro vide sous le widget quand il est
     redimensionné en hauteur.

     designWidth  = largeur  de référence (scale = 1 à cette largeur)
     opts.designHeight = hauteur de référence (optionnelle)
     opts.min / opts.max = bornes (défaut 0.4 / 2.2).
  */
  JW.initScale = function (rootEl, designWidth, opts) {
    if (!rootEl || !designWidth) return null;
    opts = opts || {};
    var min = opts.min != null ? opts.min : 0.4;
    var max = opts.max != null ? opts.max : 2.2;
    var designHeight = opts.designHeight || null;

    function update() {
      var w = rootEl.offsetWidth;
      var h = rootEl.offsetHeight;
      if (w < 10) return;
      var scaleW = w / designWidth;
      var scaleH = designHeight ? h / designHeight : Infinity;
      var scale = Math.max(min, Math.min(max, Math.min(scaleW, scaleH)));
      rootEl.style.setProperty('--jw-scale', scale);
    }
    update();
    window.addEventListener('resize', update, { passive: true });
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(update);
      ro.observe(rootEl);
      return ro;
    }
    return null;
  };

  /* ---- Helpers DOM ---- */
  JW.setText = function (root, field, val) {
    var el = root.querySelector('[data-field="' + field + '"]');
    if (!el) return;
    el.textContent = (val == null || val === '') ? '—' : String(val);
  };
  JW.setTextUnit = function (root, field, val, unit) {
    var el = root.querySelector('[data-field="' + field + '"]');
    if (!el) return;
    if (val == null || val === '' || isNaN(val)) { el.textContent = '—'; return; }
    el.textContent = JW.fmt(val) + ' ' + unit;
  };

  global.JW = JW;
})(window);
