# Design System — Line 11 Case Packer

This document captures the visual design language observed in the project (`src/styles.css`, `fonts.css`, `index.html`, and inline styles in `src/main.js`) so UI additions stay consistent.

## Overview

The app is a full-screen 3D product viewer (Three.js) with a UI chrome of floating "glass" panels, pill-shaped buttons, and slide-in/modal overlays layered on top of the canvas. The look is a light, neutral industrial-UI (greys) accented by a single brand orange, with dark translucent "glass" chrome for header/label elements. There is no traditional scrolling page — `html, body` are fixed/`overflow: hidden`, and everything is positioned via `fixed`/`absolute` overlays.

## Typography

- **Primary typeface:** `Noto Sans` (self-hosted via `fonts.css` with woff/eot/ttf/svg fallbacks, also loaded from Google Fonts in `index.html` as a backup). Applied explicitly per-element (`font-family: 'Noto Sans', sans-serif`) rather than globally on `body`.
- **Weights in use:** 400 (regular), 500 (medium/most UI labels), 550 (titles — e.g. `.hotspot-title`, `h1`), 600 (semibold — `strong`, `.step-done-btn`), 700 (bold — `.overlay-title`).
- **Sizes are mostly px, with a few pt values** for panel text (`10pt`–`14pt`) that pre-date the px-based nav UI:
  - Header title (`.header-title`): 16px / weight 300
  - Panel/body copy (`p`, `.hotspot-description`): 16px desktop → 9–12pt on mobile breakpoints
  - Titles (`.hotspot-title`, `.hazard-title`): 11–12pt
  - Small UI labels (nav text, mode buttons, cam labels): 11–13px, weight 500
  - Overlay title: 16px / weight 700; overlay subtitle: 13px / weight 400
- **Color of type** is context-dependent: black/dark grey text on light panels (`#E6E6E6`, `#d4d4d4` chrome), white text on dark glass chrome (header, mode label, loading screen).

## Color Palette

| Role | Color | Usage |
|---|---|---|
| Brand accent (primary action / active state) | `#EF5337` (orange-red) | Active mode button, active camera button, active hazard filter, primary overlay button, step "Done" button |
| Accent hover | `#d4452e` | Hover state of the orange accent buttons |
| Neutral chrome (light) | `#d4d4d4` | Default background for pill buttons, icon buttons, nav bar, camera controls, mode filter, mobile hazard toggle |
| Neutral chrome hover | `#c4c4c4` / `#b0b0b0` / `#c0c0c0` | Hover states of the above |
| Neutral outline | `#9e9e9e` | 1px outlines on light chrome elements (buttons, pills, panels) |
| Panel background (info/spec) | `#E6E6E6` | `.hotspot-info` description/spec panel background |
| Dark glass chrome | `#363d47` at ~40–65% alpha (`#363d4765`, `#363d47a1`, `rgba(54,61,71,0.45)`) + `backdrop-filter: blur(5px–10px)` | Top-left header, mode label, mobile hazard slide-in panel, header toggle button |
| Body text on dark chrome | `#fff` / `#eee` / `#d4d4d4` | Header title, `p`, mode-label subtitle |
| Body text on light chrome | `black` / `#333` / `#555` / `#666` | Hotspot titles/descriptions, nav labels, overlay subtitle |
| Selection/edge highlight (3D) | `#2873F5` (blue) | Three.js outline pass edge color for selected model parts |
| Scene background gradient | `#F7F4F2` → `#f0f0f0` | Canvas backdrop gradient (bottom→top), off-white/light grey |
| Overlay scrim | `rgba(0,0,0,0.1–0.3)` / `rgba(0,0,0,0.8)` (loading) | Modal/mode-overlay backdrops, loading screen |
| Error/interrupt banner | `rgba(0,0,0,0.85)` bg, white text, white button w/ black text | WebGL-context-lost recovery banner |

**Palette philosophy:** neutral greys for structural chrome, one warm accent (`#EF5337`) reserved strictly for "active/primary/selected" states, and a cool blue (`#2873F5`) reserved strictly for 3D selection highlighting (never used in flat UI). Dark glass panels always pair with `backdrop-filter: blur()` for a frosted-glass effect over the 3D scene.

## Shape & Elevation

- **Corner radii** scale with element size, and pill/circle shapes are the default for interactive controls:
  - Circular: nav buttons, hazard/mobile toggle, close buttons (`border-radius: 50%`)
  - Full pill: navigation bar, mode filter, hazard filter buttons, mode buttons (`border-radius: 16–30px`)
  - Soft rounded rectangles: cards, panels, icon buttons (`border-radius: 6–12px`)
- **No drop shadows on flat buttons** — depth comes from `outline: 1px solid #9e9e9e` (a hairline border) rather than `box-shadow`, keeping the look flat/matte. Shadows are reserved for panels that float above content (`.hotspot-info` scroll-shadow trick, `#mobileHazardPanel` box-shadow, `.hotspot-info` outline).
- **Glassmorphism** is used specifically for chrome that sits directly over the 3D viewport and needs to stay legible without blocking the view (header, mode label, hazard slide-in panel, spec modal): translucent dark fill + `backdrop-filter: blur()`.
- **Opaque flat panels** (`#E6E6E6`, `#d4d4d4`) are used for content the user reads closely (hotspot info, spec values, overlay cards) — legibility over the scene wins there.

