# Design System — Domino Room

<!-- impeccable:design-schema 1 -->

## Direction & Thesis

- **Thesis**: Permainan domino (gaple / block domino) murni dengan visual yang tenang, hangat, dan taktil tanpa distraksi kasino, glowing neon, banner agresif, atau estetika generatif AI.
- **Form**: Physical double-six domino set di atas meja horizontal neutral warm, didukung micro-motion halus dan audio taktil sintetis.
- **Seed Key**: a56d9a08

---

## Palette & Surface Roles

| Role | Hex | Tailwind Token | Penggunaan |
|---|---|---|---|
| Background Ground | `#F3F2EE` | `bg-background` | Background utama seluruh halaman |
| Main Surface | `#FFFFFF` | `bg-surface` | Kartu modal, HUD bar, slot pemain |
| Secondary Surface | `#EAE8E2` | `bg-surface-secondary` | Area hand pemain, kontainer kode room |
| Tertiary Surface | `#DFDDD6` | `bg-surface-tertiary` | Hover state surface sekunder |
| Primary Ink | `#191A18` | `text-ink` | Teks utama, judul, pip domino |
| Secondary Ink | `#72736E` | `text-ink-secondary` | Subtitle, counter kartu, status koneksi |
| Muted Ink | `#9E9F9A` | `text-ink-muted` | Label kecil, timestamp event |
| Primary Action | `#242623` | `bg-action` | Tombol CTA utama (Buat/Mulai Room) |
| Action Hover | `#343733` | `hover:bg-action-hover` | State hover tombol gelap |
| Subtle Accent | `#697369` | `bg-accent` | Badge Host, indikator turn aktif |
| Domino Ivory Ground | `#FCFCFA` &rarr; `#EFEFE8` | `tile-ivory` | Linear gradient badan kartu domino |
| Domino Pip Charcoal | `#191A18` | `tile-pip` | Titik pip domino standar 0-6 |
| Tile Groove Line | `#C8C7C0` | `tile-groove` | Garis pembagi tengah kartu domino |

---

## Typography

- **Font Family**: Geist / Inter (fallback ke `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
- **Font Weights**:
  - `400` (Regular): Deskripsi, teks pendukung.
  - `500` (Medium): Label kontrol, tombol sekunder, status seat.
  - `600` (Semi-bold): Subheading, nama pemain, status turn.
  - `700` (Bold) / `900` (Black): Judul utama "DOMINO", angka kode room.

---

## Border Radius Hierarchy

- **Buttons**: `10px` (`rounded-btn`)
- **Player & Action Cards**: `14px` (`rounded-card`)
- **Modals & Dialogs**: `18px` (`rounded-modal`)
- **Domino Tiles**: `8–10px` (`rounded-tile`)
- **Status Pills / Turn Banners**: `9999px` (`rounded-full`)

---

## Shadows & Tactile Elevation

- **Subtle Surface**: `0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)`
- **Domino Tile Resting**: `0 2px 6px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)`
- **Domino Tile Hover**: `0 4px 12px rgba(0,0,0,0.12), 0 12px 28px rgba(0,0,0,0.1)` (Lift 4px)
- **Domino Tile Selected**: `0 0 0 2px #191A18, 0 8px 24px rgba(0,0,0,0.18)` (Lift 10px + Ring)

---

## Motion & Micro-Interactions

- **Spring Dynamics**: `stiffness: 340, damping: 26` via Framer Motion.
- **Card Entrance**: Stagger deal animation (40ms per tile) pada saat awal permainan.
- **Turn Transition**: Smooth opacity & translateY fade saat giliran berpindah.
- **Sound Feedback**: Web Audio API sintetis (zero network audio latency / no broken mp3 links).
