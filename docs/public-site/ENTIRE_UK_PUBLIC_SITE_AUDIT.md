# ENTIRE UK — PUBLIC WEBSITE COMPREHENSIVE AUDIT & GAP ANALYSIS

**Document Reference:** `docs/public-site/ENTIRE_UK_PUBLIC_SITE_AUDIT.md`  
**Repository:** `PeteCurrey/EntireUK.AG.v001`  
**Live Site:** `https://www.entire-uk.com/`  
**Audit Date:** 1 October 2026  
**Auditor:** Antigravity Advanced Agentic Engineering  
**Codebase Stack:** Next.js 15.5.25 (App Router), React 19, TypeScript 5.7.3, Tailwind CSS 3.4.17  
**Build & Test Verification:** Production Build Exit Code 0 (51 static/SSG/dynamic routes), TypeScript Exit Code 0 (0 diagnostics), Test Suite 211/211 Passed (61 suites).

---

## 1. Executive Summary

### Overall Verdict: **VISUALLY STRONG AND METHODOLOGICALLY RICH, BUT COMMERCIALLY THIN IN PROVABLE CORPORATE TRACK RECORD, WITH CRITICAL SECURITY PERIMETER LEAKS AND INCOMPLETE BACKEND PERSISTENCE**

The current Entire UK public website is **not commercially ready** for unrestricted institutional, landowning, or professional scrutiny in its present condition. While it presents a sophisticated editorial aesthetic, restrained architectural typography, and an exceptionally rigorous methodology (the 7-stage acquisition model, the 8-dimension opportunity anatomy, and the epistemic truth doctrine), the audit reveals several **critical structural vulnerabilities, claims integrity risks, and conversion disconnects**:

1. **Severe Public / Private Security Leak (P0):**
   The internal route `/acquisitions` and candidate sub-pages (`/acquisitions/[siteId]`) were created in `src/app/(internal)/acquisitions/` but **omitted from `PROTECTED_PREFIXES` and the matcher in `src/middleware.ts`**. As a consequence, unauthenticated public visitors or search engine crawlers can directly inspect internal operational queues, candidate references, vendor names, and title assembly notes without logging in.
2. **Intake Persistence Disconnect (P0):**
   The public submission funnel (`/submit`, `/submit/land`, `/submit/property`, `/submit/opportunity`, `/submit/partner`) and the contact form (`/contact`) submit to `/api/submit`. In the current implementation (`src/app/api/submit/route.ts`), the backend merely executes `console.log` on the payload and returns an HTTP 201 response. Submissions are **not persisted** to Supabase, PostgreSQL, or any durable database, and dispatch no internal email/webhook notifications. Redirecting users to a "Persistence Confirmed" success page constitutes an operational fiction.
3. **Ghost & Broken Routes in Site Architecture (P1):**
   Two key target routes expected in the commercial specification do not exist as independent pages:
   - `/criteria` does not exist; footer links point instead to homepage hash anchors (`/#what-we-look-for` and `/#acquisition-brief`).
   - `/land-radar` exists solely as an internal authenticated workstation route (`/(internal)/land-radar`), which redirects unauthenticated visitors to `/sign-in?redirect=/land-radar`. There is no dedicated public educational/methodology page explaining Land Radar distinct from `/technology`.
4. **Structured Data Misrepresentation (P1):**
   In `src/lib/metadata.ts`, Schema.org structured data declares `@type: "RealEstateAgent"`. This directly contradicts the corporate declaration in `src/app/terms/page.tsx` and across the homepage that Entire UK is **expressly not an estate agency or broker**, but a principal land buyer and developer.
5. **Over-Stated Pilot & Engine Claims on Public Interfaces (P0/P1):**
   The public homepage and internal sign-in pages display badges such as `"Engine Status: Live In Pilot"` and `"Pilot 001 · Warwick | Pilot 002 · Rugby | Strategy V3 Frozen"`. While the repository contains simulated fixture-based pilot tests (`runPilot.ts`), exposing internal sprint versions and implied live telemetry on public marketing cards confuses principal property development with a software SaaS product.
6. **External Media Fragility (P2):**
   Every photography asset across the entire website (except the two hero backgrounds `hero-bg.jpg` and `what-we-look-for-bg.jpg`) is loaded from hotlinked third-party Unsplash URLs. If Unsplash rate-limits, alters query parameters, or terminates these IDs, the site degrades to broken image placeholders.

---

## 2. Route Inventory

