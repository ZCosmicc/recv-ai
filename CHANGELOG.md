# Changelog

All notable changes to this project will be documented in this file.

## [1.3.1] - 2026-04-02

### 🚀 Performance & UI Enhancements
- **Global Physics Engine**: Replaced basic CSS hover/click states with hardware-accelerated **Framer Motion** physics (`stiffness: 400`, `damping: 25`) across all primary interactive elements (Buttons, Support Modal, Cards).
- **Smooth Scrolling**: Implemented **Lenis** global scroll provider (`lerp: 0.1`, `wheelMultiplier: 1.2`) to eliminate native scroll stuttering and deliver a premium, buttery-smooth navigation experience.
- **Centralized Components**: Created a reusable `<NeoButton>` wrapper to standardize Framer Motion interactions and reduce codebase repetition.
- **Global Entrance Animations**: Developed a global `<SlideIn>` wrapper component that leverages Framer Motion spring physics to orchestrate staggered component mounting across all major pages (Dashboard, CV Builder, Document Setup, Authentication).
- **Removed Layout Repaints**: Migrated away from generic CSS translation/shadow utility classes that previously triggered CPU layout recalculations, drastically decreasing "heaviness" on complex builder pages.

---

## [1.3.0] - 2026-04-01

### ✨ New Features

#### In-App Support Ticket System
- **Floating Support Button**: Fixed bottom-right button visible on every page (globally added to root layout)
- **Support Modal** — 3 views:
  - Category selection: Bug Report, Payment Issue, Account Problem, Feature Request, Other
  - Details form: subject, description, optional screenshot upload (drag & drop, max 5MB)
  - Confirmation screen: thank-you message with 2–7 day estimate and link to Changelog
- **Screenshot Upload**: Images uploaded to Supabase Storage (`support-screenshots` bucket, private)
- **Rate Limiting**: Logged-in users limited to 1 ticket per 24 hours; guests rate-limited by IP
- **Email prefill**: Automatically filled for logged-in users; manual entry for guests

#### Admin Panel — Support Tickets Tab
- New **Support Tickets** section below Users table
- Displays: Date, Email, Category, Subject + Description preview, Status badge, Screenshot link, Action
- **Detailed View**: Clickable ticket subject opens a full modal displaying all details and multiple screenshots using a 1:1 Lightbox.
- Status badges: 🟡 Open, 🔵 In Progress, 🟢 Resolved
- Filter buttons: All / Open / In Progress / Resolved
- **Advance** button cycles status (Open → In Progress → Resolved), **Reopen** resets to Open
- **Delete Ticket**: Added a delete action (UI + API `DELETE /api/admin/tickets`) to remove resolved or spam tickets.
- Instant UI update without page refresh

#### Public Changelog Page (`/changelog`) & PublicChangelog.md Split
- Server-rendered page now reads our new `PublicChangelog.md` via `fs` instead of `CHANGELOG.md` — auto-updates on every deploy.
- Styled with neobrutalist design matching the rest of the app.
- Added **Changelog** link to the Navbar (desktop + mobile).
- 📝 **Developer Note**: Whenever adding new user-facing features or noteworthy bug fixes to `CHANGELOG.md`, remember to translate and append them in a friendly, non-technical format to `PublicChangelog.md`!

#### Account Self-Deletion (PDPA/GDPR Compliance)
- **Danger Zone** section at the bottom of the Dashboard
- Confirmation modal requiring user to type `DELETE` exactly before proceeding
- Permanently deletes: storage files, support tickets, cover letters, CVs, profile, and auth account
- Redirects to home page after deletion

### 🔧 Changes
- **Privacy Page**: Removed personal email from "Contact Us" section — replaced with support modal callout. Updated "Deletion" right to reference self-service via Dashboard.
- **Terms Page**: Removed personal email from "Contact Information" section — replaced with support modal callout.
- Both pages retain the Instagram `@zcostudio` link as secondary contact.

