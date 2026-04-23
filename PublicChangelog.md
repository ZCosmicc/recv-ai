# Changelog

All user-facing updates and improvements to Recv. AI.

## [1.5.2] - 2026-04-23

### ✨ New in This Update
- **"Currently Enrolling" for Education 🎓**: Still in school? We heard you! We've added a new **"Currently enrolling"** checkbox to the Education section in the CV builder. Tick it and the graduation date field disappears — and every single one of our CV templates will automatically show **"Present"** in its place. No more awkward blank dates or manual workarounds.

### 🐛 Fixes & Improvements
- **Easier Reordering on Mobile**: Rearranging your CV sections on a phone was a bit of a struggle — the drag handle was tiny and easy to miss. We've made the grip area significantly larger and added a clear grip icon, so reorganising your sections is now much smoother without accidentally scrolling the page at the same time.
- **Section Order No Longer Resets**: This one was sneaky. If you reordered your sections and then quickly tapped "Next: Fill Section", your new order could vanish and snap back to the default the next time you opened your CV. That reset is now gone — your section order is saved the moment you move on.
- **AI Review Responds in the Right Language**: If your CV is written in English but contains Indonesian place names (like "Jakarta" or "Universitas Indonesia"), the AI reviewer was sometimes replying entirely in Bahasa Indonesia. We've taught it to look at the actual content of your descriptions — not just proper nouns — to figure out what language your CV is in. English CV? English feedback. Simple as that.
- **Correct AI Credit Count in Cover Letter Editor**: Pro users were seeing "50 credits" and Free users were seeing "1 credit" in the Cover Letter editor — both wrong. The displayed credit count now correctly reflects your plan: **Pro = 30**, **Starter = 10**, **Free = 1**.
- **No More "Saving..." When You Haven't Changed Anything**: Every time you navigated between the Sections, Fill, Review, or Cover Letter pages, you'd see a "Saving changes…" notification pop up — even if you hadn't touched a single thing. That was a false alarm caused by an internal timing issue. Auto-save now only triggers when you've actually made a change to your CV. Your feed stays quiet while you're just browsing.

## [1.5.1] - 2026-04-21
### ✨ Enhance Your Workflow with CV Duplication!
- **One-Click CV Duplication**: A highly requested feature has finally landed! You can now duplicate any of your existing CVs right from your dashboard. It's the perfect way to quickly tailor a "Marketing" version and a "Design" version of your resume without having to start entirely from scratch.
- **Cleaner Dashboard Cards**: We've tidied up the interface on your CV and Cover Letter cards! The floating action icons have been consolidated into a clean, modern `⋯` menu. It's much less cluttered, perfectly organized, and makes editing on mobile devices feel extra spacious. 

### 🛡️ Enhanced Platform Security & Reliability
- **Self-Service Safety**: We've added a server-side confirmation requirement for account deletions, ensuring your data is never removed accidentally.
- **Accurate Credit Limits**: Fixed a bug where **Starter** subscribers were seeing incorrect credit limits. Your 10 daily AI credits are now correctly applied across all AI features!
- **Under-the-Hood Hardening**: Completed a comprehensive security audit! We've implemented advanced binary file verification, payment anti-replay protection, and atomic request handling to keep your experience secure and snappy.
- **Browser-Level Protection**: Your session is now shielded by industry-standard security headers, protecting you from common web-based threats like clickjacking.

### 🐛 Bug Fixes & Polish
- **Dashboard Cards No Longer Cut Off on Mobile**: The cover letter and CV cards in your dashboard were getting clipped on the right side on smaller screens, hiding the document title. Both card types are now fully contained and long titles gracefully truncate with an ellipsis (…) instead of overflowing.
- **Cover Letter Notifications Now Appear in the Right Place**: The "Saving draft…" and "Draft saved!" pop-up messages in the Cover Letter editor were appearing below the page content. They now correctly show up in the top-right corner, just like every other notification in the app.
- **Previously Generated Cover Letters Are Now Viewable Again**: This was a sneaky but important one — if you'd already generated a cover letter and later opened it from your dashboard, you'd land on the Job Details form instead of seeing your letter. Even worse, clicking "Generate Letter" again would silently overwrite your original. The root cause was an auto-save bug that was erasing the letter content in the background every time you changed a field. This is now fully fixed. Your generated letter is safely preserved, and we've also added a **"View Generated Letter →"** button so you can jump straight to your saved letter at any time without needing to re-generate it.

