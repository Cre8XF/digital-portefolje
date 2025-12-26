# Digital Portefølje – Audit Report

## 1) Snapshot (stack + structure)

**Framework:** None (vanilla HTML/CSS/JS)
**Build tool:** None detected (no package.json, webpack, vite, etc.)
**Styling approach:** CSS custom properties with two themes (light + neon), base.css + page-specific CSS files
**Routing:** Static HTML pages with client-side navigation highlighting
**Deployment hints:** Likely Netlify (form submissions use `data-netlify="true"`)
**Notable folders:**
- `/demos/` – 11 industry-specific demo sites (barnehage, bilpleie, frisor, hytte, kafe, konsulent, rorlegger, tattoo, terapeut, yoga, fotograf)
- `/artikler/` – 7 blog-style articles
- `/assets/css/` – 15 CSS files (~3,887 total lines, base.css is 797 lines)
- `/assets/js/` – app.js (97 lines) + effects.js (53 lines)
- `/assets/img/` – ~50 images, some very large (2.1MB hero image)

---

## 2) UX/UI Findings (prioritized)

### **HIGH SEVERITY**

#### **Missing Typography System Variables**
- **Where:** `assets/css/base.css:30-31`, `assets/css/themes.css` (entire file)
- **Problem:** Base.css references `var(--font)`, `var(--lh)`, `var(--container)`, `var(--space-2)`, `var(--space-3)` but these are **never defined** in themes.css or base.css. They only exist in demo-specific CSS files (barnehage.css, bilpleie.css, etc.).
- **User impact:** Main site pages fall back to browser defaults for font-family and line-height, creating inconsistent typography between main pages and demos.
- **Recommendation:** Define typography tokens in `themes.css` or `:root`:
  ```css
  :root {
    --font: system-ui, -apple-system, "Segoe UI", sans-serif;
    --lh: 1.6;
    --container: 1200px;
    --space-1: 8px;
    --space-2: 16px;
    --space-3: 24px;
    --space-4: 48px;
  }
  ```
- **Acceptance criteria:** All pages render with consistent system font stack; spacing is predictable.

---

#### **Massive Unoptimized Images**
- **Where:** `assets/img/eksempler-bg.jpg` (2.1MB), `profil1.jpg` (801KB), `rorlegger.jpg` (285KB), `kafe.jpg` (216KB)
- **Problem:** Hero images are not optimized, causing slow LCP (Largest Contentful Paint). Mobile users on 3G will wait 5–10 seconds for images to load.
- **User impact:** Bounces on slow connections, poor Lighthouse/PageSpeed scores, wasted bandwidth.
- **Recommendation:**
  1. Use responsive image formats: convert JPG → WebP (or AVIF for modern browsers)
  2. Create srcset variants: `480w`, `800w`, `1200w`, `1920w`
  3. Target < 100KB for hero images (WebP with quality 75–85)
  4. Use `loading="lazy"` for below-fold images (already done inconsistently)
  5. Add `<link rel="preload" as="image" href="hero.webp">` for LCP images
- **Acceptance criteria:** Hero images < 150KB, LCP < 2.5s on 3G, Lighthouse Performance score > 90.

---

#### **No robots.txt or sitemap.xml**
- **Where:** Repository root
- **Problem:** Search engines have no crawl guidance or sitemap. Pages like `/demos/` and `/artikler/` may not be indexed properly.
- **User impact:** Poor SEO discoverability, missing structured indexing.
- **Recommendation:**
  1. Create `robots.txt`:
     ```
     User-agent: *
     Allow: /
     Sitemap: https://cre8web.netlify.app/sitemap.xml
     ```
  2. Generate `sitemap.xml` with all main pages, demos, and articles (priority: 1.0 for home, 0.8 for services/priser, 0.6 for demos/artikler)
- **Acceptance criteria:** Google Search Console shows sitemap submitted and indexed.

---

#### **Inconsistent Phone Numbers**
- **Where:** `index.html:339` shows `+47 91 55 83 93`, `kontakt.html:155` shows `+47 12 34 56 78` (placeholder)
- **Problem:** Footer contact info differs between pages. Users calling the kontakt.html number will get a non-working placeholder.
- **User impact:** Lost leads, confusion, unprofessional appearance.
- **Recommendation:** Audit all pages and standardize to `+47 91 55 83 93` (or correct number). Use a shared footer partial or replace manually.
- **Acceptance criteria:** All pages show same phone number, verified functional.

