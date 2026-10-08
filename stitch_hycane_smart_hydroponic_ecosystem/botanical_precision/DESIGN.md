---
name: Botanical Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3e4a3d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6e7b6c'
  outline-variant: '#bdcaba'
  surface-tint: '#006e2d'
  primary: '#006b2c'
  on-primary: '#ffffff'
  primary-container: '#00873a'
  on-primary-container: '#f7fff2'
  inverse-primary: '#62df7d'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#0051d5'
  on-tertiary: '#ffffff'
  tertiary-container: '#316bf3'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#7ffc97'
  primary-fixed-dim: '#62df7d'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005320'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  kpi-display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.03em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an accessible, grounded, and educational operating layer for modern hydroponic agriculture. It rejects sci-fi tropes, glowing cybernetics, and complex enterprise density in favor of crisp agrarian clarity, tactile feedback, and human-scaled telemetry.

### Tone & Personality
- **Grounded & Living:** Rooted in botanical vitality; feels organic and fresh rather than clinical or synthetic.
- **Empowering & Educational:** Translates complex biosystem parameters (EC, pH, ambient humidity, dissolved oxygen) into clear, friendly guidance suitable for beginner growers and scale-focused operators alike.
- **Reassuring & Precise:** Quiet, systematic visual composure that conveys biological stability and system health at a glance.

### Design Movement
Modern Organic Utilitarianism: Crisp structural grids combined with generous whitespace, gentle border radii, and soft tonal grouping. The interface functions like a well-crafted field notebook elevated with precise sensor readouts.

## Colors

The palette is anchored by living plant greens, disciplined structural slates, and clear diagnostic accents. Interfaces are primarily presented in crisp, warm daylight tones.

### Palette Architecture
- **Primary (Botanical Green):** `#16A34A` serves as the primary actionable anchor, accompanied by deep canopy `#15803D` for interaction states and light mint `#DCFCE7` for positive surface fills and badges.
- **Secondary (Deep Slate):** `#0F172A` provides solid typographic contrast and primary grounding, while `#1E293B` frames structural panels, sidebars, and strong iconography.
- **Tertiary (Tech Accent Blue):** `#2563EB` paired with `#EFF6FF` reserved for automation routines, firmware controls, and secondary connectivity cues.
- **Neutrals & Surfaces:** Pure canvas `#FFFFFF` resting upon light foundational backdrops of `#F8FAFC` and `#F1F5F9`, bordered by delicate structural lines in `#E2E8F0`.
- **Diagnostics & Semantics:**
  - *Safe / Target:* `#10B981` (Surface: `#ECFDF5`)
  - *Warning / Caution:* `#F59E0B` (Surface: `#FEF3C7`)
  - *Critical Alert:* `#EF4444` (Surface: `#FEE2E2`)
  - *Telemetry Blue:* `#0EA5E9` (Surface: `#E0F2FE`) for water temperature and pump circulation metrics.

## Typography

The type system prioritizes uncompromised data legibility, fast scanning, and consistent visual clarity across mobile paddock-side screens and desktop command centers.

### Typographic Hierarchy
- **KPI Display (`32px`):** High-impact numerical tracking for sensor outputs, dosage volumes, and harvest countdowns. Always paired with unit metadata set in `label-sm` or `body-sm`.
- **Headlines (`20px - 36px`):** Clean, tracking-reduced titles that clearly separate system modules and operational cycles.
- **Body (`12px - 16px`):** Comfortable reading size for educational guides, diagnostic recommendations, and plant care instructions.
- **Data & Micro Labels (`11px - 13px`):** Uppercase or medium-weighted tokens for status ribbons, metric titles, and sensor pins.

## Layout & Spacing

A structured 8pt layout rhythm guides all spatial decisions, giving the UI room to breathe while presenting critical operational telemetry cleanly.

### Grid & Breakpoints
- **Desktop (1024px+):** 12-column fluid grid, `margin: 2rem`, `gutter: 1.5rem`. Max readable dashboard container width: `1440px`.
- **Tablet (768px - 1023px):** 8-column layout, `margin: 1.5rem`, `gutter: 1.25rem`.
- **Mobile (< 768px):** 4-column layout, `margin: 1rem`, `gutter: 1rem`. Cards collapse into single-column vertical stacks.

