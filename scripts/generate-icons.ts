#!/usr/bin/env bun
/**
 * NIS Kwara — PWA Icon Generator
 *
 * Composes the brand logo (public/icons/brand-logo.jpeg) onto the required
 * PWA icon sizes. Falls back to a "NIS" monogram if the logo is missing.
 *
 * Usage:
 *   bun scripts/generate-icons.ts
 */

import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

const OUT_DIR = join(process.cwd(), 'public', 'icons')
const LOGO_SRC = join(OUT_DIR, 'brand-logo.jpeg')

// "NIS" monogram fallback (used only if brand-logo.jpeg is absent).
function svgFallback(size: number, bleed: boolean): string {
  const bgSize = bleed ? size : Math.round(size * 0.8)
  const bgX = (size - bgSize) / 2
  const bgY = (size - bgSize) / 2
  const fontSize = Math.round(size * 0.42)
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${size}" height="${size}" fill="#FAFAF7"/>
  <rect x="${bgX}" y="${bgY}" width="${bgSize}" height="${bgSize}" rx="${Math.round(bgSize * 0.22)}" fill="#1B5E3B"/>
  <text x="50%" y="50%" dy="0.36em" text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif" font-weight="bold"
    font-size="${fontSize}" fill="#FFFFFF">NIS</text>
</svg>`
}

// Center the logo on a transparent canvas with the given max height.
async function compose(size: number, maxLogoHeight: number): Promise<Buffer> {
  const logo = await sharp(LOGO_SRC)
    .resize({ height: Math.round(maxLogoHeight), fit: 'inside' })
    .toBuffer()

  const meta = await sharp(logo).metadata()
  const w = meta.width ?? 0
  const h = meta.height ?? 0
  const left = Math.round((size - w) / 2)
  const top = Math.round((size - h) / 2)

  const base = await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .png()
    .toBuffer()

  return sharp(base).composite([{ input: logo, left, top }]).png().toBuffer()
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const useLogo = existsSync(LOGO_SRC)
  console.log(useLogo ? `🎨 Sourcing from ${LOGO_SRC}` : '⚙️  logo missing — using NIS monogram fallback')

  const jobs = [
    { name: 'icon-192.png', size: 192, maxLogoHeight: 144 },
    { name: 'icon-512.png', size: 512, maxLogoHeight: 384 },
    { name: 'icon-maskable-512.png', size: 512, maxLogoHeight: 384 },
    { name: 'icon-180.png', size: 180, maxLogoHeight: 135 },
  ]

  for (const job of jobs) {
    const out = join(OUT_DIR, job.name)
    const img = useLogo
      ? await compose(job.size, job.maxLogoHeight)
      : Buffer.from(svgFallback(job.size, job.name.includes('maskable')))
    await sharp(img).png().toFile(out)
    console.log(`  ✓ ${job.name} (${job.size}x${job.size})`)
  }

  console.log(`\n✅ Icons written to ${OUT_DIR}`)
}

main().catch(e => {
  console.error('Failed to generate icons:', e)
  process.exit(1)
})