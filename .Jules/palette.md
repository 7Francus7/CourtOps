## 2025-10-24 - Accessibility Patterns in Modals
**Learning:** Found a pattern of using `div` with `onClick` for buttons (e.g., footer actions) and missing ARIA labels on icon-only buttons (close icons). This hurts keyboard navigation and screen reader support.
**Action:** Always verify interactive elements are semantic `<button>`s and icon-only buttons have `aria-label`. Check inputs have labels beyond placeholders.
