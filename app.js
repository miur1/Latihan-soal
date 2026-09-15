/* =========================================================
   KONFIGURASI PAKET SOAL
   Tambah paket baru cukup dengan menambah baris di sini
   dan menaruh file JSON-nya di folder /data
   ========================================================= */
const PAKET = [
  { id: "paket-1", nama: "ssw 1", file: "data/ssw1.json" },
  { id: "paket-2", nama: "ssw 2", file: "data/ssw2.json" },
  { id: "paket-3", nama: "ssw 3", file: "data/ssw3.json" },
  { id: "paket-4", nama: "ssw 4", file: "data/ssw4.json" },
  { id: "paket-5", nama: "ssw 5", file: "data/ssw5.json" },
  { id: "paket-6", nama: "ssw 6", file: "data/ssw6.json" },
  { id: "paket-7", nama: "ssw 7", file: "data/ssw7.json" },
  { id: "paket-8", nama: "ssw 8", file: "data/ssw8.json" },
];

/* =========================================================
   STATE
   ========================================================= */
let paketAktif = null;   // { id, nama, file, judul, soal: [...] }
let soalAcak = [];       // urutan soal ter-acak untuk sesi berjalan
let indexSoal = 0;
let jawabanUser = [];    // { soalId, pertanyaan, dipilih, benar }
let sudahDijawab = false;

/* =========================================================
   ELEMEN DOM
   ========================================================= */
const layarPilih = document.getElementById("layar-pilih");
const layarSoal = document.getElementById("layar-soal");
const layarHasil = document.getElementById("layar-hasil");

const daftarPaketEl = document.getElementById("daftar-paket");
const statusMuatEl = document.getElementById("status-muat");

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

const judulHasilEl = document.getElementById("judul-hasil");
const skorAngkaEl = document.getElementById("skor-angka");
const rekapListEl = document.getElementById("rekap-list");
const btnUlangi = document.getElementById("btn-ulangi");
const btnPaketLain = document.getElementById("btn-paket-lain");

/* =========================================================
   UTIL
   ========================================================= */

// Fisher-Yates shuffle, tidak mengubah array asli
function acak(array) {
  const hasil = [...array];
  for (let i = hasil.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [hasil[i], hasil[j]] = [hasil[j], hasil[i]];
  }
  return hasil;
}

function tampilkan(layar) {
  [layarPilih, layarSoal, layarHasil].forEach((el) => el.classList.add("tersembunyi"));
  layar.classList.remove("tersembunyi");
}

/* =========================================================
   LAYAR 1: RENDER DAFTAR PAKET
   ========================================================= */
function renderDaftarPaket() {
  daftarPaketEl.innerHTML = "";
  PAKET.forEach((p) => {
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
    daftarPaketEl.appendChild(kartu);
  });
}

async function mulaiPaket(p) {
  statusMuatEl.textContent = `Memuat ${p.nama}...`;
  try {
    const res = await fetch(p.file);
    if (!res.ok) throw new Error("Gagal memuat file");
    const data = await res.json();
    paketAktif = { ...p, judul: data.judul || p.nama, soal: data.soal };
    statusMuatEl.textContent = "";
    mulaiSesi();
  } catch (err) {
    statusMuatEl.textContent = `Gagal memuat soal (${err.message}). Pastikan file ${p.file} ada dan halaman ini dibuka lewat server (bukan dibuka langsung dari file explorer).`;
  }
}

/* =========================================================
   LAYAR 2: SESI SOAL
   ========================================================= */
function mulaiSesi() {
  soalAcak = acak(paketAktif.soal);
  indexSoal = 0;
  jawabanUser = [];
  judulPaketAktifEl.textContent = paketAktif.judul;
  tampilkan(layarSoal);
  renderSoal();
}

function renderSoal() {
  sudahDijawab = false;
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

let pilihanTerpilih = null;

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
  btnLanjut.innerHTML = indexSoal === soalAcak.length - 1 ? "Lihat hasil &rarr;" : "Soal berikutnya &rarr;";
}

function lanjutSoal() {
  pilihanTerpilih = null;
  if (indexSoal < soalAcak.length - 1) {
    indexSoal++;
    renderSoal();
  } else {
    isiProgresEl.style.width = "100%";
    tampilkanHasil();
  }
}

/* =========================================================
   LAYAR 3: HASIL
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
      <span>${i + 1}. ${j.pertanyaan}${j.benar ? "" : ` — jawabanmu ${j.dipilih}, yang benar ${j.jawabanBenar}`}</span>
    `;
    rekapListEl.appendChild(item);
  });
}

/* =========================================================
   EVENT LISTENERS
   ========================================================= */
btnJawab.addEventListener("click", cekJawaban);
btnLanjut.addEventListener("click", lanjutSoal);
btnKeluar.addEventListener("click", () => tampilkan(layarPilih));
btnUlangi.addEventListener("click", mulaiSesi);
btnPaketLain.addEventListener("click", () => tampilkan(layarPilih));

/* =========================================================
   INIT
   ========================================================= */
renderDaftarPaket();
