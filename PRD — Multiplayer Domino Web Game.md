# Product Requirements Document
## Multiplayer Domino Web Game

**Working title:** Domino Room  
**Platform:** Web  
**Frontend:** React + TypeScript  
**Deployment:** Vercel  
**Game mode:** Online multiplayer, 2–4 pemain  
**Primary device:** Mobile-first, tetap nyaman di desktop  
**Style:** Modern, clean, neutral, non-AI-looking  
**Language awal:** Bahasa Indonesia

---

# 1. Product Overview

Domino Room adalah website multiplayer untuk bermain domino secara realtime melalui sistem **Create Room** dan **Join Room**.

Pemain tidak perlu membuat akun. Cukup memasukkan nickname, membuat atau bergabung ke room menggunakan kode room, lalu bermain setelah jumlah pemain sesuai dengan kapasitas room.

Mode permainan yang tersedia:

| Jumlah Pemain | Kartu per Pemain | Kartu Starter |
|---|---:|---:|
| 2 pemain | 14 | Tidak ada |
| 3 pemain | 9 | 1 kartu |
| 4 pemain | 7 | Tidak ada |

Total kartu domino adalah **28 kartu**, mulai dari `0-0` sampai `6-6`.

Untuk permainan 3 pemain, setelah shuffle:

- 27 kartu dibagikan kepada pemain.
- Masing-masing mendapat 9 kartu.
- 1 kartu tersisa otomatis diletakkan di meja sebagai **starter tile**.

Untuk permainan 2 dan 4 pemain, seluruh 28 kartu dibagikan.

---

# 2. Product Goals

Tujuan utama produk:

1. Pemain dapat langsung bermain tanpa registrasi.
2. Membuat room harus selesai dalam beberapa detik.
3. Bergabung ke room cukup menggunakan room code.
4. Permainan tersinkron secara realtime.
5. Tampilan nyaman digunakan di HP maupun desktop.
6. Animasi kartu terasa halus tetapi tidak berlebihan.
7. UI terlihat seperti produk game modern yang dibuat secara sengaja, bukan template AI.
8. Sistem mencegah pemain memanipulasi kartu atau melihat kartu lawan.
9. Setelah game selesai, pemain dapat langsung melakukan rematch.

---

# 3. Target User

Target utama:

- Pengguna yang ingin bermain domino/gaple bersama teman.
- Grup 2–4 orang.
- Pengguna mobile.
- Pemain casual yang tidak ingin login atau membuat akun.
- Pemain yang ingin membuka link, masuk room, dan langsung bermain.

---

# 4. Core User Flow

## 4.1 Landing Page

Ketika membuka website, user melihat:

**DOMINO**

Subtitle:

> Main domino bareng teman secara online.

Primary actions:

**Create Room**

**Join Room**

Tidak perlu hero section besar, ilustrasi 3D, gradient berlebihan, atau elemen marketing yang tidak relevan.

Landing page harus sederhana dan langsung membawa user ke permainan.

---

# 5. Create Room Flow

Ketika user memilih **Create Room**, tampil form/modal.

Input:

### Nickname

Contoh:

`Raka`

Rules:

- 2–16 karakter.
- Tidak boleh kosong.
- Trim whitespace.

### Number of Players

Pilihan berupa segmented control:

`2 Players`

`3 Players`

`4 Players`

Default:

`4 Players`

Setelah klik:

**Create Room**

sistem:

1. Membuat room.
2. Generate room code.
3. Creator otomatis menjadi host.
4. Creator masuk ke Lobby Room.

---

# 6. Room Code

Room menggunakan kode pendek.

Contoh:

`DK7H2P`

Format:

- 6 karakter.
- Uppercase.
- Tidak case-sensitive saat user memasukkan kode.

Karakter ambigu seperti:

`0 O 1 I`

sebaiknya tidak digunakan.

Contoh character set:

`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`

Room code harus unik selama room masih aktif.

---

# 7. Join Room Flow

User klik:

**Join Room**

Form:

### Nickname

`Raka`

### Room Code

`DK7H2P`

CTA:

**Join Room**

Setelah submit, server melakukan validasi.

Kemungkinan hasil:

- Room ditemukan → masuk lobby.
- Room tidak ditemukan → tampil error.
- Room penuh → tampil error.
- Game sudah dimulai → join ditolak.
- Nickname sama → user diminta menggunakan nickname lain.

Error message harus jelas.

Contoh:

> Room tidak ditemukan.

> Room sudah penuh.

> Permainan sudah dimulai.

---

# 8. Lobby Room

Lobby menampilkan:

### Room Code

Contoh:

**DK7H2P**

Dengan tombol:

**Copy Code**

dan:

**Copy Invite Link**

Invite link dapat berbentuk:

`domain.com/room/DK7H2P`

Ketika link tersebut dibuka, room code otomatis terisi.

---

# 9. Player Slots

Contoh room 4 pemain:

**Players — 3/4**

Raka  
Host

Dimas

Budi