### 🛡️ Infrastructure
- `POST /api/support` — submit tickets with Zod validation and DB-based rate limiting
- `POST /api/support/upload` — screenshot upload to Supabase Storage with type/size validation
- `GET/PATCH /api/admin/tickets` — admin-only ticket management
- `DELETE /api/account` — full account wipe using service role (ordered deletion)

---

## [1.2.7] - 2026-04-01

### 🐛 Bug Fixes
- **Login Page**: Logged-in users visiting `/login` are now immediately redirected to `/dashboard` instead of seeing the login form or Home Page again.
- **Session Persistence**: Opening a cloud CV (via dashboard Edit) no longer resets the user back to the Sections step on every tab switch or focus change.
  - Cloud CV loads now land directly on the Fill page (not Sections).
  - Auth state listener is now guarded to only reload data on actual `SIGNED_IN`/`SIGNED_OUT` events, not on token refreshes.
- **Project Links in Templates**: Project link URLs were only visible in the Minimal template. Now correctly shown in all templates:
  - Corporate, Creative, Executive, and Modern templates all render `p.link` under each project entry.
- **Pro Plan Expiry on Admin Upgrade**: Admin PATCH was only saving `tier` but not `pro_expires_at`, causing upgraded users to appear as expired or revert to Free.
  - Admin upgrades now set `pro_expires_at` to **30 days from now** (matching the Pakasir payment webhook), consistent with the monthly subscription model.
  - Admin downgrades now clear `pro_expires_at` (set to `null`).
- **Executive Template Custom Fields Alignment**: Custom fields in the Executive template sidebar were forced `text-left`, breaking the centered layout inherited from their parent container. Removed the explicit `text-left` class so they now correctly center-align with email, phone, and location.

### ✨ Improvements

#### Admin Panel
- **Pro Expires Column**: Added a new "Pro Expires" column to the Users table showing each Pro user's subscription end date with color-coded status badges:
  - 🟢 Green — Active subscription with >7 days remaining
  - 🟠 Orange — Expiring within 7 days (shows days remaining)
  - 🔴 Red — Subscription has expired
  - `—` — Free tier users or Pro users with no expiry date set
- **Instant State Update**: After toggling a user's tier in admin, the Pro Expires column now updates immediately in the UI (no page refresh needed).

### 🔧 Infrastructure
- **Rate Limiter Migration**: Replaced Upstash Redis rate limiter with a self-hosted in-memory sliding window implementation.
  - No external service dependency — zero maintenance, zero cost, no inactivity archiving concerns.
  - Same behavior: 20 requests per 10 seconds per IP across all `/api` routes.
  - `@upstash/ratelimit` and `@upstash/redis` packages retained in `package.json` for potential future use.

---

## [1.2.6] - 2026-02-14

### 🌐 Custom Domain Setup
- **Domain Registration**: Claimed free `recv-ai.me` domain via GitHub Student Developer Pack (Namecheap)
- **Email Domain Verification**:
  - Verified domain in Resend for professional email sending
  - Configured DNS records (DKIM, SPF, DMARC, MX) for email authentication
  - Updated email sender to `Recv.AI <noreply@recv-ai.me>`
- **Vercel Custom Domain**:
  - Pointed domain to Vercel for custom URL access
  - Configured A record (216.198.79.1) and CNAME for www subdomain
  - Automatic SSL certificate provisioned
  - App now accessible at `https://recv-ai.me`
- **Google OAuth Configuration**:
  - Added custom domain to authorized JavaScript origins
  - Updated redirect URIs for `recv-ai.me` and `www.recv-ai.me`
- **Google Domain Verification**:
  - Verified ownership via Google Search Console  
  - Published OAuth branding with verified domain
  - Submitted for Google branding review (pending 3-7 days)

### 🔧 Configuration Updates
- **Environment Variables**:
  - Added `NEXT_PUBLIC_SITE_URL=https://recv-ai.me` in Vercel Production
  - Added `NEXT_PUBLIC_BASE_URL=https://recv-ai.me` in Vercel Production
- **Supabase Configuration**:
  - Updated Site URL to `https://recv-ai.me`
  - Added redirect URLs for custom domain authentication
