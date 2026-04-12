# UI/UX Improvement Plan — Recv.AI

> Last updated: 2026-04-13 12:24 AM

## Overview

8 items reported across 3 difficulty tiers. Items #1–#4 shipped. Items #4.5 ✅ Done. Item #3 ⚠️ Ongoing (5 attempts). Item #5 pending.

---

## ~~Session A — Quick Polish~~ ✅ DONE

### ~~#1 — Mobile Footer Layout Fix~~ ✅ DONE

**Problem:** On mobile, the footer copyright line breaks awkwardly ("Made with" / ❤️ / "by ZCo Studio." on separate lines), and the nav links (Privacy, Terms, Contact, Instagram) have inconsistent spacing with Instagram orphaned on its own row.

**Fix applied:** Wrapped copyright in a single `<span>` with `whitespace-nowrap`, made links row `flex-wrap: wrap; justify-content: center; gap` so all 4 links flow naturally.

---

### ~~#2 — Language Toggle Animation~~ ✅ DONE

**Problem:** The EN/ID language switcher in the navbar had no Framer Motion animation — it was the only interactive element without the v1.3.1 physics treatment.Le

**Fix applied:**
- Wrapped toggle button in `motion.button` with spring physics (`stiffness: 400, damping: 25`)
- Added `whileHover={{ scale: 1.05 }}` and `whileTap={{ scale: 0.92 }}`
- Used `layoutId="lang-pill-desktop/mobile"` on a `motion.span` for a sliding pill effect between EN and ID

---

## ~~Session B — Fill Page Animation Isolation~~ ✅ DONE (Revised + 4th attempt)

### ~~#3 — Fill Page Section Animation Bleed~~ ✅ DONE

**Problem:** When a new card is added to one section (e.g., Experience), items in *all sections below* (Education, Skills, etc.) play positional animations simultaneously — sliding down to their new position. The language toggle in the Navbar was also affected.

**Root cause analysis (3 attempts):**

#### Attempt 1 — `LayoutGroup` (WRONG ❌)
Wrapped each section's `Reorder.Group` in `<LayoutGroup id="section-name">`. This was the wrong tool — `LayoutGroup` only scopes `layoutId` shared-element transitions. It does NOT prevent a `Reorder.Item`'s internal `layout` animation from firing when its DOM position physically changes due to content above growing.

#### Attempt 2 — `layoutDependency` (WRONG ❌)
Added `layoutDependency={cvData.<section>}` to each `Reorder.Item`, hoping it would tell Framer Motion to only re-measure layout when that specific value changes. This prop was **silently ignored** — it compiled without error but had zero effect. It's not a supported prop on `Reorder.Item` in the installed Framer Motion version.

#### Attempt 3 — Drag-state-gated `layout` (WRONG ❌)
Set `layout={draggingSection === 'section' ? true : undefined}` on every `Reorder.Item`. This reduced bleed during passive state but did NOT fix it when adding items — because `LayoutGroup` wrappers were still connecting all sections' layout scopes together, and `Reorder.Item` still participates in the parent measurement pass even with `layout={undefined}`.

#### Attempt 4 — `layoutRoot` isolation (WRONG ❌)
Converted all 6 section card `<div>` → `<motion.div layoutRoot>` and removed all `<LayoutGroup>` wrappers. The theory was that each section would become a sealed Framer Motion layout tree, preventing cross-section measurement propagation.

**What `layoutRoot` does NOT fix:** the bleed is not a *layout position animation* — it is the `initial → animate` **enter transition** re-firing on already-mounted items. `layoutRoot` only scopes layout measurements; it has no effect on whether `initial`/`animate` re-triggers on existing nodes. The root cause is that Framer Motion's `Reorder.Item` (or `AnimatePresence`) re-evaluates children's initial states when the parent `Reorder.Group` receives a new `values` reference, even if the array contents are identical.

#### ~~Attempt 5 — CSS `@keyframes` enter animation~~ ✅ DONE

Removed `initial`/`animate` from all 6 `DraggableReorderItem` usages in `Fill.tsx`. Wrapped each item's render-prop content in `<div className="card-enter">`. Added `@keyframes card-enter` + `.card-enter` to `app/globals.css`.

