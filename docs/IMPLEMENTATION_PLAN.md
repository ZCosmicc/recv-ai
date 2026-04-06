# UI/UX Improvement Plan — Recv.AI

> Last updated: 2026-04-06 11:45 PM

## Overview

8 items reported across 3 difficulty tiers. Items #1–#4 shipped. Items #4.5 and #5 pending.

---

## ~~Session A — Quick Polish~~ ✅ DONE

### ~~#1 — Mobile Footer Layout Fix~~ ✅ DONE

**Problem:** On mobile, the footer copyright line breaks awkwardly ("Made with" / ❤️ / "by ZCo Studio." on separate lines), and the nav links (Privacy, Terms, Contact, Instagram) have inconsistent spacing with Instagram orphaned on its own row.

**Fix applied:** Wrapped copyright in a single `<span>` with `whitespace-nowrap`, made links row `flex-wrap: wrap; justify-content: center; gap` so all 4 links flow naturally.

---

### ~~#2 — Language Toggle Animation~~ ✅ DONE

**Problem:** The EN/ID language switcher in the navbar had no Framer Motion animation — it was the only interactive element without the v1.3.1 physics treatment.

**Fix applied:**
- Wrapped toggle button in `motion.button` with spring physics (`stiffness: 400, damping: 25`)
- Added `whileHover={{ scale: 1.05 }}` and `whileTap={{ scale: 0.92 }}`
- Used `layoutId="lang-pill-desktop/mobile"` on a `motion.span` for a sliding pill effect between EN and ID

---

## ~~Session B — Fill Page Animation Isolation~~ ✅ DONE (Revised)

### ~~#3 — Fill Page Section Animation Bleed~~ ✅ DONE

**Problem:** When a new card is added to one section (e.g., Experience), items in *all sections below* (Education, Skills, etc.) play positional animations simultaneously — sliding down to their new position. The language toggle in the Navbar was also affected.

**Root cause analysis (3 attempts):**

#### Attempt 1 — `LayoutGroup` (WRONG ❌)
Wrapped each section's `Reorder.Group` in `<LayoutGroup id="section-name">`. This was the wrong tool — `LayoutGroup` only scopes `layoutId` shared-element transitions. It does NOT prevent a `Reorder.Item`'s internal `layout` animation from firing when its DOM position physically changes due to content above growing.

#### Attempt 2 — `layoutDependency` (WRONG ❌)
Added `layoutDependency={cvData.<section>}` to each `Reorder.Item`, hoping it would tell Framer Motion to only re-measure layout when that specific value changes. This prop was **silently ignored** — it compiled without error but had zero effect. It's not a supported prop on `Reorder.Item` in the installed Framer Motion version.

#### Attempt 3 — Drag-state-gated `layout` (CORRECT ✅)
`Reorder.Item` internally enables `layout` to animate displacement during drag-and-drop. The fix: **only enable `layout` during an active drag**, and leave it `undefined` otherwise.

**Fix applied in `components/Fill.tsx`:**
```tsx
const [draggingSection, setDraggingSection] = useState<string | null>(null);

// On each Reorder.Item:
<Reorder.Item
  layout={draggingSection === 'experience' ? true : undefined}
  onDragStart={() => setDraggingSection('experience')}
  onDragEnd={() => setDraggingSection(null)}
  ...
>
```

Applied to all 6 `Reorder.Item` sections: experience, education, skills, projects, certification, language.

**Fix applied in `components/Navbar.tsx`:**
- Wrapped both desktop and mobile language toggles in `<LayoutGroup id="lang-toggle-desktop/mobile">` to isolate the `layoutId` pill from the global layout cascade
- Added `LayoutGroup` to the import from `framer-motion`

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

#### Stale Closure Fix (`components/Fill.tsx`)
The undo button didn't work because `handleUndoDelete` captured `pendingDelete` as `null` in its closure at the time it was passed to `addToast`. The action callback "froze" the state value.