- **Cloudflare Turnstile**:
  - Added `recv-ai.me` and `www.recv-ai.me` to allowed domains

### 📝 Code Changes
- **SEO Updates**:
  - Updated `app/sitemap.ts` fallback URL to custom domain
  - Updated `app/robots.ts` fallback URL to custom domain
- **Payment Integration**:
  - Updated `app/api/payment/create/route.ts` redirect URL to custom domain

### 🌍 DNS Configuration
All DNS records configured in Namecheap Advanced DNS:
- A Record: `@` → `216.198.79.1` (Vercel)
- CNAME: `www` → `cname.vercel-dns.com`
- TXT (DKIM): `resend._domainkey` → Email authentication
- TXT (SPF): `send` → `v=spf1 include:amazonses.com ~all`
- TXT (DMARC): `_dmarc` → `v=DMARC1; p=none;`
- TXT (Google): `@` → Google Search Console verification
- MX: `send` → Amazon SES email delivery

### 🛡️ Security Improvements
- **Payment Validation**: Added Pro status check to prevent duplicate subscriptions
  - API now validates user isn't already Pro before creating payment
  - Returns user-friendly error with subscription expiry information
  - Updated UI to handle "already Pro" status gracefully
- **Webhook Logging**: Removed sensitive payment data from production logs
  - Only logs order ID and status (non-sensitive data)
  - Improved error messages without exposing internal details
- **Security Audit**: Conducted comprehensive security review
  - ✅ Authentication verified on all API routes
  - ✅ Row Level Security (RLS) policies confirmed active
  - ✅ Input validation with Zod schemas
  - ✅ Rate limiting active (Upstash Redis)
  - ✅ Payment webhook security verified
  - Security Rating: 🟢 8.5/10 - Production Ready

---

## [1.2.5] - 2026-02-11

### Added
- Google OAuth authentication as alternative login method
- "Continue with Google" button on login page with official Google branding
- Support for dual authentication: Magic Links and Google OAuth

### Fixed
- Investigated and documented magic link email sending issue (Resend testing mode restriction)
- Added comprehensive error handling for OAuth authentication flow

### Changed
- Enhanced login page UI with OAuth divider and improved user experience

---

## [1.2.4] - 2026-02-09

### 🐛 Bug Fixes
- **Authentication**:
  - Fixed a 404 error during email verification redirects by creating a dedicated `auth-code-error` page.
  - Improved error handling for failed magic link callbacks.

### 📧 Infrastructure
- **Email Reliability**:
  - Documented and implemented Custom SMTP configuration (Resend) to resolve Supabase's default email rate limits.
  - Added clear instructions in `README.md` for setting up production-ready email delivery.

## [1.2.3] - 2026-02-07

### ✨ New Features - Projects Section
- **Projects Section for CVs**:
  - Added dedicated "Projects" section to showcase personal/professional projects
  - **Form Fields**: Title, Description, Technologies, and Link (optional)
  - **Drag & Drop**: Reorder projects with drag-and-drop functionality
  - **All Templates**: Projects render beautifully in all 5 CV templates (Minimal, Modern, Corporate, Creative, Executive)
  - **Smart Layout**: In Creative template, Projects appear in the main content area for better readability

### 🛠 Improvements
- **Database Migration**:
  - Added SQL migration script to add empty `projects` array to existing CV records
  - Implemented automatic section merging when loading old CVs to include new sections
- **Data Safety**:


  - Added optional chaining to prevent errors when loading CVs without the projects field
  - Implemented backward compatibility for all existing CVs
- **Type Safety**: Added `Project` interface and updated `CVData` type with full validation schema

### 🔧 Technical Details
- **Files Modified**:
  - `types/index.ts` - Added Project interface
  - `components/Fill.tsx` - Added projects form with drag-and-drop
  - `components/CVPreview.tsx` - Added projects rendering for all templates
  - `app/page.tsx` - Added section merging logic for backward compatibility
  - `lib/validation.ts` - Added project validation schema
- **Database**: Created `sql script` for migrating existing records

