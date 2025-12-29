#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/make-hls-from-url.sh <REMOTE_MP4_URL> [OUTPUT_DIR]
# Example: ./scripts/make-hls-from-url.sh "https://.../input.mp4" public/video

URL="$1"
OUT_DIR="${2:-video}"
TMP_NAME="input_$(date +%s).mp4"

mkdir -p "$OUT_DIR"
echo "Preparing source $URL..."
if [[ "$URL" == file://* ]]; then
  cp "${URL#file://}" "$TMP_NAME"
elif [[ -f "$URL" ]]; then
  cp "$URL" "$TMP_NAME"
else
  curl -L --progress-bar -o "$TMP_NAME" "$URL"
fi

echo "Converting to HLS (single bitrate) into $OUT_DIR..."
# Force a 2s GOP and stable VBV for smoother HLS playback.
ffmpeg -y -i "$TMP_NAME" \
  -an \
  -vf "scale=1280:-2,format=yuv420p" \
  -c:v libx264 \
  -profile:v main \
  -preset medium \
  -b:v 2500k -maxrate 3000k -bufsize 6000k \
  -g 60 -keyint_min 60 -sc_threshold 0 \
  -force_key_frames "expr:gte(t,n_forced*2)" \
  -hls_time 4 \
  -hls_flags independent_segments \
  -hls_segment_filename "$OUT_DIR/segment%03d.ts" \
  -hls_playlist_type vod \
  "$OUT_DIR/master.m3u8"

echo "Conversion finished. Removing temp file..."
rm -f "$TMP_NAME"

echo "Files in $OUT_DIR:"
ls -la "$OUT_DIR"

if [[ -t 0 ]]; then
  echo "Commit and push?"
  read -p "Commit and push generated files to git (y/N)? " ans
  if [[ "$ans" =~ ^[Yy]$ ]]; then
    git add "$OUT_DIR"
    git commit -m "Add HLS files generated from $URL"
    git push origin main
  fi
fi

echo "Done. Use jsDelivr URL like: https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/$OUT_DIR/master.m3u8"
