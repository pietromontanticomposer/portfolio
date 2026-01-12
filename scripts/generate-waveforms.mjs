#!/usr/bin/env node
/**
 * Generate static waveform JSON files for all audio tracks.
 * Requires: npm install --save-dev audiobuffer-to-wav decode-audio-data
 * Run with: node scripts/generate-waveforms.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TRACKS_DIR = join(__dirname, '../public/uploads/tracks');
const WAVEFORMS_DIR = join(__dirname, '../public/waveforms');
const PEAKS_LENGTH = 200;

// Ensure waveforms directory exists
if (!existsSync(WAVEFORMS_DIR)) {
  mkdirSync(WAVEFORMS_DIR, { recursive: true });
}

function extractPeaksFromMp3(filePath) {
  // Read MP3 file and extract rough amplitude data from raw bytes
  // This is a simplified approach that reads the audio frame data
  const buffer = readFileSync(filePath);
  const samples = [];

  // Skip ID3 header if present
  let offset = 0;
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
    const size = ((buffer[6] & 0x7f) << 21) | ((buffer[7] & 0x7f) << 14) |
                 ((buffer[8] & 0x7f) << 7) | (buffer[9] & 0x7f);
    offset = 10 + size;
  }

  // Sample every N bytes to get amplitude approximation
  const step = Math.floor((buffer.length - offset) / (PEAKS_LENGTH * 10));
  for (let i = offset; i < buffer.length && samples.length < PEAKS_LENGTH * 10; i += step) {
    // Use absolute value of signed byte as amplitude proxy
    const val = buffer[i] > 127 ? buffer[i] - 256 : buffer[i];
    samples.push(Math.abs(val) / 128);
  }

  // Average samples into peaks
  const peaks = [];
  const samplesPerPeak = Math.floor(samples.length / PEAKS_LENGTH);
  for (let i = 0; i < PEAKS_LENGTH; i++) {
    const start = i * samplesPerPeak;
    const end = Math.min(start + samplesPerPeak, samples.length);
    let max = 0;
    for (let j = start; j < end; j++) {
      if (samples[j] > max) max = samples[j];
    }
    // Add some variation and normalize
    peaks.push(Math.min(1, Math.max(0.15, max * 1.5)));
  }

  return peaks;
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

      // Skip if already exists
      if (existsSync(outputFile)) {
        console.log(`  Skip: ${relativePath}/${trackName} (exists)`);
        continue;
      }

      try {
        const peaks = extractPeaksFromMp3(fullPath);
        writeFileSync(outputFile, JSON.stringify({ peaks }));
        console.log(`  Generated: ${relativePath}/${trackName}.json`);
        count++;
      } catch (err) {
        console.error(`  Error: ${relativePath}/${trackName}:`, err.message);
      }
    }
  }
  return count;
}

console.log('Generating waveform data from MP3 files...\n');
const total = processDirectory(TRACKS_DIR);
console.log(`\nDone! Generated ${total} waveform files.`);