CSS `@keyframes` fire **exactly once** when first applied to a freshly-mounted DOM node — React/Framer Motion re-renders cannot retrigger them. This physically prevents cross-section animation bleed.

**Files modified:**
- `app/globals.css` — added `@keyframes card-enter` + `.card-enter` class
- `components/Fill.tsx` — stripped `initial`/`animate` from `DraggableReorderItemProps` type and component; added `card-enter` wrapper div in all 6 sections; kept `exit` + `layout` on FM

---

## ~~Session C.1 — Undo Delete Toast~~ ✅ DONE (Revised)

### ~~#4 — Undo Delete Toast on Fill Page~~ ✅ DONE

**Problem:** Deleting a card was instant and irreversible.

**Behaviour spec:**
- User clicks delete → item visually removed immediately
- A red toast appears: `"Experience deleted. Undo"` with a clickable **Undo** link
- If user clicks **Undo** within 5 seconds → item is re-inserted at its original position
- If toast expires → item stays deleted

**Implementation (with bug fixes):**

#### Toast Queue System (`app/page.tsx`)
The original implementation had two independent `<Toast>` render sites: one in `page.tsx` for auto-save, one in `Fill.tsx` for undo. They overlapped at `fixed top-24 right-6`.

**Fix:** Lifted to a single toast queue in `app/page.tsx`:
```tsx
const [toasts, setToasts] = useState<ToastItem[]>([]);

const addToast = (message, type, duration?, action?) => {
  const id = crypto.randomUUID();
  setToasts(prev => [...prev, { id, message, type, duration, action }]);
  return id;
};

const removeToast = (id) => {
  setToasts(prev => prev.filter(t => t.id !== id));
};
```
`addToast` and `removeToast` are passed down to `<Fill>` as props.

#### Toast Stacking (`components/Toast.tsx`)
Added `offsetIndex?: number` prop. Each toast renders at `top: ${96 + offsetIndex * 80}px` via inline style, so they stack vertically without overlap.

#### Stale Closure Fix (`components/Fill.tsx`) — Attempt 1 (WRONG ❌)
The undo button didn't work because `handleUndoDelete` captured `pendingDelete` as `null` in its closure at the time it was passed to `addToast`. The action callback "froze" the state value.

**First fix (had a snapshot bug):** Replaced `pendingDelete` state with `pendingDeleteRef` (a ref) and stored a `snapshotCvData` (shallow copy of `cvData` at deletion time) so undo would restore from it.

**Problem with snapshots:** Deleting B then A would snapshot `[A,B]` then `[A]`. Undo spliced A back into snapshot `[A]` → produced `[A, A]`. Rapid delete+undo cycles compounded duplicates (3, 4, 6+ items).

#### Stale Closure Fix — Attempt 2 (CORRECT ✅)
Removed `snapshotCvData` entirely. Instead, use a **`cvDataRef`** that always points to the latest `cvData`:

```tsx
// Always synced to latest cvData on every render
const cvDataRef = useRef(cvData);
cvDataRef.current = cvData;

// Stores only the deleted item — NO snapshot
const pendingDeleteRef = useRef<{ field, item, idx, label } | null>(null);

const handleUndoDelete = React.useCallback(() => {
  const pd = pendingDeleteRef.current;
  if (!pd) return;
  // Read CURRENT cvData from ref, not a frozen snapshot
  const currentData = cvDataRef.current;
  const arr = [...(currentData[pd.field] as unknown[])];
  arr.splice(pd.idx, 0, pd.item);
  setCvData({ ...currentData, [pd.field]: arr });
  // cleanup...
}, [setCvData, removeToast]);
```

Key insight: `cvDataRef.current` is updated on every render (`cvDataRef.current = cvData`), so when the frozen `handleUndoDelete` callback runs inside the toast, it reads the **live** current state, not a stale copy.

#### Toast Spam Fix (`app/page.tsx`)
Auto-save was calling `addToast` on every save cycle, stacking "Saving changes..." / "Changes saved!" infinitely.

**Fix:** Track the active save toast ID via `saveToastIdRef`. Before adding a new save toast, remove the previous one. Before showing the result toast, remove the "Saving changes..." toast.

