# Changelog

## [Unreleased] - 2026-01-27

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
