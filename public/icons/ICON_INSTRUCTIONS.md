# Grytt App Icons - Generation Instructions

## Quick Setup

I've created an SVG template at `icon.svg`. You need to convert it to PNG in 3 sizes:

### Option 1: Online Converter (Fastest - 2 minutes)

1. Visit https://cloudconvert.com/svg-to-png
2. Upload `public/icons/icon.svg`
3. Convert to these sizes:
   - **180x180** → Save as `icon-180.png` (Apple touch icon)
   - **192x192** → Save as `icon-192.png` (Android/PWA)
   - **512x512** → Save as `icon-512.png` (High-res PWA)
4. Place all 3 PNG files in `public/icons/`

### Option 2: Using Figma/Canva (5 minutes)

1. Open Figma or Canva
2. Import `icon.svg`
3. Export as PNG at 180x180, 192x192, 512x512
4. Save to `public/icons/`

### Option 3: macOS Preview (3 minutes)

1. Open `icon.svg` in Preview
2. File → Export → Format: PNG
3. Adjust size to 512x512, export as `icon-512.png`
4. Repeat for 192x192 and 180x180

### Option 4: Command Line (if you install ImageMagick)

```bash
brew install imagemagick

cd public/icons
convert icon.svg -resize 180x180 icon-180.png
convert icon.svg -resize 192x192 icon-192.png
convert icon.svg -resize 512x512 icon-512.png
```

## Customization

Want to customize the icon?

1. Edit `icon.svg` in any text/vector editor
2. Change colors:
   - Background: Currently `#fb923c` (orange)
   - Dumbbell: Currently `white`
3. Re-export to PNG sizes

## Files Needed

After conversion, you should have:
- ✅ `public/icons/icon.svg` (template - already created)
- ⬜ `public/icons/icon-180.png` (Apple touch icon)
- ⬜ `public/icons/icon-192.png` (PWA icon)
- ⬜ `public/icons/icon-512.png` (High-res PWA icon)

## Temporary Placeholder

For now, I'll create a simple favicon.ico as a placeholder so the PWA can be tested immediately.
