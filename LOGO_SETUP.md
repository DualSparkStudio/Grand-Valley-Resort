# Logo Setup Instructions

## Logo File Location

Please place your Grand Valley Resort logo image at:
```
public/images/logo.png
```

## Logo Specifications

The logo should be:
- Format: PNG (with transparent background preferred)
- Recommended size: At least 200px height for best quality
- The logo will automatically scale to fit the navigation bar

## Current Implementation

The logo is currently integrated in:
1. **Main Navigation** (`src/components/Layout.tsx`) - Header and Footer
2. **Admin Sidebar** (`src/components/AdminSidebar.tsx`) - Admin panel header

If the logo file is not found, the system will automatically show a fallback with "GVR" text in golden color.

## Theme Colors

The website now uses the Grand Valley Resort color scheme:
- **Dark Blue**: `#040f32` (Primary background)
- **Golden**: `#d4af37` (Primary accent color)

These colors match the logo design with the dark blue background and golden lotus flower.
