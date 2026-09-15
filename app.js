/* =========================================================
   KONFIGURASI KATEGORI & PAKET SOAL
   Tambah kategori / paket baru cukup di sini.
   File JSON ditaruh di folder /data/<kategori>/
   ========================================================= */
const KATEGORI = [
  {
    id: "ssw",
    nama: "SSW",
    ikon: "🍜",
    paket: [
      { id: "ssw-1", nama: "ssw 1", file: "data/Ssw/ssw1.json" },
      { id: "ssw-2", nama: "ssw 2", file: "data/Ssw/ssw2.json" },
      { id: "ssw-3", nama: "ssw 3", file: "data/Ssw/ssw3.json" },
      { id: "ssw-4", nama: "ssw 4", file: "data/Ssw/ssw4.json" },
      { id: "ssw-5", nama: "ssw 5", file: "data/Ssw/ssw5.json" },
      { id: "ssw-6", nama: "ssw 6", file: "data/Ssw/ssw6.json" },
      { id: "ssw-7", nama: "ssw 7", file: "data/Ssw/ssw7.json" },
      { id: "ssw-8", nama: "ssw 8", file: "data/Ssw/ssw8.json" },
    ],
  },
  {
    id: "jft",
    nama: "JFT",
    ikon: "📘",
    paket: [
      { id: "jft-1", nama: "jft 1", file: "data/jft/jft1.json" },
      { id: "jft-2", nama: "jft 2", file: "data/jft/jft2.json" },
    ],
  },
  {
    id: "kotoba",
    nama: "Kotoba",
    ikon: "📚",
    paket: [
      { id: "kotoba-1", nama: "Bab 1", file: "data/Kotoba/bab1.json" },
      { id: "kotoba-2", nama: "Bab 2", file: "data/Kotoba/bab2.json" },
      { id: "kotoba-3", nama: "Bab 3", file: "data/Kotoba/bab3.json" },
      { id: "kotoba-4", nama: "Bab 4", file: "data/Kotoba/bab4.json" },
      { id: "kotoba-5", nama: "Bab 5", file: "data/Kotoba/bab5.json" },
      { id: "kotoba-6", nama: "Bab 6", file: "data/Kotoba/bab6.json" },
      { id: "kotoba-7", nama: "Bab 7", file: "data/Kotoba/bab7.json" },
      { id: "kotoba-8", nama: "Bab 8", file: "data/Kotoba/bab8.json" },
      { id: "kotoba-9", nama: "Bab 9", file: "data/Kotoba/bab9.json" },
      { id: "kotoba-10", nama: "Bab 10", file: "data/Kotoba/bab10.json" },
      { id: "kotoba-11", nama: "Bab 11", file: "data/Kotoba/bab11.json" },
      { id: "kotoba-12", nama: "Bab 12", file: "data/Kotoba/bab12.json" },
    ],
  },
];

/* =========================================================
   STATE
   ========================================================= */
let kategoriAktif = null;   // { id, nama, ikon, paket: [...] }
let paketAktif = null;      // { id, nama, file, judul, soal: [...] }
let soalAcak = [];          // urutan soal ter-acak untuk sesi berjalan
let indexSoal = 0;
let jawabanUser = [];       // { pertanyaan, dipilih, jawabanBenar, benar }
let sudahDijawab = false;
let pilihanTerpilih = null;

/* =========================================================
   ELEMEN DOM
   ========================================================= */
// Layar 1: pilih kategori
const layarPilih = document.getElementById("layar-pilih");
const daftarPaketEl = document.getElementById("daftar-paket");
const statusMuatEl = document.getElementById("status-muat");

// Layar 2: pilih paket dalam kategori
const layarPilihPaket = document.getElementById("layar-pilih-paket");
const judulKategoriEl = document.getElementById("judul-kategori");
const daftarPaketKategoriEl = document.getElementById("daftar-paket-kategori");
const btnKembaliKategori = document.getElementById("btn-kembali-kategori");

