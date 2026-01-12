#!/usr/bin/env node
/**
 * Generate real waveform JSON files from audio using Web Audio API (Node.js).
 * Run with: node scripts/generate-waveforms.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TRACKS_DIR = join(__dirname, '../public/uploads/tracks');
const WAVEFORMS_DIR = join(__dirname, '../public/waveforms');
const PEAKS_LENGTH = 800; // High definition waveforms

// Ensure waveforms directory exists
if (!existsSync(WAVEFORMS_DIR)) {
  mkdirSync(WAVEFORMS_DIR, { recursive: true });
}

function getDuration(filePath, sampleCount) {
  // Calculate duration from sample count at 8000 Hz sample rate
  // samples = duration * sampleRate
  const sampleRate = 8000;
  return sampleCount / sampleRate;
}

function generatePeaksWithFFmpeg(filePath) {
  try {
    // Use ffmpeg to get raw PCM data and extract peaks
    // -ac 1 = mono, -ar 8000 = 8kHz sample rate (enough for waveform)
    // -f s16le = signed 16-bit little endian
    const cmd = `ffmpeg -i "${filePath}" -ac 1 -ar 8000 -f s16le -acodec pcm_s16le - 2>/dev/null`;
    const buffer = execSync(cmd, { maxBuffer: 50 * 1024 * 1024 });

    // Convert buffer to samples
    const samples = [];
    for (let i = 0; i < buffer.length; i += 2) {
      const sample = buffer.readInt16LE(i);
      samples.push(Math.abs(sample) / 32768);
    }

    // Calculate peaks
    const samplesPerPeak = Math.floor(samples.length / PEAKS_LENGTH);
    const peaks = [];

    for (let i = 0; i < PEAKS_LENGTH; i++) {
      const start = i * samplesPerPeak;
      const end = Math.min(start + samplesPerPeak, samples.length);
      let max = 0;
      for (let j = start; j < end; j++) {
        if (samples[j] > max) max = samples[j];
      }
      // Round to 2 decimal places
      peaks.push(Math.round(max * 100) / 100);
    }

    const duration = getDuration(filePath, samples.length);
    return { peaks, duration };
  } catch (err) {
    console.error(`    FFmpeg error: ${err.message}`);
    return null;
  }
}

function processDirectory(dir, relativePath = '') {
  const items = readdirSync(dir);
  let count = 0;

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      count += processDirectory(fullPath, join(relativePath, item));
    } else if (item.toLowerCase().endsWith('.mp3')) {
      const trackName = item.replace(/\.mp3$/i, '');
      const waveformDir = join(WAVEFORMS_DIR, relativePath);

      // Create subdirectory if needed
      if (!existsSync(waveformDir)) {
        mkdirSync(waveformDir, { recursive: true });
      }

      const outputFile = join(waveformDir, `${trackName}.json`);

      console.log(`  Processing: ${relativePath}/${trackName}...`);
      const result = generatePeaksWithFFmpeg(fullPath);

      if (result) {
        writeFileSync(outputFile, JSON.stringify({ peaks: result.peaks, duration: result.duration }));
        console.log(`  ✓ Generated: ${relativePath}/${trackName}.json (${result.peaks.length} peaks, ${result.duration.toFixed(1)}s)`);
        count++;
      } else {
        console.log(`  ✗ Failed: ${relativePath}/${trackName}`);
      }
    }
  }
  return count;
}

// Check if ffmpeg is available
try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
} catch {
  console.error('Error: ffmpeg is not installed. Please install it first.');
  console.error('  macOS: brew install ffmpeg');
  console.error('  Ubuntu: sudo apt install ffmpeg');
  process.exit(1);
}

console.log('Generating waveform data from MP3 files using FFmpeg...\n');
const total = processDirectory(TRACKS_DIR);
console.log(`\nDone! Generated ${total} waveform files.`);
