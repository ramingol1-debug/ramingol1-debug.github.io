# Human Sadid Bonyan Trade Holding — Corporate Website

Bilingual (Persian RTL default / English LTR) static corporate website for
**هلدینگ هومان تجارت سدید بنیان** (Human Sadid Bonyan Trade Holding).

Plain HTML/CSS/JavaScript — no build step, no framework, no secrets in the
code. Deployable to any free static host.

---

## 1. Folder structure

```
.
├── index.html              # Home (hero slider, counters, companies, chat, contact)
├── about.html              # About us
├── vision.html             # Vision, mission & values
├── services.html           # Services overview
├── projects.html           # Projects / execution areas
├── news.html               # News & articles (sample content)
├── faq.html                # Frequently asked questions
├── careers.html            # Careers (sample listings)
├── certifications.html     # Certificates & documents (sample)
├── clients.html            # Clients, partners, testimonials (sample)
├── gallery.html            # Photo gallery + lightbox
├── privacy.html            # Privacy policy
├── terms.html              # Terms of use
├── contact.html            # Contact page + general form
├── daryadaran.html         # Daryadaran Tous — multimodal transport + freight form
├── harmoniza.html          # Harmoniza Hormoz Arian — container terminal + form
├── hami.html               # Hami Hamrah Jonoub — bulk operations + form
├── naghel.html             # Naghel Al-Aswad — Iraq trade + form
├── affiliated.html         # Affiliated companies (6 countries) + form
├── sarakhs.html            # Sarakhs Free Zone logistics center + form
├── laws.html               # International Trade Laws (10 chapters, TOC, glossary)
├── 404.html                # Not found
├── assets/
│   ├── css/style.css       # Single stylesheet (RTL/LTR via [dir] + logical props)
│   └── js/
│       ├── config.js       # ← ALL deployment values live here (see §3)
│       ├── i18n.js         # Translation engine + SEO/meta/JSON-LD swap
│       ├── site.js         # Shared chrome (header/footer/fabs), counters, lightbox
│       └── forms.js        # Validation, sanitization, honeypot, submit logic
├── lang/
│   ├── fa.json             # Persian strings (source of truth, generated — see §4)
│   └── en.json             # English strings (hand-maintained, parity-checked)
├── scripts/
│   ├── extract-fa.mjs      # Regenerates lang/fa.json from HTML + site.js
│   └── check-lang.mjs      # fa/en key parity + source-key coverage check
├── robots.txt
├── sitemap.xml             # 21 public URLs (GitHub Pages domain set — §5)
├── _headers                # Netlify / Cloudflare Pages security headers
├── netlify.toml
├── vercel.json
├── README.md
└── CONTENT-REVIEW-CHECKLIST.md   # Facts/figures that MUST be verified pre-launch
```

**Pages:** 22 HTML files (21 indexed + 404). All visible text lives in
`lang/fa.json` / `lang/en.json` and is swapped by `i18n.js`; Persian is also
inlined in the HTML so search engines and no-JS visitors get content.

---

## 2. How the site works

| Concern | Mechanism |
|---|---|
| Language | `i18n.js` reads `?lang=` → `localStorage` → `SITE_CONFIG.defaultLang` (`fa`). Swaps `data-i18n` text, `data-i18n-html` rich text, `data-i18n-ph/-title/-aria/-alt/-content` attributes, then re-applies `<title>`, meta description, Open Graph and JSON-LD from `meta.*` / `schema.*` keys. Sets `document.documentElement.lang` and `dir` (fa→rtl, en→ltr). |
| Shared chrome | `site.js` renders header, footer and floating WhatsApp/Telegram buttons into every page; `i18n.js` calls `SiteChrome.render()` **before** translating so injected nodes get translated too. |
| Forms | `forms.js`: per-field validation, input sanitization, honeypot (`botcheck`), localized success/error status, submit to Web3Forms (default) or Formspree, `mailto:` fallback when unconfigured. |
| Chat | `site.js` loads Tawk.to when `SITE_CONFIG.chat.propertyId` is set; otherwise chat CTAs fall back to WhatsApp/Telegram (never a dead button). |
| Counters | `.counter[data-count]` animated on scroll (IntersectionObserver). |
| Gallery | Lightbox from `data-lightbox` (full-size URL) + `alt`. |
| CSP | Every page ships a `Content-Security-Policy` meta tag: strict script policy; style allowances limited to Google Fonts + the Tawk.to widget (its stylesheets, inline styles and `wss://` socket). Keep `_headers` in sync if you change it. |