Waiting for player...

Slot kosong ditampilkan dengan visual sederhana.

Tidak menggunakan ilustrasi/avatar generatif.

Avatar cukup menggunakan:

- lingkaran,
- initial nama,

contoh:

`R`

untuk Raka.

---

# 10. Host Controls

Host memiliki kemampuan:

- Start Game.
- Copy room code.
- Copy invite link.
- Leave Room.

Tombol:

**Start Game**

hanya aktif jika jumlah pemain sudah sesuai dengan kapasitas room.

Contoh:

Room dibuat untuk 4 pemain.

Jika pemain baru:

`3 / 4`

button:

`Waiting for players`

disabled.

Saat:

`4 / 4`

button berubah aktif:

**Start Game**

Game tidak dimulai otomatis agar semua pemain mengetahui kapan permainan dimulai.

---

# 11. Room Rules

Kapasitas room ditentukan saat room dibuat.

Contoh:

Jika host membuat:

`3 Players`

maka pemain keempat tidak dapat join.

Kapasitas tidak dapat diubah setelah ada pemain lain masuk.

Jika hanya host yang berada di lobby, host masih boleh kembali dan membuat room baru.

---

# 12. Game Preparation

Ketika host menekan **Start Game**, server:

1. Membuat satu set domino berisi 28 tile.
2. Melakukan secure random shuffle.
3. Membagikan tile sesuai mode.
4. Menentukan pemain pertama.
5. Membuat game state.
6. Mengirim kartu privat kepada masing-masing pemain.
7. Broadcast public game state.
8. Mengubah status room menjadi `playing`.

Shuffle harus dilakukan di backend, bukan browser pemain.

---

# 13. Domino Set

Set domino menggunakan double-six set:

```text
0-0
0-1
0-2
0-3
0-4
0-5
0-6

1-1
1-2
1-3
1-4
1-5
1-6

2-2
2-3
2-4
2-5
2-6

3-3
3-4
3-5
3-6

4-4
4-5
4-6

5-5
5-6

6-6
```

Total:

**28 tile**

Setiap tile memiliki ID unik untuk satu match.

Contoh:

```text
domino_6_6
domino_2_5
domino_0_4
```

---

# 14. Game Rules

MVP menggunakan aturan dasar block domino/gaple.

Board mempunyai:

```text
leftValue
rightValue
```

Contoh board:

```text
6|2 — 2|4 — 4|4 — 4|1
```

Maka ujung yang tersedia:

```text
6
1
```

Pemain dapat memainkan tile yang mempunyai angka:

```text
6
```

atau:

```text
1
```

---

# 15. Playing a Tile

Misalnya tangan pemain:

```text
1|3
2|5
5|6
0|0
```

Board:

```text
6|2 — 2|4 — 4|1
```

Pemain dapat memainkan:

```text
1|3
```

atau:

```text
5|6
```

Server menentukan apakah tile valid untuk:

- sisi kiri,
- sisi kanan,
- keduanya.

Jika tile cocok di kedua ujung, UI meminta pemain memilih:

**Play Left**

atau:

**Play Right**

Alternatif UX desktop:

pemain dapat drag tile ke ujung kiri atau kanan.

Untuk mobile, tap menjadi interaksi utama.

---

# 16. Tile Rotation

Tile otomatis dirotasi sesuai kebutuhan.

Contoh:

Pemain mempunyai:

```text
3|1
```

Board membutuhkan:

```text
1
```

sistem dapat me-render sebagai:

```text
1|3
```

ketika ditempatkan.

Data asli tile tetap:

```json
{
  "a": 3,
  "b": 1
}
```

Rotation hanya bagian dari presentasi board.

---

# 17. First Turn

Untuk MVP:

### 2 Players

Pemain pertama dipilih secara random.

Board masih kosong.

Pemain pertama boleh menaruh tile apa saja.

### 3 Players

Kartu ke-28 yang tidak dibagikan otomatis menjadi starter.

Contoh:

```text
3|5
```

Board dimulai dengan:

```text
3|5
```

Setelah itu salah satu dari tiga pemain dipilih secara random untuk mendapatkan giliran pertama.

### 4 Players

Pemain pertama dipilih secara random.

Board masih kosong.

Pemain pertama boleh menaruh tile apa saja.

---

# 18. Turn System

Game selalu mempunyai:

```text
currentPlayerId
```

Hanya pemain tersebut yang dapat memainkan tile.

UI memberikan indikator:

**Your Turn**

atau:

**Dimas's Turn**

Untuk pemain aktif:

- kartunya sedikit naik.
- area board aktif.
- tile legal dapat dipilih.

Untuk pemain lain:

- interaction disabled.

Setelah tile valid dimainkan:

```text
current player
↓
next player
↓
next player
↓
...
```

Urutan pemain tetap selama satu game.

---

# 19. Valid Move Highlight

Ketika giliran user:

Tile yang dapat dimainkan memiliki state normal.

Tile yang tidak dapat dimainkan dibuat sedikit:

