/**
 * =============================================================
 *  site.js — shared chrome + UI behaviours
 * =============================================================
 *  Renders the sticky header, footer and floating action buttons
 *  on every page, then wires up:
 *    • icon painting (inline SVG sprite, no icon font)
 *    • animated hero slider (Ken-Burns, respects reduced-motion)
 *    • scroll reveal + animated counters (locale-aware digits)
 *    • mobile navigation & accessible dropdowns
 *    • back-to-top, gallery lightbox, canonical/OG URL
 *    • Tawk.to live chat loader (when configured)
 *    • Google Analytics 4 loader (when configured)
 * =============================================================
 */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var CONTACT = CFG.contact || {};
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================
   * 1. Inline SVG icon set (stroke style, 24×24 viewBox)
   * ======================================================== */
  var ICONS = {
    menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    'chevron-down': '<polyline points="6 9 12 15 18 9"/>',
    'chevron-up': '<polyline points="18 15 12 9 6 15"/>',
    'arrow-right': '<line x1="4" y1="12" x2="20" y2="12"/><polyline points="13 5 20 12 13 19"/>',
    'arrow-left': '<line x1="20" y1="12" x2="4" y2="12"/><polyline points="11 5 4 12 11 19"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22 6 12 13 2 6"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5z"/>',
    telegram: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
    whatsapp: '<path d="M21 11.5a8.5 8.5 0 0 1-12.7 7.4L3 21l2.2-5.2A8.5 8.5 0 1 1 21 11.5z"/><path d="M8.6 9.4c0 3 2.4 5.4 5.4 5.4.6 0 1-.4 1-1v.7c0 .4-.3.8-.7.9l-1.3.4c-1.7-.9-3-2.2-3.9-3.9l.4-1.3c.1-.4.5-.7.9-.7h.7c.6 0 1 .4 1 1z"/>',
    ship: '<path d="M3 17.5c1.4 1 2.8 1.5 4.2 1.5s2.8-.5 4.2-1.5 2.8-1.5 4.2-1.5 2.8.5 4.2 1.5"/><path d="M5.5 16 7 10.5h10L18.5 16"/><path d="M12 10.5V5.5"/><path d="M9 5.5h6"/><path d="M4 21c1.7 1 3.4 1.5 5 1.5s3.3-.5 5-1.5"/>',
    train: '<rect x="5" y="3" width="14" height="13" rx="2"/><path d="M5 10.5h14"/><path d="M8.5 19.5 7 22M15.5 19.5 17 22"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/><line x1="7" y1="16" x2="4.5" y2="19.5"/><line x1="17" y1="16" x2="19.5" y2="19.5"/>',
    truck: '<path d="M3 6h11v10H3z"/><path d="M14 9.5h3.8L21 13v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17.2" cy="18" r="1.8"/>',
    container: '<path d="M3 8.5 12 4l9 4.5v7L12 20l-9-4.5z"/><path d="M3 8.5 12 13l9-4.5M12 13v7"/>',
    warehouse: '<path d="M3 21V9l9-5 9 5v12"/><path d="M7.5 21v-7h9v7"/><path d="M7.5 17h9"/><path d="M12 14v3"/>',
    anchor: '<circle cx="12" cy="5" r="2.2"/><line x1="12" y1="7.2" x2="12" y2="21"/><path d="M5 13a7 7 0 0 0 14 0"/><line x1="3" y1="13" x2="6.5" y2="13"/><line x1="17.5" y1="13" x2="21" y2="13"/><path d="M8.5 17.5 12 21l3.5-3.5"/>',
    globe: '<circle cx="12" cy="12" r="9.5"/><line x1="2.5" y1="12" x2="21.5" y2="12"/><path d="M12 2.5a14.5 14.5 0 0 1 4 9.5 14.5 14.5 0 0 1-4 9.5 14.5 14.5 0 0 1-4-9.5 14.5 14.5 0 0 1 4-9.5z"/>',
    shield: '<path d="M12 21.5s7.5-3.7 7.5-9.3V5.4L12 2.5 4.5 5.4v6.8c0 5.6 7.5 9.3 7.5 9.3z"/><polyline points="9 12 11.2 14.2 15.4 10"/>',
    clock: '<circle cx="12" cy="12" r="9.5"/><polyline points="12 6.5 12 12 16 14"/>',
    pin: '<path d="M20.5 10.3c0 6.5-8.5 12-8.5 12s-8.5-5.5-8.5-12a8.5 8.5 0 0 1 17 0z"/><circle cx="12" cy="10.2" r="3"/>',
    award: '<circle cx="12" cy="8.5" r="5.5"/><path d="M8.4 13.4 7 21.5l5-2.8 5 2.8-1.4-8.1"/>',
    briefcase: '<rect x="2.5" y="7" width="19" height="13.5" rx="2"/><path d="M16 7V5.5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2V7"/><path d="M2.5 12.5h19"/>',
    file: '<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><polyline points="14 2.5 14 8 19.5 8"/><line x1="8.5" y1="13" x2="15.5" y2="13"/><line x1="8.5" y1="17" x2="15.5" y2="17"/>',
    news: '<path d="M4.5 21.5V4a1.5 1.5 0 0 1 1.5-1.5h11A1.5 1.5 0 0 1 18.5 4v17.5"/><path d="M18.5 8.5h1.5a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H4.5"/><line x1="8" y1="7" x2="15" y2="7"/><line x1="8" y1="11" x2="15" y2="11"/><line x1="8" y1="15" x2="13" y2="15"/>',
    help: '<circle cx="12" cy="12" r="9.5"/><path d="M9.2 9.3a3 3 0 0 1 5.8 1c0 2-2.9 2.7-2.9 4"/><line x1="12" y1="17.2" x2="12.01" y2="17.2"/>',
    camera: '<path d="M22.5 19a2 2 0 0 1-2 2h-17a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2H7l1.8-3h6.4L17 6.5h3.5a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="3.8"/>',
    trend: '<polyline points="22 6.5 13.5 15 8.5 10 2 17"/><polyline points="16 6.5 22 6.5 22 12.5"/>',
    zap: '<polygon points="13 2.5 3.5 14 11.5 14 10 21.5 20.5 10 12.5 10 13 2.5"/>',
    users: '<path d="M16.5 21v-2a4 4 0 0 0-4-4h-7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="3.8"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M15.5 3.3a4 4 0 0 1 0 7.4"/>',
    layers: '<polygon points="12 2.5 2.5 7.2 12 12 21.5 7.2 12 2.5"/><polyline points="2.5 16.8 12 21.5 21.5 16.8"/><polyline points="2.5 12 12 16.8 21.5 12"/>',
    star: '<polygon points="12 2.5 14.9 8.5 21.5 9.4 16.7 14 17.9 20.5 12 17.4 6.1 20.5 7.3 14 2.5 9.4 9.1 8.5 12 2.5"/>',
    building: '<rect x="4.5" y="2.5" width="15" height="19" rx="1.5"/><path d="M9.5 21.5v-4h5v4"/><line x1="8.5" y1="6.5" x2="10.5" y2="6.5"/><line x1="13.5" y1="6.5" x2="15.5" y2="6.5"/><line x1="8.5" y1="10.5" x2="10.5" y2="10.5"/><line x1="13.5" y1="10.5" x2="15.5" y2="10.5"/><line x1="8.5" y1="14.5" x2="10.5" y2="14.5"/><line x1="13.5" y1="14.5" x2="15.5" y2="14.5"/>',
    linkedin: '<path d="M16 8.5a5.5 5.5 0 0 1 5.5 5.5V21h-4v-6.5a1.8 1.8 0 0 0-3.6 0V21h-4V9h4v1.6A4.4 4.4 0 0 1 16 8.5z"/><rect x="2.5" y="9" width="4" height="12"/><circle cx="4.5" cy="4.5" r="2"/>',
    instagram: '<rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.2"/><line x1="17.4" y1="6.6" x2="17.41" y2="6.6"/>',
    twitter: '<path d="M22.5 3.5a9.7 9.7 0 0 1-2.9 1.4A4.5 4.5 0 0 0 11.7 8v1A10.7 10.7 0 0 1 3 4.5s-4 9 5 13a11.6 11.6 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.1-.8 7.7 7.7 0 0 0 2.6-2.7z"/>',
    youtube: '<path d="M22.5 6.6a2.8 2.8 0 0 0-1.9-2C18.9 4.2 12 4.2 12 4.2s-6.9 0-8.6.4a2.8 2.8 0 0 0-1.9 2A29 29 0 0 0 1.1 12a29 29 0 0 0 .4 5.4 2.8 2.8 0 0 0 1.9 2c1.7.4 8.6.4 8.6.4s6.9 0 8.6-.4a2.8 2.8 0 0 0 1.9-2 29 29 0 0 0 .4-5.4 29 29 0 0 0-.4-5.4z"/><polygon points="9.8 15 15.5 12 9.8 9 9.8 15"/>',
    send: '<path d="M21.5 2.5 11 13"/><path d="M21.5 2.5 15 21.5l-4-8.5-8.5-4z"/>'
  };

  /** Return an inline <svg> for a named icon. */
  function svg(name, cls) {
    var body = ICONS[name] || '';
    return '<svg class="icon ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  /** Replace every [data-icon] placeholder inside root with real SVG. */
  function paintIcons(root) {
    var els = (root || document).querySelectorAll('[data-icon]:not([data-icon-done])');
    for (var i = 0; i < els.length; i++) {
      els[i].innerHTML = svg(els[i].getAttribute('data-icon'));
      els[i].setAttribute('data-icon-done', '1');
    }
  }

  /* ==========================================================
   * 2. Shared chrome markup
   * ======================================================== */

  function telHref() { return 'tel:' + (CONTACT.phoneTel || '+989153143647'); }
  function waHref() { return CONTACT.whatsapp || '#'; }
  function tgHref() { return CONTACT.telegram || '#'; }
  function mailHref() { return 'mailto:' + (CONTACT.email || ''); }

  function brandHtml() {
    return '' +
      '<a class="brand" href="index.html">' +
        '<span class="brand-mark" aria-hidden="true">HSB</span>' +
        '<span class="brand-text">' +
          '<strong data-i18n="brand.name">هلدینگ هومان تجارت سدید بنیان</strong>' +
          '<small data-i18n="brand.tagline">حمل‌ونقل بین‌المللی، تجارت و لجستیک</small>' +
        '</span>' +
      '</a>';
  }

  function navLink(page, href, key, label) {
    return '<li><a href="' + href + '" data-nav="' + page + '">' +
      '<span data-i18n="' + key + '">' + label + '</span></a></li>';
  }

  function headerHtml() {
    return '' +
    '<div class="header-inner container">' +
      brandHtml() +
      '<nav class="site-nav" id="site-nav" aria-label="Main navigation">' +
        '<ul class="nav-list">' +
          navLink('index', 'index.html', 'nav.home', 'خانه') +
          navLink('about', 'about.html', 'nav.about', 'درباره ما') +
          '<li class="nav-drop-item">' +
            '<details class="nav-drop" data-nav-parents="daryadaran harmoniza hami naghel affiliated">' +
              '<summary><span data-i18n="nav.companies">شرکت‌ها</span>' +
              '<span class="icon-caret" data-icon="chevron-down"></span></summary>' +
              '<ul class="nav-sub">' +
                navLink('daryadaran', 'daryadaran.html', 'nav.daryadaran', 'دریاداران طوس') +
                navLink('harmoniza', 'harmoniza.html', 'nav.harmoniza', 'هراز هرمز آرین') +
                navLink('hami', 'hami.html', 'nav.hami', 'حامی همراه جنوب') +
                navLink('naghel', 'naghel.html', 'nav.naghel', 'ناقل السودان') +
                navLink('affiliated', 'affiliated.html', 'nav.affiliated', 'شرکت‌های وابسته') +
              '</ul>' +
            '</details>' +
          '</li>' +
          navLink('services', 'services.html', 'nav.services', 'خدمات') +
          navLink('sarakhs', 'sarakhs.html', 'nav.sarakhs', 'منطقه آزاد سرخس') +
          navLink('laws', 'laws.html', 'nav.laws', 'حقوق تجارت بین‌الملل') +
          navLink('contact', 'contact.html', 'nav.contact', 'تماس با ما') +
          '<li class="nav-drop-item">' +
            '<details class="nav-drop nav-drop-more" data-nav-parents="vision projects news faq careers certifications clients gallery privacy terms">' +
              '<summary><span data-i18n="nav.more">بیشتر</span>' +
              '<span class="icon-caret" data-icon="chevron-down"></span></summary>' +
              '<ul class="nav-sub nav-sub-wide">' +
                navLink('vision', 'vision.html', 'nav.vision', 'چشم‌انداز و مأموریت') +
                navLink('projects', 'projects.html', 'nav.projects', 'پروژه‌ها') +
                navLink('news', 'news.html', 'nav.news', 'اخبار') +
                navLink('faq', 'faq.html', 'nav.faq', 'سؤالات متداول') +
                navLink('careers', 'careers.html', 'nav.careers', 'فرصت‌های شغلی') +
                navLink('certifications', 'certifications.html', 'nav.certifications', 'گواهی‌نامه‌ها') +
                navLink('clients', 'clients.html', 'nav.clients', 'مشتریان و همکاران') +
                navLink('gallery', 'gallery.html', 'nav.gallery', 'گالری') +
              '</ul>' +
            '</details>' +
          '</li>' +
        '</ul>' +
      '</nav>' +
      '<div class="header-actions">' +
        '<div class="lang-switch" role="group" aria-label="Language">' +
          '<button type="button" class="lang-btn" data-set-lang="fa" aria-pressed="true">فارسی</button>' +
          '<button type="button" class="lang-btn" data-set-lang="en" aria-pressed="false">EN</button>' +
        '</div>' +
        '<a class="btn btn-gold btn-sm header-chat" href="' + waHref() + '" data-chat-open>' +
          '<span data-icon="chat"></span><span data-i18n="cta.chat">گفت‌وگو با کارشناس</span>' +
        '</a>' +
        '<a class="header-tel" href="' + telHref() + '">' +
          '<span data-icon="phone"></span><span data-phone-display>+98 915 314 3647</span>' +
        '</a>' +
        '<button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav" ' +
          'aria-label="Menu" data-i18n-aria="a11y.menu"><span data-icon="menu"></span></button>' +
      '</div>' +
    '</div>';
  }

  function footerHtml() {
    var y = new Date().getFullYear();
    var addr = (CFG.address && (CFG.address[I18N_LANG()] || CFG.address.fa)) || '';
    return '' +
    '<div class="footer-main container">' +
      '<div class="footer-col footer-about">' +
        brandHtml() +
        '<p class="footer-desc" data-i18n="footer.about">هلدینگ تخصصی حمل‌ونقل بین‌المللی، تجارت و لجستیک با شبکه‌ای از شرکت‌های عملیاتی در بندرعباس، سرخس و عراق.</p>' +
        '<ul class="footer-social" data-social-list></ul>' +
      '</div>' +
      '<div class="footer-col">' +
        '<h3 data-i18n="footer.colCompany">شرکت‌های گروه</h3>' +
        '<ul>' +
          '<li><a href="daryadaran.html" data-i18n="nav.daryadaran">دریاداران طوس</a></li>' +
          '<li><a href="harmoniza.html" data-i18n="nav.harmoniza">هراز هرمز آرین</a></li>' +
          '<li><a href="hami.html" data-i18n="nav.hami">حامی همراه جنوب</a></li>' +
          '<li><a href="naghel.html" data-i18n="nav.naghel">ناقل السودان</a></li>' +
          '<li><a href="affiliated.html" data-i18n="nav.affiliated">شرکت‌های وابسته</a></li>' +
          '<li><a href="sarakhs.html" data-i18n="nav.sarakhs">منطقه آزاد سرخس</a></li>' +
        '</ul>' +
      '</div>' +
      '<div class="footer-col">' +
        '<h3 data-i18n="footer.colLinks">دسترسی سریع</h3>' +
        '<ul>' +
          '<li><a href="about.html" data-i18n="nav.about">درباره ما</a></li>' +
          '<li><a href="vision.html" data-i18n="nav.vision">چشم‌انداز و مأموریت</a></li>' +
          '<li><a href="services.html" data-i18n="nav.services">خدمات</a></li>' +
          '<li><a href="projects.html" data-i18n="nav.projects">پروژه‌ها</a></li>' +
          '<li><a href="laws.html" data-i18n="nav.laws">حقوق تجارت بین‌الملل</a></li>' +
          '<li><a href="faq.html" data-i18n="nav.faq">سؤالات متداول</a></li>' +
          '<li><a href="contact.html" data-i18n="nav.contact">تماس با ما</a></li>' +
        '</ul>' +
      '</div>' +
      '<div class="footer-col footer-contact">' +
        '<h3 data-i18n="footer.colContact">تماس با ما</h3>' +
        '<ul>' +
          '<li><a href="' + telHref() + '"><span data-icon="phone"></span>' +
            '<span data-phone-display>+98 915 314 3647</span></a></li>' +
          '<li><a href="' + mailHref() + '"><span data-icon="mail"></span>' +
            '<span>' + (CONTACT.email || '') + '</span></a></li>' +
          '<li><a href="' + tgHref() + '" target="_blank" rel="noopener"><span data-icon="telegram"></span>' +
            '<span data-i18n="footer.telegram">تلگرام</span></a></li>' +
          '<li><a href="' + waHref() + '" target="_blank" rel="noopener"><span data-icon="whatsapp"></span>' +
            '<span>WhatsApp</span></a></li>' +
          '<li><span data-icon="pin"></span><span class="footer-address">' + addr + '</span></li>' +
        '</ul>' +
        '<div class="footer-newsletter">' +
          '<h4 data-i18n="footer.newsTitle">خبرنامه</h4>' +
          '<p data-i18n="footer.newsDesc">آخرین اخبار تجارت و لجستیک را دریافت کنید.</p>' +
          '<form class="newsletter-form" data-form="newsletter" data-success-key="forms.newsletter.success" novalidate>' +
            '<label class="sr-only" for="nl-email" data-i18n="forms.newsletter.label">ایمیل شما</label>' +
            '<input id="nl-email" type="email" name="email" required data-validate="email" ' +
              'data-i18n-ph="forms.newsletter.ph" placeholder="ایمیل شما">' +
            '<button type="submit" class="btn btn-gold" data-i18n="forms.newsletter.btn">عضویت</button>' +
            '<div class="hp-field" aria-hidden="true"><label>Leave this field empty<input type="text" ' +
              'name="botcheck" tabindex="-1" autocomplete="off"></label></div>' +
            '<p class="form-status" role="status" aria-live="polite"></p>' +
          '</form>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="footer-bottom">' +
      '<div class="container footer-bottom-inner">' +
        '<p class="copyright">© <span id="footer-year">' + y + '</span> ' +
          '<span data-i18n="footer.rights">هلدینگ هومان تجارت سدید بنیان — تمامی حقوق محفوظ است.</span></p>' +
        '<ul class="footer-legal">' +
          '<li><a href="privacy.html" data-i18n="nav.privacy">حریم خصوصی</a></li>' +
          '<li><a href="terms.html" data-i18n="nav.terms">شرایط استفاده</a></li>' +
          '<li><a href="certifications.html" data-i18n="nav.certifications">گواهی‌نامه‌ها</a></li>' +
        '</ul>' +
      '</div>' +
    '</div>';
  }

  /** Current language (used before i18n boots → default FA). */
  function I18N_LANG() {
    return (window.I18N && window.I18N.getLang && window.I18N.getLang()) ||
      (CFG.defaultLang || 'fa');
  }

  function floatingHtml() {
    return '' +
      '<button type="button" class="fab fab-top" data-back-top aria-hidden="true" tabindex="-1" ' +
        'title="Top" data-i18n-title="a11y.top"><span data-icon="chevron-up"></span></button>' +
      '<a class="fab fab-chat" href="' + waHref() + '" data-chat-open ' +
        'title="Chat" data-i18n-title="cta.chatShort"><span data-icon="chat"></span></a>' +
      '<a class="fab fab-telegram" href="' + tgHref() + '" target="_blank" rel="noopener" ' +
        'title="تلگرام" data-i18n-title="footer.telegram"><span data-icon="telegram"></span></a>' +
      '<a class="fab fab-whatsapp" href="' + waHref() + '" target="_blank" rel="noopener" ' +
        'title="واتساپ" data-i18n-title="cta.whatsapp"><span data-icon="whatsapp"></span></a>';
  }

  /* ==========================================================
   * 3. Chrome renderer (idempotent — called by i18n + boot)
   * ======================================================== */
  function renderChrome() {
    var header = document.getElementById('site-header');
    if (header && !header.dataset.rendered) {
      header.innerHTML = headerHtml();
      header.dataset.rendered = '1';
    }
    var footer = document.getElementById('site-footer');
    if (footer && !footer.dataset.rendered) {
      footer.innerHTML = footerHtml();
      footer.dataset.rendered = '1';
    }
    var fab = document.getElementById('floating-actions');
    if (fab && !fab.dataset.rendered) {
      fab.innerHTML = floatingHtml();
      fab.dataset.rendered = '1';
    }
    paintIcons(document);
    markActiveNav();
    paintSocial();
  }

  window.SiteChrome = { render: renderChrome, svg: svg, paintIcons: paintIcons };

  /* ==========================================================
   * 4. Active nav state
   * ======================================================== */
  function markActiveNav() {
    var page = document.documentElement.getAttribute('data-page') || 'index';
    var links = document.querySelectorAll('[data-nav]');
    for (var i = 0; i < links.length; i++) {
      links[i].classList.toggle('is-current', links[i].getAttribute('data-nav') === page);
      if (links[i].getAttribute('data-nav') === page) {
        links[i].setAttribute('aria-current', 'page');
      } else {
        links[i].removeAttribute('aria-current');
      }
    }
    var drops = document.querySelectorAll('details[data-nav-parents]');
    for (var d = 0; d < drops.length; d++) {
      var pages = drops[d].getAttribute('data-nav-parents').split(/\s+/);
      drops[d].classList.toggle('is-current', pages.indexOf(page) !== -1);
    }
  }

  /* Social icons (hidden until real URLs are configured) */
  function paintSocial() {
    var list = document.querySelector('[data-social-list]');
    if (!list || list.dataset.painted) return;
    var s = CFG.social || {};
    var items = [
      ['linkedin', s.linkedin, 'LinkedIn'],
      ['instagram', s.instagram, 'Instagram'],
      ['twitter', s.twitter, 'X'],
      ['youtube', s.youtube, 'YouTube']
    ];
    var html = '';
    items.forEach(function (it) {
      if (!it[1]) return;
      html += '<li><a href="' + it[1] + '" target="_blank" rel="noopener" aria-label="' + it[2] + '">' +
        svg(it[0]) + '</a></li>';
    });
    list.innerHTML = html;
    list.dataset.painted = '1';
    list.style.display = html ? '' : 'none';
  }

  /* ==========================================================
   * 5. Hero slider
   * ======================================================== */
  var sliderTimer = null;
  var lastDict = null;   // current language dictionary (for captions)

  function getPath(obj, path) {
    if (!obj) return null;
    var parts = path.split('.');
    var node = obj;
    for (var i = 0; i < parts.length; i++) {
      if (node == null) return null;
      node = node[parts[i]];
    }
    return typeof node === 'string' ? node : null;
  }

  function initSlider() {
    var root = document.querySelector('[data-slider]');
    if (!root || root.dataset.built) return;
    var slides = CFG.heroSlides || [];
    if (!slides.length) return;

    var track = document.createElement('div');
    track.className = 'slider-track';
    slides.forEach(function (s, idx) {
      var fig = document.createElement('div');
      fig.className = 'slide' + (idx === 0 ? ' is-active' : '');
      var img = document.createElement('img');
      img.src = s.img;
      img.alt = '';
      if (s.captionKey) img.setAttribute('data-i18n-alt', s.captionKey);
      img.decoding = 'async';
      if (idx === 0) { img.fetchPriority = 'high'; } else { img.loading = 'lazy'; }
      fig.appendChild(img);
      track.appendChild(fig);
    });
    root.appendChild(track);

    var dots = document.createElement('div');
    dots.className = 'slider-dots';
    dots.setAttribute('role', 'tablist');
    slides.forEach(function (s, idx) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dot' + (idx === 0 ? ' is-active' : '');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Slide ' + (idx + 1));
      b.addEventListener('click', function () { goTo(idx); restart(); });
      dots.appendChild(b);
    });
    root.appendChild(dots);
    root.dataset.built = '1';

    var current = 0;
    function goTo(n) {
      current = (n + slides.length) % slides.length;
      var slideEls = track.children;
      for (var i = 0; i < slideEls.length; i++) {
        slideEls[i].classList.toggle('is-active', i === current);
        dots.children[i].classList.toggle('is-active', i === current);
      }
      // Rotating hero caption follows the active slide + language
      var cap = document.querySelector('[data-slide-caption]');
      var key = slides[current].captionKey;
      if (cap && key) {
        var txt = getPath(lastDict, key);
        if (txt) cap.textContent = txt;
        else cap.setAttribute('data-i18n', key);
      }
    }
    function restart() {
      if (sliderTimer) clearInterval(sliderTimer);
      if (!REDUCED) sliderTimer = setInterval(function () { goTo(current + 1); }, 6000);
    }
    restart();
    root.addEventListener('mouseenter', function () { if (sliderTimer) clearInterval(sliderTimer); });
    root.addEventListener('mouseleave', restart);
  }

  /* ==========================================================
   * 6. Scroll reveal + animated counters
   * ======================================================== */
  function initReveal() {
    var els = document.querySelectorAll('.reveal:not([data-observed])');
    if (!els.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) {
      for (var i = 0; i < els.length; i++) els[i].classList.add('is-visible');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    for (var j = 0; j < els.length; j++) {
      els[j].setAttribute('data-observed', '1');
      io.observe(els[j]);
    }
  }

  function formatNumber(value, lang) {
    try {
      return Math.round(value).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US');
    } catch (e) {
      return String(Math.round(value));
    }
  }

  function initCounters() {
    var els = document.querySelectorAll('.counter[data-count]:not([data-counted])');
    if (!els.length) return;

    function run(el) {
      el.setAttribute('data-counted', '1');
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var lang = I18N_LANG();
      if (REDUCED) {
        el.textContent = formatNumber(target, lang) + suffix;
        return;
      }
      var dur = 1800, start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 4);          // ease-out-quart
        el.textContent = formatNumber(target * eased, lang) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < els.length; i++) run(els[i]);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    for (var j = 0; j < els.length; j++) io.observe(els[j]);
  }

  /* ==========================================================
   * 7. Navigation behaviour
   * ======================================================== */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.innerHTML = svg(open ? 'close' : 'menu');
      document.body.classList.toggle('nav-locked', open);
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Hover-open for dropdowns on pointer devices (click still works)
    if (window.matchMedia('(hover:hover) and (min-width:1024px)').matches) {
      var drops = nav.querySelectorAll('details.nav-drop');
      for (var i = 0; i < drops.length; i++) {
        (function (d) {
          var t = null;
          d.addEventListener('mouseenter', function () {
            if (t) clearTimeout(t);
            d.open = true;
          });
          d.addEventListener('mouseleave', function () {
            t = setTimeout(function () { d.open = false; }, 180);
          });
          d.addEventListener('focusout', function (e) {
            if (!d.contains(e.relatedTarget)) d.open = false;
          });
        })(drops[i]);
      }
    }
    // Close other dropdowns when one opens
    nav.addEventListener('toggle', function (e) {
      if (e.target.tagName === 'DETAILS' && e.target.open) {
        var others = nav.querySelectorAll('details.nav-drop[open]');
        for (var k = 0; k < others.length; k++) {
          if (others[k] !== e.target) others[k].open = false;
        }
      }
    }, true);
  }

  /* ==========================================================
   * 8. Back-to-top / header shadow / smooth anchors
   * ======================================================== */
  function initScrollUi() {
    var topBtn = document.querySelector('[data-back-top]');
    var header = document.querySelector('.site-header');
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || 0;
        if (header) header.classList.toggle('is-scrolled', y > 12);
        if (topBtn) {
          var show = y > 500;
          topBtn.classList.toggle('is-show', show);
          topBtn.setAttribute('aria-hidden', show ? 'false' : 'true');
          topBtn.tabIndex = show ? 0 : -1;
        }
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (topBtn) {
      topBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
      });
    }
  }

  /* ==========================================================
   * 9. Live chat (Tawk.to) + chat CTAs
   * ======================================================== */
  function initChat() {
    var c = CFG.chat || {};
    var configured = c.provider === 'tawk' && !!c.propertyId && !!c.widgetId;
    if (configured) {
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_API.customStyle = {
        visibility: {
          desktop: { position: 'br', xOffset: 16, yOffset: 96 },
          mobile: { position: 'br', xOffset: 12, yOffset: 96 }
        }
      };
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://embed.tawk.to/' + encodeURIComponent(c.propertyId) +
        '/' + encodeURIComponent(c.widgetId);
      s.charset = 'UTF-8';
      s.setAttribute('crossorigin', '*');
      document.head.appendChild(s);
    }

    // Chat CTAs: open the widget when available, otherwise the
    // WhatsApp link already in the href keeps them useful.
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-chat-open]');
      if (!btn) return;
      if (configured && window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
        e.preventDefault();
        window.Tawk_API.maximize();
      }
    });
  }

  /* ==========================================================
   * 10. Gallery lightbox
   * ======================================================== */
  function initLightbox() {
    var triggers = document.querySelectorAll('[data-lightbox]');
    if (!triggers.length) return;

    var overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = '<button type="button" class="lightbox-close" aria-label="Close">' +
      svg('close') + '</button><img alt="">';
    document.body.appendChild(overlay);
    var img = overlay.querySelector('img');

    function close() {
      overlay.classList.remove('is-open');
      document.body.classList.remove('nav-locked');
    }
    function open(src, alt) {
      img.src = src;
      img.alt = alt || '';
      overlay.classList.add('is-open');
      document.body.classList.add('nav-locked');
      overlay.querySelector('.lightbox-close').focus();
    }

    for (var i = 0; i < triggers.length; i++) {
      (function (el) {
        el.addEventListener('click', function () {
          open(el.getAttribute('data-lightbox'), el.getAttribute('data-lightbox-alt') ||
            (el.querySelector('img') && el.querySelector('img').alt) || '');
        });
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
        });
      })(triggers[i]);
    }
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.closest('.lightbox-close')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
    });
  }

  /* ==========================================================
   * 11. SEO URL + analytics
   * ======================================================== */
  function applyUrls() {
    try {
      var clean = window.location.origin + window.location.pathname;
      var canon = document.querySelector('link[rel="canonical"]');
      if (canon) canon.setAttribute('href', clean);
      var ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', clean);
      var ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && !ogImage.getAttribute('content')) {
        ogImage.setAttribute('content', (CFG.heroSlides[0] && CFG.heroSlides[0].img) || '');
      }
    } catch (e) { /* file:// preview has no origin — ignore */ }
  }

  function initAnalytics() {
    var id = CFG.analytics && CFG.analytics.gaMeasurementId;
    if (!id) return;
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', id, { anonymize_ip: true });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
  }

  /* ==========================================================
   * 12. Boot
   * ======================================================== */
  function boot() {
    renderChrome();
    initSlider();
    initNav();
    initScrollUi();
    initReveal();
    initCounters();
    initLightbox();
    initChat();
    applyUrls();
    initAnalytics();

    // Re-run light-dependent UI after each language change
    if (window.I18N && window.I18N.onChange) {
      window.I18N.onChange(function (lang, dict) {
        lastDict = dict;
        renderChrome();
        markActiveNav();
        var cap = document.querySelector('[data-slide-caption]');
        var built = document.querySelector('[data-slider][data-built]');
        if (cap && built && CFG.heroSlides && CFG.heroSlides.length) {
          var active = 0;
          var dotsEl = built.querySelectorAll('.dot');
          for (var d = 0; d < dotsEl.length; d++) {
            if (dotsEl[d].classList.contains('is-active')) active = d;
          }
          var k = CFG.heroSlides[active] && CFG.heroSlides[active].captionKey;
          var t = k ? getPath(dict, k) : null;
          if (t) cap.textContent = t;
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