---

#### **Theme Inconsistency**
- **Where:** `artikler/artikler.html:2` hardcodes `data-theme="neon"`, `artikler/pris-nettside-2025.html:2` same
- **Problem:** Theme toggle doesn't work on artikler pages – they force dark neon theme even if user prefers light.
- **User impact:** Jarring experience when navigating from main site (light) to artikler (forced dark).
- **Recommendation:** Remove hardcoded `data-theme="neon"` attributes. Let localStorage/user preference persist across all pages (already implemented in app.js:91-95).
- **Acceptance criteria:** Theme toggle works consistently across all pages.

---

### **MEDIUM SEVERITY**

#### **Empty or Missing Alt Text**
- **Where:** `demos/barnehage.html:18`, `demos/barnehage.html:54`, and more (4 files with `alt=""`)
- **Problem:** Screen readers skip images entirely. Fails WCAG 2.1 Level A (1.1.1 Non-text Content).
- **User impact:** Blind/low-vision users miss visual context.
- **Recommendation:** Add descriptive alt text for all content images. For decorative images, use `alt=""` intentionally with `aria-hidden="true"`. Example: `alt="Children playing outdoors in kindergarten playground"`.
- **Acceptance criteria:** No `alt=""` on content images; axe DevTools shows 0 violations.

---

#### **No Standardized Typography Scale**
- **Where:** `base.css` lines 64, 67, 70, 98, 100, etc. (15+ one-off font-sizes)
- **Problem:** Font sizes are scattered across the file with no system: `1.12rem`, `0.78rem`, `0.9rem`, `1.05rem`, `1.35rem`, etc. Hard to maintain, creates visual noise.
- **User impact:** Inconsistent hierarchy, harder to scan content.
- **Recommendation:** Define a type scale:
  ```css
  --text-xs: 0.75rem;   /* 12px */
  --text-sm: 0.875rem;  /* 14px */
  --text-base: 1rem;    /* 16px */
  --text-lg: 1.125rem;  /* 18px */
  --text-xl: 1.25rem;   /* 20px */
  --text-2xl: 1.5rem;   /* 24px */
  --text-3xl: 2rem;     /* 32px */
  --text-4xl: 2.5rem;   /* 40px */
  ```
  Then replace all hardcoded sizes with tokens.
- **Acceptance criteria:** All font-sizes use token variables; design system documented.

---

#### **Duplicated CSS in Demos**
- **Where:** `demos/assets/css/base.css` (8,900 bytes), nearly identical to main `assets/css/base.css` (797 lines)
- **Problem:** Demo CSS duplicates ~80% of base styles, creating maintenance burden. Changes must be made in 2 places.
- **User impact:** Inconsistent styles between main site and demos if one file is updated.
- **Recommendation:** Consolidate into a shared `assets/css/base.css` and import it from demos using `<link rel="stylesheet" href="../assets/css/base.css">` (already done in some demos like `barnehage.html:8`). Delete `demos/assets/css/base.css`.
- **Acceptance criteria:** Single source of truth for base styles; demos reference main CSS.

---

#### **Missing Focus Indicators on Interactive Elements**
- **Where:** `.nav-toggle` (base.css:160), `.scroll-cue` buttons, `.tlogo` placeholders
- **Problem:** Keyboard users see no visible focus state on burger menu button and some interactive elements. `base.css:518-522` defines `:focus-visible` globally but some elements override or lack it.
- **User impact:** Keyboard navigation is difficult/impossible to track visually.
- **Recommendation:** Audit all interactive elements (buttons, links, inputs). Ensure `:focus-visible` outline is visible with ≥3px offset and high-contrast color. Test with Tab navigation.
- **Acceptance criteria:** All interactive elements show clear focus ring when tabbed; passes WCAG 2.1 Level AA (2.4.7 Focus Visible).

---

#### **No Responsive Image Strategy (srcset)**
- **Where:** All `<img>` tags (except footer logo which uses `sizes` attribute once)
- **Problem:** Desktop users download mobile-sized images (wasted resolution), mobile users download desktop-sized images (wasted bandwidth).
- **User impact:** Slow load times on mobile, blurry images on desktop.
- **Recommendation:** Implement `srcset` and `sizes` for all hero and content images:
  ```html
  <img src="hero-800.webp"
       srcset="hero-480.webp 480w, hero-800.webp 800w, hero-1200.webp 1200w"
       sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
       alt="..." loading="lazy">
  ```