- lebih redup,
- cursor disabled,
- opacity sekitar 45–55%.

Jangan menggunakan warna merah terang untuk kartu invalid.

User harus langsung mengetahui kartu mana yang legal tanpa harus mencoba satu per satu.

---

# 20. Pass

Jika pemain tidak mempunyai tile yang dapat dimainkan:

button:

**Pass**

menjadi aktif.

Server tetap harus mengecek bahwa benar-benar tidak ada legal move.

Pemain tidak boleh melakukan Pass jika masih mempunyai kartu yang valid.

Setelah Pass:

- turn berpindah.
- event singkat muncul:

`Raka passed`

Tidak menggunakan modal.

---

# 21. Winning Condition

Pemain menang jika jumlah kartunya menjadi:

```text
0
```

Game langsung selesai.

Contoh:

**Raka wins**

Game state berubah menjadi:

```text
finished
```

---

# 22. Blocked Game

Jika seluruh pemain berturut-turut tidak dapat memainkan kartu, game dianggap blocked.

Contoh untuk 4 pemain:

```text
Player A → Pass
Player B → Pass
Player C → Pass
Player D → Pass
```

Jika tidak ada tile yang dimainkan di antara pass tersebut, game selesai.

Winner ditentukan menggunakan jumlah pip paling kecil.

Contoh:

```text
Raka = 12
Dimas = 18
Budi = 9
Ari = 14
```

Winner:

```text
Budi
```

karena mempunyai nilai total tile paling rendah.

Jika dua pemain memiliki skor yang sama, hasil boleh dianggap tie untuk MVP.

---

# 23. Game Over Screen

Game over tidak perlu membawa pemain ke halaman berbeda.

Gunakan dialog/modal di atas meja.

Contoh:

# Budi wins

**9 points remaining**

Player result:

```text
Budi      9
Raka     12
Ari      14
Dimas    18
```

Actions:

**Play Again**

**Back to Lobby**

**Leave Room**

Host mengontrol rematch.

Jika host memilih Play Again:

- shuffle ulang.
- distribusi kartu ulang.
- player order dapat di-random ulang.

---

# 24. Main Game UI

Desktop layout:

```text
                 Player 3
               5 tiles left


Player 2                               Player 4
8 tiles                               4 tiles


             DOMINO BOARD


              Player 1
              Your hand
```

Untuk 2 pemain:

```text
Opponent


Board


You
```

Untuk 3 pemain:

```text
       Player 2

Player 3


       Board


        You
```

Untuk 4 pemain:

```text
         Player 3

Player 2          Player 4


          Board


           You
```

Player sendiri selalu berada di bagian bawah layar.

Posisi pemain lain disesuaikan relatif terhadap pemain lokal.

---

# 25. Player Information

Kartu lawan tidak diperlihatkan.

Yang ditampilkan hanya:

```text
Dimas
7 tiles
```

Optional visual:

7 tile backs dapat ditampilkan kecil.

Jangan pernah mengirim isi kartu lawan ke browser pemain.

Ini merupakan requirement keamanan utama.

---

# 26. Board Behaviour

Board harus mampu menangani chain domino panjang.

Desktop:

- board berada di tengah.
- dapat melakukan horizontal pan.
- mouse wheel/trackpad dapat digunakan.
- board otomatis scroll ke tile terbaru.

Mobile:

- swipe horizontal.
- auto-center ke tile terbaru.

Jika chain terlalu panjang, board boleh membentuk visual snake layout pada fase berikutnya.

Untuk MVP, horizontal scrolling sudah cukup.

---

# 27. Tile Interaction

Mobile:

**Tap tile**

Tile naik sekitar:

`8–12px`

Jika hanya satu sisi valid:

tampilkan:

**Play**

Jika dua sisi valid:

tampilkan:

**Left**

**Right**

Desktop:

Support:

- click,
- optional drag & drop.

Click tetap harus tersedia meskipun drag & drop ditambahkan.

---

# 28. Responsive Design

Prioritas:

1. Mobile 360px+
2. Tablet
3. Desktop

Game harus playable pada:

```text
360 × 640
```

tanpa horizontal overflow di luar area board.

Hand pemain dapat menggunakan horizontal scrolling.

Kartu pemain tidak perlu diperkecil berlebihan.

Lebih baik:

```text
scrollable hand
```

daripada kartu menjadi terlalu kecil.

---

# 29. Visual Direction

Desain harus terasa:

- clean,
- modern,
- calm,
- premium casual game,
- sederhana,
- deliberate.

Hindari visual yang umum terlihat pada website hasil generator AI:

- gradient besar.
- glowing buttons.
- terlalu banyak pill.
- glassmorphism.
- blur berlebihan.
- neon.
- floating blobs.
- ilustrasi generik.
- icon random.
- copywriting terlalu panjang.
- dashboard cards di setiap bagian.
- excessive rounded containers.

Tidak menggunakan emoji.

---

# 30. Color Palette

Gunakan neutral warm palette.