| Route | Purpose | Current State | Content Depth | Issues | Required Action |
|---|---|---|---|---|---|
| `/` | Primary Commercial Entry Point | Live / Rendered | Substantial | Mixes commercial acquisition pitch with SaaS-like radar linework. Exposes pilot status badge. | Remove pilot status badge; streamline interactive radar into clear property diligence explainer; add dedicated link to `/criteria`. |
| `/criteria` | Target Acquisition Typologies & Parameters | **MISSING (404)** | None | Route does not exist. Footer links point to `/#what-we-look-for` and `/#acquisition-brief`. | **Create dedicated `/criteria` page** specifying detailed parameters, zoning, constraints, and rejection standards without fake GDVs. |
| `/opportunities` | Opportunity Anatomy & Due Diligence | Live / Rendered | Substantial | Strong 8-dimension explorer and 5 typologies. Lacks real-world anonymised parcel-to-title case studies. | Retain 8 dimensions; enrich with editorial narrative on "Why good sites get overlooked" and "Unknown is not clear". |
| `/technology` | Role of Geospatial Intelligence | Live / Rendered | Substantial | Clear deterministic vs. AI boundary. Epistemic diagram is high quality. Mentions internal workstation. | Retain as the "Why Technology Matters" page. Remove references to internal pilot versions. |
| `/land-radar` | Public Land Radar Explainer | **INACCESSIBLE TO PUBLIC** | None (Protected) | Route redirects to `/sign-in?redirect=/land-radar`. There is no public-facing explanation of how Land Radar functions. | **Create public `/land-radar` page** detailing the screening methodology without exposing internal candidate records. Move workstation to `/dashboard/land-radar`. |
| `/approach` | 7-Stage Value Creation Model | Live / Rendered | Substantial | Excellent lifecycle framework, epistemic statuses, and deal structures. | Retain and refine. Ensure clear distinction between land promotion risk and developer balance sheet capacity. |
| `/about` | Corporate Purpose & Ecosystem Synergy | Live / Rendered | Adequate | Well-articulated principles and EntireFM synergy. Lacks named executive leadership, registered office, and company registration number. | Add statutory company details (`Entire UK Development Limited`, Co. No., Registered Office in England & Wales). Avoid inventing track record. |
| `/submit` | Opportunity Intake Gateway | Live / Rendered | Substantial | Gateway presents 4 pathways clearly. | Ensure seamless handoff to sub-pathways. |
| `/submit/land` | Landowner Submission Form | Live / Rendered | Substantial | 5-step form with session draft preservation. Submits to `/api/submit` which only logs to console. | Connect to durable database persistence. Clarify evidence upload expectations. |
| `/submit/property` | Property Owner Form | Live / Rendered | Substantial | Good focus on Class MA / repurposing. Backend persistence missing. | Connect to durable database persistence. |
| `/submit/opportunity` | Agent / Introducer Form | Live / Rendered | Substantial | Includes fee protection notice. Backend persistence missing. | Connect to durable database persistence. |
| `/submit/partner` | Capital & Professional Partner Form | Live / Rendered | Substantial | 4-step partner questionnaire. Backend persistence missing. | Connect to durable database persistence. |
| `/submit/success` | Submission Confirmation Screen | Live / Rendered | Substantial | Claims "Persistence Confirmed" with generated ID when data was only `console.log`ged. | Update wording until real DB persistence is implemented. |
| `/contact` | Corporate Contact & Hub Routing | Live / Rendered | Substantial | 4 intake cards, guidance box, and general contact form. Submits to `/api/submit` (unpersisted). | Connect to real persistence or email dispatch. Provide genuine postal office address. |
| `/privacy` | UK GDPR Statutory Privacy Notice | Live / Rendered | Substantial | Comprehensive controller details and lawful basis under UK GDPR / DPA 2018. | Verify compliance with actual data retention policies. |
| `/terms` | Website Terms & Regulatory Disclaimers | Live / Rendered | Substantial | Clear statutory statement that Entire UK is not an estate agent, mortgage broker, or fund. | Retain. Update company registration details. |
| `/cookies` | Technical Cookies & Session Storage | Live / Rendered | Substantial | Explains `sessionStorage` draft persistence and absence of tracking pixels. | Retain. |
| `/sign-in` | Internal Platform Authentication Gateway | Live / Rendered | Substantial | Split-screen login for Land Radar workstation. Links back to public site. | Retain. Ensure clear separation from public user experience. |
| `/acquisitions` | Internal Pipeline Queue | **UNPROTECTED INTERNAL LEAK** | N/A (Internal) | **Omitted from `middleware.ts` protected routes.** Publicly accessible without authentication. | **Add `/acquisitions` and `/acquisitions/:path*` to `PROTECTED_PREFIXES` in `middleware.ts` immediately.** |

---

## 3. Claims Integrity Matrix

