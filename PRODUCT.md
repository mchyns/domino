# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React, TypeScript, Vite, Tailwind CSS, Framer Motion (Motion), Zustand, Web Audio API, Supabase / Realtime Sync

## Users

Teman, keluarga, atau komunitas casual game (2–4 pemain) yang ingin langsung bermain domino / gaple bersama di mobile atau desktop tanpa registrasi atau login.

## Product Purpose

Menyediakan platform web multiplayer domino realtime yang cepat, bersih, berestetika tinggi, dan bebas hambatan (frictionless) dengan sistem Create Room / Join Room via kode 6-karakter atau invite link.

## Positioning

Domino Room adalah web game domino multiplayer yang berfokus pada kemurnian gameplay (pure domino/gaple rules), kenyamanan visual bernuansa neutral warm yang tenang dan physical, serta sinkronisasi realtime yang ketat dan anti-cheat. Berbeda dari game kasino generik yang penuh iklan, banner mencolok, neon gradient, atau registrasi rumit.

## Operating Context

Pemain membuka link di browser HP (Safari/Chrome di iOS/Android) atau desktop, memasukkan nama, membuat atau bergabung ke room, menunggu 2-4 pemain terkumpul di lobby, lalu bermain hingga selesai dan langsung dapat melakukan rematch.

## Capabilities and Constraints

- Kapasitas Room: 2, 3, atau 4 pemain.
- Distribusi Kartu:
  - 2 pemain: 14 kartu/pemain, 0 kartu starter.
  - 3 pemain: 9 kartu/pemain, 1 kartu starter ditaruh otomatis di meja.
  - 4 pemain: 7 kartu/pemain, 0 kartu starter.
- Set Domino: 28 kartu standar double-six (0-0 hingga 6-6) SVG mandiri berlisensi CC0/MIT.
- Aturan Validasi: Validasi legal move, dual-end choice (Left/Right), Pass hanya jika tidak ada move valid, Win saat kartu habis, Blocked Game saat semua pemain pass berurutan (pemenang adalah pemain dengan total pip terendah).
- Kerahasiaan Tangan (Anti-Cheat): Kartu pemain lain tidak pernah dikirim ke client lawan; hanya jumlah kartu dan board publik yang disinkronkan.
- Session & Reconnection: Anonymous player session via localStorage, mendukung reconnect jika halaman ter-refresh.
- Bahasa: Bahasa Indonesia yang natural, ringkas, dan jelas.

## Brand Commitments

- Nama: **Domino Room** (atau **DOMINO**).
- Gaya Visual: Neutral warm palette (`#F3F2EE`, `#FFFFFF`, `#191A18`, `#72736E`, `#697369`), tipografi jernih (Inter/Geist), micro-motion halus, border-radius konsisten, tanpa AI-tropes (no glowing gradients, no random blobs, no excessive glassmorphism, no emojis).
- Suara: Efek audio taktil sintetis Web Audio API (ketukan kartu domino, turn alert, win chime) dengan tombol mute.

## Evidence on Hand

- Dokumen spesifikasi lengkap: `PRD — Multiplayer Domino Web Game.md`
- Skill guideline: `.gemini/skills/impeccable/SKILL.md` dan referensi craft floor

## Product Principles

1. **Zero Friction**: Buka link, masukkan nama, langsung main tanpa register atau download aplikasi.
2. **Tactile Craft**: Setiap tile domino terasa fisik dan responsif (angkat saat dipilih, snap ke board, audio ketukan halus).
3. **Calm & Deliberate**: Desain yang elegan, bersih, dan fungsional tanpa distraksi visual kasino/judi.
4. **Fair & Authoritative**: Aturan terstandarisasi, validasi langkah ketat, tidak ada kebocoran kartu tangan lawan.
5. **Fluid Multiplayer**: Sinkronisasi realtime instan antar device, responsif di HP (360px+) maupun desktop lebar.

## Accessibility & Inclusion

- Target sentuhan mobile nyaman (min 44px).
- Kontras rasio teks ≥ 4.5:1.
- Visual state yang jelas (tile disabled 50% opacity, tile terpilih terangkat, indikator turn aktif).
- Aria label deskriptif pada setiap tile domino (misal: "Domino 3 dan 6").
