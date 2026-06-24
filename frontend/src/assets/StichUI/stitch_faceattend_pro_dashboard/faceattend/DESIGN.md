---
name: FaceAttend
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
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006329'
  on-tertiary: '#ffffff'
  tertiary-container: '#007f36'
  on-tertiary-container: '#c7ffca'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 1.5rem
  sidebar-width: 280px
  sidebar-collapsed: 80px
  section-gap: 2rem
  component-padding: 1rem
  card-padding: 1.5rem
---

## Brand & Style

The design system is engineered for high-stakes institutional environments, balancing the precision of biometric technology with the approachability required for educational administration. The brand personality is professional, secure, and efficient, aiming to evoke a sense of reliability and modern sophistication. 

The aesthetic follows a **Corporate / Modern** style characterized by high-clarity interfaces, purposeful whitespace, and a layered architectural depth. By utilizing a clean, logic-driven layout, the design system minimizes cognitive load for administrators managing large datasets while maintaining a high-tech edge through subtle motion and glass-like surface treatments for secondary overlays.

## Colors

The palette is anchored by a trust-evoking "Signal Blue" (Primary) and a deep "Midnight Navy" (Secondary). This combination ensures high legibility and a professional atmosphere. 

- **Primary & Action:** #2563EB is used for primary calls-to-action, active navigation states, and key data highlights.
- **Surface & Hierarchy:** Backgrounds use a cool-toned #F8FAFC to differentiate from the pure white (#FFFFFF) of interactive cards and modals.
- **Semantic Feedback:** Success, Warning, and Danger colors are calibrated for high visibility against both white and light-grey backgrounds, ensuring critical attendance alerts or system errors are immediately recognizable.
- **Neutral Scale:** Text hierarchy is managed through #0F172A for primary content and #64748B for metadata and captions.

## Typography

This design system utilizes **Inter** exclusively to leverage its exceptional legibility in data-dense environments. 

- **Headlines:** Use tighter letter spacing and semi-bold weights to create a strong visual anchor for page titles and card headings.
- **Data Display:** Table content should primarily use `body-sm` for density, while key metrics in stat cards should utilize `headline-md`.
- **Labels:** Small caps or semi-bold weights are used for table headers and input labels to distinguish them from user-generated content.
- **Responsiveness:** Display sizes scale down by approximately 20% on mobile devices to ensure headings do not wrap excessively.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a fixed-width sidebar for navigation. 

- **Sidebar:** Positioned on the left, maintaining a constant presence for rapid context switching between Dashboard, Students, Reports, and Settings.
- **Main Canvas:** Content is housed within a responsive container that maxes out at 1440px to prevent excessive line lengths on ultrawide monitors.
- **Rhythm:** A 4px/8px base scaling system is used. Standard card gaps are 24px (1.5rem), providing a "spacious" feel that prevents the dashboard from feeling cluttered despite the amount of data.
- **Breakpoints:**
  - **Desktop (1024px+):** Sidebar expanded, 3-4 column stat card grid.
  - **Tablet (768px - 1023px):** Sidebar collapses to icons only, 2 column grid.
  - **Mobile (<767px):** Bottom navigation or hamburger menu, single column stack, reduced horizontal margins (16px).

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**.

- **Level 0 (Background):** #F8FAFC, the base canvas.
- **Level 1 (Cards/Sidebar):** White (#FFFFFF) with a very soft, diffused shadow (0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)).
- **Level 2 (Modals/Dropdowns):** Elevated with a more pronounced shadow to indicate temporary overlay and focus.
- **Borders:** A 1px solid border (#E2E8F0) is used on all Level 1 elements to maintain crisp definition against the light background, even in low-contrast viewing conditions.

## Shapes

The shape language is deliberately friendly yet structured. 

- **Standard Elements:** Buttons, input fields, and small components use `rounded-lg` (0.5rem / 8px).
- **Containers:** Dashboard cards, the camera preview window, and modals use `rounded-xl` (1rem / 16px) or `rounded-2xl` (1.5rem / 24px) to create a distinct, modern container feel.
- **Biometric UI:** The face-scanning frame within the camera preview should use a specialized "squircle" or highly rounded corner to feel "organic" and aligned with human facial structure.

## Components

- **Sidebar:** Uses a semi-transparent active state (Primary Blue at 10% opacity) with a solid left-edge accent bar to indicate the current page.
- **Stat Cards:** Feature a top-aligned icon in a tinted circular background, a large-format metric, and a "trend" indicator (Success/Danger text) at the bottom.
- **Data Tables:** Borderless rows with subtle hover states (#F1F5F9). Headers are sticky and use #64748B with `label-sm` styling.
- **Camera Preview UI:** A dark-mode container with a pulsing "scanning" line. Overlay instructional text (e.g., "Align face in frame") using a semi-transparent dark backdrop.
- **Buttons:**
  - *Primary:* Solid #2563EB, white text, subtle hover darken.
  - *Secondary:* Ghost style with #E2E8F0 border and #0F172A text.
- **Modals:** Centered with a backdrop blur (blur-sm) on the main content to focus user attention on the action.
- **Icons:** Use **Lucide React** icons with a 1.5px or 2px stroke width to match the clean, linear aesthetic of the typography.