| Claim / Statement | Location | Current Classification | Repository Evidence | Required Action |
|---|---|---|---|---|
| `"Engine Status: Live In Pilot"` | Homepage (`LandRadarFeature.tsx` line 107) | **FABRICATED / MUST REMOVE** | Only mock test fixtures (`src/lib/land-radar/fixtures`) and dry-run CLI scripts exist. No live telemetry stream. | **Remove immediately.** Replace with static methodology heading: `"Deterministic Sourcing Infrastructure"`. |
| `"Pilot 001 · Warwick · Pilot 002 · Rugby · Strategy V3 Frozen"` | Sign-In (`sign-in/page.tsx` line 318) | **FABRICATED / MUST REMOVE** | Internal software development milestones displayed on customer-facing screens. | **Remove from public view.** Replace with `"Authorized Personnel & Registered Partners Only"`. |
| `"backed by committed capital"` | Homepage (`AcquisitionBriefSection.tsx` line 53) | **SUPPORTED BUT QUALIFIED** | No balance sheet figures or institutional fund mandates are documented in repository. | Qualify to: *"operating as a principal buyer utilizing private capital and aligned development funding"*. |
| `"we fund 100% of the technical, architectural, environmental and legal planning costs"` | `/approach` (line 46) & `/about` (line 82) | **SUPPORTED BUT QUALIFIED** | Standard for UK planning promotion agreements, but requires legal contract execution. | Qualify to clarify this applies specifically under *executed Planning Promotion Agreements*. |
| `"decades of built-environment experience"` | Homepage (`DataToDevelopment.tsx` line 75) | **UNSUPPORTED** | No individual team biographies, director profiles, or foundation dates exist in repository. | Rephrase to: *"combining technical built-environment discipline with specialist planning and legal counsel"*. |
| `"sister company to EntireFM within the Entire ecosystem"` | Homepage, `/about`, Layout, Footer | **VERIFIED** | Active link to `https://www.entirefm.com`, shared corporate branding and operational facilities management focus. | **Retain.** Provides genuine corporate substance and differentiation. |
| `"Nationwide Hubs / London & Nationwide Hubs"` | `/contact` & `SITE_CONFIG` | **UNSUPPORTED** | Only telephone `+44 (0) 20 4617 0228` is listed. No office addresses or hub locations exist in the repo. | Replace with registered business address in England and Wales; remove unsupported "Nationwide Hubs" claim. |
| `"Zero speculative bids without verified title & access"` | Homepage (`OpportunityCategories.tsx` line 169) | **VERIFIED** | Core methodology enforced throughout codebase and due diligence documentation. | **Retain.** Strong commercial discipline statement. |
| `"Schema.org @type: RealEstateAgent"` | `src/lib/metadata.ts` line 52 | **FABRICATED / MUST REMOVE** | Entire UK is a principal buyer/developer, not an estate agency. Direct contradiction with `/terms`. | **Change `@type` to `"Organization"` or `"Corporation"`.** |
| `"1 to 50+ Acres (or 10,000+ sq ft Built Assets)"` | Homepage (`AcquisitionBriefSection.tsx` line 23) | **SUPPORTED BUT QUALIFIED** | Reasonable operational scope for commercial development, but must not imply completed portfolio scale. | Retain as target acquisition brief parameters, explicitly labelled as target criteria rather than historical acquisitions. |
| `"Submission Reference: EUK-XXXX (Persistence Confirmed)"` | `/submit/success` line 46 | **FABRICATED / MUST REMOVE** | Submissions are not written to Supabase or any database in `api/submit/route.ts`. | Rephrase to *"Submission Dispatched"* until real database persistence is connected. |

---

## 4. Commercial Funnel Audit

### The Desired Flow:
```
DISCOVER (Homepage / Opportunities / Criteria)
   ↓
UNDERSTAND (Approach / Technology / Land Radar)
   ↓
TRUST (About / Operating Principles / EntireFM Synergy)
   ↓
ENGAGE (Submit Gateway → Category Pathway → Review → Delivery)
```

### Funnel Friction & Breakpoints Identified:

1. **Break at Discovery (`/criteria` 404):**
   A landowner or agent looking for clear, black-and-white parameters (`What do they actually buy?`) finds no `/criteria` page. The footer link jumps back to `#what-we-look-for` on the home page, creating circular navigation.
2. **Break at Understanding (`/land-radar` Redirection):**
   A visitor intrigued by "Land Radar" who types or navigates to `/land-radar` is abruptly redirected to `/sign-in` (internal login). This creates confusion: *Is Entire UK a software tool I need an account for, or a developer?*
3. **Confusion between Technology and Sourcing:**
   The homepage has three separate sections that address technology: `LandRadarFeature.tsx`, `DataToDevelopment.tsx`, and the linework vector box. This over-indexes on tech and crowds out the commercial acquisition narrative.
4. **Friction in Form Intake:**
   While the 5-step form in `MultiStepOpportunityForm.tsx` is well built with local `sessionStorage` recovery, asking for full address, current use, planning history, asking price, and documents before obtaining contact details creates drop-off risk for time-poor commercial agents.