## [1.2.2] - 2026-02-06

### 🛡️ Security & Cleanup (Feb 6, 2026)
- **Hardening**: Implemented strict Zod input validation for all API routes (CV Analysis, Cover Letter Gen, Webhooks).
- **Rate Limiting**: Confirmed active Rate Limiting via Upstash Redis.
- **Cleanup**: Removed unused SQL migration files (`supabase_*.sql`) from repository.
- **Debounce**: Verified actively used in Auto-Save features to optimize API usage.

### ✨ New Features - Auto-Save System
- **Real-time Auto-save**:
  - **CV Builder**: Automatically saves changes 2 seconds after typing stops for "Fill" and "Sections" pages.
  - **Cover Letter**: Added auto-save draft functionality to the Wizard, persisting inputs across sessions.
  - **Status Indicator**: Replaced manual "Save" button with a dynamic "Saving..." / "Saved" validation card in the top bar.
- **Cross-Platform Safety**:
  - **Cloud Sync**: Saves to S2upabase for authenticated aint users.
  - **Local Backup**: Simultaneously saves to `localStorage` as a fallback for Guest users.

### 🛠 Improvements
- **Database Schema**: Added missing `updated_at` column to `cover_letters` table to properly track last edited times.
- **UI UX**:
  - Added "Info" toast notification type (Blue) for non-critical status updates like "Saving draft...".
  - Improved error logging for API routes to catch silent validation failures.
- **Developer Experience**: Added `useDebounce` hook for performance optimization.

### 🛡️ Security & Infrastructure
- **DDoS Protection**: Implemented robust Rate Limiting middleware (Upstash) to prevent abuse on all API routes.
- **Critical Security Patch**: Fixed a major Row Level Security (RLS) vulnerability that allowed improper data access.
  - Locked down `public` schema access.
  - Added strict policy verification script `scripts/verify_rls.ts` to ensure data isolation.

## [1.2.1] - 2026-02-01

### 🐛 Bug Fixes & Reliability
- **Cover Letter Logic**:
  - **Duplicate Prevention**: Fixed a critical issue where "Starting Over" on an existing letter created a duplicate entry.
  - **Update Mechanism**: Removed invalid database column reference that caused save failures during updates.
  - **Data Safety**: Implemented a "Safe Mode" fallback that delivers generated content to the user even if the database connection fails.
- **Limit Enforcement**:
  - **Strict Storage Limits**: Server-side enforcement of cover letter caps (1 for Free, 4 for Pro).
  - **Smart Checks**: API now checks limits *before* generation to save AI credits.

## [1.2.0] - 2026-01-30

### ✨ New Features - Translation System (EN/ID)
- **Language Switcher**: Added EN/ID toggle button in navbar for instant language switching without page reload
- **Comprehensive Translation Coverage**:
  - **Navbar**: All navigation links (Home, Features, Pricing, FAQ, Login, Logout, Dashboard, Admin)
  - **Home Page**: Hero section, Features, Pricing, FAQ, Footer
  - **Dashboard**: Page title, subtitle, empty states, confirmation modals, action buttons
  - **LimitModal**: All upgrade prompts and Premium/AI/CV limit messages
  - **ChooseTemplate**: Page title, "Clear Data" button, "LOCKED" status, "Upgrade to Pro" button
  - **ClearDataModal**: Full translation including privacy notice
  - **Privacy & Terms Pages**: Page titles, navigation buttons, "Last updated" text
- **Mobile Responsiveness**:
  - **Core App**: Full responsive support down to 280px screen width for all pages (Home, Login, Dashboard, Privacy, Terms)
  - **CV Builder**:
    - **Sections**: Stacked layout for mobile, responsive container heights, scaled preview
    - **Fill**: "Forms First" ordering (forms above preview), responsive padding, auto-resizing containers
    - **Preview**: Responsive typography and padding for all CV templates (Minimal, Modern, Corporate, Creative, Executive)
    - **Review**: Stacked layout for scores and summaries, responsive button groups
    - **Choose Template**: Grid changes to single column on mobile, visible selection borders
  - **Admin Panel**: Optimized grid layout (1 column), scrollable user tables, responsive stat cards
  - **Modals**: Flexible width and padding for Limit, Alert, Confirm, and ClearData modals
  - **Navbar**: Hamburger menu implementation for mobile navigation