### Density Guidelines
- Sensor dashboard cards feature internal padding governed by `space-lg` (`1.5rem`), keeping key metrics distinct.
- Compact list items and sensor mini-tiles use `space-md` (`1rem`) padding to maintain quick tap targets without overcrowding.

## Elevation & Depth

Visual hierarchy relies on soft surface distinction rather than harsh drop shadows, creating a calm and glare-free daytime reading experience.

### Layering Strategy
- **Base Canvas (`Level 0`):** `#F8FAFC`. The quiet foundation for the workspace.
- **Structural Cards (`Level 1`):** Solid `#FFFFFF` fill bounded by a crisp 1px border (`#E2E8F0`). Subtly separated from the base with an ambient shadow: `0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)`.
- **Floating Overlays & Dropdowns (`Level 2`):** Elevates floating popovers, date-pickers, and telemetry drawers using `0 10px 15px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`.
- **Modal Dialogs (`Level 3`):** High priority calibration overlays, system confirmations, and emergency shutoff dialogs resting over a `#0F172A` scrim set at 40% opacity.

## Shapes

The geometric architecture uses balanced, friendly corner radii to eliminate industrial harshness while maintaining utilitarian efficiency.

### Corner Radii Guidelines
- **Cards & Data Modules:** `16px` (`rounded-lg`) creates an approachable, contained surface for telemetry groupings.
- **Buttons, Inputs & Selectors:** `10px` to `12px` provides an ergonomic target that fits comfortably between micro-chips and outer cards.
- **Chips, Badges & Pills:** Completely rounded full pill radii (`9999px`) to distinguish categorical tags and status indicators from interactive rectangular controls.
- **Icon Containers:** `12px` squircle containers for sensor category icons (light, moisture, nutrition).

## Components

### Buttons
- **Primary Button:** Background `#16A34A`, text `#FFFFFF`, radius `10px`, height `44px` (desktop) / `48px` (mobile). Hover state deepens to `#15803D`. Focus ring `2px #DCFCE7` with `2px` offset.
- **Secondary Button:** Surface `#FFFFFF`, border `1px solid #E2E8F0`, text `#1E293B`. Hover state applies `#F8FAFC`.
- **Tertiary / Subdued:** Ghost button with transparent background, `#2563EB` text, used for actions like "Calibrate Sensor" or "View Guide".

### Telemetry Cards & Metric Blocks
- Structured on `#FFFFFF` with `16px` border radius and a 1px `#E2E8F0` border.
- Cards feature a clear header with metric name in `label-md` (`#64748B`), leading sensor status badge, large KPI readout in `kpi-display`, and bottom baseline range indicator showing target vs. current tolerances.

### Status Badges & Chips
- Status indicators pair a subtle pastel tinted container with dark high-contrast text and a leading `6px` solid status dot.
  - *Optimal:* Background `#DCFCE7`, text `#15803D`.
  - *Attention Needed:* Background `#FEF3C7`, text `#B45309`.
  - *Critical Range:* Background `#FEE2E2`, text `#B91C1C`.
- Filter chips use `pill` geometry (`9999px`), `1px solid #CBD5E1` border, transitioning to `#1E293B` text and mint highlight `#DCFCE7` when active.

### Input Fields & Controls
- **Text Inputs & Selects:** Height `44px`, radius `10px`, background `#FFFFFF`, border `1px solid #CBD5E1`. Inner text `#0F172A` with `#94A3B8` placeholder. Active focus triggers border `#16A34A` and subtle glow `0 0 0 3px rgba(22, 163, 74, 0.15)`.
- **Checkboxes & Radios:** `20px` touch targets with radius `6px` (checkbox) and circular (radio). In checked state, fill with `#16A34A` with crisp white inner markings.

### Educational Callouts & Banners
- Informational companion banners use light sky or mint fills (`#EFF6FF` or `#F0FDF4`) with a soft 1px matched border. Displays an approachable botanical tip or explanation alongside critical nutrient readouts without cluttering primary actions.