# Content Review Checklist — pre-launch

Every item below is a **fact, figure or asset in the site that is currently a
placeholder, a sample, or a public statistic that has not been verified by
management**. The site intentionally flags these with visible "before
publication" notices (in both languages). Work through this list with the
commercial manager before going live.

Legend: `[ ]` pending · `[x]` verified

---

## 1. Contact identity

- [ ] **Phone 09153143647** — confirm it is the correct commercial line for
      call / WhatsApp (`wa.me/989153143647`) / Telegram (`t.me/+989153143647`)
      on all 22 pages and in `config.js`.
- [ ] **E-mail ramingol1@gmail.com** — confirm this is the mailbox that must
      receive all form submissions and chat notifications (Web3Forms
      dashboard, Tawk notifications, Formspree recipient).
- [ ] **Office address** — `config.js → address` and `config.address` in
      `lang/*.json` are placeholders ("to be confirmed"). Replace with the
      verified address in **both** languages.
- [ ] Company legal name spelling: «هلدینگ هومان تجارت سدید بنیان» /
      "Human Sadid Bonyan Trade Holding" — confirm official English
      transliteration for contracts and invoicing.

## 2. Capacity & performance figures (highest risk)

### Daryadaran Tous (`daryadaran.html`, home hero counters, `meta.daryadaran`)
- [ ] **Up to 1,000,000 tons of sulfur per year**
- [ ] **Up to 10,000 wagons from the CIS region per year**
- [ ] **Up to 5,000 containers from China per year**
- [ ] These three appear on the home page counters, the Daryadaran stats
      section and the page meta description — verify once, fix everywhere
      (search the numbers in the HTML + `lang/*.json`).

### Harmoniza Hormoz Arian (`harmoniza.html`, `meta.harmoniza`)
- [ ] **Nominal capacity 500,000 containers per year** (declared figure —
      label as "declared/nominal" if it is not audited).
- [ ] **2024 Shahid Rajaee statistics** quoted in the intro:
  - [ ] ~**2.39 million TEU** handled in 2024
  - [ ] ~**85 million tons** of total cargo in 2024
  - [ ] **85–90% share** of Iran's container traffic
  - [ ] Home-page badge **"85% of Iran's container traffic passes through
        Shahid Rajaee Port"**
  - Source: reconcile with the latest official Ports & Maritime Organization
    (PMO) statistics; update or remove if the official number differs.

### Hami Hamrah Jonoub (`hami.html`)
- [ ] **462,000+ m³ of warehousing space** at the Shahid Rajaee complex
      (cited from public port statistics — verify against PMO data).
- [ ] Company-level unloading capacities (tons/hour), equipment count and
      warehouse areas — currently described generically; replace with real
      operational figures from operations management.

### Sarakhs Free Zone (`sarakhs.html`, `meta.sarakhs`)
- [ ] **~5,290 hectares** total zone area
- [ ] **150 km east of Mashhad**
- [ ] **Dual-gauge 1520/1435 mm** rail + **~42 km** internal railway
- [ ] **Up to 400 wagons/day** interchange at Sarakhs station
- [ ] **~18-hectare container complex** under commissioning
- [ ] **75% share of the country's border rail transit (estimate)** — the
      riskiest figure on the site; verify with official free-zone
      authorities or remove the percentage
- [ ] Zone history: activity "from the 1990s (1370s SH)", upgrade to
      free-zone status via **1402 (2023) approvals and 1403 (2024)
      regulations** — confirm the legal instruments
- [ ] Corridor claims (Sarakhs–Serdar, Bajgiran–Farah, INSTC node) — confirm
      operating status

### Home page
- [ ] Quick-stats section uses the figures above — after verification,
      re-run `node scripts/extract-fa.mjs` if any Persian text changes.

## 3. Sample content that must be replaced or approved

Pages carrying a visible "sample content — before publication" notice:

