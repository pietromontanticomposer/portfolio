#!/usr/bin/env bash
set -euo pipefail

# Import poster images from ./uploads to ./public/posters and optionally resize
SRC_DIR="uploads"
DST_DIR="public/posters"

echo "Importing posters from '$SRC_DIR' to '$DST_DIR'..."
mkdir -p "$DST_DIR"
mkdir -p "$SRC_DIR"

shopt -s nullglob || true

count=0
for f in "$SRC_DIR"/*; do
  ext="${f##*.}"
  ext_lc=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
  case "$ext_lc" in
    jpg|jpeg|png)
      base=$(basename "$f")
      echo "- Copying $base"
      cp "$f" "$DST_DIR/$base"
      # Resize to a reasonable max width using sips (macOS) or ImageMagick if available
      if command -v sips >/dev/null 2>&1; then
        sips -Z 1600 "$DST_DIR/$base" >/dev/null 2>&1 || true
      elif command -v convert >/dev/null 2>&1; then
        convert "$DST_DIR/$base" -resize 1600x "$DST_DIR/$base"
      fi
      count=$((count+1))
      ;;
    *)
      echo "- Skipping non-image file: $(basename "$f")"
      ;;
  esac
done

echo "Imported $count files to $DST_DIR"
echo "Run 'npm run dev' to preview the site locally."