#### Delete Toast Color
Changed `type="info"` (blue) → `type="error"` (red) for the delete undo toast.

#### Save Toast Overwrite Fix (`app/page.tsx`)
Even after the spam fix, the **result** toast ("Changes saved!") was not tracked by `saveToastIdRef`. Each save cycle added a new one without removing the old one, causing the green toasts to pile up (visible in screenshot: 4–5 "Changes saved!" stacked).

**Fix:** `saveToastIdRef` now also tracks the result toast (`addToast('Changes saved!', 'success')` return value). The next save cycle removes whatever toast is currently tracked — whether it's a "Saving changes..." or "Changes saved!" — before adding a new one. At most 1 save-related toast is visible at any time.

#### Mobile Toast Sizing (`components/Toast.tsx`)
Toast was too large on mobile — thick 4px border, large padding, and full-width text blocked significant screen real estate.

**Fix:** Responsive classes:
- Padding: `px-3 py-2` → `md:px-6 md:py-4`
- Border: `border-2` → `md:border-4`
- Text: `text-xs` → `md:text-base`
- Right offset: `right-3` → `md:right-6`
- Max width: `max-w-[90vw]` on mobile to prevent overflow
- Stacking gap: `56px` on mobile vs original `80px`
- Icon/close button: proportionally smaller with `md:` breakpoints

---

## Session C.2 — Remaining Items

### ~~#4.5 — Mobile Drag Scroll Conflict~~ ✅ DONE

**Problem:** On mobile, touching and swiping down on any card accidentally triggers drag-and-drop reorder even when the user's intent is to scroll. `Reorder.Item` listened to ALL pointer events on the entire card surface.

**Fix applied:**
- `dragListener={false}` on all `Reorder.Item` — card body no longer initiates drag
- `useDragControls` hook lifted into a `DraggableReorderItem` wrapper component (defined before the `Fill`/`Sections` function so the hook call is valid at component level)
- Each `<GripVertical>` icon wrapped in `<div onPointerDown={startDrag} style={{ touchAction: 'none', cursor: 'grab' }}>` — only the grip handle can start a drag
- `cursor-grab active:cursor-grabbing` removed from card `className`

**Files modified:**
- `components/Fill.tsx` — all 6 sections (Experience, Education, Skills, Projects, Certification, Language) converted to `DraggableReorderItem`
- `components/Sections.tsx` — section reorder list converted to `DraggableSectionItem` (same pattern)

---

---

## Session D — Animation Bleed Attempt 5

### #3 (cont.) — Fill Page Animation Bleed ⚠️ Ongoing (Attempt 5 did not fully fix)

**Confirmed problem:** Pressing "Add Experience" causes existing cards in Education, Skills, Projects etc. to re-play their `initial → animate` entrance animation (`opacity: 0, y: 16 → opacity: 1, y: 0`). They should not animate at all — they were already mounted and visible.

**Why this happens (current best theory):** When `setCvData` is called, React re-renders `Fill`. Framer Motion's `Reorder.Group` or the surrounding `AnimatePresence` appears to re-evaluate its children's animation state when the parent re-renders, even though `cvData.education` is the same array reference. This causes the `initial` pose to be re-applied to already-mounted `Reorder.Item` nodes, triggering a spurious enter animation.

> The `layoutRoot` fix (Attempt 4) narrowed the scope of layout measurements but **did not address** enter animation re-triggering, because `layoutRoot` only affects layout/position animations, not `initial`/`animate` transition state.

---

#### Option A — CSS `@keyframes` for enter animation (USER's IDEA ✅ Recommended)

**The user's core insight:** give each section its own animation identity so cross-section triggering is impossible. The refined version isn't about unique class names per section — it's about **removing the enter animation from Framer Motion's control entirely** and handing it to pure CSS.

CSS `@keyframes` animations fire **exactly once**, when a class is first applied to a freshly-mounted DOM node. They are physically incapable of re-triggering on an already-mounted element just because a React parent re-rendered. No Framer Motion re-render cycle can touch them.

```css
/* app/globals.css */
@keyframes card-enter {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
.card-enter {
  animation: card-enter 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
```

```tsx
// Inside DraggableReorderItem — wrap content in the animated div
{({ startDrag }) => (
  <div className="card-enter">
    {/* grip + card content */}
  </div>
)}
```