### Background

```css
#F3F2EE
```

### Main Surface

```css
#FFFFFF
```

### Secondary Surface

```css
#EAE8E2
```

### Primary Text

```css
#191A18
```

### Secondary Text

```css
#72736E
```

### Border

```css
#D8D7D1
```

### Dark Button

```css
#242623
```

### Dark Button Hover

```css
#343733
```

### Subtle Accent

Muted sage/stone:

```css
#697369
```

Accent hanya digunakan secara terbatas untuk:

- active turn,
- selected tile,
- status.

---

# 31. Typography

Recommended:

**Geist**

atau:

**Inter**

Font weights:

```text
400
500
600
```

Gunakan font weight `700` hanya untuk heading penting.

Tidak perlu menggunakan display font.

Style harus terasa functional dan modern.

---

# 32. Border Radius

Gunakan radius konsisten.

Buttons:

```text
10px
```

Cards:

```text
14px
```

Modal:

```text
18px
```

Domino tiles:

```text
8–10px
```

Hindari semua elemen menggunakan radius 24–30px.

---

# 33. Shadows

Shadow sangat subtle.

Contoh:

```css
box-shadow:
0 1px 2px rgba(0,0,0,.04),
0 8px 24px rgba(0,0,0,.06);
```

Domino tile boleh memiliki shadow sedikit lebih terlihat agar terasa seperti object fisik.

---

# 34. Domino Asset Requirement

User tidak perlu menyediakan gambar domino secara manual.

Developer bertanggung jawab mencari satu set gambar domino dari internet.

Gunakan asset:

- public domain,
- CC0,
- atau lisensi permissive yang mengizinkan penggunaan pada website.

Prioritaskan format:

**SVG**

dibanding PNG.

Sumber kandidat:

- Wikimedia Commons
- OpenGameArt
- open-source SVG repository

Lisensi setiap asset harus dicek sebelum digunakan.

Jangan mengambil gambar dari Google Images secara langsung.

Jangan menggunakan asset dengan copyright yang tidak jelas.

---

# 35. Asset Storage

Setelah asset ditemukan:

**jangan hotlink gambar dari website sumber.**

Download seluruh asset dan simpan di repository project.

Struktur:

```text
/public
  /domino
    0-0.svg
    0-1.svg
    0-2.svg
    ...
    6-6.svg
```

Total:

```text
28 SVG
```

Kemudian aplikasi memanggil:

```tsx
<img
  src={`/domino/${a}-${b}.svg`}
  alt={`${a}-${b}`}
/>
```

Jika asset mempunyai orientasi terbalik, aplikasi dapat melakukan:

```css
transform: rotate(180deg);
```

tanpa membutuhkan asset kedua.

Tambahkan:

```text
/public/domino/LICENSE.txt
```

yang berisi:

- sumber asset.
- URL sumber.
- nama pembuat jika diperlukan.
- jenis lisensi.

---

# 36. Domino Tile Appearance

Preferensi visual:

- ivory/off-white.
- pip hitam/dark charcoal.
- center divider tipis.
- sedikit shadow.
- tidak glossy.
- tidak menggunakan style kasino berlebihan.

Contoh:

```text
┌─────────┐
│ •     • │
│    •    │
│ •     • │
├─────────┤
│    •    │
│         │
│    •    │
└─────────┘
```

Tile harus tetap terbaca dengan baik pada layar HP.

---

# 37. Motion Design

Gunakan:

**Motion for React / Framer Motion**

Animasi harus terasa cepat dan natural.

Standard transition:

```text
180–250ms
```

---

# 38. Tile Draw Animation

Ketika game dimulai, kartu tidak langsung muncul seluruhnya.

Gunakan stagger pendek.

Contoh:

```text
tile 1
50ms
tile 2
50ms
tile 3
...
```

Total animasi tidak boleh terlalu panjang.

Target keseluruhan:

sekitar `600–900ms`.

---

# 39. Tile Play Animation

Ketika kartu dimainkan:

1. Tile sedikit scale.
2. Bergerak menuju board.
3. Posisi board update.
4. Tile settle menggunakan soft spring.

Contoh Motion configuration:

```tsx
transition={{
  type: "spring",
  stiffness: 320,
  damping: 28
}}
```

Hindari:

- bounce besar.
- spin.
- confetti berlebihan.

---

# 40. Hover Animation

Desktop tile:

```text
translateY(-4px)
```

sekitar:

```text
160ms
```

Selected tile:

```text
translateY(-10px)
```

dan menggunakan border/shadow sedikit lebih kuat.

---

# 41. Page Animation

Transisi:

Landing → Lobby

Lobby → Game

cukup menggunakan:

```text
opacity
+
translateY 6–10px
```

Tidak menggunakan slide panjang.

---

# 42. Win Animation

Saat menang:

- board sedikit dim.
- modal fade + scale masuk.
- winner name tampil.
- subtle tile highlight.

Tidak menggunakan emoji atau efek celebration yang berlebihan.

