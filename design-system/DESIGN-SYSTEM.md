# Job Notification App — Design System

Design system foundation for a premium B2C SaaS. Calm, intentional, coherent, confident.

---

## Design Philosophy

- **Calm, intentional, coherent, confident**
- Not flashy, not playful, not hackathon-style
- No gradients, glassmorphism, neon colors, or animation noise

---

## Color System

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#F7F6F3` | Background (off-white) |
| `--color-text` | `#111111` | Primary text |
| `--color-accent` | `#8B0000` | Primary actions, links |
| `--color-success` | `#3D6B4F` | Success states |
| `--color-warning` | `#8B6914` | Warning states |

**Maximum 4 colors across entire UI.** Use only these.

---

## Spacing Scale

Use **only** these values: `8px`, `16px`, `24px`, `40px`, `64px`

| Token | Value |
|-------|-------|
| `--space-1` | 8px |
| `--space-2` | 16px |
| `--space-3` | 24px |
| `--space-4` | 40px |
| `--space-5` | 64px |

---

## Typography

- **Headings:** Source Serif 4, large, confident, generous spacing
- **Body:** Source Sans 3, 17px, line-height 1.65
- **Max text width:** 720px
- No decorative fonts, no random sizes

---

## Layout Structure

Every page must follow:

```
[Top Bar] → [Context Header] → [Primary Workspace (70%)] + [Secondary Panel (30%)] → [Proof Footer]
```

---

## Components

- **Primary button:** Solid deep red (#8B0000)
- **Secondary button:** Outlined, border only
- **Cards:** Subtle border, no drop shadows
- **Inputs:** Clean borders, clear focus state
- **Border radius:** 4px everywhere

---

## Transitions

- Duration: 175ms
- Easing: ease-in-out
- No bounce, no parallax

---

## File Structure

```
design-system/
  tokens.css      # Design tokens
  base.css        # Reset, typography
  layout.css      # Layout structure
  components.css  # Buttons, inputs, cards
  index.css       # Main entry (imports all)
```

---

## Usage

Link the design system in your HTML:

```html
<link rel="stylesheet" href="design-system/index.css">
```

Or import in your build:

```css
@import 'design-system/index.css';
```