---

## 3. Configuration — `assets/js/config.js`

Everything deployment-specific is here. **No secrets belong in this file** —
Web3Forms access keys and Formspree endpoints are public by design.

| Key | What to set |
|---|---|
| `forms.provider` | `'web3forms'` (recommended) or `'formspree'` |
| `forms.web3formsAccessKey` | Public access key from web3forms.com |
| `forms.formspreeEndpoint` | `https://formspree.io/f/xxxxxxx` (alternative) |
| `forms.destinationEmail` | `ramingol1@gmail.com` (already set) |
| `chat.propertyId` / `chat.widgetId` | Tawk.to property + widget IDs (§5) |
| `analytics.gaMeasurementId` | GA4 `G-XXXXXXX` (optional) |
| `address.fa` / `address.en` | **Placeholder — verify before launch** |
| `social.*` | LinkedIn/Instagram/etc. links (optional) |
| `heroSlides` | Royalty-free Unsplash images (already set) |

### 3.1 Forms → ramingol1@gmail.com (Web3Forms, recommended)

1. Create a free account at <https://web3forms.com/> and create an access key.
2. In the Web3Forms dashboard set the destination e-mail to
   **ramingol1@gmail.com** (and confirm it).
3. Paste the **public** access key into `config.js` →
   `forms.web3formsAccessKey`.
4. Done — all 7 forms (contact, 4 subsidiary request forms, affiliated,
   Sarakhs, plus newsletter) submit through the same key; every email carries
   all submitted fields.

**Alternative — Formspree:** create a form at <https://formspree.io/>, set the
recipient to ramingol1@gmail.com, paste the endpoint into
`forms.formspreeEndpoint`, and switch `forms.provider` to `'formspree'`.

**Until one is configured** the forms show a clear "setup required" message
and offer a pre-filled `mailto:ramingol1@gmail.com` fallback — this is
expected behavior, not a bug.

**Spam protection:** every form has a honeypot field named `botcheck`
(invisible to humans; bots that fill it get a fake success and nothing is
sent). Validation and sanitization run client-side before submit.

### 3.2 Chat — Tawk.to with e-mail notifications

1. Create a free account at <https://www.tawk.to/> and add a property for the
   site domain.
2. **Administration → Property** → copy the *Property ID* and *Widget ID* →
   paste into `config.js` → `chat.propertyId` / `chat.widgetId`.
3. **E-mail notifications (required by the brief):**
   - **Administration → Notifications → E-mail** → add
     **ramingol1@gmail.com** → every chat message sends an e-mail to the
     commercial manager.
   - Enable *Transcript* notifications so full conversations are e-mailed too.
4. **Greeting & auto-responses (Persian + English):**
   - **Administration → Canned responses** → add greetings in both languages
     (e.g. «سلام، چطور می‌توانم کمک کنم؟» / “Hello, how can I help you?”),
     business-hours text, and an offline message asking for name, phone and
     cargo details.
   - **Administration → Triggers** → *Page visited* → show the Persian greeting
     for `/fa`-default visitors and the English greeting for `?lang=en`
     visitors (match on URL or page language).
   - Set working hours and an offline auto-reply with the same two languages.
5. Tawk.to natively supports a Persian and an English property language —
   set both under **Administration → Languages** so the widget UI itself is
   bilingual.

Until the IDs are set, the "Chat now" buttons open WhatsApp/Telegram instead.

### 3.3 Analytics (optional)

Paste a GA4 Measurement ID into `config.js` → `analytics.gaMeasurementId`.
The loader is injected only when non-empty; the CSP already allows
googletagmanager.com / google-analytics.com. For a privacy-first alternative
(e.g. Plausible), swap the loader in `site.js`.

---