## [1.5.0] - 2026-04-20
### ✨ Explore Our New Template Gallery!
- **Dynamic Previews:** We've launched a brand new **[Template Showcase](/templates)** page where you can explore all our designs in full high-resolution. No more static screenshots—you see exactly what the CV looks like in the live builder!
- **Perfect Scaling:** Whether you're on a phone or a laptop, our new gallery perfectly scales each design so you can pick the best layout for your industry before you even start building.
- **Professional Guidelines:** We've added "Best For" sections for every template, giving you expert advice on whether a design fits more formal corporate roles, creative marketing paths, or technical engineering applications.

### 🌐 Better Search & Visibility
- **Finding Us is Easier:** We've significantly upgraded our technical SEO. You can now more easily find Recv. AI when searching for professional tools like "AI CV Maker" or "Web CV Online."
- **Seamless Local Experience:** Improved our language detection for search engines so that users in Indonesia and around the world always land on the right version of the platform.

## [1.4.3] - 2026-04-20
### ✨ Introducing the Starter Plan!
- **Affordable Premium Access:** We’ve launched the brand new **Starter Plan** for just **Rp 5.000**! It’s the perfect middle ground if you need a professional boost without a full Pro subscription.
  - **Premium Templates:** Get full access to Syntax, Executive, and all other premium designs.
  - **No Watermarks:** Export unlimited PDFs with a clean, professional finish.
  - **Boosted Limits:** Save up to 2 CVs and get 10 AI credits every single day.
  - **Cover Letters:** You can now create and save 2 AI-generated cover letters to kickstart your applications.

### 🚀 Smoother Success Journey
- **Personalized Success Messages:** When you upgrade, your success message is now specifically tailored to your new plan, showing you exactly what benefits you've unlocked in your preferred language.
- **Full Support for Indonesian:** We’ve finished localizing every single limit prompt, button, and description across the app. Whether you speak English or Bahasa Indonesia, the experience is now 100% seamless! Please let us know if we miss something!

## [1.4.2] - 2026-04-15
### ✨ New Templates
- **Developer Templates:** Meet **Syntax** and **Syntax Nano** — two sleek, terminal-inspired templates crafted specifically for software engineers. Complete with beautiful monospaced typefaces, these new premium additions perfectly merge structure with readability to help your professional background pop.
- **More Free Options:** We've shifted our robust **Creative** template from Premium down to the Free tier. Enjoy building beautiful layouts! 

### 🧠 Smarter AI Feedback
- **Native Language Detection:** You no longer need to translate your English recommendations! The AI Review system will natively detect if your CV is written in Bahasa Indonesia or any other language, and it will respond with analysis, strengths, and fix suggestions entirely in your native language.
- **Spam Rejection Guardrails:** We've upgraded the AI model's engine protections to actively reject attempts to insert irrelevant copy-paste material into the CV structure. Your CV builder will strictly maintain its professional environment.

### 🎨 Design Polish
- **Crisp Vector Icons:** Look closely and you'll notice our templates just got much sharper! We've systematically replaced all older text-message emojis (like 📧 and 📞) across our templates with razor-sharp vector SVG icons. No more blurry phone markers when scaling your CVs to massive PDFs!
- **Clarity in Editing:** Added a straightforward "Graduation Date" placeholder tag within the Education block of the Fill editor to clear any formatting ambiguity when adding dates to schools!

## [1.4.1] - 2026-04-14
### ✨ SEO & Branding
- **Better Link Sharing**: Sharing Recv. AI with your friends or colleagues on WhatsApp, Twitter, or Discord will now display a beautiful preview card of the application instead of an empty box.
- **Official Favicon**: We've updated our browser tab icon to the official Recv. AI logo, replacing the default placeholder.

### 🐛 Bug Fixes & Polish
- **Mobile Suggestion Controls**: The 'Ignore' button for dismissing AI suggestions is now always visible on phones and tablets. Previously, it only appeared when hovering with a mouse, which made it tricky to use on touch screens.
- **Preview Page Precision**: Fixed a phantom bug where the live CV preview in the Review page would sometimes mistakenly display an extra blank page at the very end of the document.
- **Notification Fixes**: Solved an issue where multiple popup notifications (like applying an AI fix and auto-saving simultaneously) would directly overlap and hide each other. They now sort themselves out smoothly.

