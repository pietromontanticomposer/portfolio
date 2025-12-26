## Background video (HLS) - quick steps

1) Convert your MP4 to HLS (VOD) with ffmpeg (example):

```bash
ffmpeg -i input.mp4 -an -vf scale=1280:-2 -c:v libx264 -g 48 -sc_threshold 0 -hls_time 4 -hls_playlist_type vod master.m3u8
```

This produces `master.m3u8` and `.ts` segment files. Put them in this folder (or a `video/` folder in your repo).

2) Add files to your GitHub repo (public folder) and push to `main` on a public repository.

3) Use jsDelivr CDN URL for the playlist:

```
https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/public/video/master.m3u8
```

4) In your Next.js site, set env var in `.env.local`:

```
NEXT_PUBLIC_BG_HLS_URL=https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/public/video/master.m3u8
```

5) The `BackgroundVideo` component will detect the env var and use HLS (via hls.js) where needed.

Notes:
- Use a public repo so jsDelivr can fetch it.
- If you prefer hosting the HLS files directly under `video/` at repo root (no `public/`), adjust the jsDelivr path accordingly.
