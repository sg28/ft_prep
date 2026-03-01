#!/bin/bash

# Simple script to generate icons using built-in tools
# This creates simple colored squares as placeholders
# For better icons, convert the SVG manually using:
# - Online converters
# - ImageMagick: convert julienites-logo.svg julienites-logo-192.png
# - Inkscape

echo "Generating placeholder icons..."

cd "$(dirname "$0")/../public"

# Create a simple blue square as favicon (32x32)
echo "Creating favicon.ico..."
convert -size 32x32 xc:#1DA1F2 favicon.ico 2>/dev/null || \
  echo "Note: ImageMagick not found. Using fallback method..."

# Create 192x192 PNG
echo "Creating 192x192 PNG..."
if command -v convert &> /dev/null; then
  convert -size 192x192 xc:#1DA1F2 -fill white -draw "text 50,100 'J'" julienites-logo-192.png
else
  # Create using Python
  python3 -c "
from PIL import Image, ImageDraw, ImageFont
import sys

try:
    # Create blue background
    img = Image.new('RGB', (192, 192), color='#1DA1F2')
    draw = ImageDraw.Draw(img)
    
    # Try to add a 'J' in the center
    try:
        font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 80)
    except:
        font = ImageFont.load_default()
    
    # Calculate text position
    text = 'J'
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (192 - text_width) // 2
    y = (192 - text_height) // 2
    
    draw.text((x, y), text, fill='white', font=font)
    img.save('julienites-logo-192.png')
    print('Created 192x192 PNG')
except ImportError:
    print('PIL/Pillow not installed. Creating empty file...')
    open('julienites-logo-192.png', 'w').close()
"
fi

# Create 512x512 PNG
echo "Creating 512x512 PNG..."
if command -v convert &> /dev/null; then
  convert -size 512x512 xc:#1DA1F2 -fill white -draw "text 200,250 'J'" julienites-logo-512.png
else
  # Create using Python
  python3 -c "
from PIL import Image, ImageDraw, ImageFont
import sys

try:
    # Create blue background
    img = Image.new('RGB', (512, 512), color='#1DA1F2')
    draw = ImageDraw.Draw(img)
    
    # Try to add a 'J' in the center
    try:
        font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 200)
    except:
        font = ImageFont.load_default()
    
    # Calculate text position
    text = 'J'
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (512 - text_width) // 2
    y = (512 - text_height) // 2
    
    draw.text((x, y), text, fill='white', font=font)
    img.save('julienites-logo-512.png')
    print('Created 512x512 PNG')
except ImportError:
    print('PIL/Pillow not installed. Creating empty file...')
    open('julienites-logo-512.png', 'w').close()
"
fi

echo "\n✅ Placeholder icons generated!"
echo "\nFor better quality icons, please:"
echo "1. Install ImageMagick: brew install imagemagick"
echo "2. Run: convert julienites-logo.svg julienites-logo-192.png"
echo "3. Run: convert julienites-logo.svg julienites-logo-512.png"
echo "4. Run: convert julienites-logo.svg -resize 32x32 favicon.ico"
echo "\nOr use an online SVG to PNG converter."