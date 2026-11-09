/**
 * =============================================================
 *  i18n — bilingual engine (Persian default / English)
 * =============================================================
 *  • Loads lang/fa.json or lang/en.json (fetch, cached per session)
 *  • Applies translations to elements carrying:
 *        data-i18n="dotted.key"            → textContent
 *        data-i18n-ph="dotted.key"         → placeholder
 *        data-i18n-title="dotted.key"      → title
 *        data-i18n-aria="dotted.key"       → aria-label
 *        data-i18n-alt="dotted.key"        → alt
 *        data-i18n-html="dotted.key"       → innerHTML (trusted, from our own JSON)
 *  • Sets <html lang>, <html dir>, font stack, document.title,
 *    meta description, Open Graph tags and JSON-LD name/description
 *  • Persists choice in localStorage and honours ?lang= / #lang
 * =============================================================
 */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var LANG_KEY = CFG.langStorageKey || 'hsb_lang';
  var DEFAULT_LANG = CFG.defaultLang || 'fa';
  var dictionaries = {};   // lang -> flat/nested object (session cache)
  var listeners = [];      // callbacks fired after every language change
  var currentLang = null;

  /* ---------- helpers ------------------------------------------------ */

  function getStoredLang() {
    try {
      var q = new URLSearchParams(window.location.search).get('lang');
      if (q === 'fa' || q === 'en') return q;
      var s = window.localStorage.getItem(LANG_KEY);
      if (s === 'fa' || s === 'en') return s;
    } catch (e) { /* storage blocked → fall back to default */ }
    return DEFAULT_LANG;
  }

  /** Resolve "a.b.c" inside a (possibly nested) dictionary. */
  function lookup(dict, path) {
    if (!dict) return null;
    var parts = path.split('.');
    var node = dict;
    for (var i = 0; i < parts.length; i++) {
      if (node == null) return null;
      node = node[parts[i]];
    }
    return typeof node === 'string' ? node : null;
  }

  function loadDictionary(lang) {
    if (dictionaries[lang]) return Promise.resolve(dictionaries[lang]);
    return fetch('lang/' + lang + '.json', { cache: 'force-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('lang file not found: ' + lang);
        return r.json();
      })
      .then(function (json) {
        dictionaries[lang] = json;
        return json;
      });
  }

  function isRTL(lang) { return lang === 'fa'; }

  /* ---------- translation pass --------------------------------------- */

  function applyDictionary(dict, lang) {
    var i, els;

    // Render the shared chrome (header/footer/floating buttons) FIRST so
    // its data-i18n nodes are picked up by the translation pass below.
    applyChrome(dict, lang);

    // Plain text nodes
    els = document.querySelectorAll('[data-i18n]');
    for (i = 0; i < els.length; i++) {
      var v = lookup(dict, els[i].getAttribute('data-i18n'));
      if (v !== null) els[i].textContent = v;
    }
    // Attributes
    var attrMap = [
      ['data-i18n-ph', 'placeholder'],
      ['data-i18n-title', 'title'],
      ['data-i18n-aria', 'aria-label'],
      ['data-i18n-alt', 'alt'],
      ['data-i18n-content', 'content']   // meta tags
    ];
    attrMap.forEach(function (pair) {
      els = document.querySelectorAll('[' + pair[0] + ']');
      for (i = 0; i < els.length; i++) {
        var val = lookup(dict, els[i].getAttribute(pair[0]));
        if (val !== null) els[i].setAttribute(pair[1], val);
      }
    });
    // Trusted HTML (only used with our own JSON content)
    els = document.querySelectorAll('[data-i18n-html]');
    for (i = 0; i < els.length; i++) {
      var hv = lookup(dict, els[i].getAttribute('data-i18n-html'));
      if (hv !== null) els[i].innerHTML = hv;
    }

    applySeo(dict, lang);
  }

  /** document.title, meta description, OG + JSON-LD */
  function applySeo(dict, lang) {
    var page = document.documentElement.getAttribute('data-page') || 'index';
    var title = lookup(dict, 'meta.' + page + '.title');
    var desc = lookup(dict, 'meta.' + page + '.description');
    if (title) document.title = title;
    setMeta('name="description"', desc);
    setMeta('property="og:title"', title);
    setMeta('property="og:description"', desc);
    setMeta('property="og:locale"', lang === 'fa' ? 'fa_IR' : 'en_US');

    // Update Organization JSON-LD name/description if present
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      try {
        var data = JSON.parse(scripts[i].textContent);
        var update = function (obj) {
          if (!obj || typeof obj !== 'object') return;
          if (obj['@type'] === 'Organization' || obj['@type'] === 'LocalBusiness') {
            var n = lookup(dict, 'schema.organization.name');
            var d = lookup(dict, 'schema.organization.description');
            if (n) obj.name = n;
            if (d) obj.description = d;
          }
        };
        if (Array.isArray(data)) data.forEach(update); else update(data);
        scripts[i].textContent = JSON.stringify(data);
      } catch (e) { /* leave malformed JSON-LD untouched */ }
    }
  }

  function setMeta(selector, content) {
    if (!content) return;
    var el = document.head.querySelector('meta[' + selector + ']');
    if (el) el.setAttribute('content', content);
  }

  /** Header / footer / floating buttons are rendered by site.js */
  function applyChrome(dict, lang) {
    if (window.SiteChrome && typeof window.SiteChrome.render === 'function') {
      window.SiteChrome.render(dict, lang);
    }
  }

  /* ---------- document-level language switch -------------------------- */

  function setDocumentLanguage(lang) {
    var html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', isRTL(lang) ? 'rtl' : 'ltr');
    html.setAttribute('data-lang', lang);

    // Switcher button states
    var buttons = document.querySelectorAll('[data-set-lang]');
    for (var i = 0; i < buttons.length; i++) {
      var active = buttons[i].getAttribute('data-set-lang') === lang;
      buttons[i].classList.toggle('is-active', active);
      buttons[i].setAttribute('aria-pressed', active ? 'true' : 'false');
    }

    // Phone display per language
    var telLinks = document.querySelectorAll('[data-phone-display]');
    var disp = (CFG.contact && CFG.contact.phoneDisplay)
      ? CFG.contact.phoneDisplay[lang] : '';
    for (var j = 0; j < telLinks.length; j++) {
      if (disp) telLinks[j].textContent = disp;
    }
  }

  /* ---------- public API --------------------------------------------- */

  function translate(lang) {
    return loadDictionary(lang).then(function (dict) {
      setDocumentLanguage(lang);
      applyDictionary(dict, lang);
      currentLang = lang;
      try { window.localStorage.setItem(LANG_KEY, lang); } catch (e) {}
      // Keep ?lang= in the URL so links stay shareable
      try {
        var url = new URL(window.location.href);
        if (lang === DEFAULT_LANG) url.searchParams.delete('lang');
        else url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);
      } catch (e) {}
      listeners.forEach(function (fn) {
        try { fn(lang, dict); } catch (e) { /* listener errors must not break i18n */ }
      });
      return lang;
    });
  }

  function onChange(fn) { listeners.push(fn); }

  function getLang() { return currentLang || getStoredLang(); }

  function t(path, fallback) {
    var dict = dictionaries[getLang()];
    var v = lookup(dict, path);
    if (v !== null) return v;
    // fall back to the other language before giving up
    var other = getLang() === 'fa' ? 'en' : 'fa';
    v = lookup(dictionaries[other], path);
    return v !== null ? v : (fallback !== undefined ? fallback : path);
  }

  window.I18N = {
    t: t,
    translate: translate,
    onChange: onChange,
    getLang: getLang,
    isRTL: function (lang) { return isRTL(lang || getLang()); },
    loadDictionary: loadDictionary
  };

  /* ---------- boot ---------------------------------------------------- */

  document.addEventListener('DOMContentLoaded', function () {
    // Language switcher clicks (delegated — header may be injected)
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-set-lang]');
      if (!btn) return;
      e.preventDefault();
      translate(btn.getAttribute('data-set-lang'));
    });

    translate(getStoredLang()).catch(function (err) {
      // JSON missing/broken: keep the inline Persian content, log loudly.
      console.error('[i18n] failed to load language file:', err);
      setDocumentLanguage(DEFAULT_LANG);
    });
  });
})();
