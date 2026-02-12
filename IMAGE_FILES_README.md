# Hegemon Global Website Image Assets

This directory contains all the brand image and icon files for the Hegemon Global website, using the official brand colors:
- Dark Background: #050508 / #0a0a0f
- Teal/Cyan: #06b6d4 / #22d3ee
- Indigo: #6366f1

## Files Created

### 1. favicon.svg (3.8 KB)
**Animated SVG globe favicon**
- ViewBox: 64x64 (scalable to any size)
- Features:
  - Rotating globe animation (5-second cycle)
  - Gradient background (#0f172a to #020617)
  - Globe gradient (teal #22d3ee to indigo #6366f1)
  - Visible latitude/longitude lines for globe effect
  - Simplified continent outlines (Americas, Europe/Africa, Asia)
  - Continuous smooth rotation using SVG `<animateTransform>`
- Best for: Browser tabs, social media profiles, high-resolution displays
- Compatible with: All modern browsers

### 2. og-image.png (22.2 KB)
**Open Graph social sharing image**
- Dimensions: 1200x630 pixels (optimal for Facebook, Twitter, LinkedIn)
- Features:
  - Dark background (#0a0a0f)
  - Large bold teal "HEGEMON" title
  - Gray subtitle: "GLOBAL INTELLIGENCE NETWORK"
  - Decorative indigo border and accent lines
  - Professional gradient header accent
- Usage: Use in HTML meta tags for social media sharing
  ```html
  <meta property="og:image" content="/og-image.png">
  ```

### 3. favicon-192.png (7.0 KB)
**High-resolution app icon**
- Dimensions: 192x192 pixels
- Features:
  - Gradient globe with simplified continent shapes
  - Dark background with grid lines (latitude/longitude)
  - Readable at small sizes
- Usage: Android chrome manifest, PWA app icon
  ```html
  <link rel="icon" sizes="192x192" href="/favicon-192.png">
  ```

### 4. apple-touch-icon.png (6.1 KB)
**iOS home screen icon**
- Dimensions: 180x180 pixels
- Features:
  - Similar to favicon-192, optimized for iOS devices
  - No transparency for iOS compatibility
- Usage: iOS devices and macOS Safari
  ```html
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  ```

### 5. favicon.ico (1.4 KB)
**Classic favicon format**
- Dimensions: Includes 32x32 and 16x16 pixel versions
- Features:
  - Compact file size
  - Works on legacy systems
  - Clear at tiny sizes
- Usage: Traditional favicon in HTML head
  ```html
  <link rel="icon" href="/favicon.ico">
  ```

## Recommended HTML Implementation

Add these lines to your HTML `<head>` section:

```html
<!-- SVG favicon (modern, scalable) -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">

<!-- Fallback favicon -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">

<!-- Apple iOS home screen -->
<link rel="apple-touch-icon" href="/apple-touch-icon.png">

<!-- Android Chrome manifest -->
<link rel="manifest" href="/site.webmanifest">

<!-- Open Graph social sharing -->
<meta property="og:image" content="https://your-domain.com/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:type" content="website">
```

## Color Palette Used

| Color | Hex | Usage |
|-------|-----|-------|
| Dark Background | #050508 / #0a0a0f | Base, backgrounds |
| Teal | #06b6d4 | Primary accent, globe primary color |
| Cyan | #22d3ee | Globe highlight, gradient start |
| Indigo | #6366f1 | Secondary accent, gradient end |
| Gray | #94a3b8 | Text, subtle accents |
| Dark Navy | #0f172a | Gradients, depth |
| Very Dark | #020617 | Deepest backgrounds |

## Technical Notes

- All PNG files use RGBA color space for transparency support
- OG image uses RGB (no transparency needed for social media)
- SVG is scalable and performs smooth rotation animation
- ICO file contains both 16x16 and 32x32 versions for compatibility
- File sizes optimized for web delivery
- All colors follow WCAG accessibility guidelines with proper contrast

## Animation Details (favicon.svg)

The SVG includes a continuous rotation animation:
- **Duration**: 5 seconds per full rotation (360 degrees)
- **Behavior**: Smooth, linear, infinite loop
- **Transform**: Rotation around center point (32, 32)
- **Effect**: Creates a continuously spinning globe effect