## [1.4.0] - 2026-04-13
### ✨ New Features
- **Review Page CV Live Preview**: We completely redesigned the AI Analysis page! It now features a split-pane layout with a sticky Live View of your CV right next to the AI Feedback. You no longer have to blindly guess what the AI is talking about or bounce back to the editor—you see everything exactly as it'll look on your actual CV, instantly.
- **Glanceable AI Highlights**: Immediately spot exactly what the AI wants you to fix. Suggested improvements now emit a soft, faded yellow highlight across your CV preview, making it extremely mobile-friendly to locate suggestions at a glance.
- **Interactive Highlighting**: When you hover your mouse over an AI suggestion card on the Review page, you'll see a bright yellow highlight lock onto the exact field it's referencing in your Live Preview CV. It feels *magical*.

### 🐛 Bug Fixes & Polish
- **Removed Ghost Pages**: We eradicated a visual bug where the CV preview would occasionally tack on an entirely blank A4 page at the very end of your document due to empty underlying sections triggering the engine. Your pagination previews should now be precise.
- **Sidebar Highlights Now Work for Creative & Executive Templates**: The left-side panel for both the Creative and Executive templates now correctly lights up with AI suggestion highlights alongside the main content area.
- **'Remove with AI' Now Actually Removes**: Clicking "Remove with AI" on a suggestion was incorrectly writing a message into your CV field instead of deleting the item. It now correctly removes the flagged entry from your CV.
- **'Fix Applied' Toast Now Appears at the Top**: The success notification after applying an AI fix was incorrectly appearing at the bottom of the page. It now shows up in the top-right corner where all other app notifications appear.

## [1.3.5] - 2026-04-12
### 🐛 Bug Fixes & Polish
- **Mobile Drag Fixed — Scroll Without Accidentally Reordering:** On phones and tablets, swiping up or down on a CV card in the builder was sometimes triggering the reorder drag instead of scrolling the page. This has been fixed — dragging to reorder now only activates when you grab the **grip handle** (⠿) on the left side of each card. Scrolling the rest of the card works naturally again.
- **Notification Toasts No Longer Overlap:** When multiple notifications appeared at once (for example, after deleting several items quickly), they were stacking on top of each other and becoming unreadable. They now stack neatly in a clean column with proper spacing between them.
- **Each Notification Has Its Own Timer:** Previously, notifications would all expire at the same time — the newer ones would reset the clock for the older ones. Now each notification independently counts down from the moment it appears, so older ones disappear first as expected.

## [1.3.4] - 2026-04-06
### ✨ UI & Animation Polish
- **Fixed Mobile Footer:** The footer copyright text was awkwardly breaking across multiple lines on phones. It now reads cleanly in a single line on all screen sizes, and the Privacy / Terms / Contact / Instagram links all sit neatly on one row.
- **Language Toggle Polish:** The EN | ID language switcher in the top navigation bar now has a smooth animated pill that slides between the two options when you switch — consistent with the rest of the app's feel.
- **Smarter CV Builder Animations:** Fixed a confusing visual glitch in the CV Builder where adding a new card in one section (e.g. Certifications) would also trigger animations in completely unrelated sections below it (e.g. Languages). Each section now animates independently — only the section you're actively editing moves.
- **Undo Delete:** Accidentally deleted an Experience entry, Skill, Certification, or any other card in the CV Builder? No more panic! Deleting anything now shows a quick **"Deleted. Undo"** notification at the top of the screen. You have 5 seconds to take it back — your data will be restored exactly where it was.

## [1.3.3] - 2026-04-05
### 🚀 Drag & Drop Stability + Deep Fixes
- **Perfected Drag Handling:** We completely eradicated an annoying visual bug in the CV Builder where dragged sections (like Experience or Education) would aggressively overlap or conflict with each other. Dragging any card now works perfectly cleanly, respecting boundaries seamlessly without visually glitching.
- **Recovered Local Sessions:** We implemented an under-the-hood engine fallback to instantly fix older, offline-cached CVs that were locking up the interface or refusing to drag correctly. Moving forward, returning users won't experience dead cards.
- **Smarter AI Cover Letter Connections:** Underwent a massive data-architecture upgrade that dramatically slims down how your resume speaks to our AI APIs without you having to re-enter anything, optimizing accuracy when your Cover Letters are generated.

### 🛡️ Security & Trust
- **Routine Security Audit:** We conducted a thorough security review of all new features added over the past few months. Several improvements were made behind the scenes to further protect your data, account, and emails. Your experience doesn't change — it's just safer.
- **Email Protection Upgraded:** We've strengthened our email domain security settings (DMARC) so it's even harder for bad actors to impersonate Recv. AI in your inbox. Any suspicious email pretending to be from us will now be automatically flagged as spam by your mail provider.


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