Confetti tidak menjadi bagian MVP.

---

# 43. Recommended Tech Stack

## Frontend

```text
React
TypeScript
Vite
```

Deployment:

```text
Vercel
```

Styling:

```text
Tailwind CSS
```

Animation:

```text
Motion / Framer Motion
```

Client state:

```text
Zustand
```

Server state/realtime:

```text
Supabase
```

---

# 44. Backend

Recommended:

**Supabase**

Digunakan untuk:

- database.
- realtime.
- room management.
- player sessions.
- game state.
- authentication/session.
- server-side game functions.

React tetap di-deploy menggunakan Vercel.

Architecture:

```text
Browser
   ↓
React App
   ↓
Supabase API
   ↓
Game Logic / RPC
   ↓
PostgreSQL
   ↓
Realtime
   ↓
Other Players
```

---

# 45. Why Game Logic Must Be Server-Side

Client tidak boleh menentukan:

- hasil shuffle.
- kartu pemain lain.
- apakah move valid.
- turn selanjutnya.
- winner.
- jumlah kartu pemain lain.
- starter tile.

Client hanya mengirim intent.

Contoh:

```json
{
  "action": "PLAY_TILE",
  "tileId": "tile_2_6",
  "side": "right"
}
```

Server melakukan validation.

Jika valid:

```text
update database
↓
broadcast state
↓
semua pemain update
```

Jika invalid:

```text
reject request
```

---

# 46. Anonymous Player Session

Tidak perlu login email/password.

Ketika user pertama kali membuka website:

buat anonymous player session.

Simpan identifier secara lokal.

Contoh:

```text
localStorage
```

Informasi:

```json
{
  "sessionId": "...",
  "nickname": "Raka"
}
```

Jika browser refresh:

session dapat digunakan untuk reconnect ke room.

Backend tetap melakukan autentikasi session, sehingga `playerId` tidak boleh dipercaya hanya berdasarkan value yang dikirim frontend.

---

# 47. Suggested Database

## rooms

```text
id
code
host_player_id
max_players
status
created_at
updated_at
```

Status:

```text
lobby
playing
finished
closed
```

---

# 48. room_players

```text
id
room_id
player_id
nickname
seat_number
connected
joined_at
last_seen_at
```

---

# 49. matches

```text
id
room_id
status
current_player_id
starter_tile
left_value
right_value
consecutive_passes
created_at
finished_at
winner_player_id
```

---

# 50. board_tiles

```text
id
match_id
tile_a
tile_b
position
orientation
played_by
played_at
```

---

# 51. Player Hands

Kartu pemain tidak boleh diletakkan di public room state.

Suggested structure:

```text
player_hands
```

fields:

```text
match_id
player_id
tile_id
tile_a
tile_b
```

Security policy:

player hanya dapat membaca kartu dengan:

```text
player_id == authenticated player
```

Pemain lain hanya menerima:

```text
hand_count
```

bukan tile contents.

---

# 52. Public Game State

Data yang aman dikirim kepada semua pemain:

```json
{
  "roomCode": "DK7H2P",
  "status": "playing",
  "currentPlayerId": "p2",
  "players": [
    {
      "id": "p1",
      "nickname": "Raka",
      "tileCount": 7
    },
    {
      "id": "p2",
      "nickname": "Dimas",
      "tileCount": 5
    }
  ],
  "board": [],
  "leftValue": 3,
  "rightValue": 6
}
```

---

# 53. Private Player State

Player menerima state tambahan:

```json
{
  "hand": [
    {
      "id": "t12",
      "a": 2,
      "b": 4
    },
    {
      "id": "t18",
      "a": 6,
      "b": 6
    }
  ]
}
```

Data ini hanya tersedia bagi owner.

---

# 54. Realtime Events

Event penting:

```text
PLAYER_JOINED
PLAYER_LEFT
PLAYER_RECONNECTED
GAME_STARTED
TILE_PLAYED
PLAYER_PASSED
TURN_CHANGED
GAME_FINISHED
REMATCH_STARTED
```

Frontend subscribe terhadap perubahan room/match menggunakan realtime connection.

---

# 55. Server Functions

Recommended backend operations:

```text
create_room()
join_room()
leave_room()
start_game()
play_tile()
pass_turn()
request_rematch()
start_rematch()
```

Semua fungsi penting harus atomic.

Contoh:

`play_tile()`:

1. check match active.
2. check player berada di room.
3. check giliran player.
4. check player memiliki tile tersebut.
5. check tile sesuai board.
6. remove tile dari hand.
7. insert tile ke board.
8. update left/right value.
9. check winner.
10. update next turn.
11. commit transaction.

---

# 56. Optimistic UI

Untuk memainkan tile, gunakan limited optimistic UI.

Tile boleh langsung mendapatkan animation feedback ketika ditekan.

Namun final placement harus mengikuti server confirmation.

Jika server reject:

tile kembali ke posisi semula.

---

# 57. Reconnection

