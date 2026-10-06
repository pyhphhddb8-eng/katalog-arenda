#!/bin/zsh
# Превью ссылки public/og.jpg 1200×630 из tools/portfolio/og.html.
cd "${0:A:h}"
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless=new --disable-gpu --hide-scrollbars --window-size=600,315 \
  --force-device-scale-factor=2 --virtual-time-budget=10000 \
  --screenshot="$PWD/og.png" "file://$PWD/og.html" 2>/dev/null
sips -s format jpeg -s formatOptions 88 og.png --out ../../public/og.jpg >/dev/null
sips -g pixelWidth -g pixelHeight ../../public/og.jpg | tail -2
