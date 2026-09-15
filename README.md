# Ruang Latihan Soal

Web latihan soal interaktif. Soal disimpan di file JSON per paket, diacak setiap sesi mulai, dan langsung dicek jawabannya di halaman (tanpa backend/server).

## Struktur folder

```
latihan-soal/
├── index.html      ← halaman (pilih paket → kerjakan soal → hasil)
├── style.css        ← tampilan
├── app.js           ← logika: load JSON, acak soal, cek jawaban, skor
├── data/
│   ├── paket-1.json ← Paket Soal 1
│   └── paket-2.json ← Paket Soal 2
└── README.md
```

## Menambah paket soal baru

1. Buat file baru di `data/`, misalnya `paket-3.json`, dengan format yang sama:

```json
{
  "judul": "Paket Soal 3 - IPA",
  "soal": [
    {
      "id": "p3-01",
      "pertanyaan": "Tulis pertanyaan di sini",
      "pilihan": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "jawaban": "A",
      "pembahasan": "Penjelasan kenapa A yang benar"
    }
  ]
}
```

2. Daftarkan di `app.js`, di bagian paling atas file:

```js
const PAKET = [
  { id: "paket-1", nama: "Paket Soal 1", file: "data/paket-1.json" },
  { id: "paket-2", nama: "Paket Soal 2", file: "data/paket-2.json" },
  { id: "paket-3", nama: "Paket Soal 3", file: "data/paket-3.json" }, // ← baris baru
];
```

Tidak perlu ubah HTML/CSS. Tombol paket baru otomatis muncul di halaman pilih paket.

## Cara deploy ke GitHub Pages (gratis)

1. Buat repository baru di GitHub, misalnya `latihan-soal`.
2. Upload semua file/folder di atas ke repo tersebut (lewat "Add file → Upload files" di web GitHub, atau lewat `git push` kalau sudah biasa pakai git).
3. Di repo, buka **Settings → Pages**.
4. Pada **Source**, pilih branch `main` dan folder `/ (root)`, lalu klik **Save**.
5. Tunggu 1-2 menit, GitHub akan kasih link seperti:
   `https://namamu.github.io/latihan-soal/`
6. Buka link itu — web-nya sudah jadi dan bisa dibagikan ke siapa saja.

## Kenapa harus dibuka lewat server/Pages, bukan diklik dua kali file-nya?

`app.js` memuat file JSON pakai `fetch()`, dan browser memblokir `fetch()` ke file lokal kalau dibuka langsung dari File Explorer (protokol `file://`). Ini normal dan aman — begitu di-deploy ke GitHub Pages (protokol `https://`), fetch-nya berjalan normal.

Kalau mau coba dulu di komputer sendiri sebelum upload, jalankan server lokal sederhana di folder ini, contoh pakai Python:

```
python -m http.server 8000
```

lalu buka `http://localhost:8000` di browser.