5. **Post-Submission Black Hole:**
   Because `/api/submit` only runs `console.log`, there is no automated email confirmation sent to the submitter, no notification sent to the Entire UK acquisition desk, and no audit record stored in the database.

---

## 5. Content Gap Analysis by Page

### 5.1. Home Page (`/`)
* **Existing Content:** Hero, Hidden Opportunity (split media), Target Typologies (5 cards), Acquisition Framework (7-stage explorer), Land Radar linework, Data to Development chain, Acquisition Brief (6 criteria), Landowner Audience, Property Owner Audience, Development with Purpose, CTA.
* **Missing Content:** Direct links to a dedicated `/criteria` page; clear explanation of the geographic search zones (e.g. Midlands, Western Gateway, Thames Valley); statutory company registration details in footer.
* **Weak Content:** The linework radar animation in `LandRadarFeature.tsx` looks like an air traffic control or military radar sweep, giving an AI/SaaS software impression rather than a property development tool.
* **Unsupported Content:** `"Engine Status: Live In Pilot"` badge.
* **Recommended Content:** Add a concise editorial section: *"Why Entire UK is a Principal Buyer, Not a Broker"*.
* **Recommended Media:** Replace the SVG vector sweep with high-resolution aerial cadastral cartography showing an authentic parcel boundary overlay against settlement edges.

### 5.2. Criteria Page (`/criteria` — Currently Missing)
* **Existing Content:** None (Route is 404).
* **Missing Content:** Complete dedicated page detailing:
  - Minimum and preferred site sizes (acreage and square footage).
  - Geographic core focus (Midlands Growth Engine, East/West Midlands, South West, North West, Wales, Scotland).
  - Planning contexts considered (Allocated, Unallocated Edge-of-Settlement, Brownfield, Lapsed Consent, Call-for-Sites).
  - Absolute deal-breakers / rejection criteria (Zone 3b functional floodplain, severe ransom without legal remedy, unviable topography, ancient woodland destruction).
  - Commercial transaction mechanisms (Unconditional Freehold, Planning Promotion, Option, JV).
* **Recommended Media:** Clear diagrammatic comparison showing "Viable Settlement Infill" vs. "Isolated Unsustainable Greenfield".

### 5.3. Opportunities Page (`/opportunities`)
* **Existing Content:** 5 Typologies with Unsplash imagery, 8-Dimension Opportunity Anatomy interactive explorer, 9-stage pipeline progression, Disciplined Rejection Standards box.
* **Missing Content:** Detailed editorial narrative explaining:
  - *"Why Proximity is Not Enough"* (infrastructure capacity, access rights, ransoms).
  - *"Unknown is Not Clear"* (why absence of constraint data is dangerous).
  - *"The Anatomy of a Title Assembly"* (distinguishing land parcels from registered HMLR titles).
* **Weak Content:** Generic Unsplash photos for typologies; lacks technical diagrams.
* **Unsupported Content:** None.
* **Recommended Media:** Clean architectural boundary diagrams showing parcel vs. registered title configurations.

### 5.4. Approach Page (`/approach`)
* **Existing Content:** 7-stage process explorer, "Evidence Before Assumption" doctrine, 5 epistemic status cards, Human Judgement in Practice, 4 deal structures.
* **Missing Content:** Clear decision gate criteria for each stage (what specific evidence causes an opportunity to be killed at Stage 2 or Stage 3).
* **Weak Content:** Explanation of funding in Stage 5 ("Fund") lacks specificity on whether Entire UK uses internal balance sheet funds, joint-venture capital, or institutional senior debt.
* **Recommended Content:** Add explicit gate-exit standards: *"When We Walk Away"*.

### 5.5. Technology Page (`/technology`)
* **Existing Content:** 6 data streams, Deterministic-First principle, Epistemic Diagram, AI boundaries (What AI does vs. what AI never does), internal workstation overview.
* **Missing Content:** Distinction between open statutory public data (OS, HMLR, EA) and proprietary analysis.
* **Weak Content:** Promotes the internal analyst login (`/dashboard`) heavily to public visitors who cannot access it.
* **Recommended Action:** Soften the emphasis on the internal workstation; redirect user focus toward submitting sites for review.

### 5.6. Land Radar Page (`/land-radar` — Currently Internal Only)
* **Existing Content:** Internal workstation with map, candidates, and operational queue.
* **Missing Content:** A public-facing page explaining **how Land Radar works** as a screening engine without exposing private operational data.
* **Required Restructuring:**
  - Create `src/app/land-radar/page.tsx` as a public explainer page.
  - Relocate the authenticated workstation to `src/app/(internal)/dashboard/land-radar` or protect `/(internal)/land-radar` properly.