// Layar 3: sesi soal
const layarSoal = document.getElementById("layar-soal");
const judulPaketAktifEl = document.getElementById("judul-paket-aktif");
const nomorProgresEl = document.getElementById("nomor-progres");
const isiProgresEl = document.getElementById("isi-progres");
const nomorSoalStempelEl = document.getElementById("nomor-soal-stempel");
const teksPertanyaanEl = document.getElementById("teks-pertanyaan");
const daftarPilihanEl = document.getElementById("daftar-pilihan");
const pembahasanEl = document.getElementById("pembahasan");
const teksVerdictEl = document.getElementById("teks-verdict");
const teksPembahasanEl = document.getElementById("teks-pembahasan");
const btnJawab = document.getElementById("btn-jawab");
const btnLanjut = document.getElementById("btn-lanjut");
const btnKeluar = document.getElementById("btn-keluar");

// Layar 4: hasil
const layarHasil = document.getElementById("layar-hasil");
const judulHasilEl = document.getElementById("judul-hasil");
const skorAngkaEl = document.getElementById("skor-angka");
const rekapListEl = document.getElementById("rekap-list");
const btnUlangi = document.getElementById("btn-ulangi");
const btnPaketLain = document.getElementById("btn-paket-lain");

/* =========================================================
   UTIL
   ========================================================= */
function acak(array) {
  const hasil = [...array];
  for (let i = hasil.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [hasil[i], hasil[j]] = [hasil[j], hasil[i]];
  }
  return hasil;
}

/**
 * Sembunyikan SEMUA layar, tampilkan yang dituju.
 * Pakai querySelectorAll biar otomatis include layar flashcard juga.
 */
function tampilkan(layar) {
  document.querySelectorAll(".layar").forEach((el) => {
    el.classList.add("tersembunyi");
  });
  layar.classList.remove("tersembunyi");
}

/**
 * Reset semua state sesi soal (dipakai saat keluar).
 */
function resetStateSesi() {
  paketAktif = null;
  soalAcak = [];
  indexSoal = 0;
  jawabanUser = [];
  sudahDijawab = false;
  pilihanTerpilih = null;

  // Bersihkan tampilan (biar nggak ada sisa render lama)
  if (daftarPilihanEl) daftarPilihanEl.innerHTML = "";
  if (teksPertanyaanEl) teksPertanyaanEl.textContent = "";
  if (pembahasanEl) pembahasanEl.classList.add("tersembunyi");
  if (isiProgresEl) isiProgresEl.style.width = "0%";
}

/**
 * Reset semua state termasuk kategori yang sedang dibuka.
 */
function resetSemuaState() {
  resetStateSesi();
  kategoriAktif = null;
}

/**
 * Reset flashcard kalau modul flashcard.js aktif.
 */
function resetFlashcardJikaAda() {
  if (typeof window.resetFlashcard === "function") {
    window.resetFlashcard();
  }
}

/* =========================================================
   LAYAR 1: DAFTAR KATEGORI
   ========================================================= */
function renderDaftarKategori() {
  daftarPaketEl.innerHTML = "";
  KATEGORI.forEach((k) => {
    const kartu = document.createElement("button");
    kartu.type = "button";
    kartu.className = "kartu-paket";
    kartu.innerHTML = `
      <span>
        <span class="kp-nama">${k.ikon || "📁"} ${k.nama}</span>
        <span class="kp-info">${k.paket.length} paket soal</span>
      </span>
      <span class="kp-panah">&rarr;</span>
    `;
    kartu.addEventListener("click", () => bukaKategori(k));
    daftarPaketEl.appendChild(kartu);
  });
}

/* =========================================================
   LAYAR 2: DAFTAR PAKET DALAM KATEGORI
   ========================================================= */
