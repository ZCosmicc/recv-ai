# Changelog

All user-facing updates and improvements to Recv. AI.

## [1.3.3] - 2026-04-05
### 🚀 Drag & Drop Stability + Deep Fixes
- **Perfected Drag Handling:** We completely eradicated an annoying visual bug in the CV Builder where dragged sections (like Experience or Education) would aggressively overlap or conflict with each other. Dragging any card now works perfectly cleanly, respecting boundaries seamlessly without visually glitching.
- **Recovered Local Sessions:** We implemented an under-the-hood engine fallback to instantly fix older, offline-cached CVs that were locking up the interface or refusing to drag correctly. Moving forward, returning users won't experience dead cards.
- **Smarter AI Cover Letter Connections:** Underwent a massive data-architecture upgrade that dramatically slims down how your resume speaks to our AI APIs without you having to re-enter anything, optimizing accuracy when your Cover Letters are generated.

## [1.3.2] - 2026-04-04
### ✨ Animations & Mobile Fixes
- **Animated Navigation Menu:** The mobile hamburger menu now opens and closes with a smooth slide-down animation. The `☰` and `✕` icons rotate through each other instead of swapping instantly. Menu links also cascade in one by one for a polished feel.
- **Smoother CV Builder:** When you add a new Experience, Education, Skill, Project, Certification, Language, or Custom Field entry in the CV Builder, it now slides in smoothly instead of just appearing. Deleting an entry also animates out gracefully.
- **Better Section Reordering:** Dragging sections to reorder them in the CV Builder now works on **all devices including iPhones**. Sections also visually slide out of the way as you drag, making it much clearer where things will land.
- **Consistent Cursor:** Hovering over any button, dropdown, or interactive element across the entire site now correctly shows the hand pointer — no more inconsistent mix of arrow and hand cursors depending on which element you hover.
- **Mobile Layout Fixes:** Fixed cards in the Features and Pricing sections touching the screen edge on mobile. Also fixed the "Label" input in Custom Fields being squashed on narrow screens — it now stacks neatly above the Value input on mobile.

## [1.3.1] - 2026-04-02
### 🚀 Performance & Feel
- **Buttery Smooth Interactions:** We completely rebuilt the engineering behind our buttons and animations. Hovering and clicking around the application now uses advanced, hardware-accelerated physics. This removes any feeling of "heaviness" or stuttering—everything feels snappy, premium, and alive!
- **Silky Scrolling:** We replaced the browser's default choppy scrolling engine with a professional smooth-scrolling system. Gliding down pages and reading through your CV preview is now incredibly fluid.
- **Global Entrance Animations:** Every single page and list across the application now slides in beautifully on staggered delays. No more jarring page loads—everything cascades smoothly as you work.

## [1.3.0] - 2026-04-01
### ✨ New Features
- **In-App Support Tickets:** You can now easily report bugs, suggest features, or get help with your account directly from any page. Just click the "Support" button in the bottom right corner. You can even attach up to 3 screenshots to help us understand the issue faster!
- **Data Privacy Control:** Added a new "Danger Zone" in your dashboard giving you complete control to permanently delete your account and all associated data safely and securely.
- **Live Changelog:** We've added this very page so you can always see the latest features, fixes, and improvements to Recv. AI!

## [1.2.7] - 2026-04-01
### 🐛 Bug Fixes & Improvements
- Fixed an issue where logged-in users visiting the login page would be asked to log in again instead of being taken to their dashboard.
- Fixed a frustrating bug where opening a saved CV would sometimes jump you back to the beginning of the form instead of letting you edit immediately.
- **Template Fixes:** Ensured your project links display correctly in all 5 templates, not just the Minimal template.
- Visually perfectly centered the custom field alignments in the Executive template to match the rest of the professional layout.
- Improved the accuracy of Pro plan expiration dates on your account dashboard.

## [1.2.6] - 2026-02-14
### 🌐 Custom Domain
- We're officially live on our new custom domain: **recv-ai.me**! All links and emails will now come from this verified, secure domain.

## [1.2.5] - 2026-02-11
### 🔐 Authentication
- **Google Login:** You can now sign up and log in securely using your Google account with just one click.

## [1.2.3] - 2026-02-07
### ✨ New Features
- **Projects Section:** Added a brand new "Projects" section to the CV builder! You can now easily showcase your personal and professional projects complete with descriptions, technologies used, and live links. These format beautifully across all 5 of our CV templates.

## [1.2.2] - 2026-02-06
### 🛠 Improvements
- **Payment Processing:** Improved the speed and reliability of our Pro plan upgrades so that your account updates instantly after a successful checkout.

## [1.2.1] - 2026-02-01
### ✨ New Features
- **Cover Letters:** Introduced AI-generated Cover Letters! You can now auto-generate professional cover letters perfectly tailored to your CV and the specific job description you're applying for.

## [1.0.0] - Launch
- **Initial Release:** Welcome to Recv. AI! The easiest way to build beautiful, ATS-friendly CVs that help you land more interviews.
