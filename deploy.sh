#!/bin/bash
set -e

echo "Building..."
npm run build

echo "Deploying to gh-pages..."
git checkout gh-pages
git rm -rf assets/ audio/ --quiet 2>/dev/null || true
cp -r dist/assets .
cp -r dist/audio . 2>/dev/null || true
cp dist/index.html .
cp dist/lessons.json . 2>/dev/null || true
git add assets/ audio/ index.html lessons.json
git commit -S -m "deploy: $(date '+%Y-%m-%d %H:%M')"
git push origin gh-pages
git checkout main
echo "Done! https://bkmashiro.github.io/tango/"