Jika user reload browser ketika sedang bermain:

sistem mencoba:

```text
reconnect session
↓
find active room
↓
restore player seat
↓
fetch public state
↓
fetch private hand
↓
resume game
```

Pemain tidak perlu memasukkan room code lagi selama session masih valid.

---

# 58. Disconnect State

Jika pemain kehilangan koneksi:

tampilkan kepada player lain:

```text
Dimas
Reconnecting...
```

Berikan grace period.

Recommended:

```text
90 seconds
```

Jika user reconnect dalam periode tersebut:

permainan dilanjutkan.

Untuk MVP, jika pemain tidak kembali setelah grace period, match dapat dihentikan dan pemain lain dikembalikan ke lobby.

Bot replacement tidak termasuk MVP.

---

# 59. Host Disconnect

Jika host meninggalkan lobby:

host role berpindah ke pemain yang join setelahnya paling awal.

Jika host disconnect sementara ketika game berlangsung, game tidak langsung dibatalkan.

Host ownership dapat dipindahkan hanya jika host benar-benar meninggalkan room.

---

# 60. Room Expiration

Room kosong tidak perlu disimpan selamanya.

Recommended:

- room tanpa pemain → close.
- inactive room → expire setelah beberapa jam.
- finished abandoned game → cleanup otomatis.

Ini menjaga database tetap ringan.

---

# 61. URL Structure

Recommended routes:

```text
/
```

Landing.

```text
/room/:code
```

Lobby atau game room.

Contoh:

```text
/room/DK7H2P
```

Tidak perlu route terpisah untuk game.

Room state menentukan apakah user melihat:

```text
Lobby
```

atau:

```text
Game
```

---

# 62. React Component Structure

Recommended:

```text
src/
│
├── components/
│   ├── ui/
│   ├── domino/
│   ├── lobby/
│   └── game/
│
├── pages/
│   ├── HomePage.tsx
│   └── RoomPage.tsx
│
├── stores/
│   ├── playerStore.ts
│   └── gameStore.ts
│
├── hooks/
│   ├── useRoom.ts
│   ├── useRealtimeRoom.ts
│   └── useGame.ts
│
├── lib/
│   ├── supabase.ts
│   └── domino.ts
│
├── types/
│   ├── game.ts
│   └── room.ts
│
└── App.tsx
```

---

# 63. Main Components

### DominoTile

```tsx
<DominoTile
  top={6}
  bottom={4}
  orientation="vertical"
/>
```

Responsible for:

- image.
- rotation.
- selected state.
- disabled state.
- animation.

---

### PlayerHand

Responsible for:

- displaying player's tiles.
- horizontal scroll.
- legal move status.
- tile selection.

---

### DominoBoard

Responsible for:

- board tiles.
- left endpoint.
- right endpoint.
- tile placement animations.
- scrolling.

---

### PlayerSeat

Displays:

```text
nickname
connection status
tile count
turn indicator
```

---

### GameHUD

Displays:

```text
room code
current turn
leave button
```

---

### GameOverDialog

Displays:

```text
winner
scores
rematch
leave
```

---

# 64. State Machine

Room:

```text
JOINING
↓
LOBBY
↓
STARTING
↓
PLAYING
↓
FINISHED
```

Player turn:

```text
WAITING
↓
MY_TURN
↓
SELECTING_TILE
↓
SUBMITTING_MOVE
↓
WAITING
```

State machine membantu menghindari double click dan state UI yang tidak sinkron.

---

# 65. Sound

Sound bukan requirement utama MVP.

Tetapi architecture boleh disiapkan untuk:

- tile placed.
- your turn.
- game win.

Default jika ditambahkan:

sound volume rendah.

Harus ada mute control.

---

# 66. Accessibility

Minimum requirements:

- keyboard-accessible buttons.
- visible focus states.
- minimum button height sekitar 44px pada mobile.
- text contrast cukup.
- tidak hanya mengandalkan warna untuk menunjukkan turn.
- domino mempunyai descriptive alt/aria label.

Contoh:

```text
Domino 3 and 6
```

---

# 67. Performance

Target:

Landing page:

- fast initial load.
- asset domino SVG cached.
- no large animation library usage outside game elements.

Domino assets:

28 SVG relatif kecil dan cacheable.

Gunakan lazy loading untuk UI yang tidak diperlukan pada landing page.

Realtime update tidak boleh menyebabkan seluruh page re-render.

---

# 68. Loading States

Create room:

```text
Creating room...
```

Join:

```text
Joining...
```

Start:

```text
Shuffling tiles...
```

Reconnect:

```text
Reconnecting...
```

Hindari spinner besar.

Gunakan subtle progress indicator.

---

# 69. Error Handling

Harus menangani:

```text
ROOM_NOT_FOUND
ROOM_FULL
GAME_ALREADY_STARTED
INVALID_ROOM_CODE
INVALID_MOVE
NOT_YOUR_TURN
PLAYER_NOT_IN_ROOM
NETWORK_ERROR
SESSION_EXPIRED
```