function bukaKategori(k) {
  kategoriAktif = k;
  judulKategoriEl.textContent = `${k.ikon || "📁"} ${k.nama}`;
  daftarPaketKategoriEl.innerHTML = "";
  k.paket.forEach((p) => {
    const kartu = document.createElement("button");
    kartu.type = "button";
    kartu.className = "kartu-paket";
    kartu.innerHTML = `
      <span>
        <span class="kp-nama">${p.nama}</span>
        <span class="kp-info">soal diacak setiap kamu mulai</span>
      </span>
      <span class="kp-panah">&rarr;</span>
    `;
    kartu.addEventListener("click", () => mulaiPaket(p));
    daftarPaketKategoriEl.appendChild(kartu);
  });
  tampilkan(layarPilihPaket);
}

/* =========================================================
   FUNGSI MULAI PAKET (deteksi kuis vs flashcard)
   ========================================================= */
async function mulaiPaket(p) {
  statusMuatEl.textContent = `Memuat ${p.nama}...`;
  try {
    const res = await fetch(p.file);
    if (!res.ok) throw new Error("Gagal memuat file");
    const data = await res.json();
    statusMuatEl.textContent = "";

    // Kalau tipe flashcard, oper ke flashcard.js
    if (data.tipe === "flashcard") {
      window.mulaiFlashcard({
        ...p,
        judul: data.judul || p.nama,
        kartu: data.kartu,
      });
      return;
    }

    // Default: kuis pilihan ganda
    paketAktif = { ...p, judul: data.judul || p.nama, soal: data.soal };
    mulaiSesi();
  } catch (err) {
    statusMuatEl.textContent = `Gagal memuat soal (${err.message}). Pastikan file ${p.file} ada dan halaman ini dibuka lewat server (bukan dibuka langsung dari file explorer).`;
  }
}

/* =========================================================
   LAYAR 3: SESI SOAL
   ========================================================= */
function mulaiSesi() {
  soalAcak = acak(paketAktif.soal);
  indexSoal = 0;
  jawabanUser = [];
  pilihanTerpilih = null;
  judulPaketAktifEl.textContent = paketAktif.judul;
  tampilkan(layarSoal);
  renderSoal();
}

function renderSoal() {
  sudahDijawab = false;
  pilihanTerpilih = null;
  const soal = soalAcak[indexSoal];

  nomorSoalStempelEl.textContent = `SOAL ${String(indexSoal + 1).padStart(2, "0")}`;
  nomorProgresEl.textContent = `${indexSoal + 1} / ${soalAcak.length}`;
  isiProgresEl.style.width = `${(indexSoal / soalAcak.length) * 100}%`;

  teksPertanyaanEl.textContent = soal.pertanyaan;

  daftarPilihanEl.innerHTML = "";
  const hurufTerurut = Object.keys(soal.pilihan);
  hurufTerurut.forEach((huruf) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pilihan";
    btn.dataset.huruf = huruf;
    btn.innerHTML = `<span class="huruf">${huruf}</span><span>${soal.pilihan[huruf]}</span>`;
    btn.addEventListener("click", () => pilihJawaban(huruf));
    daftarPilihanEl.appendChild(btn);
  });

  pembahasanEl.classList.add("tersembunyi");
  btnJawab.classList.remove("tersembunyi");
  btnJawab.disabled = true;
  btnLanjut.classList.add("tersembunyi");
}

function pilihJawaban(huruf) {
  if (sudahDijawab) return;
  pilihanTerpilih = huruf;
  [...daftarPilihanEl.children].forEach((el) => {
    el.classList.toggle("dipilih", el.dataset.huruf === huruf);
  });
  btnJawab.disabled = false;
}