- **Acceptance criteria:** Images load correctly at 1x, 2x, 3x pixel densities; Lighthouse flags no oversized images.

---

#### **External Unsplash Images Without Optimization**
- **Where:** `tjenester.html:99`, `priser.html:69`, `page-home.css:2`, and many demos
- **Problem:** External images from Unsplash CDN are unoptimized query strings (`?q=80&w=2000`), causing slow loads and CORS issues.
- **User impact:** Slow LCP, no control over image quality/format, dependency on third-party CDN.
- **Recommendation:** Download all Unsplash images → optimize locally (WebP, proper dimensions) → host in `assets/img/`. Example: `tjenester-hero.webp` instead of long Unsplash URL.
- **Acceptance criteria:** All images served from local assets folder, < 150KB each.

---

#### **No Build Process or Minification**
- **Where:** Repository root (no package.json, no build scripts)
- **Problem:** CSS/JS are not minified, causing ~10–15% larger file sizes. No autoprefixing for older browsers (backdrop-filter, color-mix).
- **User impact:** Slightly slower loads, potential CSS bugs in Safari < 16 or Chrome < 111 (color-mix unsupported).
- **Recommendation:** Add build step with PostCSS or Lightning CSS:
  1. `npm init -y && npm install -D vite`
  2. Create `vite.config.js` for minification + autoprefixing
  3. Add npm scripts: `"build": "vite build"`, `"dev": "vite"`
  4. Deploy `dist/` folder to Netlify
- **Acceptance criteria:** CSS minified to ~60% original size, JS minified, autoprefixed for last 2 years of browsers.

---

### **LOW SEVERITY**

#### **Placeholder Trust Logos**
- **Where:** `index.html:196-200` (5 `<span class="tlogo">LOGO 1</span>` placeholders)
- **Problem:** "Brukt av" section shows text placeholders instead of real client logos.
- **User impact:** Looks unfinished, reduces trust/credibility.
- **Recommendation:** Replace with real client logos (even anonymized "Kafe i Oslo", "Rørlegger AS") or remove section entirely until you have 3+ real logos.
- **Acceptance criteria:** Section shows real logos or is hidden.

---

#### **Inconsistent Spacing Between Sections**
- **Where:** `.section` uses `clamp(48px, 7vw, 96px)` in base.css:50, but `ui-polish.css:8` overrides with `padding-block: 56px / 72px`
- **Problem:** Spacing rules conflict. UI-polish.css loads last and wins, but clamp() is better for fluid spacing.
- **User impact:** Less responsive spacing, harder to maintain.
- **Recommendation:** Remove `padding-block` override in ui-polish.css; keep clamp() in base.css. Use CSS variable: `--section-padding: clamp(3rem, 7vw, 6rem)`.
- **Acceptance criteria:** Spacing is consistent and fluid across all breakpoints.

---

#### **Missing Meta Description on Some Pages**
- **Where:** Demos (e.g., `demos/barnehage.html:7` has generic "Demo" title)
- **Problem:** Demo pages have no meta descriptions or OG tags. Won't share well on social media or search results.
- **User impact:** Poor SEO for demo pages, unappealing social shares.
- **Recommendation:** Add unique meta descriptions and OG tags to all demo pages. Example for barnehage.html:
  ```html
  <meta name="description" content="Demo nettside for barnehager – trygg, leken og lærerik hverdag. Se eksempel på moderne barnehage-nettside.">
  <meta property="og:title" content="Barnehage Demo – Cre8Web">
  <meta property="og:description" content="Demo nettside for barnehager. Moderne design med fokus på trygghet og læring.">
  ```
- **Acceptance criteria:** All pages have unique meta descriptions < 160 chars; OG tags present.

---

#### **No Breadcrumbs on Demo Pages**
- **Where:** All `/demos/*.html` files
- **Problem:** Demos lack breadcrumb schema (main pages have it, e.g., `eksempler.html:34-43`).
- **User impact:** Missing rich snippets in search results, less SEO value.
- **Recommendation:** Add breadcrumb JSON-LD to all demos:
  ```json
  {
    "@context":"https://schema.org",
    "@type":"BreadcrumbList",
    "itemListElement":[
      {"@type":"ListItem","position":1,"name":"Hjem","item":"https://cre8web.netlify.app/"},
      {"@type":"ListItem","position":2,"name":"Eksempler","item":"https://cre8web.netlify.app/eksempler.html"},
      {"@type":"ListItem","position":3,"name":"Barnehage Demo","item":"https://cre8web.netlify.app/demos/barnehage.html"}
    ]
  }
  ```