Error user-facing tidak menampilkan kode teknis.

Contoh:

Internal:

```text
INVALID_MOVE
```

UI:

> Tile ini tidak dapat dimainkan di posisi tersebut.

---

# 70. Anti-Cheat Requirements

MVP minimal harus memastikan:

1. Shuffle dilakukan backend.
2. Private hand tidak dikirim ke lawan.
3. Client tidak menentukan turn.
4. Client tidak menentukan winner.
5. Server memvalidasi tile ownership.
6. Server memvalidasi legal move.
7. Server memvalidasi Pass.
8. Database menggunakan row-level access/security.
9. Mutation game dilakukan menggunakan server function.
10. Secret/service key tidak pernah dimasukkan ke frontend.

---

# 71. MVP Scope

MVP harus memiliki:

- Landing page.
- Nickname.
- Create room.
- Join room.
- Invite room code.
- Invite URL.
- 2 player mode.
- 3 player mode.
- 4 player mode.
- Realtime multiplayer.
- Shuffle.
- Automatic card distribution.
- 3-player starter tile.
- Player turns.
- Legal move validation.
- Left/right placement.
- Pass.
- Win detection.
- Blocked-game detection.
- Game result.
- Rematch.
- Leave room.
- Reconnection.
- Responsive mobile UI.
- Domino image assets.
- Smooth tile animations.
- Vercel deployment.

---

# 72. Not in MVP

Tidak perlu dibuat dahulu:

- User registration.
- Google login.
- Friends list.
- Public matchmaking.
- Global leaderboard.
- Ranking/MMR.
- Tournament.
- Bot.
- Spectator.
- Chat.
- Voice chat.
- Custom domino skins.
- Coins.
- Shop.
- Ads.
- Paid items.
- Match history.
- Profile.
- Achievements.

Semua fitur tersebut dapat ditambahkan setelah core game stabil.

---

# 73. Future Features

Potential V2:

### Public Matchmaking

User memilih:

```text
2P
3P
4P
```

lalu sistem mencarikan pemain.

### Private Room Settings

Host dapat menentukan:

```text
Turn timer
Game rule
Rematch rules
```

### Turn Timer

Contoh:

```text
30 seconds
```

### Player Stats

```text
Games Played
Wins
Win Rate
```

### Spectator Mode

User dapat melihat game tanpa melihat kartu pemain.

---

# 74. Analytics

Basic product events:

```text
landing_view
create_room_clicked
room_created
join_room_clicked
room_joined
game_started
tile_played
player_passed
game_finished
rematch_started
player_disconnected
```

Important metrics:

```text
Room Created → Game Started conversion
Average players per room
Game completion rate
Disconnect rate
Rematch rate
Average game duration
```

---

# 75. Suggested Landing UI

Desktop:

```text
DOMINO


Main domino bareng teman.


[ Create Room ]

[ Join Room ]


No account required
```

Mobile:

```text
DOMINO

Main domino
bareng teman.

[ Create Room ]

[ Join Room ]
```

Background menggunakan neutral warm tone.

Tidak perlu screenshot mockup besar pada homepage.

---

# 76. Suggested Lobby UI

```text
DOMINO


Room

DK7H2P        Copy


Players                         3 / 4

[R] Raka                       Host

[D] Dimas

[B] Budi

[ ] Waiting for player


[ Start Game ]
```

Di bawah:

```text
Share invite link
```

---

# 77. Suggested Game Screen

```text
Room DK7H2P


                  Dimas
                 5 tiles


        ┌───┬───┐ ┌───┬───┐
        │ 6 │ 2 │ │ 2 │ 4 │
        └───┴───┘ └───┴───┘


              Your turn


     YOUR HAND

 [3|4] [4|6] [1|1] [5|6] [0|2]


                 Pass
```

UI game fokus pada meja dan kartu.

Navigation tidak perlu banyak.

---

# 78. Design Quality Checklist

Sebelum release, pastikan:

- tidak ada emoji.
- tidak ada unnecessary gradient.
- tidak ada glowing CTA.
- tidak semua elemen berbentuk pill.
- typography hierarchy jelas.
- whitespace cukup.
- maksimum 1 primary CTA dalam satu konteks.
- button hover subtle.
- tile interaction terasa physical.
- animation tidak menghambat game.
- mobile layout playable.
- room code mudah dicopy.
- current turn sangat jelas.
- kartu legal mudah dikenali.
- state disconnect mudah dipahami.

---

# 79. Functional Acceptance Criteria

## Create Room

Given user berada di homepage.

When user memasukkan nickname dan memilih 4 pemain lalu Create Room.

Then:

- room dibuat.
- room code muncul.
- user menjadi host.
- lobby menunjukkan `1 / 4`.

---

## Join Room

Given room mempunyai kapasitas 4 pemain.

When pemain lain memasukkan room code yang benar.

Then:

- pemain masuk lobby.
- semua user di room melihat player baru tanpa refresh.

---

