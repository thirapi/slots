# Olympus Gates - Slot Game Asset Documentation

Dokumentasi ini berisi daftar lengkap aset yang diperlukan untuk mencapai kualitas visual premium (Pragmatic Play Style).

## 📂 Struktur Folder Aset
Letakkan semua file di dalam folder `public/images/`.

```text
public/
├── images/
│   ├── symbols/        # Simbol slot (Normal & Win)
│   ├── zeus/           # Karakter Zeus (Atlas/Frames)
│   ├── ui/             # Frame, Button, Panel
│   └── background/     # Sky, Islands, Clouds
└── audio/              # Music & Sound Effects
```

---

## 1. Slot Symbols (`/images/symbols/`)
Setiap simbol direkomendasikan berukuran **512x512px** dalam format **.webp**.

| ID Simbol | Nama | Deskripsi |
| :--- | :--- | :--- |
| `RED_GEM` | Permata Merah | High pay gem (Octagon shape) |
| `PURPLE_GEM` | Permata Ungu | Medium pay gem (Diamond shape) |
| `YELLOW_GEM` | Permata Kuning | Medium pay gem (Square shape) |
| `GREEN_GEM` | Permata Hijau | Low pay gem (Triangle shape) |
| `BLUE_GEM` | Permata Biru | Low pay gem (Circle shape) |
| `CUP` | Cangkir Emas | High mythology item |
| `RING` | Cincin Permata | High mythology item |
| `HOURGLASS` | Jam Pasir | High mythology item |
| `CROWN` | Mahkota Zeus | Highest regular pay item |
| `SCATTER` | Wajah Zeus | Digunakan untuk memicu Free Spins |
| `MULTIPLIER` | Bola Kristal | Warna: Blue (2x-5x), Green (6x-10x), Red (25x+), Pink (500x) |

---

## 2. Karakter Zeus (`/images/zeus/`)
Disarankan menggunakan **Texture Atlas** (JSON + Image).

*   `zeus.json` & `zeus.png`: Berisi frame untuk:
    *   `idle`: Gerakan bernapas.
    *   `attack`: Melempar petir (tangan terangkat).
    *   `laugh`: Tertawa saat Big Win.
    *   `angry`: Saat masuk mode Free Spins.

---

## 3. UI & Frame (`/images/ui/`)
*   `reel_frame.webp`: Tekstur marmer + gold border (1200x900px).
*   `multiplier_hud.webp`: Background kecil untuk angka multiplier di atas reel.
*   `buy_panel.webp`: Background modal untuk Buy Free Spins.
*   `paytable_bg.webp`: Background untuk panel informasi.
*   `coin_gold.webp`: Partikel koin emas kecil untuk animasi Big Win.

---

## 4. Background & Environment (`/images/background/`)
*   `sky_bg.webp`: Langit ungu gelap/biru tua (1920x1080px).
*   `cloud_0.webp`, `cloud_1.webp`: Awan transparan untuk parallax.
*   `island_0.webp`, `island_1.webp`: Pulau melayang untuk sisi kiri/kanan.
*   `god_ray.webp`: Tekstur gradasi cahaya kuning transparan.

---

## 5. Audio Assets (`/public/audio/`)
Format: **.mp3** (128kbps atau lebih tinggi).

*   `bgm_base.mp3`: Musik utama orkestra Yunani.
*   `bgm_freespin.mp3`: Musik intens mode bonus.
*   `sfx_spin.mp3`: Klik mekanik putaran.
*   `sfx_drop.mp3`: Bunyi marmer mendarat (Duk!).
*   `sfx_win_short.mp3`: Bunyi denting kemenangan kecil.
*   `sfx_big_win.mp3`: Lonceng kemenangan besar.
*   `sfx_mega_win.mp3`: Fanfare kemenangan mega.
*   `sfx_epic_win.mp3`: Musik klimaks kemenangan epik.
*   `sfx_multiplier_pop.mp3`: Bunyi petir menyambar (Electric zap).
*   `sfx_trigger.mp3`: Suara alarm Free Spins terpicu.

---

## 🛠️ Tips Teknis:
1.  **Transparency:** Gunakan PNG-24 atau WebP (lossless) untuk simbol agar alpha channel tetap bersih.
2.  **SpriteSheet:** Gunakan software seperti *TexturePacker* untuk menggabungkan simbol ke satu atlas guna optimasi GPU.
3.  **Naming Convention:** Samakan nama file dengan `alias` yang ada di `AssetManager.ts`.
