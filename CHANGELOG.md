# Changelog

## [Unreleased] - 2026-01-30

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

### 🛠 Improvements
- **Better UX for Payment Flow**:
  - Replaced browser `alert()` with styled `AlertModal` in LimitModal
  - Replaced browser `alert()` with styled `AlertModal` in Home page pricing section
  - Better error messages: Now shows specific error from API instead of generic message
  - 401 Unauthorized handling: Prompts user to log in and redirects to `/login`
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
  - `app/privacy/page.tsx` - Translated header/navigation
  - `app/terms/page.tsx` - Translated header/navigation

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
