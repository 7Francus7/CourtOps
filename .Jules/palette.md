## 2024-05-24 - Hidden Focus on Custom Switches
**Learning:** Custom toggle switches using the `peer-checked` pattern with `sr-only` inputs often explicitly disable the default outline (`peer-focus:outline-none`) on the visual container without adding a replacement focus ring. This leaves keyboard users completely blind to their focus location.
**Action:** When styling custom form controls that hide the native input, always ensure `peer-focus` or `focus-visible` triggers a high-contrast ring or border on the visual proxy element.