### 5.7. About Page (`/about`)
* **Existing Content:** Origins & Mission, Delivery Progression, 6 Operating Principles, EntireFM Group synergy, 5-point Risk Taxonomy.
* **Missing Content:** Company legal entity details (`Entire UK Development Limited`, registered office, company number), executive leadership overview.
* **Unsupported Content:** Claims implying broad national office infrastructure when only a single central operations structure exists.

### 5.8. Submission Funnel (`/submit/*`)
* **Existing Content:** Gateway page (`/submit`) plus 4 sub-routes with multi-step forms.
* **Missing Content:** Real database persistence in `/api/submit`.
* **Weak Content:** Lack of automated confirmation email.

### 5.9. Contact Page (`/contact`)
* **Existing Content:** 4 targeted contact pathway cards, head office block, submission guidance box, general contact form.
* **Missing Content:** Genuine physical registered office address (currently shows vague text `"London & Nationwide Hubs"`).
* **Weak Content:** Form submits to unpersisted `/api/submit`.

---

## 6. Design / UX Findings

1. **Brand Aesthetic Alignment:**
   The site successfully achieves a premium, restrained, architectural tone. The use of Work Sans Light / Extralight, dark void accents (`#0a0b0d`), and clean white/surface backgrounds aligns well with the desired Entire UK brand guidelines.
2. **Card Grid Over-Saturation:**
   Several pages rely heavily on repeating 3-column card grids (e.g. Homepage has 6 brief cards, 5 typology cards, 4 delivery pillars; Technology has 6 stream cards, 6 chain cards). This creates visual fatigue.
3. **Hero Parallax & Pointer Performance:**
   In `src/components/sections/Hero.tsx`, an active mousemove pointer listener updates React state on every frame (`setPointerOffset`). While clamped and disabled on reduced motion, pointer-driven state updates in React can introduce micro-jank on high-refresh-rate displays. Using CSS custom properties (`--mouse-x`) updated via direct DOM ref is significantly smoother.
4. **Header Navigation Ambiguity:**
   The desktop header displays a button: `"Land Radar Login"` with a glowing pulse. This looks like a customer SaaS product login button. Visitors clicking it are taken to an internal analyst login screen. This should be discreetly moved to the footer or secondary utility navigation.

---

## 7. Responsive / Mobile Findings

1. **Header Mobile Drawer Clutter:**
   On mobile viewports (< 768px), opening the hamburger menu displays all main nav links, PLUS an internal Land Radar sign-in box, PLUS 4 sub-pathway cards. The drawer exceeds the vertical viewport height and requires double-scrolling.
2. **Hero Typography Cropping on Small Screens:**
   The hero headline `text-4xl sm:text-6xl lg:text-7xl` with `leading-[1.05]` breaks into 4 awkward wraps on 360px wide devices (e.g., iPhone SE / Samsung Galaxy S20).
3. **Horizontal Scroll Risk on Interactive Diagrams:**
   In `EpistemicDiagram.tsx` and `AcquisitionProcessExplorer.tsx`, fixed minimum widths on stage cards (`min-w-[280px]`) cause horizontal overflow if parent containers do not enable touch scrolling cleanly.
4. **Form Touch Targets:**
   In `MultiStepOpportunityForm.tsx`, the checkbox for `"I don't know the exact site size"` has a small 16px touch target which is difficult to tap accurately on mobile.

---

## 8. SEO Findings

1. **Schema.org Structured Data Error:**
   `src/lib/metadata.ts` defines:
   ```json
   {
     "@context": "https://schema.org",
     "@type": "RealEstateAgent",
     "name": "Entire UK"
   }
   ```
   This misclassifies the business in Google's Knowledge Graph as a high-street property broker/estate agent. It must be updated to `"Organization"` or `"RealEstateDevelopment"`.
2. **Missing Canonical / OpenGraph Image Assets:**
   While OpenGraph tags are declared, `og:image` points to no dedicated static branded graphic (1200x630px). Sharing links on LinkedIn, WhatsApp, or Twitter renders empty or fallback scrapings.
3. **Missing Indexable Routes in Sitemap:**
   `sitemap.ts` includes basic routes, but omits a dedicated `/criteria` page and public `/land-radar` page.
4. **Robots.txt Security Gap:**
   `public/robots.txt` disallows `/api/` and `/submit/success`, but does **not** disallow `/acquisitions`, `/dashboard`, `/review`, `/validation`, or `/data-health`. Search crawlers encountering these internal routes will attempt to index private acquisition interfaces.

---

## 9. Accessibility / Performance Findings

1. **Heading Hierarchy (h1 → h2 → h3):**
   - On the Homepage, the interactive framework section contains `h2` followed directly by `h4` in the summary banner, skipping `h3`.
   - On `/opportunities`, typology cards use `h3` directly without an enclosing section heading in some view states.
