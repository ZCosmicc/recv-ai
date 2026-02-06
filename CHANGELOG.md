# Changelog

## [Released]

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