**Changes required:**
- `app/globals.css` — add `@keyframes card-enter` + `.card-enter` class
- `components/Fill.tsx` — remove `initial` and `animate` from all 6 `DraggableReorderItem` calls; add `<div className="card-enter">` inside each item's render prop
- Keep `exit` on `DraggableReorderItem` (FM still handles removal via `AnimatePresence` — only exit needs FM)
- Keep `layout` on items (FM still handles drag-reorder displacement — this is a separate system from enter animations)

**Trade-off:** Enter animation uses CSS `cubic-bezier` spring approximation instead of FM spring physics. Visually near-identical. Exit animation stays as FM spring. Drag reorder stays as FM layout.

> Unique class names per section are **not needed** — CSS animation isolation is per-DOM-node by design. One shared `.card-enter` class is enough.

---

#### Option B — FM-native: move `initial`/`animate` to inner `motion.div` (Alternative)

Keep Framer Motion but remove `initial`/`animate`/`exit` from `Reorder.Item` and put them on a `motion.div` wrapper inside the item. `Reorder.Item` becomes layout-only:

```tsx
<DraggableReorderItem value={exp} layout className="...">
  {({ startDrag }) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      {/* content */}
    </motion.div>
  )}
</DraggableReorderItem>
```

**Problem:** `exit` animations require the element to be a **direct child of `<AnimatePresence>`**. Moving exit to an inner `motion.div` breaks the removal animation. Solvable with a nested `<AnimatePresence>` inside the item but that creates an isolated animation context which may not unmount correctly.

**Verdict:** Option A is cleaner — no edge cases, zero FM involvement in the enter path.

---

### #5 — Review Page — Live CV Preview with AI Highlights ✅ DONE

**Problem / Vision:** The Review page shows AI score and improvements on one side, but the CV preview is hidden off-screen. The user wants a split-pane layout where the preview is visible and AI-flagged fields are highlighted.

**Layout change:**
- Desktop: Split pane — analysis panel (left ~45%) + live CV preview (right ~55%)
- Mobile: Stacked — analysis panel above, preview below (collapsible toggle)

**Highlight behaviour:**
- Each improvement card has a `target_path` (e.g., `experience[0].description`)
- When hovering an improvement card → the corresponding field in the CV preview gets a yellow highlight ring
- When clicking "Fix with AI" → the field in the preview animates to the new value

**Files to modify:**
- `components/Review.tsx` — add visible preview pane, `hoveredPath` state
- `components/CVPagedContent.tsx` — accept `highlightedPath` prop, add highlight ring

> **Note:** This is the most complex item (~4–6 hr). Best tackled as its own dedicated session after #4.5 is stable.

---

## Commit History

| Commit | Description |
|--------|-------------|
| `d9e5c6d` | Session A: Mobile footer + language toggle animation |
| `58bae4c` | Session B (attempt 1): LayoutGroup isolation |
| `d1397b4` | Bug fixes: layoutDependency attempt + toast queue + offsetIndex |
| `1a1ebf4` | Correct fixes: drag-state layout + undo ref + toast dedup |
| `f7e600a` | Fix undo duplication: cvDataRef instead of snapshot |
| `2b92703` | Save toast overwrite + mobile toast sizing (also includes layoutRoot attempt 4) |
| `40d41e6` | v1.3.5: Mobile drag grip handles, CSS card-enter (attempt 5), toast stacking fix, independent toast timers |
| `c28033c` | v1.4.0: Review page live preview with split-pane layout and AI highlighted fields |

---

## Priority Summary

| # | Item | Status | Complexity |
|---|------|--------|------------|
| 1 | Mobile footer layout | ✅ Done | 🟢 Easy |
| 2 | Language toggle animation | ✅ Done | 🟢 Easy |
| 3 | Fill page animation bleed | ⚠️ Ongoing (5 attempts, CSS approach applied) | 🟡 Medium |
| 4 | Undo delete toast | ✅ Done (3rd attempt) | 🟡 Medium |
| 4.5 | Mobile drag scroll conflict | ✅ Done (Fill + Sections) | 🟡 Medium |
| 5 | Review page live preview | ✅ Done | 🔴 Complex |
