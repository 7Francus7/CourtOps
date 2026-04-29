import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import ffmpegStatic from "ffmpeg-static";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const framesDir = path.join(root, "renders", "frames");
const output = path.join(root, "renders", "courtops-promo.mp4");
const musicPath = path.join(root, "audio", "music.wav");
const width = 1080;
const height = 1920;
const fps = 30;
const duration = 42;
const totalFrames = duration * fps;

fs.mkdirSync(framesDir, { recursive: true });
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.mkdirSync(path.dirname(musicPath), { recursive: true });

const existingFrames = fs.existsSync(path.join(framesDir, `frame-${String(totalFrames - 1).padStart(5, "0")}.png`));
if (!existingFrames) {
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1
  });

  await page.goto(`file://${path.join(root, "index.html").replaceAll("\\", "/")}?render=1`, {
    waitUntil: "networkidle"
  });
  await page.evaluate(() => document.fonts && document.fonts.ready);

  for (let frame = 0; frame < totalFrames; frame += 1) {
    const time = frame / fps;
    await page.evaluate((t) => window.setCourtOpsTime(t), time);
    const file = path.join(framesDir, `frame-${String(frame).padStart(5, "0")}.png`);
    await page.screenshot({ path: file, type: "png" });
    if (frame % 90 === 0) {
      console.log(`Rendered frame ${frame}/${totalFrames}`);
    }
  }

  await browser.close();
} else {
  console.log("Reusing existing rendered frames");
}

function writeMusicWav(filePath) {
  const sampleRate = 44100;
  const channels = 2;
  const seconds = duration;
  const samples = sampleRate * seconds;
  const dataBytes = samples * channels * 2;
  const buffer = Buffer.alloc(44 + dataBytes);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * 2, 28);
  buffer.writeUInt16LE(channels * 2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataBytes, 40);

  let offset = 44;
  for (let i = 0; i < samples; i += 1) {
    const t = i / sampleRate;
    const beat = (t % 0.5) < 0.07 ? Math.sin(Math.PI * ((t % 0.5) / 0.07)) : 0;
    const accent = (t % 2) < 0.09 ? Math.sin(Math.PI * ((t % 2) / 0.09)) : 0;
    const side = Math.sin(2 * Math.PI * 0.18 * t) * 0.18;
    const pad = Math.sin(2 * Math.PI * (110 + 22 * Math.sin(2 * Math.PI * 0.04 * t)) * t) * 0.12;
    const pulse = Math.sin(2 * Math.PI * 220 * t) * beat * 0.09;
    const tick = Math.sin(2 * Math.PI * 660 * t) * accent * 0.045;
    const fadeIn = Math.min(1, t / 0.8);
    const fadeOut = Math.min(1, (seconds - t) / 1.8);
    const env = Math.max(0, Math.min(fadeIn, fadeOut));
    const left = Math.max(-1, Math.min(1, (pad + pulse + tick) * env * (1 - side)));
    const right = Math.max(-1, Math.min(1, (pad + pulse + tick) * env * (1 + side)));
    buffer.writeInt16LE(Math.round(left * 32767), offset);
    buffer.writeInt16LE(Math.round(right * 32767), offset + 2);
    offset += 4;
  }

  fs.writeFileSync(filePath, buffer);
}

writeMusicWav(musicPath);

const ffmpeg = ffmpegStatic || "ffmpeg";
const voiceInputs = [
  ["audio/vo-01.wav", 0.35],
  ["audio/vo-02.wav", 3.25],
  ["audio/vo-03.wav", 8.35],
  ["audio/vo-04.wav", 15.25],
  ["audio/vo-05.wav", 30.25],
  ["audio/vo-06.wav", 38.25]
];

const args = [
  "-y",
  "-framerate", String(fps),
  "-i", path.join(framesDir, "frame-%05d.png"),
  "-i", musicPath,
  ...voiceInputs.flatMap(([file]) => ["-i", path.join(root, file)]),
  "-filter_complex",
  [
    "[1:a]volume=0.55,afade=t=in:st=0:d=0.8,afade=t=out:st=40.5:d=1.5[music]",
    ...voiceInputs.map(([, start], index) => `[${index + 2}:a]adelay=${Math.round(start * 1000)}|${Math.round(start * 1000)},volume=1.35[vo${index}]`),
    `[music]${voiceInputs.map((_, index) => `[vo${index}]`).join("")}amix=inputs=${voiceInputs.length + 1}:duration=longest:normalize=0,alimiter=limit=0.95[aout]`
  ].join(";"),
  "-map", "0:v",
  "-map", "[aout]",
  "-c:v", "libx264",
  "-pix_fmt", "yuv420p",
  "-profile:v", "high",
  "-crf", "18",
  "-preset", "medium",
  "-c:a", "aac",
  "-b:a", "192k",
  "-shortest",
  "-movflags", "+faststart",
  output
];

const result = spawnSync(ffmpeg, args, { cwd: root, stdio: "inherit" });
if (result.status !== 0) {
  process.exit(result.status || 1);
}

console.log(`Video rendered: ${output}`);
