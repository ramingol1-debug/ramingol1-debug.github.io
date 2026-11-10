/**
 * =============================================================
 *  Human Sadid Bonyan Trade Holding — Central configuration
 * =============================================================
 *  All deployment-specific values live here. Nothing secret is
 *  stored in this file: form access keys for Web3Forms / public
 *  form endpoints are *public* keys by design. Never put a
 *  Formspree "secret" or any API secret token in front-end code.
 *
 *  Setup instructions: see README.md (sections "Forms" and "Chat").
 * =============================================================
 */
window.SITE_CONFIG = {

  /* -------------------------------------------------------
   * Languages
   * ----------------------------------------------------- */
  defaultLang: 'fa',           // 'fa' = Persian (RTL, default) | 'en' = English (LTR)
  langStorageKey: 'hsb_lang',   // localStorage key

  /* -------------------------------------------------------
   * Contact channels (shown on every page)
   * ----------------------------------------------------- */
  contact: {
    email: 'ramingol1@gmail.com',
    phoneIntl: '+989153143647',        // dialable international number
    phoneTel: '+989153143647',
    phoneDisplay: { fa: '۰۹۱۵۳۱۴۳۶۴۷', en: '+98 915 314 3647' },
    whatsapp: 'https://wa.me/989153143647',
    /* Phone-number deep link (Telegram official format, see
       https://core.telegram.org/api/links ). If the company gets a
       public @username, replace with https://t.me/username */
    telegram: 'https://t.me/+989153143647'
  },

  /* -------------------------------------------------------
   * Forms — secure third-party processing (no secrets in code)
   *
   * Option A (recommended): Web3Forms
   *   1. Create a free access key at https://web3forms.com/
   *   2. Paste the PUBLIC access key below.
   *   3. Set the destination e-mail to ramingol1@gmail.com
   *      inside the Web3Forms dashboard.
   *
   * Option B: Formspree
   *   1. Create a form at https://formspree.io/
   *   2. Paste the form endpoint below (https://formspree.io/f/xxxxxxx)
   *
   * Until one of them is set, forms show a clear "setup required"
   * message and offer a pre-filled e-mail fallback.
   * ----------------------------------------------------- */
  forms: {
    provider: 'web3forms',                 // 'web3forms' | 'formspree'
    web3formsAccessKey: '58bc9ed5-d51e-4cd6-a006-4d516ec71b1a',  // public key, safe in client code
    formspreeEndpoint: '',                 // e.g. 'https://formspree.io/f/abcdefg'
    destinationEmail: 'ramingol1@gmail.com'
  },

  /* -------------------------------------------------------
   * Live chat — Tawk.to (free)
   * 1. Create a free account at https://www.tawk.to/
   * 2. Admin → Administration → Property → copy the Property ID
   *    and Widget ID, paste them here.
   * 3. Admin → Administration → Notifications → E-mail → add
   *    ramingol1@gmail.com so every chat message notifies the
   *    commercial manager (see README.md → "Chat setup").
   * When empty, the "Chat now" CTAs gracefully fall back to
   * WhatsApp / Telegram so no dead button is ever shown.
   * ----------------------------------------------------- */
  chat: {
    provider: 'tawk',
    propertyId: '6ae986372863393c326e7bb3',
    widgetId: '1k6g38j29'
  },

  /* -------------------------------------------------------
   * Analytics — Google Analytics 4 (optional)
   * Paste the Measurement ID (G-XXXXXXX). Skipped when empty.
   * ----------------------------------------------------- */
  analytics: {
    gaMeasurementId: ''
  },

  /* -------------------------------------------------------
   * Social / messaging links
   * ----------------------------------------------------- */
  social: {
    linkedin: '',        // e.g. 'https://www.linkedin.com/company/...'
    instagram: '',
    twitter: '',
    telegramChannel: '', // public channel, if any
    eitaad: ''           // eitaad / e-namad badge URL, if any
  },

  /* -------------------------------------------------------
   * Office address (footer + contact page).
   * TODO before launch: replace with the verified address —
   * see CONTENT-REVIEW-CHECKLIST.md
   * ----------------------------------------------------- */
  address: {
    fa: 'ایران — دفتر مرکزی (نشانی دقیق پیش از انتشار درج می‌شود)',
    en: 'Iran — head office (exact address to be confirmed before launch)'
  },

  /* -------------------------------------------------------
   * Hero slider (royalty-free Unsplash imagery, WebP via CDN)
   * ----------------------------------------------------- */
  /* Captions come from lang/*.json (keys home.hero.slide1..4) so that
     every visible string stays translatable. */
  heroSlides: [
    {
      img: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1920&q=75&fm=webp',
      captionKey: 'home.hero.slide1'
    },
    {
      img: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1920&q=75&fm=webp',
      captionKey: 'home.hero.slide2'
    },
    {
      img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1920&q=75&fm=webp',
      captionKey: 'home.hero.slide3'
    },
    {
      img: 'https://images.pexels.com/photos/12196578/pexels-photo-12196578.jpeg?auto=compress&cs=tinysrgb&w=1920&fm=webp',
      captionKey: 'home.hero.slide4'
    }
  ]
};