## 4. Translations (i18n workflow)

- **Persian (`lang/fa.json`)** is generated — do not hand-edit:
  ```bash
  node scripts/extract-fa.mjs    # harvests inline Persian from HTML + site.js
  ```
  It reads `data-i18n*` attributes, `<title>`/meta per `data-page`, and the
  Organization JSON-LD. Conflicting keys are reported as warnings — resolve
  them by giving each occurrence its own key, never by editing the JSON.
- **English (`lang/en.json`)** is hand-written and must stay in key parity
  with fa.json. Verify any time either file changes:
  ```bash
  node scripts/check-lang.mjs    # exit 0 = parity OK
  ```
  The checker validates JSON, empty values, missing/extra keys on both sides,
  and that every `data-i18n*` key used in source exists in fa.json.
- Adding a new visible string: put the Persian inline in the HTML with a new
  `data-i18n="section.key"`, run `extract-fa.mjs`, then add the English value
  to `en.json` and run `check-lang.mjs`.

---

## 5. Deployment (free hosting)

The site is fully static — publish the repository root as-is. `robots.txt`
and `sitemap.xml` already point at `https://ramingol1-debug.github.io`;
update both if the production domain ever changes.

### GitHub Pages
Plain static with only relative paths (`assets/…`, `lang/…`, `about.html`), so
it works both at a domain root and in a repository sub-path. A `.nojekyll`
file is included so every file is served verbatim instead of being processed
by Jekyll.

**Free user site — `https://<user>.github.io`**
1. Create a **public** repository named exactly `<user>.github.io`.
2. Push this project to its `main` branch (repo root = publish root).
3. **Settings → Pages** → Source: *Deploy from a branch* → `main` / `(root)`.
4. The site is live at `https://<user>.github.io/` after a minute or two;
   `404.html` is served automatically for unknown paths.
5. Submit `https://<user>.github.io/sitemap.xml` in Google Search Console.

**Project repo — `https://<user>.github.io/<repo>/`** works the same way,
because no link is root-absolute.

GitHub Pages ignores `_headers`, `netlify.toml` and `vercel.json`. The
per-page CSP meta tag still applies; the extra HTTP security headers are
Netlify/Vercel-only.

### Netlify
1. <https://app.netlify.com> → *Add new site* → *Import an existing project*.
2. Build command: *(leave empty)* · Publish directory: `.` (repo root).
3. `_headers` and `netlify.toml` are picked up automatically (CSP +
   security headers).

### Vercel
1. <https://vercel.com> → *Import* the repo.
2. Framework Preset: *Other* · no build command · output directory: `.`.
3. `vercel.json` provides clean URLs and security headers.

### Cloudflare Pages
Same as Netlify: build *(empty)*, output `.`, `_headers` applies automatically.

All four hosts provide free HTTPS — required for the chat widget, form
endpoints and clipboard/geolocation-free CSP to work.

---

## 6. Verification scripts

```bash
node scripts/check-lang.mjs     # language parity + source key coverage
node scripts/extract-fa.mjs     # regenerate fa.json (reports key conflicts)
python3 -m http.server 3000     # local preview at http://localhost:3000
```

---

## 7. Security notes

- HTTPS only (enforced by the hosts above).
- CSP on every page **and** in `_headers`: no inline `<script>` (and our own
  markup contains no inline `style` attributes), `object-src 'none'`,
  restricted `form-action`/`connect-src`. `style-src`/`style-src-attr` allow
  inline styles solely because the Tawk.to widget injects them, and
  `wss://*.tawk.to` is allowed for its live message socket.
- Form input is sanitized client-side; honeypot spam trap on every form.
- No passwords, API secrets or tokens in the repository — only public keys
  (Web3Forms access key, GA ID, Tawk IDs), which are public by design.
- If you change the CSP in the HTML, mirror it in `_headers`.

---

## 8. Pre-launch

Read **[CONTENT-REVIEW-CHECKLIST.md](CONTENT-REVIEW-CHECKLIST.md)** — it lists
every figure, address, logo, testimonial and certificate in the site that is
currently a placeholder or an unverified public statistic and must be
confirmed by management before publication.