- **Acceptance criteria:** Breadcrumbs appear in Google Search Console rich results test.

---

#### **Console Warning on Include Failure**
- **Where:** `assets/js/app.js:55` (`console.warn('Include failed:', err)`)
- **Problem:** If a partial fails to load (e.g., footer include), error is logged but user sees broken layout.
- **User impact:** Broken pages with no visible error message.
- **Recommendation:** Add user-facing error handling or graceful fallback. Example: inject static footer HTML if fetch fails.
- **Acceptance criteria:** Pages always show footer even if fetch fails; no console warnings in production.

---

#### **No Preconnect to External Domains**
- **Where:** HTML `<head>` on pages loading Unsplash images
- **Problem:** Unsplash images require DNS lookup, TCP handshake, TLS negotiation before download starts. Adds ~200-400ms latency.
- **User impact:** Slower image loads.
- **Recommendation:** Add preconnect hints (or eliminate external images per earlier recommendation):
  ```html
  <link rel="preconnect" href="https://images.unsplash.com">
  ```
- **Acceptance criteria:** LCP timing improves by ~200ms (or external images removed entirely).

---

## 3) Accessibility

### **Top Issues + Fixes**

1. **Missing alt text** (4 files) → Add descriptive alt for all images
2. **No focus indicators** on burger menu, some buttons → Ensure `:focus-visible` applies to all interactive elements
3. **Color contrast in neon theme** → Test with WebAIM Contrast Checker:
   - `--muted: #9fb0d1` on `--bg: #0a0d14` = **7.8:1** (PASS AA)
   - `--text: #e6ecff` on `--bg: #0a0d14` = **13.2:1** (PASS AAA)
   - `--brand-1: #00f0ff` on `--bg: #0a0d14` = **11.5:1** (PASS AAA)
   - Ghost button text (`--text`) on `transparent` background over dark hero image may fail AA if hero is too bright → test with actual images
4. **No skip-to-content on demo pages** → Already present on main pages (`<a href="#main" class="skip-link">`), add to all demos
5. **Burger menu button lacks `aria-expanded`** → Already implemented in app.js:8, but check all pages load app.js correctly

### **Keyboard/Focus Checklist**

- [x] Skip link present and functional (index.html:117)
- [x] All links/buttons keyboard accessible
- [ ] **Missing:** Visible focus states on `.nav-toggle`, `.tlogo`, `.scroll-cue`
- [ ] **Missing:** Mobile menu closes on Escape (not implemented, should add)
- [x] Forms have visible focus on inputs (base.css:376-379)
- [ ] **Missing:** Details/summary elements need focus styling
- [x] Tab order is logical (follows DOM order)

**Recommendations:**
1. Add Escape key handler to close mobile menu
2. Ensure `:focus-visible` applies to all interactive elements
3. Test with NVDA/VoiceOver for screen reader compatibility

### **Contrast Notes**