## Start Game — 4 Players

Given 4 pemain berada di room.

When host menekan Start Game.

Then:

- 28 tile di-shuffle.
- setiap pemain mendapatkan 7 tile.
- tidak ada kartu tersisa.
- hanya kartu sendiri yang dapat dibaca player.

---

## Start Game — 3 Players

Given 3 pemain berada di room.

When host menekan Start Game.

Then:

- 28 tile di-shuffle.
- setiap pemain mendapatkan 9 tile.
- 1 tile otomatis ditempatkan sebagai starter.
- total tile tetap 28.

---

## Start Game — 2 Players

Given 2 pemain berada di room.

When host menekan Start Game.

Then:

- masing-masing mendapatkan 14 tile.
- tidak ada tile tersisa.

---

## Valid Move

Given board endpoint:

```text
2 dan 6
```

And player mempunyai:

```text
6|4
```

When player memainkan tile ke endpoint `6`.

Then:

- move diterima.
- board berubah.
- tile dihapus dari hand.
- turn berpindah.

---

## Invalid Move

Given endpoint:

```text
2 dan 6
```

And tile:

```text
3|5
```

When player mencoba memainkannya.

Then:

- server menolak move.
- board tidak berubah.
- tile tetap di hand.
- turn tidak berubah.

---

## Pass

Given player tidak memiliki legal move.

When player memilih Pass.

Then:

- pass diterima.
- turn berpindah.

Given player masih mempunyai legal move.

When player memilih Pass.

Then:

- server menolak Pass.

---

## Win

Given player hanya mempunyai satu tile.

When tile tersebut dimainkan secara valid.

Then:

- hand count menjadi 0.
- match berubah menjadi finished.
- player tersebut menjadi winner.
- game over dialog ditampilkan kepada semua pemain.

---

# 80. Recommended Development Order

### Phase 1 — Foundation

- React + TypeScript + Vite.
- Tailwind.
- Routing.
- Supabase.
- Base design system.

### Phase 2 — Rooms

- Anonymous session.
- Create room.
- Join room.
- Lobby.
- Player presence.
- Invite code.

### Phase 3 — Game Engine

- Domino set generator.
- Shuffle.
- Distribution.
- Turn management.
- Move validation.
- Pass.
- Winning.
- Blocked game.

### Phase 4 — Realtime

- Room subscription.
- Game subscription.
- Player connection state.
- Reconnection.

### Phase 5 — Game UI

- Domino assets.
- Hand.
- Board.
- Player seats.
- Mobile layout.
- 2P/3P/4P layout.

### Phase 6 — Motion

- Shuffle/deal animation.
- Tile selection.
- Tile placement.
- Turn transition.
- Game-over animation.

### Phase 7 — Hardening

- Anti-cheat.
- RLS/security.
- race-condition tests.
- reconnect tests.
- mobile testing.

### Phase 8 — Release

- Vercel deployment.
- production environment variables.
- database migrations.
- analytics.
- error tracking.

---

# 81. Definition of Done

MVP dianggap selesai ketika:

**Empat user dapat membuka website dari empat device berbeda, masuk ke room yang sama menggunakan room code, mendapatkan masing-masing tujuh kartu privat, memainkan satu pertandingan domino secara realtime sampai selesai, lalu melakukan rematch tanpa refresh halaman.**

Selain itu:

- mode 2 pemain berjalan dengan distribusi 14/14.
- mode 3 pemain berjalan dengan distribusi 9/9/9 + 1 starter.
- mode 4 pemain berjalan dengan distribusi 7/7/7/7.
- lawan tidak dapat melihat isi hand pemain lain.
- refresh browser dapat melakukan reconnect.
- UI usable dari mobile.
- website berhasil di-deploy ke Vercel.
- seluruh asset domino tersedia secara lokal di repository.
- asset mempunyai lisensi yang jelas.
- interaction dan animation terasa smooth.
- desain tetap neutral, clean, dan tidak menggunakan aesthetic generative-AI yang berlebihan.

---

# 82. Final Technical Recommendation

Untuk versi pertama gunakan:

```text
React
TypeScript
Vite
Tailwind CSS
Motion
Zustand
Supabase PostgreSQL
Supabase Realtime
Supabase server functions/RPC
Vercel
```

Arsitektur:

```text
                    VERCEL

                React Frontend
                     │
                     │
                     ▼
                SUPABASE
        ┌────────────┼────────────┐
        │            │            │
    PostgreSQL    Realtime     Game RPC
        │            │            │
        └────────────┼────────────┘
                     │
                     ▼
                 Game State
```

Frontend bertanggung jawab atas:

```text
Rendering
Animation
Input
UI state
```

Backend bertanggung jawab atas:

```text
Rooms
Shuffle
Hands
Turns
Move validation
Pass validation
Winner detection
Realtime game state
Anti-cheat
```

Pembagian ini menjaga aplikasi tetap sederhana untuk di-deploy di Vercel tetapi game multiplayer tetap aman dan konsisten.