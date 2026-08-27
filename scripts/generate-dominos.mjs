import fs from 'fs';
import path from 'path';

const DOMINO_DIR = path.resolve('public/domino');
if (!fs.existsSync(DOMINO_DIR)) {
  fs.mkdirSync(DOMINO_DIR, { recursive: true });
}

function getPipCoordinates(value, isBottom = false) {
  const yOffset = isBottom ? 60 : 0;
  
  // Coordinates relative to 60x60 square
  const TL = [18, 18 + yOffset];
  const TR = [42, 18 + yOffset];
  const CL = [18, 30 + yOffset];
  const CC = [30, 30 + yOffset];
  const CR = [42, 30 + yOffset];
  const BL = [18, 42 + yOffset];
  const BR = [42, 42 + yOffset];

  switch (value) {
    case 0:
      return [];
    case 1:
      return [CC];
    case 2:
      return [TR, BL];
    case 3:
      return [TR, CC, BL];
    case 4:
      return [TL, TR, BL, BR];
    case 5:
      return [TL, TR, CC, BL, BR];
    case 6:
      return [TL, TR, CL, CR, BL, BR];
    default:
      return [];
  }
}

function renderPipsSvg(coords) {
  return coords
    .map(
      ([cx, cy]) =>
        `    <circle cx="${cx}" cy="${cy}" r="4.25" fill="#191A18" />`
    )
    .join('\n');
}

function generateSvg(a, b) {
  const topPips = getPipCoordinates(a, false);
  const bottomPips = getPipCoordinates(b, true);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 120" width="60" height="120">
  <defs>
    <linearGradient id="tileGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FCFCFA"/>
      <stop offset="100%" stop-color="#EFEFE8"/>
    </linearGradient>
    <filter id="tileShadow" x="-10%" y="-5%" width="120%" height="115%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#000" flood-opacity="0.1"/>
    </filter>
  </defs>

  <!-- Tile Body -->
  <rect x="1" y="1" width="58" height="118" rx="8" ry="8" fill="url(#tileGradient)" stroke="#D3D2CA" stroke-width="1.5" />
  
  <!-- Subtle inner edge highlight -->
  <rect x="2" y="2" width="56" height="116" rx="7" ry="7" fill="none" stroke="#FFFFFF" stroke-opacity="0.8" stroke-width="1" />

  <!-- Center Groove -->
  <line x1="8" y1="60" x2="52" y2="60" stroke="#C8C7C0" stroke-width="1.5" stroke-linecap="round" />
  <line x1="8" y1="61" x2="52" y2="61" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.9" stroke-linecap="round" />

  <!-- Top Pips (${a}) -->
  <g id="top-pips">
${renderPipsSvg(topPips)}
  </g>

  <!-- Bottom Pips (${b}) -->
  <g id="bottom-pips">
${renderPipsSvg(bottomPips)}
  </g>
</svg>
`;
}

// Generate all 28 double-six domino tiles (0-0 to 6-6)
let count = 0;
for (let a = 0; a <= 6; a++) {
  for (let b = a; b <= 6; b++) {
    const svgContent = generateSvg(a, b);
    fs.writeFileSync(path.join(DOMINO_DIR, `${a}-${b}.svg`), svgContent, 'utf8');
    count++;
  }
}

// Also generate tile back SVG
const tileBackSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 120" width="60" height="120">
  <defs>
    <linearGradient id="backGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2C2E2A"/>
      <stop offset="100%" stop-color="#1A1C19"/>
    </linearGradient>
    <pattern id="diagHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="8" stroke="#3A3D38" stroke-width="1" />
    </pattern>
  </defs>
  <rect x="1" y="1" width="58" height="118" rx="8" ry="8" fill="url(#backGrad)" stroke="#3A3D38" stroke-width="1.5" />
  <rect x="4" y="4" width="52" height="112" rx="5" ry="5" fill="url(#diagHatch)" stroke="#353833" stroke-width="1" />
  <rect x="25" y="55" width="10" height="10" rx="2" fill="#4B4E48" />
</svg>
`;
fs.writeFileSync(path.join(DOMINO_DIR, `back.svg`), tileBackSvg, 'utf8');

// License documentation
const licenseText = `Domino Vector Assets (28 Double-Six Tiles + Tile Back)
-------------------------------------------------------
Source: Custom authored vector SVGs for Domino Room Web Application
License: Creative Commons Zero (CC0 1.0 Universal) / Public Domain Dedication
Summary: You are free to copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.
File format: SVG (Scalable Vector Graphics)
Created: 2026-08-28
`;
fs.writeFileSync(path.join(DOMINO_DIR, 'LICENSE.txt'), licenseText, 'utf8');

console.log(`Successfully generated ${count} domino SVGs, 1 tile back, and LICENSE.txt in ${DOMINO_DIR}`);