### 🛠 Improvements
- **Pakasir Payment Flow Enhancements**:
  - Fixed payment button error handling across all pages (LimitModal, Home pricing section)
  - Replaced browser `alert()` popups with professional styled `AlertModal` component
  - Added specific 401 Unauthorized detection: Now prompts "Please log in first to upgrade to Pro" and redirects to `/login`
  - Display actual API error messages instead of generic "Failed to create payment"
  - Consistent error handling in both LimitModal and Home page "Go Pro" buttons
- **Better UX for Payment Flow**:
  - All payment errors now show in beautiful neobrutalist-style modals
  - Auto-redirect to login page when user needs authentication
  - Clear, actionable error messages for better user guidance
- **Consistent Design**: All notifications now use neobrutalist-style modal instead of ugly browser alerts
- **Translation Infrastructure**:
  - Created `LanguageContext` for global language state management
  - Created `translations.ts` with type-safe translation keys
  - Wrapped app in `LanguageProvider` for React Context

### 📝 Technical Details
- **Translation Files**:
  - `contexts/LanguageContext.tsx` - React Context for language state
  - `lib/i18n/translations.ts` - Translation dictionary (EN/ID)
- **Components Updated**:
  - `Navbar.tsx` - Added language switcher
  - `Home.tsx` - Translated all sections + replaced alerts with AlertModal
  - `LimitModal.tsx` - Full translation + replaced alerts with AlertModal  
  - `ClearDataModal.tsx` - Full translation
  - `ChooseTemplate.tsx` - Translated UI elements
  - `app/dashboard/page.tsx` - Full translation
- **Pages Updated**:
  - `app/privacy/page.tsx` - Translated header/navigation
  - `app/terms/page.tsx` - Translated header/navigation

### 💎 Polish & Refinements
- **Cover Letter Wizard**:
  - **Saved Letters**: Now possible to open and edit previously generated cover letters from the dashboard.
  - **Mobile Experience**: Optimized button layouts to prevent cramping on smaller screens.
  - **Live Credit Updates**: AI credit counter now updates instantly after generating a letter.
  - **UI/UX**: Improved "Download PDF" button style and "Start Over" hover effects.
- **Pricing & Landing Page**:
  - Updated Pricing section to clearly list "AI Cover Letter" features for Free and Pro plans.
  - Corrected feature icons and descriptions in the Pricing table.

---

## [1.1.0] - 2026-01-27

### ✨ New Features
- **Premium Templates**: Introduced "Executive" template with a dark sidebar and gold accents, designed for high-tier professionals.
- **Premium Locking System**:
  - **Choose Template**: Premium templates ("Modern", "Creative", "Executive") now display a "👑 PRO" badge.
  - **Preview Mode**: Non-Pro users can see full, unblurred previews of premium templates in the grid.
  - **Hover Lock**: Hovering over a premium template fades in a "LOCKED" overlay with a blur effect.
  - **Selection Blocking**:
    - **Grid**: Clicking a locked template triggers the Selling Modal.
    - **Dropdowns**: In "Sections" and "Fill" pages, premium templates are marked with `🔒`. Selecting them triggers the Selling Modal and reverts the choice.
- **Selling Modal**:
  - Replaced browser alerts with a professional `LimitModal` upsell.
  - Custom "Premium Template" mode with persuasive copy.
  - "Upgrade to Pro" call-to-action (Black text on Yellow background).

### 🛠 Improvements
- **UI Polish**: Standardized button styling for "Upgrade to Pro" to be consistent with the Pro branding (Yellow/Black).
- **Security**: Closed loopholes where users could switch to premium templates during the editing phase.

### 🐛 Bug Fixes
- **Build Fix**: Resolved `Duplicate identifier 'aiCredits'` error in `components/Fill.tsx`.