**Fix:** Replaced `pendingDelete` state with `pendingDeleteRef` (a ref). The undo callback reads from the ref, which always has the latest value. Also stores a **snapshot** of `cvData` at deletion time so undo restores the exact pre-delete state:
```tsx
const pendingDeleteRef = useRef<{ field, item, idx, label, snapshotCvData } | null>(null);

const handleUndoDelete = React.useCallback(() => {
  const pd = pendingDeleteRef.current; // always current
  if (!pd) return;
  // restore from snapshot...
}, [setCvData, removeToast]);
```

#### Toast Spam Fix (`app/page.tsx`)
Auto-save was calling `addToast` on every save cycle, stacking "Saving changes..." / "Changes saved!" infinitely.

**Fix:** Track the active save toast ID via `saveToastIdRef`. Before adding a new save toast, remove the previous one. Before showing the result toast, remove the "Saving changes..." toast.

#### Delete Toast Color
Changed `type="info"` (blue) → `type="error"` (red) for the delete undo toast.

---

## Session C.2 — Remaining Items

### #4.5 — Mobile Drag Scroll Conflict ⏳ PENDING

**Problem:** On mobile, touching and swiping down on any card in the Fill page accidentally triggers drag-and-drop reorder, even when the user's intent is to scroll the page. `Reorder.Item` listens to ALL pointer events on the entire card surface.

**Approach:** `useDragControls` + `dragListener={false}`
- `dragListener={false}` disables automatic drag detection on the `Reorder.Item` body
- `dragControls.start(e)` on the grip icon's `onPointerDown` manually starts the drag
- `style={{ touchAction: 'none' }}` on the grip div tells the browser to surrender touch control only for that small handle area

**Files to modify:**
#### [MODIFY] `components/Fill.tsx`
1. Add `useDragControls` to the framer-motion import
2. Define a `DraggableReorderItem` wrapper component **before** the `Fill` function so it can call `useDragControls()` as a proper hook:
   ```tsx
   const DraggableReorderItem = ({ value, className, initial, animate, exit, transition, layout, onDragStart, onDragEnd, children }) => {
       const dragControls = useDragControls();
       return (
           <Reorder.Item
             value={value}
             dragListener={false}
             dragControls={dragControls}
             layout={layout}
             onDragStart={onDragStart}
             onDragEnd={onDragEnd}
             ...
           >
               {children({ onPointerDown: (e) => dragControls.start(e) })}
           </Reorder.Item>
       );
   };
   ```
3. Replace all 6 `<Reorder.Item>` blocks with `<DraggableReorderItem>` using a render prop
4. Wrap each `<GripVertical />` in a `<div onPointerDown={onPointerDown} style={{ touchAction: 'none', cursor: 'grab' }}>` so only the handle initiates drag
5. Remove `cursor-grab active:cursor-grabbing` from the card's `className` (no longer needed on the full card)

> **Note:** The 6 sections have two structural patterns: Experience/Education/Projects wrap their content in an inner `<div className="flex gap-2">`, so the grip is a child of that div. Skills/Certifications/Languages use the `Reorder.Item` itself as the flex row.

---

### #5 — Review Page — Live CV Preview with AI Highlights ⏳ PENDING

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

---

## Priority Summary

| # | Item | Status | Complexity |
|---|------|--------|------------|
| 1 | Mobile footer layout | ✅ Done | 🟢 Easy |
| 2 | Language toggle animation | ✅ Done | 🟢 Easy |
| 3 | Fill page animation bleed | ✅ Done (3rd attempt) | 🟡 Medium |
| 4 | Undo delete toast | ✅ Done (revised) | 🟡 Medium |
| 4.5 | Mobile drag scroll conflict | ⏳ Pending | 🟡 Medium |
| 5 | Review page live preview | ⏳ Pending | 🔴 Complex |
