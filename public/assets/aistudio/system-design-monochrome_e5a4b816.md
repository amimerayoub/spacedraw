# System Design — Design System

## 1. Visual Identity
- **Design style:** Modern, cinematic, minimalist, premium.
- **Visual language:** Glassmorphism, layered surfaces, subtle depth, controlled lighting.
- **Principles:** Consistency, clarity, visual hierarchy, accessibility, responsiveness.

## 2. Monochrome Color System

The interface uses **black, white, and neutral grayscale only**. Do not use red or any other chromatic accent color.

| Token | Value | Usage |
|---|---|---|
| `color-bg-primary` | `#000000` | Main dark page background |
| `color-bg-secondary` | `#0D0D0D` | Dark cards and panels |
| `color-bg-tertiary` | `#171717` | Elevated dark surfaces |
| `color-text-primary-dark` | `#FFFFFF` | Primary text in Dark Mode |
| `color-text-secondary-dark` | `#A3A3A3` | Supporting text in Dark Mode |
| `color-bg-light` | `#FFFFFF` | Main light page background |
| `color-bg-light-secondary` | `#F5F5F5` | Light cards and panels |
| `color-text-primary-light` | `#111111` | Primary text in Light Mode |
| `color-text-secondary-light` | `#666666` | Supporting text in Light Mode |
| `color-accent-dark` | `#FFFFFF` | Monochrome accent in Dark Mode |
| `color-accent-light` | `#000000` | Monochrome accent in Light Mode |

## 3. Typography

| Role | Font family | Usage |
|---|---|---|
| Display | Cormorant Garamond | Large headings and editorial titles |
| Body | Inter | Paragraphs and general content |
| Technical | JetBrains Mono | Metadata, labels, counters, and technical details |

- Display headings: large and expressive.
- Section headings: clearly differentiated.
- Body text: readable size and line height.
- Labels: compact and consistent.
- Technical text: monospaced with restrained letter spacing.

## 4. Spacing System

Use a consistent spacing scale based on multiples of 4px.

| Token | Value |
|---|---:|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-24` | 96px |

Use larger spacing between sections and smaller spacing within related component groups.

## 5. Layout and Grid

- Responsive, mobile-first layouts.
- Centered content containers with consistent maximum widths.
- Twelve-column grid on wide desktop layouts where appropriate.
- Flexible grids for cards and repeated content.
- Consistent horizontal page padding.
- Clear separation between sections.
- Avoid unnecessary nested containers and excessive visual density.

## 6. Glassmorphism System

| Property | Dark Mode | Light Mode |
|---|---|---|
| Surface | `rgba(255, 255, 255, 0.05)` | `rgba(0, 0, 0, 0.04)` |
| Border | `rgba(255, 255, 255, 0.12)` | `rgba(0, 0, 0, 0.12)` |
| Backdrop blur | `12–20px` | `12–20px` |
| Shadow | Soft, dark | Soft, light |

- Use transparency without sacrificing text readability.
- Keep highlights subtle and monochrome.
- Avoid excessive blur, bright colored outlines, and stacked opaque overlays.
- Ensure decorative layers remain visible through intended transparent areas.

## 7. Component System

### Buttons
- Primary, secondary, ghost, and icon variants.
- Consistent heights, padding, and interaction states.
- Clear distinction between primary and secondary actions.
- Hover, active, focus, disabled, and loading states.
- Monochrome interaction effects only.

### Cards
- Consistent internal padding and corner radius.
- Clear content hierarchy.
- Optional glass surfaces and subtle borders.
- Separate decorative layers from content layers.
- Keep decorative shards visible without compromising text contrast.
- Support hover, focus, active, and reduced-motion states.

### Inputs
- Consistent height, padding, borders, and typography.
- Clear labels and accessible error messages.
- Distinct focus, disabled, and invalid states.
- Sufficient contrast for placeholders and entered text.

### Navigation
- Consistent alignment and spacing.
- Clear active-state indication.
- Responsive behavior across viewport sizes.
- Keyboard navigation and visible focus indicators.

### Overlays and Dialogs
- Consistent stacking order.
- Controlled backdrop opacity and blur.
- Clear separation between overlay, content, and background.
- Predictable opening and closing transitions.
- No unintended interaction with underlying content.

## 8. Border Radius and Elevation

| Token | Radius |
|---|---:|
| `radius-sm` | 6px |
| `radius-md` | 10px |
| `radius-lg` | 16px |
| `radius-xl` | 24px |
| `radius-full` | 9999px |

- **Level 0:** Flat surfaces.
- **Level 1:** Subtle borders and shadows.
- **Level 2:** Elevated cards and dropdowns.
- **Level 3:** Dialogs and full-screen overlays.

## 9. Motion and Animation

- Standard interaction duration: `150–250ms`.
- Interface transitions: `250–400ms`.
- Use longer cinematic sequences only when justified.
- Prefer `transform` and `opacity` for efficient animations.
- Use smooth easing and avoid unnecessary looping animations.
- Prevent conflicting animations on the same element.
- Respect `prefers-reduced-motion`.

## 10. Iconography and Imagery

- Use a consistent line-icon style.
- Keep icon sizes aligned with typography and component dimensions.
- Avoid mixing unrelated icon styles.
- Preserve image proportions and intended transparency.
- Use `contain` for logos and `cover` for photographic surfaces where appropriate.
- Avoid unintended cropping, visible background artifacts, and inconsistent image scaling.
- Apply monochrome treatments where appropriate; do not add red accents.

## 11. Dark and Light Themes

| Property | Dark Mode | Light Mode |
|---|---|---|
| Page background | `#000000` | `#FFFFFF` |
| Secondary surface | `#0D0D0D` | `#F5F5F5` |
| Tertiary surface | `#171717` | `#EBEBEB` |
| Primary text | `#FFFFFF` | `#111111` |
| Secondary text | `#A3A3A3` | `#666666` |
| Accent | `#FFFFFF` | `#000000` |
| Glass surface | `rgba(255, 255, 255, 0.05)` | `rgba(0, 0, 0, 0.04)` |
| Borders | `rgba(255, 255, 255, 0.12)` | `rgba(0, 0, 0, 0.12)` |
| Hover surface | `#1A1A1A` | `#EEEEEE` |