function cekJawaban() {
  if (!pilihanTerpilih || sudahDijawab) return;
  sudahDijawab = true;
  const soal = soalAcak[indexSoal];
  const benar = pilihanTerpilih === soal.jawaban;

  [...daftarPilihanEl.children].forEach((el) => {
    el.disabled = true;
    if (el.dataset.huruf === soal.jawaban) el.classList.add("benar");
    else if (el.dataset.huruf === pilihanTerpilih) el.classList.add("salah");
  });

  teksVerdictEl.textContent = benar ? "JAWABAN BENAR" : "JAWABAN KURANG TEPAT";
  teksVerdictEl.className = `verdict ${benar ? "benar" : "salah"}`;
  teksPembahasanEl.textContent = soal.pembahasan || "";
  pembahasanEl.classList.remove("tersembunyi");

  jawabanUser.push({
    pertanyaan: soal.pertanyaan,
    dipilih: pilihanTerpilih,
    jawabanBenar: soal.jawaban,
    benar,
  });

  btnJawab.classList.add("tersembunyi");
  btnLanjut.classList.remove("tersembunyi");
  btnLanjut.innerHTML =
    indexSoal === soalAcak.length - 1
      ? "Lihat hasil &rarr;"
      : "Soal berikutnya &rarr;";
}

function lanjutSoal() {
  if (indexSoal < soalAcak.length - 1) {
    indexSoal++;
    renderSoal();
  } else {
    isiProgresEl.style.width = "100%";
    tampilkanHasil();
  }
}

/* =========================================================
   LAYAR 4: HASIL
   ========================================================= */
function tampilkanHasil() {
  tampilkan(layarHasil);
  const totalBenar = jawabanUser.filter((j) => j.benar).length;
  const total = jawabanUser.length;

  judulHasilEl.textContent = `Selesai: ${paketAktif.judul}`;
  skorAngkaEl.textContent = `${totalBenar}/${total}`;

  const persen = Math.round((totalBenar / total) * 100);
  let ket = "Terus berlatih ya.";
  if (persen === 100) ket = "Sempurna, semua benar!";
  else if (persen >= 70) ket = "Bagus, hampir semua benar.";
  else if (persen >= 40) ket = "Lumayan, masih bisa ditingkatkan.";
  skorAngkaEl.nextElementSibling.textContent = ket;

  rekapListEl.innerHTML = "";
  jawabanUser.forEach((j, i) => {
    const item = document.createElement("div");
    item.className = `rekap-item ${j.benar ? "rk-benar" : "rk-salah"}`;
    item.innerHTML = `
      <span class="tanda">${j.benar ? "✓" : "✕"}</span>
      <span>${i + 1}. ${j.pertanyaan}${
        j.benar ? "" : ` — jawabanmu ${j.dipilih}, yang benar ${j.jawabanBenar}`
      }</span>
    `;
    rekapListEl.appendChild(item);
  });
}

/* =========================================================
   EVENT LISTENERS
   ========================================================= */
btnJawab.addEventListener("click", cekJawaban);
btnLanjut.addEventListener("click", lanjutSoal);

// Keluar dari sesi soal → reset state + balik ke daftar paket kategori
btnKeluar.addEventListener("click", () => {
  resetStateSesi();
  if (kategoriAktif) tampilkan(layarPilihPaket);
  else tampilkan(layarPilih);
});

// Ulangi sesi yang sama (state di-reset ulang di mulaiSesi)
btnUlangi.addEventListener("click", mulaiSesi);

// Dari hasil → reset state + balik ke daftar paket kategori
btnPaketLain.addEventListener("click", () => {
  resetStateSesi();
  if (kategoriAktif) tampilkan(layarPilihPaket);
  else tampilkan(layarPilih);
});

// Kembali dari daftar paket → reset SEMUA state (termasuk flashcard)
btnKembaliKategori.addEventListener("click", () => {
  resetFlashcardJikaAda();
  resetSemuaState();
  tampilkan(layarPilih);
});

/* =========================================================
   INIT
   ========================================================= */
renderDaftarKategori();

/* =========================================================
   EKSPOSE UNTUK FLASHCARD.JS
   ========================================================= */
window.kembaliKeDaftarPaket = function () {
  resetFlashcardJikaAda();
  resetStateSesi();
  if (kategoriAktif) tampilkan(layarPilihPaket);
  else tampilkan(layarPilih);
};