- [ ] **Projects** (`projects.html`) — six project descriptions are
      representative scopes, not completed references. Replace with real
      projects or keep the notice.
- [ ] **News** (`news.html`) — three sample articles with dates
      (15 Mehr 1405 / 29 Shahrivar 1405 / 10 Shahrivar 1405). Replace with
      real posts or remove the section notice.
- [ ] **Careers** (`careers.html`) — three sample job listings
      (Terminal Ops Specialist, Rail/Transit Specialist, Intl. Sales
      Specialist). HR must confirm real openings or the section is removed.
- [ ] **Certifications** (`certifications.html`) — ISO 9001 / 45001 /
      14001, transport licenses and cargo insurance are a *framework
      sample*. **Do not publish ISO claims unless valid certificates exist.**
      Replace with scans + validity dates.
- [ ] **Clients & Partners** (`clients.html`) — logos and three
      testimonials are placeholders. Publish only with **written
      permission** of each client; otherwise delete the section.
- [ ] **Gallery** (`gallery.html`) — currently Pexels/Unsplash stock.
      Replace with the group's own facility/operation photos and confirm
      stock-license compliance for any images kept.
- [ ] **Affiliated companies** (`affiliated.html`) — six country cards use
      generic descriptions; legal entity names, scope and licenses must be
      supplied by management.
- **Testimonials/logos on the home page** (`home.logos.*`,
  `home.testi.*`) — same rule: real names only with permission.

## 4. Legal review required

- [ ] **Privacy policy** (`privacy.html`) — sample legal text; review by
      counsel against actual data flows (Web3Forms, Tawk.to, GA).
- [ ] **Terms of use** (`terms.html`) — sample legal text; counsel review.
- [ ] **International Trade Laws** (`laws.html`) — carries a visible
      "not legal advice" disclaimer in both languages; confirm the Iranian
      customs chapter (groups 1–4, Single Window, tariff process) against
      current regulations with a licensed customs consultant.
- [ ] **FAQ disclaimer** — informational answers, not contractual advice;
      confirm payment/insurance answers match actual company policy.

## 5. Technical / SEO launch tasks

- [x] **Domain**: `robots.txt` and `sitemap.xml` (21 URLs) point at
      `https://ramingol1-debug.github.io`.
- [ ] Submit `sitemap.xml` to Google Search Console; verify indexing of all
      21 pages (404 excluded).
- [x] **Forms**: Web3Forms access key configured in `config.js`; browser test
      returned `success:true` and queued 2 test submissions.
- [ ] Confirm those test submissions arrived at ramingol1@gmail.com, then
      send one real message per form (7 forms).
- [x] **Chat**: Tawk.to property/widget IDs configured; widget loads with
      0 CSP violations and a test visitor message reached the Tawk queue.
- [ ] Tawk → Administration → Notifications → E-mail: add
      ramingol1@gmail.com; check Persian + English greetings and the offline
      auto-reply.
- [ ] **Analytics**: GA4 Measurement ID set (or consciously skipped).
- [ ] **hreflang**: intentionally **not** implemented (single-URL bilingual
      switch, default Persian). If you later want separate `/fa/` `/en/`
      URL versions for SEO, that is a structural change — add hreflang only
      then, never as a half-measure.
- [ ] Lighthouse pass on home + one form page (target: performance > 90,
      no CSP violations in the console — especially the Tawk iframe).
- [ ] Mobile check: RTL Persian layout on a phone-width viewport; language
      switcher in header works and persists.

## 6. Quick sign-off

| Area | Owner | Date | Signed |
|---|---|---|---|
| Contact identity & address | | | |
| Capacity figures (§2) | | | |
| Sample content replaced/approved (§3) | | | |
| Legal review (§4) | | | |
| Technical/SEO launch tasks (§5) | | | |

**Rule of thumb:** if a number appears in a counter, a hero badge or a meta
description, it will be read as a claim — verify it or remove it.