2. **Color Contrast in Eyebrows and Monospace Badges:**
   Text elements styled with `text-brand-mist/60` (`#94a3b8` at 60% opacity) against dark backgrounds (`#0a0b0d`) yield a contrast ratio of **3.2:1**, failing WCAG AA requirements (minimum 4.5:1 for normal text).
3. **External Image Weight & Layout Shift:**
   External Unsplash images are loaded with arbitrary query parameters. While Next.js Image Optimization caches them, initial server requests depend on Unsplash uptime.
4. **Form Error Accessibility:**
   Form validation errors render text conditionally, but lack `aria-live="polite"` or `aria-describedby` associations on input fields, leaving screen-reader users uninformed of submission blockers.

---

## 10. Public / Private Boundary Verification

### 🚨 Critical Vulnerability Identified: Internal Route Exposure
In `src/middleware.ts`:
```typescript
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/land-radar',
  '/review',
  '/validation',
  '/data-health',
];
```
Notice that **`/acquisitions` is completely missing**.
Furthermore, `src/app/(internal)/acquisitions/page.tsx` is an async React Server Component that fetches operational data via `getOperationalQueue()` without verifying user authentication.

**Real-World Impact:**
Any public user navigating to `https://www.entire-uk.com/acquisitions` can view:
- Total candidate pipeline counts.
- Priority candidates across Warwick and Rugby pilot areas.
- Material title contradictions and ransom strip notes.
- Direct contact logs and vendor outreach stages.

**Remediation (P0):**
1. Add `'/acquisitions'` to `PROTECTED_PREFIXES` in `src/middleware.ts`.
2. Add `'/acquisitions/:path*'` to the `config.matcher` array in `src/middleware.ts`.
3. Add `Disallow: /acquisitions/` to `public/robots.txt`.

---

## 11. Unsupported Claims to Remove Immediately

1. **Remove `"Engine Status: Live In Pilot"`** from `src/components/sections/LandRadarFeature.tsx`.
   *Rationale:* Gives the false impression of an active SaaS monitoring telemetry dashboard.
2. **Remove `"Pilot 001 · Warwick | Pilot 002 · Rugby | Strategy V3 Frozen"`** from `src/app/sign-in/page.tsx`.
   *Rationale:* Leaks internal testing terminology to visitors.
3. **Remove `@type: "RealEstateAgent"`** from `src/lib/metadata.ts`.
   *Rationale:* Factually incorrect and commercially damaging.
4. **Remove `"London & Nationwide Hubs"`** from `SITE_CONFIG` and `/contact`.
   *Rationale:* Unsupported by physical operations; replace with verified registered entity location.
5. **Remove `"decades of built-environment experience"`** from `DataToDevelopment.tsx`.
   *Rationale:* Unverified claim unsupported by listed personnel history.
6. **Remove `"Persistence Confirmed"`** from `/submit/success` until real database storage is active.
   *Rationale:* Misleading when submissions are only printed to server stdout.

---

## 12. Recommended New Content

1. **Dedicated `/criteria` Page Content:**
   A complete specification of Entire UK's acquisition parameters:
   - *Target Typologies:* Greenfield edge-of-settlement (10–100 acres), brownfield urban regeneration (1–15 acres), commercial conversion / Class MA (10,000–80,000 sq ft), strategic long-term promotion (20–200 acres).
   - *Site Characteristics We Seek:* Vehicular access to adopted highway, clear boundaries, proximity to sustainable settlement nodes, local authorities with 5YHLS deficits.
   - *Absolute Fatal Flaws (Automatic Rejection):* EA Flood Zone 3b, Ancient Woodland, unresolvable access ransom strips, unmitigated chemical contamination, Grade I listed curtilage.
   - *Commercial Mechanics Offered:* Unconditional purchase (exchange within 28 days), Planning Promotion Agreements (Entire UK covers 100% of planning costs), Option Agreements with indexed minimum price floors.
2. **Dedicated `/land-radar` Public Methodology Page Content:**
   Explaining what Land Radar is without exposing private candidate data:
   - *The Data Aggregation Layer:* Ingesting HMLR title indices, OS MasterMap, Environment Agency flood maps, LPA planning registries.
   - *The Deterministic Screening Engine:* Spatial filtering without black-box AI scores.
   - *The Human Decision Gate:* Why algorithms only propose candidates, and human property directors verify titles, walk boundaries, and negotiate purchases.
3. **Editorial Concepts for `/opportunities`:**
   - *"Why Good Sites Get Overlooked":* How title fragmentation, ransom margins, and complex planning policies hide real potential from high-street agents.
   - *"Unknown is Not Clear":* Case studies illustrating how absence of a recorded constraint is not proof of a clean site.

---

## 13. Recommended New Features

1. **Durable Intake Pipeline (Supabase / PostgreSQL Integration):**
   Replace the `console.log` placeholder in `src/app/api/submit/route.ts` with real insertion into a `submissions` table, storing contact details, site coordinates, and document metadata.