### Theme behavior
- Dark Mode uses a pure black page background, near-black surfaces, white primary text, and neutral gray supporting text.
- Light Mode uses a white page background, light gray surfaces, near-black primary text, and neutral gray supporting text.
- Update buttons, cards, borders, shadows, focus states, icons, overlays, and glass surfaces to match the active theme.
- Use monochrome hover and active states. Never introduce red glows or colored highlights.
- Use shared semantic tokens so components adapt consistently to the active theme.

## 12. Accessibility

- Meet WCAG AA contrast requirements wherever applicable.
- Do not communicate state using color alone.
- Provide keyboard access to interactive controls.
- Include visible focus indicators.
- Provide accessible names for icon-only buttons.
- Respect reduced-motion preferences.
- Maintain readable text sizes and comfortable line heights.
- Ensure touch targets are appropriately sized.

## 13. Responsive Behavior

- **Mobile:** Simplified layouts, readable typography, touch-friendly controls.
- **Tablet:** Flexible grids and intermediate spacing.
- **Desktop:** Expanded layouts, richer layering, and appropriate hover interactions.
- Prevent horizontal overflow.
- Keep essential content visible at all viewport sizes.
- Avoid relying exclusively on hover for functionality.

## 14. Design Tokens and Architecture

Organize the system into reusable categories:
- Color tokens.
- Typography tokens.
- Spacing tokens.
- Radius tokens.
- Shadow and elevation tokens.
- Glass surface tokens.
- Motion and transition tokens.
- Z-index and layering tokens.
- Breakpoints.
- Component variants.
- Theme-specific semantic tokens.

Maintain a single source of truth for shared values. Components should consume design tokens instead of duplicating styles.

## 15. Quality Standards

- Consistent spacing, typography, and component behavior.
- Clear visual hierarchy.
- No unintended overlapping layers.
- No opaque backgrounds hiding decorative content.
- No broken image transparency.
- No inconsistent theme colors.
- No unnecessary animation or visual noise.
- Responsive and accessible interaction states.
- No red or other chromatic accent colors; all UI colors remain black, white, or neutral grayscale.
- Reusable, maintainable, and predictable styling.

## Final Principle

Every component must follow the same monochrome visual language, use shared design tokens, preserve content readability, and maintain consistent behavior across Dark Mode, Light Mode, and all screen sizes.
