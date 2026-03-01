# Julienites Icons

## Overview

This project uses custom icons instead of the default React logo. The icons feature a graduation cap (representing alumni) with network connection dots, using the Twitter blue color (#1DA1F2) for brand consistency.

## Icon Files

### Current Icons

1. **`julienites-logo.svg`** - Source SVG file
   - Graduation cap with network connection dots
   - Blue color: #1DA1F2
   - Dimensions: 512x512

2. **`julienites-logo-192.png`** - 192x192 PNG
   - Used for mobile app icons
   - Generated from SVG

3. **`julienites-logo-512.png`** - 512x512 PNG
   - Used for desktop app icons
   - Generated from SVG

4. **`favicon.ico`** - 32x32 favicon
   - Browser tab icon
   - Currently using placeholder

5. **`favicon.svg`** - SVG version of favicon
   - Simple graduation cap

## How to Update Icons

### Option 1: Using ImageMagick (Recommended)

1. Install ImageMagick:
   ```bash
   # macOS
   brew install imagemagick
   
   # Ubuntu/Debian
   sudo apt-get install imagemagick
   
   # Windows
   # Download from https://imagemagick.org/
   ```

2. Generate PNGs from SVG:
   ```bash
   cd public
   
   # Generate 192x192 PNG
   convert julienites-logo.svg -resize 192x192 julienites-logo-192.png
   
   # Generate 512x512 PNG
   convert julienites-logo.svg -resize 512x512 julienites-logo-512.png
   
   # Generate favicon (multiple sizes)
   convert julienites-logo.svg -resize 16x16 favicon-16.png
   convert julienites-logo.svg -resize 32x32 favicon-32.png
   convert julienites-logo.svg -resize 64x64 favicon-64.png
   convert favicon-16.png favicon-32.png favicon-64.png favicon.ico
   rm favicon-*.png
   ```

### Option 2: Using Online Converters

1. Go to an online SVG to PNG converter (like https://svgtopng.com/)
2. Upload `julienites-logo.svg`
3. Download PNGs at 192x192 and 512x512 sizes
4. Save as `julienites-logo-192.png` and `julienites-logo-512.png` in the `public` folder

### Option 3: Using the Built-in Script

Run the provided script:
```bash
npm run generate-icons
```

This will generate placeholder icons with a blue background and a white "J".

## Icon Design

### SVG Design Elements

The SVG icon combines:
1. **Graduation Cap** - Represents education and alumni
2. **Network Dots** - Represents connections and networking
3. **Connection Lines** - Dashed lines showing relationships
4. **Blue Color (#1DA1F2)** - Twitter blue for familiarity

### Color Scheme

- Primary: `#1DA1F2` (Twitter blue)
- Background: Transparent or white
- Text/Accents: White

### Sizes Needed

| Size | Purpose | File |
|------|---------|------|
| 16x16 | Small favicon | `favicon.ico` |
| 32x32 | Standard favicon | `favicon.ico` |
| 64x64 | Large favicon | `favicon.ico` |
| 192x192 | Android/Apple touch icon | `julienites-logo-192.png` |
| 512x512 | PWA/splash screen | `julienites-logo-512.png` |

## Manifest Configuration

The `manifest.json` file references:
```json
{
  "icons": [
    {"src": "favicon.ico", "sizes": "64x64 32x32 24x24 16x16"},
    {"src": "julienites-logo-192.png", "sizes": "192x192"},
    {"src": "julienites-logo-512.png", "sizes": "512x512"}
  ]
}
```

## Service Worker

The service worker (`service-worker.js`) caches the icon files for offline use.

## Testing Icons

1. **Browser Tab**: Look for the icon in the browser tab
2. **Mobile Homescreen**: Add to homescreen on mobile devices
3. **PWA Installation**: Check install prompt on supported browsers
4. **Manifest**: Verify at `chrome://inspect/#apps`

## Troubleshooting

### Icons Not Showing
1. Clear browser cache
2. Restart development server
3. Check console for 404 errors
4. Verify file paths in `manifest.json`

### Poor Quality
1. Regenerate from SVG source
2. Ensure correct dimensions
3. Use lossless compression

### Wrong Colors
1. Edit SVG source file
2. Regenerate PNGs
3. Update CSS theme colors

## Customization

To customize the icons:

1. Edit `julienites-logo.svg` with a vector editor (Inkscape, Adobe Illustrator)
2. Update colors in the SVG file
3. Regenerate PNGs
4. Update theme colors in `tailwind.config.js` if needed

## License

The icon design is proprietary to Julienites. Do not use for other projects without permission.