## Layout & Positioning Conventions

- Everything is `position: fixed` or `absolute`, anchored to viewport edges with consistent margins:
  - Top-left: header stack (`top: 20px; left: 20px`)
  - Top-center: mode filter pill (`top: 20px`, centered via `left: 50%; translateX(-50%)`)
  - Top-right: camera controls (`top: 70px; right: 20px`)
  - Bottom-center: main navigation pill (`bottom: 20px`, centered)
  - Bottom-left: button column (reset/fullscreen/mode icons)
  - Left, below header: hazard filter list (`top: 160px; left: 20px`)
- `z-index` is used as a strict layering system, roughly in bands of hundreds:
  - `1000–1010`: hotspots, mouse-control hint, top-left stack
  - `1002–1005`: nav UI, camera controls, spec modal, close icons, panel-active state
  - `1500–1600`: mode filter, mobile hazard toggle/panel
  - `4000`: mode-selection modal overlay
  - `9999`: loading screen (always on top)
- **Responsive breakpoints:** `max-width: 600px` (mobile portrait), `max-width: 932px and orientation: landscape` (mobile landscape), `601px–1024px portrait` (tablet). Mobile collapses the desktop nav pill into a full-width bottom bar with text labels, moves the info panel to a bottom sheet (portrait) or right-side fixed panel (landscape), and hides desktop-only affordances (`#mouse-control`, `#fullscreenBtn`, mode-filter pillbox).

## Component Patterns

- **Icon buttons:** transparent button wrapping an `<img>`, with the visual chrome (bg color, radius, outline, padding) applied to the `img` itself, not the button (e.g. `.icon-button img`, `.button-column > #mobileHazardToggle`). Hover just darkens the background.
- **Toggle/filter buttons** (mode-btn, hazard-filter-btn, cam-btn-container): transparent/light by default, hover = slightly darker grey, `.active` = solid `#EF5337` with white text/outline matching.
- **Hotspots:** 32px absolutely-positioned circular markers over the 3D model, scale 1.2x on hover, dim to 20% opacity + greyscale once `.visited`.
- **Info/description panels:** appear anchored to a hotspot; compact "hover" state (nowrap, auto-width) expands to a fixed 420px `.active` state with a scrollable body (`.text-scroll`) that uses a gradient "scroll shadow" trick (fading top/bottom mask) instead of hard-cut edges, and a slim custom scrollbar that only appears when content overflows (`.is-scrollable`).
- **Hazard callouts:** icon + title pinned as a fixed header above the scrollable description, with a hairline `border-bottom` divider — keeps the icon/title visible while the body scrolls.
- **Modals/overlays:** centered card, translucent light background + blur, `outline` instead of `box-shadow`, stacked full-width buttons (`.overlay-btn`), with the primary action styled with the accent color and a plain-text "← Back" link below the stack.
- **Step navigation:** circular prev/next buttons flanking a centered, pointer-events-none step indicator label; a `.step-done-btn` (solid accent, pill) appears in place of "next" on the final step.

## Iconography

- SVG icons for chromeless UI controls (arrows, reset, fullscreen, spec, PDF, grid) follow a `_default` / `_active` naming convention (e.g. `Reset_default.svg` / `Reset_acitve.svg`) so JS can swap the icon source on state change rather than relying on CSS filters.
- PNG icons for in-scene/hazard iconography (PPE, hazard types, hotspot states) follow a `_default` / `_selected` / `_visited` convention per hotspot type (e.g. `icon_CM.png`, `icon_CM_selected.png`, `icon_CM_visited.png`).
- Icons are otherwise unstyled (no CSS filters/recoloring) except the header toggle button, which uses `filter: brightness(0) invert(1)` to force a white icon on dark glass chrome.

## Motion

- Transitions are short and utilitarian: `0.15s–0.3s ease` for background/color/opacity/transform changes (button hovers, hotspot scale, panel slide states). No easing curves beyond the default `ease`/`ease-in-out` — nothing bouncy or springy.
- Mobile-only slide/fade transitions move the header stack and mode filter off-screen when a walkthrough mode is active (`body.mode-active`), then back in when `titles-revealed` is toggled.

## Design Tokens (informal — not yet extracted to CSS variables)

The stylesheet does not currently use CSS custom properties; the values below are the de-facto tokens in use and worth promoting to `:root` variables if the system grows:

```
--color-accent:        #EF5337
--color-accent-hover:   #d4452e
--color-chrome-light:   #d4d4d4
--color-chrome-hover:   #c4c4c4
--color-chrome-outline: #9e9e9e
--color-panel-light:    #E6E6E6
--color-chrome-dark:    #363d47   (used at ~0.4–0.65 alpha with blur)
--color-selection:      #2873F5
--font-family-ui:       'Noto Sans', sans-serif
--radius-pill:          20px–30px
--radius-card:          8px–12px
--z-hotspot:            1000
--z-panel:              1002–1005
--z-mode-ui:            1500–1600
--z-modal:              4000
--z-loading:            9999
```