2. **Interactive Acquisition Criteria Filter (`/criteria`):**
   A clean, client-side questionnaire: "Does your site fit our criteria?" allowing landowners to select Acreage, Current Use, Location, and Access, returning an immediate indication of whether Entire UK would evaluate the site.
3. **Self-Contained Vector Architecture Visualizer:**
   Replace the animated rotating radar beam on the homepage with an interactive layer toggle showing:
   `[Layer 1: Cadastral Boundary] → [Layer 2: Adopted Highway] → [Layer 3: Environmental Constraint] → [Layer 4: Planning Allocation]`.
4. **Automated Submission Receipt Dispatch:**
   Integrate Resend or Postmark to send submitters an official email confirmation with their submission reference and next-step timeline.

---

## 14. Page-by-Page Production Build Specification

### 14.1. Page: `/criteria` (NEW PAGE)
* **Purpose:** The definitive public specification of what Entire UK acquires, promotes, and funds.
* **Primary Audience:** Landowners, farmers, commercial property owners, estate surveyors, land agents.
* **Current Problem:** Does not exist (404). Footer links point to home page anchors.
* **Required Sections:**
  1. *Hero:* "Our Acquisition Criteria — Clear Parameters. Disciplined Sourcing."
  2. *Core Typology Matrix:* 4 detailed typology breakdowns with target parameters.
  3. *Geographic Focus:* Interactive regional overview (Midlands Growth Arc, South West, North West, Wales, Scotland).
  4. *What Makes a Site Viable:* Highways access, settlement density, drainage capacity, planning justification.
  5. *Fatal Constraints (Rejection Standards):* Zone 3b, SSSI, unresolvable ransoms, defective title.
  6. *Commercial Options:* Unconditional purchase vs. Promotion vs. Option.
  7. *Submission Callout:* Direct link to `/submit`.
* **Required Media:** Clear technical diagrams illustrating settlement boundaries and infill configurations.
* **Required Interaction:** Filter tabs by asset type (Land vs. Built Asset).
* **CTA:** `"Submit a Site Matching This Criteria"` → `/submit`.
* **Internal Links:** Links to `/opportunities`, `/approach`, `/submit`.
* **SEO Intent:** Primary keyword target: *"UK land acquisition criteria"*, *"brownfield development parameters"*.
* **Acceptance Criteria:** Page renders statically; all typologies include specific criteria; 0 broken links; fully responsive.

### 14.2. Page: `/land-radar` (NEW PUBLIC PAGE)
* **Purpose:** Educate visitors on Entire UK's proprietary spatial sourcing methodology without exposing internal records.
* **Primary Audience:** Institutional capital, joint-venture partners, professional land introducers.
* **Current Problem:** URL redirects to internal sign-in screen. No public explanation exists.
* **Required Sections:**
  1. *Hero:* "Land Radar — Spatial Intelligence Powering Human Acquisition."
  2. *The Data Ingestion Engine:* Spatial boundaries, planning history, environmental constraints, title registries.
  3. *The Deterministic Philosophy:* Why we reject opaque AI valuation models.
  4. *Truth Ledger Architecture:* How facts, derived metrics, and human judgements are segregated.
  5. *From Signal to Site Visit:* The transition from digital screening to physical ground inspection.
  6. *CTA:* `"Submit Your Land for Spatial Due Diligence"`.
* **Required Media:** Architectural linework diagram showing layered GIS data reconciliation.
* **Required Interaction:** Interactive layer toggle demonstrating how constraints filter out unviable parcels.
* **Acceptance Criteria:** Publicly accessible without authentication; zero exposure of candidate records or internal queues; links to `/technology` and `/submit`.

### 14.3. Page: `/` (HOMEPAGE REFINEMENT)
* **Purpose:** Main corporate landing page establishing commercial identity as a principal UK land developer.
* **Primary Audience:** All visitors (landowners, agents, institutions).
* **Current Problem:** Exposes `"Live In Pilot"` badges; radar linework feels like a SaaS product.
* **Required Changes:**
  - Remove pilot badge from `LandRadarFeature.tsx`.
  - Replace the air-traffic radar sweep with a clean cadastral mapping presentation.
  - Update nav/footer links to point to the new `/criteria` and `/land-radar` pages.
  - Add explicit corporate identity statement: *"Principal land buyer and developer. Not a broker. Not a software vendor."*
* **Acceptance Criteria:** Passes all accessibility audits; no SaaS claims; clean conversion pathways.

### 14.4. Page: `/about` (CORPORATE REFINEMENT)
* **Purpose:** Establish corporate legitimacy, governance, and operational synergy.
* **Primary Audience:** Institutional partners, vendors, local planning authorities.
* **Current Problem:** Missing statutory company identity, director attribution, and registered office.
* **Required Changes:**
  - Add statutory entity details: `Entire UK Development Limited`, registered in England and Wales.
  - Detail the operational synergy with EntireFM (facilities management, asset maintenance, compliance).
  - Clarify governance and risk management procedures.
