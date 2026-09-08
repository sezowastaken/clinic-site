---
name: Warm Medical Editorial
colors:
  surface: '#fff8f3'
  surface-dim: '#dfd9d4'
  surface-bright: '#fff8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f2ed'
  surface-container: '#f3ede8'
  surface-container-high: '#ede7e2'
  surface-container-highest: '#e7e1dc'
  on-surface: '#1d1b18'
  on-surface-variant: '#524343'
  inverse-surface: '#32302d'
  inverse-on-surface: '#f6f0ea'
  outline: '#857373'
  outline-variant: '#d7c2c2'
  surface-tint: '#8a4d51'
  primary: '#5d292d'
  on-primary: '#ffffff'
  primary-container: '#793f43'
  on-primary-container: '#fcaeb2'
  inverse-primary: '#ffb3b6'
  secondary: '#566253'
  on-secondary: '#ffffff'
  secondary-container: '#d7e3d1'
  on-secondary-container: '#5a6657'
  tertiary: '#572f15'
  on-tertiary: '#ffffff'
  tertiary-container: '#724529'
  on-tertiary-container: '#f3b592'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b6'
  on-primary-fixed: '#380b11'
  on-primary-fixed-variant: '#6e363a'
  secondary-fixed: '#dae6d4'
  secondary-fixed-dim: '#becab8'
  on-secondary-fixed: '#141e13'
  on-secondary-fixed-variant: '#3f4a3c'
  tertiary-fixed: '#ffdbc8'
  tertiary-fixed-dim: '#f7b995'
  on-tertiary-fixed: '#321200'
  on-tertiary-fixed-variant: '#673c21'
  background: '#fff8f3'
  on-background: '#1d1b18'
  surface-variant: '#e7e1dc'
typography:
  display-lg:
    fontFamily: Bodoni Moda
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Bodoni Moda
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Bodoni Moda
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  headline-sm:
    fontFamily: Bodoni Moda
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Libre Franklin
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Libre Franklin
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Libre Franklin
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 20px
  section-gap: 120px
---

## Brand & Style

This design system embodies "Understated Luxury" tailored for a high-end private medical practice. The aesthetic is rooted in **Warm Minimalism**—moving away from the sterile, cold blues of traditional medicine toward a palette that feels skin-resonant, welcoming, and profoundly sophisticated.

The target audience seeks surgical excellence paired with artisanal care. The UI must evoke feelings of safety, discretion, and timeless beauty. We achieve this through an editorial layout approach: generous whitespace (breathing room), thin lines that suggest precision, and a delicate balance between high-contrast serif typography and soft, tonal backgrounds. The visual language is "Medical Editorial"—blending the clarity of a clinical journal with the grace of a luxury lifestyle publication.

## Colors

The palette is inspired by natural skin tones and organic elements, avoiding pure whites and blacks to maintain a soft, premium feel.

- **Oxblood Burgundy (#793F43):** Used for primary calls to action and key branding moments. It represents authority and elegance.
- **Warm Parchment (#F3ECE2):** The primary surface color, providing a soft, non-reflective base that feels more approachable than stark white.
- **Soft Ivory (#FCF8F2):** Used for secondary surfaces, card backgrounds, or to create subtle depth against the Parchment.
- **Deep Charcoal (#211F1C):** The primary color for text and heavy structural elements. It provides the necessary contrast for readability while feeling more organic than pure black.
- **Muted Sage & Soft Apricot:** Used sparingly for secondary accents, success states, or decorative flourishes that highlight medical expertise and skin health.
- **Warm Border Beige (#D9CFC2):** The standard for all structural lines, ensuring a cohesive, low-contrast UI frame.

## Typography

The typography system relies on a high-contrast pairing to distinguish between "Art" (Headings) and "Science" (Body).

- **Headings (Bodoni Moda):** A refined serif with dramatic stroke contrast. Use this for all major titles to establish the editorial character. It should always be set with a slightly tighter letter-spacing in larger sizes.
- **Body (Libre Franklin):** A clean, humanist sans-serif that ensures clinical information is legible and trustworthy. It is chosen for its utilitarian clarity which balances the decorative nature of the serif.
- **Turkish Character Support:** Ensure all fonts fully support Turkish characters (ç, ğ, ı, ö, ş, ü, İ).
- **Hierarchy:** Use `label-caps` for section overlines (e.g., "HİZMETLERİMİZ") to create a structured, organized feel.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to maintain an editorial, "centered" feel, while transitioning to a fluid model on mobile.

- **Rhythm:** Use an 8px baseline grid. Large vertical gaps (120px+) between sections are encouraged to prevent the UI from feeling "crowded," which contradicts the luxury positioning.
- **Grid:** A 12-column grid for desktop. Content should typically occupy the central 8 or 10 columns to allow for wide gutters that emphasize the premium "white space."
- **Mobile:** Margins scale down to 20px. Section gaps should reduce to 64px to maintain momentum on smaller screens.
- **Alignment:** Use asymmetrical layouts occasionally—placing text in one column and images in another—to mimic a high-end magazine spread.

## Elevation & Depth

This system avoids heavy shadows and floating effects to maintain its "Warm Minimalism."

- **Tonal Layering:** Depth is primarily communicated through color shifts (e.g., a Soft Ivory card sitting on a Warm Parchment background).
- **Thin Outlines:** Use 1px borders in `Warm Border Beige` to define containers. This replaces the need for shadows.
- **Restrained Shadows:** If a shadow is absolutely necessary (e.g., a floating "Book Now" button), use a very large blur (24px+) with extremely low opacity (5-8%) using a tint of the Charcoal color.
- **Image Depth:** Photography should use a "Soft Focus" or "Fine Art" style, further enhancing the sense of depth through the imagery rather than the UI elements.

## Shapes

The shape language is sophisticated and intentional, using varying radii to distinguish between functional and inspirational elements.

- **Functional Elements:** Cards, input fields, and buttons use a **0.5rem (8px) to 0.75rem (12px)** radius. This provides a "softened geometric" look that is professional but not rigid.
- **Inspirational Elements:** Featured images and clinical photography should use a more pronounced **1rem (16px)** radius to feel like framed portraits.
- **Icons:** Use thin-stroke (1px or 1.5px) icons. Avoid filled icons unless used for an active state.

## Components

### Buttons
- **Primary:** Oxblood Burgundy background with Soft Ivory text. No border. High-contrast and authoritative.
- **Secondary:** Transparent background with a 1px Warm Border Beige outline. Text in Deep Charcoal.
- **Text Link:** Deep Charcoal text with a thin underline that sits 4px below the baseline. On hover, the underline color shifts to Burgundy.

### Input Fields
- Labels are always placed above the field in `label-caps`. 
- Fields use the Soft Ivory background with a 1px Warm Border Beige. On focus, the border shifts to Muted Sage.

### Cards
- Standard cards use the Soft Ivory background with a 1px border.
- Avoid using cards for every piece of content; reserve them for distinct service offerings or testimonials.

### Navigation
- Main navigation links use Libre Franklin in a medium weight. 
- Use a thin, 2px horizontal line in Burgundy to indicate the active page, placed subtly below the text.

### Interactive States
- Transitions should be slow and graceful (300ms - 400ms) rather than "snappy."
- Hovering over a service card should result in a subtle background shift from Soft Ivory to a very pale tint of Muted Sage.