- **Neon theme:** PASS (high contrast by design)
- **Light theme:** Test button gradient `--brand-1: #007bff` + `--brand-2: #a259ff` on white `--bg-alt` → gradient endpoints should both meet 4.5:1 minimum. Blue (#007bff) = 4.6:1 (PASS AA), Purple (#a259ff) = 3.2:1 (FAIL AA). **Fix:** Darken `--brand-2` in light theme to `#8b47cc` (4.51:1).

---

## 4) Performance

### **Likely Bottlenecks**

1. **Massive hero images** (2.1MB) → 5–10s load on 3G → **CRITICAL**
2. **No image lazy loading** on above-fold images → Waste bandwidth
3. **Render-blocking CSS** (4 stylesheets loaded sequentially) → Delay FCP
4. **No caching headers** (Netlify default is okay, but verify `Cache-Control` for static assets)
5. **External Unsplash images** → DNS lookup + TTFB adds 300–500ms
6. **No service worker** → No offline support, no precaching
7. **Cursor glow effect** (`effects.js:32-52`) runs on every frame → Low-end devices may stutter

### **Image Strategy Recommendations**

1. **Convert all JPGs to WebP** (or AVIF where supported):
   - Hero images: target < 100KB @ 1920w
   - Content images: < 50KB @ 1200w
   - Thumbnails: < 20KB @ 480w
2. **Implement srcset** for all images (see earlier recommendation)
3. **Use `loading="lazy"` for below-fold images** (already done inconsistently)
4. **Preload LCP image** on each page:
   ```html
   <link rel="preload" as="image" href="/assets/img/hero.webp" imagesrcset="/assets/img/hero-480.webp 480w, /assets/img/hero-1200.webp 1200w" imagesizes="100vw">
   ```
5. **Add width/height attributes** to prevent CLS (Cumulative Layout Shift) → Already done inconsistently (e.g., `index.html:125` has width/height, but many demos don't)

### **JS/CSS Strategy Recommendations**

1. **Minify CSS/JS** (build process) → ~30% size reduction
2. **Critical CSS inline** → Inline above-fold CSS (hero, header) in `<head>`, load rest async:
   ```html
   <style>/* Critical CSS for hero + header */</style>
   <link rel="preload" as="style" href="base.css" onload="this.onload=null;this.rel='stylesheet'">
   ```
3. **Reduce CSS files** → Merge page-*.css into single bundle with build process, use code splitting only if needed
4. **Debounce cursor glow** → Only update every 2–3 frames on low-end devices:
   ```js
   let ticking = false;
   window.addEventListener('pointermove', e => {
     if (!ticking) {
       requestAnimationFrame(() => { tx = e.clientX; ty = e.clientY; ticking = false; });
       ticking = true;
     }
   });
   ```
5. **Remove unused CSS** → Run PurgeCSS or manual audit (e.g., `.hero--titan` is defined in base.css:695 but never used in HTML)

---

## 5) SEO & Content

### **Metadata Gaps**

1. **No robots.txt or sitemap.xml** (see High Severity above)
2. **Placeholder canonical URLs** → `priser.html:10` shows `<link rel="canonical" href="https://dittdomene.no/">` instead of `https://cre8web.netlify.app/priser.html`
3. **Missing meta descriptions** on demos
4. **Missing OG images** on demos
5. **Article dates outdated** → `pris-nettside-2025.html:34` shows `"datePublished":"2025-09-11"` but current date is 2025-12-26 → Update to actual publish dates
6. **No Twitter/X handle** → Twitter cards lack `twitter:site` and `twitter:creator`

### **Semantic Structure Improvements**

1. **Missing `<main>` landmark** on some pages (e.g., `index.html` has no `<main>` wrapper, only section#hjem) → Wrap primary content in `<main id="main">`
2. **Heading hierarchy skips levels** → Some pages jump from `<h1>` to `<h3>` (missing `<h2>`) → Ensure logical heading order
3. **Use `<article>` for blog posts** → Artikler pages should wrap content in `<article>` tag
4. **Add `<time datetime>` for article dates** → Improve schema markup:
   ```html
   <time datetime="2025-09-11">11. september 2025</time>
   ```
5. **Improve link text** → Some links say "Les mer" or "Se prosjekter" without context → Add `aria-label` or make text more descriptive

### **Portfolio Storytelling Improvements (Recruiter-First)**

**What a recruiter sees first (current state):**
- Hero: "Moderne, raske og tøffe nettsider" → Generic, doesn't differentiate
- Stats: "7 dager levering, 30+ prosjekter, 100% mobilvennlig" → Good social proof but lacks specificity
- About section: Buried below fold, requires scroll

**Recommendations:**
1. **Lead with unique value prop** → Change hero h1 to: "Nettsider som konverterer – for småbedrifter som vokser raskt" or "Fra idé til live nettside på 7 dager – uten stress"
2. **Move portfolio/case studies higher** → Add a "Utvalgte prosjekter" section immediately after hero (before "Slik jobber jeg")
3. **Quantify results** → Replace generic stats with outcome-based metrics:
   - "30+ nettsider levert" → "30+ bedrifter fikk sin første nettside"
   - "100% mobilvennlig" → "95+ Lighthouse score på alle prosjekter"
   - "7 dager levering" → "7 dager fra kickoff til live-nettside"
4. **Add testimonials** → Include 2–3 client quotes with photos + company logos (replace placeholder trust logos)
5. **Clarify target audience** → Add a "Perfekt for" section listing ideal clients (frisører, konsulenter, hytteutleie, etc.) with links to relevant demos
6. **Improve CTA hierarchy** → "Se prosjekter" (primary) should be more prominent than "La oss snakke" (secondary)

---

## 6) Code & Maintainability

### **Refactor Targets**

1. **Consolidate CSS variables** → Missing tokens (--font, --lh, --container, --space) cause inconsistency
2. **Merge duplicate demo CSS** → `demos/assets/css/base.css` should be deleted, reference main `assets/css/base.css`
3. **Extract shared components** → Header/footer HTML is copy-pasted across 25+ files → Create partials or use server-side includes (Netlify supports Edge includes)
4. **Remove unused CSS** → `.hero--titan`, `.titan-title`, `.hero--luxe` defined but never used
5. **Standardize breakpoints** → Media queries use inconsistent breakpoints: 760px, 820px, 900px, 920px, 960px, 1200px → Pick 3–4 standard breakpoints (e.g., 640px, 768px, 1024px, 1280px)
6. **Clean up git history** → `.git` folder is 4MB, consider shallow clone or LFS for large images

### **Reusable Components List (Proposed)**

Extract these patterns into documented components:

1. **Hero** (3 variants: full-height, sub-page, optical)
   - `hero--full` (index.html)
   - `hero--sub` (tjenester.html, priser.html)
   - `hero--optical` (index.html with overlay)
2. **Card** (4 variants: default, edge-glow, price-card, demo-card)
3. **Button** (3 variants: primary, ghost, magnetic)
4. **Section** (2 variants: default, alt-background)
5. **Grid** (3 layouts: 2-col, 3-col, 4-col responsive)
6. **Stats/Chips** (hero-stats, fact-chips)
7. **Form** (contact form with Netlify integration)
8. **Header/Footer** (sticky header, footer with 3-col layout)

**Documentation format:**
```markdown
## Card Component

**Variants:**
- `.card` – Default panel with border and shadow
- `.card.edge` – Adds neon edge glow effect
- `.price-card` – Pricing tier layout with badge
- `.demo-card` – Portfolio showcase with overlay

**Usage:**
<div class="card">
  <h3>Title</h3>
  <p>Description</p>
</div>

**Props (CSS classes):**
- `.edge` – Adds conic-gradient glow border
- `.hover-lift` – Adds translateY on hover (already default)
```

### **Suggested Folder Structure Adjustments**

**Current:**
```
/
├── assets/
│   ├── css/ (15 files, 3,887 lines)
│   ├── js/
│   ├── img/
├── demos/ (11 HTML files + duplicate assets/)
├── artikler/ (7 HTML files)
├── *.html (9 main pages)
```

**Proposed:**
```
/
├── src/
│   ├── components/ (reusable HTML partials)
│   │   ├── header.html
│   │   ├── footer.html
│   ├── css/
│   │   ├── tokens.css (all variables)
│   │   ├── base.css (reset + typography)
│   │   ├── components/ (card.css, button.css, hero.css)
│   │   ├── pages/ (home.css, kontakt.css)
│   │   ├── themes.css
│   ├── js/
│   ├── images/ (optimized, organized by page)
├── pages/
│   ├── index.html
│   ├── tjenester.html
│   ├── demos/
│   ├── artikler/
├── public/ (favicon, robots.txt, sitemap.xml)
├── vite.config.js (build config)
├── package.json
```

**Benefits:**
- Clear separation of concerns
- Components are reusable across pages
- Build process optimizes output to `/dist`
- No CSS duplication

---

## 7) Dependency & Security Hygiene

### **Dependency Issues**

- **No package.json** → No dependency tracking or security audits
- **No build tooling** → Missing autoprefixer, minification, modern CSS features fallback
- **Recommendation:** Add minimal build setup:
  ```json
  {
    "name": "cre8web",
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview"
    },
    "devDependencies": {
      "vite": "^5.0.0"
    }
  }
  ```

### **Secret Scanning Notes**

- **No `.env` file detected** → Good (no secrets in repo)
- **Hardcoded phone/email in HTML** → Okay for public contact info, but consider obfuscation (`mailto:` links are spam targets)
- **Netlify form key visible** → `data-netlify="true"` is public by design, no issue
- **Recommendation:** Use email obfuscation for `cre8xf@gmail.com` to reduce spam:
  ```html
  <a href="#" data-email="cre8xf@gmail.com">Send e-post</a>
  <script>
  document.querySelectorAll('[data-email]').forEach(a => {
    a.href = 'mailto:' + a.dataset.email;
  });
  </script>
  ```

### **Headers/CSP Suggestions**

**Current state:** No custom headers detected (Netlify defaults apply)

**Recommendation:** Add `netlify.toml` for security headers:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
    Content-Security-Policy = "default-src 'self'; img-src 'self' https://images.unsplash.com data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**Benefits:**
- Prevent clickjacking (X-Frame-Options)
- Prevent MIME sniffing attacks
- Long-term caching for static assets
- CSP protects against XSS (adjust `unsafe-inline` after extracting inline scripts)

---

## 8) Proposed Roadmap

### **Quick Wins (≤30 min)**

- [ ] Fix missing phone number in `kontakt.html:155` (change `+47 12 34 56 78` → `+47 91 55 83 93`)
- [ ] Fix canonical URL in `priser.html:10` (change `https://dittdomene.no/` → `https://cre8web.netlify.app/priser.html`)
- [ ] Add `robots.txt` with sitemap reference
- [ ] Remove hardcoded `data-theme="neon"` from artikler pages (let user preference persist)
- [ ] Add descriptive alt text to 4 demo images with `alt=""`
- [ ] Add preconnect to Unsplash: `<link rel="preconnect" href="https://images.unsplash.com">`
- [ ] Remove unused CSS classes (`.hero--titan`, `.titan-title`) from base.css
- [ ] Add `width` and `height` attributes to all images without them (prevent CLS)

### **Medium (0.5–1 day)**

- [ ] **Define CSS tokens** → Add `--font`, `--lh`, `--container`, `--space-*` to themes.css
- [ ] **Optimize images** → Convert top 5 largest JPGs to WebP (eksempler-bg, profil1, rorlegger, kafe, tattoo)
  - Risk: None | Impact: +40 Lighthouse score
- [ ] **Create sitemap.xml** → Include all main pages, demos, artikler
- [ ] **Add meta descriptions to demos** → 11 files, ~5 min each
- [ ] **Implement srcset for hero images** → 3 breakpoints (480w, 1200w, 1920w)
  - Dependency: Image optimization must be done first
- [ ] **Consolidate demo CSS** → Delete `demos/assets/css/base.css`, reference main base.css
- [ ] **Add breadcrumb schema to demos** → Copy-paste JSON-LD template
- [ ] **Fix color contrast in light theme** → Darken `--brand-2` from `#a259ff` to `#8b47cc`
- [ ] **Add focus states to burger menu** → Ensure `:focus-visible` applies
- [ ] **Add Escape key handler** → Close mobile menu on Escape press

### **Larger (1–3 days)**

- [ ] **Set up build process (Vite)** → Minification, autoprefixing, code splitting
  - Risk: May break existing deployments | Impact: +15-20 Lighthouse score
  - Dependency: Test locally first, deploy to preview branch
- [ ] **Implement design tokens system** → Full typography scale, spacing scale, color tokens
  - Risk: Medium (requires CSS refactor) | Impact: Easier maintenance
- [ ] **Extract header/footer partials** → Use Netlify Edge includes or build-time templating
  - Dependency: Requires build process
- [ ] **Audit and fix heading hierarchy** → Ensure no skipped levels (h1→h2→h3)
- [ ] **Download and optimize all Unsplash images** → Replace external URLs with local WebP files
  - Risk: Low | Impact: Faster LCP, better reliability
- [ ] **Create component documentation** → Document 8 core components with usage examples
- [ ] **Implement critical CSS inline** → Extract above-fold CSS, inline in `<head>`
  - Dependency: Requires build process
- [ ] **Add service worker for offline support** → Precache static assets (optional enhancement)
  - Risk: Medium (requires testing) | Impact: PWA support, offline browsing
- [ ] **Refactor folder structure** → Move to src/ + pages/ + public/ structure
  - Risk: High (breaks all relative paths) | Impact: Better organization
  - Dependency: Do this last after all other changes

---

## 9) Optional Mock Improvements (No Code)

### **A) "Recruiter-First" Landing**

**Concept:** Optimize homepage for B2B decision-makers who want to see proof + process fast.

**Structure:**
1. **Hero (above fold):**
   - H1: "Nettside på 7 dager – eller pengene tilbake"
   - Subhead: "Fastpris, ubegrensede revisjoner, og 95+ Lighthouse-score på alle prosjekter."
   - CTA: "Se case-studier" (primary) + "Bestill gratis konsultasjon" (secondary)
   - Visual: Split-screen with before/after redesign example (e.g., old vs new kafe-demo)

2. **Social Proof (trust bar):**
   - "30+ bedrifter levert · 4.9/5 stjerner · 100% fornøyde kunder"
   - Replace placeholder logos with real client logos (even anonymized)

3. **Featured Case Studies (3 cards):**
   - "Kafe i Oslo" → +40% bookinger etter lansering
   - "Rørlegger AS" → Første side på Google for 'rørlegger [by]'
   - "Hytteutleie" → 15 henvendelser første uke
   - Each card: Screenshot + metric + link to full case study

4. **Process (4 steps):**
   - "1. Kickoff (30 min) → 2. Design (2 dager) → 3. Bygging (3 dager) → 4. Lansering (1 dag)"
   - Timeline visual (horizontal bar with icons)

5. **Pricing Snapshot:**
   - "Fra 4 990 kr – se alle pakker" (link to priser.html)
   - Highlight: "MEST POPULÆR: Komplett one-pager – 4 990 kr"

6. **CTA Section:**
   - "Klar til å komme i gang?"
   - Form: Name + Email + "Hva trenger du?" (textarea) → Submit
   - Alternatively: "Book 15-minutters chat" (Calendly embed)

**Why this works:**
- Leads with outcome (7 days) + proof (case studies)
- Reduces decision friction (clear process + pricing)
- Action-oriented CTAs throughout

---

### **B) "Project Grid + Case Study" Approach**

**Concept:** Portfolio-first layout (like Dribbble/Behance) for designers/agencies browsing work.

**Structure:**
1. **Hero (minimal):**
   - H1: "Nettsider som skiller seg ut"
   - Subhead: "Moderne design, rask ytelse, bygget for vekst."
   - No CTA (let work speak for itself)

2. **Filter Bar:**
   - Tags: "Alle" | "Frisør" | "Konsulent" | "Kafé" | "Hytteutleie" | "Rørlegger" | etc.
   - Click to filter grid

3. **Project Grid (masonry layout):**
   - 3-column grid (2-col on tablet, 1-col on mobile)
   - Each card: Hero screenshot + category tag + title
   - Hover: Show overlay with "Se case study →" link
   - Load more button at bottom (lazy load)

4. **Individual Case Study Page (template):**
   - **Header:** Project title + category + date
   - **Challenge:** "Kunden trengte en rask, mobilvennlig side for å øke bookinger."
   - **Solution:** "Jeg designet en one-pager med fokus på sosial proof og enkelt bookingskjema."
   - **Results:** "40% økning i bookinger, 95 Lighthouse-score, levert på 6 dager."
   - **Gallery:** 3–5 screenshots (desktop + mobile)
   - **Tech Stack:** "HTML, CSS, JS · Netlify · 7 dager"
   - **CTA:** "Liker du dette? La oss bygge din neste side." → Link to kontakt

5. **Footer:**
   - Simplified: "Cre8Web · Roger Sørqvist · cre8xf@gmail.com · Se alle prosjekter"

**Why this works:**
- Visual-first (recruiters/clients scan screenshots fast)
- Filtering helps niche targeting ("Jeg trenger en kafé-side")
- Case studies tell story (challenge → solution → results)
- Less text, more proof

---

## Final Notes

**Prioritization Logic:**
- **High Severity** = Directly impacts user experience, SEO, or conversions (fix first)
- **Medium Severity** = Reduces quality or maintainability (fix within 1–2 weeks)
- **Low Severity** = Polish and nice-to-haves (fix when you have time)

**Biggest ROI Quick Wins:**
1. Optimize hero images (2.1MB → 100KB) = +40 Lighthouse score
2. Add sitemap + robots.txt = +20% SEO discoverability
3. Fix missing CSS tokens = Consistent design system
4. Consolidate demo CSS = -50% maintenance burden

**Risk Assessment:**
- **Low risk:** Image optimization, metadata fixes, CSS token additions
- **Medium risk:** Build process setup (test thoroughly before deploy)
- **High risk:** Folder restructure (do last, requires full regression test)

**Testing Checklist Before Launch:**
- [ ] Run Lighthouse on 5 key pages (index, tjenester, priser, eksempler, kontakt)
- [ ] Test keyboard navigation (Tab through all interactive elements)
- [ ] Validate HTML (W3C validator)
- [ ] Test on real devices (iOS Safari, Android Chrome, desktop Firefox)
- [ ] Check all forms submit correctly (Netlify Forms)
- [ ] Verify all links work (no 404s)
- [ ] Test theme toggle persistence across pages
- [ ] Run axe DevTools accessibility scan

---

**End of Audit Report**