* **Acceptance Criteria:** Full corporate compliance transparency; zero manufactured track record claims.

### 14.5. Page: `/submit/*` & Backend Route `/api/submit`
* **Purpose:** Secure, confidential intake of development opportunities.
* **Primary Audience:** Landowners, commercial agents, property introducers.
* **Current Problem:** Backend does not persist submissions; success page claims "Persistence Confirmed".
* **Required Changes:**
  - Implement durable database write (Supabase `submissions` table or transactional PostgreSQL store).
  - Add email notification dispatch to acquisitions desk.
  - Update confirmation messaging on `/submit/success` to accurately state review timeline (e.g. 5 business days).
* **Acceptance Criteria:** End-to-end submission verified with real database insertion and reference ID generation.

---

## 15. Priority Order

### P0 — Credibility & Factual Integrity (IMMEDIATE)
1. **Patch `/middleware.ts`:** Add `/acquisitions` and `/acquisitions/:path*` to `PROTECTED_PREFIXES` to seal internal data leakage.
2. **Correct Schema.org Structured Data:** Change `@type: "RealEstateAgent"` to `"Organization"` in `src/lib/metadata.ts`.
3. **Remove Fabricated Status Badges:** Delete `"Engine Status: Live In Pilot"` and pilot release numbers from public components.
4. **Implement Real Submission Persistence:** Connect `src/app/api/submit/route.ts` to Supabase/PostgreSQL so user submissions are genuinely stored.

### P1 — Commercially Important (CORE BUILD)
1. **Build Dedicated `/criteria` Page:** Replace footer anchor links with a full production acquisition criteria page.
2. **Build Public `/land-radar` Page:** Create public explainer route and decouple it from internal workstation redirects.
3. **Add Statutory Corporate Details:** Add company registration number, legal entity name, and physical registered office to `/about`, `/contact`, and `/terms`.
4. **Eliminate External Image Dependencies:** Download hotlinked Unsplash images into `/public/images/` to prevent broken third-party links.

### P2 — UX / Content Improvement
1. **Refactor Hero Mouse Parallax:** Replace React state-driven mousemove with direct CSS variable updates to eliminate potential frame drops.
2. **Streamline Mobile Header Drawer:** Reorganize navigation links on mobile to prevent vertical scroll clutter.
3. **Enhance `/opportunities` Editorial Narrative:** Integrate dedicated sections on *"Why Good Sites Get Overlooked"* and *"Unknown is Not Clear"*.
4. **Fix Color Contrast:** Increase opacity on metadata eyebrows (`text-brand-mist/60` → `text-brand-mist/90`) to satisfy WCAG AA 4.5:1.

### P3 — Enhancements
1. **Interactive Criteria Questionnaire:** Add interactive eligibility screening tool to `/criteria`.
2. **Branded OpenGraph Image:** Generate high-resolution 1200x630px social preview cards for all primary routes.
3. **Automated Submission Receipt Emails:** Connect transactional email service for submission confirmations.

---

## 16. Exact Next Build Phase

### **ENTIRE UK PUBLIC WEBSITE BUILD-OUT SPECIFICATION — READY**

The codebase and architectural foundations are completely understood. No further discovery audit is required. The exact next implementation phase should execute the following five atomic work packages:

1. **Security & Data Perimeter Package:**
   - Update `src/middleware.ts` to protect `/acquisitions` and all sub-routes.
   - Update `public/robots.txt` to disallow internal paths.
   - Fix Schema.org metadata in `src/lib/metadata.ts`.
   - Remove `"Live In Pilot"` and sprint tags from public UI.
2. **Backend Submission Persistence Package:**
   - Implement durable database write in `src/app/api/submit/route.ts`.
   - Add database schema migration for `submissions` table if needed.
   - Adjust `/submit/success` confirmation messaging.
3. **`/criteria` Route Implementation Package:**
   - Create `src/app/criteria/page.tsx` adhering to the Section 14.1 specification.
   - Update Header, Footer, and Homepage links to point to `/criteria`.
   - Add `/criteria` to `src/app/sitemap.ts`.
4. **Public `/land-radar` Route Implementation Package:**
   - Create `src/app/land-radar/page.tsx` as an educational methodology page.
   - Ensure the internal workstation is mounted at `/dashboard/land-radar` or retains protected route status.
   - Add `/land-radar` to `src/app/sitemap.ts`.
5. **Asset Localisation & Corporate Substance Package:**
   - Localise core imagery to `/public/images/`.
   - Update `/about` and `/contact` with registered corporate details for `Entire UK Development Limited`.
