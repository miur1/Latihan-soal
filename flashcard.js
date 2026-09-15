/* =========================================================
   FLASHCARD MODULE (Kotoba)
   Dipanggil oleh app.js saat file JSON bertipe "flashcard".
   ========================================================= */

(function () {
  // ---------- ELEMEN DOM ----------
  const layarFlashcard = document.getElementById("layar-flashcard");
  const layarHasilFc = document.getElementById("layar-hasil-fc");

  const judulFcEl = document.getElementById("judul-fc");
  const nomorFcEl = document.getElementById("nomor-fc");
  const isiProgresFcEl = document.getElementById("isi-progres-fc");

  const kartuFcEl = document.getElementById("kartu-fc");
  const teksKanjiEl = document.getElementById("teks-kanji");
  const teksBacaEl = document.getElementById("teks-baca");
  const teksArtiEl = document.getElementById("teks-arti");

  const btnKeluarFc = document.getElementById("btn-keluar-fc");
  const btnUlangiFc = document.getElementById("btn-ulangi-fc");
  const btnHafalFc = document.getElementById("btn-hafal-fc");

  const judulHasilFcEl = document.getElementById("judul-hasil-fc");
  const skorHafalEl = document.getElementById("skor-hafal");
  const ringkasanFcEl = document.getElementById("ringkasan-fc");
  const btnUlangiSesiFc = document.getElementById("btn-ulangi-sesi-fc");
  const btnPaketLainFc = document.getElementById("btn-paket-lain-fc");

  // ---------- STATE ----------
  let paketFc = null;      // { id, nama, file, judul, kartu: [...] }
  let antrian = [];        // kartu yang masih harus dilihat
  let sudahHafal = [];     // kartu yang ditandai hafal
  let totalKartu = 0;
  let kartuSekarang = null;

  // ---------- UTIL ----------
  function tampilkanLayar(el) {
    document.querySelectorAll(".layar").forEach((l) => l.classList.add("tersembunyi"));
    el.classList.remove("tersembunyi");
  }

  function acak(array) {
    const hasil = [...array];
    for (let i = hasil.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [hasil[i], hasil[j]] = [hasil[j], hasil[i]];
    }
    return hasil;
  }

  // ---------- MULAI SESI ----------
  function mulaiFlashcard(data) {
    paketFc = data;
    antrian = data.kartu.length > 4 ? acak(data.kartu) : [...data.kartu];
    sudahHafal = [];
    totalKartu = data.kartu.length;

    judulFcEl.textContent = paketFc.judul;
    tampilkanLayar(layarFlashcard);
    renderKartu();
  }

  // ---------- RENDER KARTU ----------
  function renderKartu() {
    if (antrian.length === 0) {
      tampilkanHasil();
      return;
    }

    kartuSekarang = antrian[0];
    kartuFcEl.classList.remove("terbuka");

    // Sisi depan: kanji besar + baca (kalau ada & beda dari kanji)
    teksKanjiEl.textContent = kartuSekarang.kanji || "";

    const baca = kartuSekarang.baca || "";
    const kanji = kartuSekarang.kanji || "";
    if (baca && baca !== kanji) {
      teksBacaEl.textContent = baca;
      teksBacaEl.style.display = "";
    } else {
      teksBacaEl.textContent = "";
      teksBacaEl.style.display = "none";
    }

    // Sisi belakang: arti
    teksArtiEl.textContent = kartuSekarang.arti || "";

    // Progress
    const selesai = sudahHafal.length;
    nomorFcEl.textContent = `${selesai + 1} / ${totalKartu}`;
    isiProgresFcEl.style.width = `${(selesai / totalKartu) * 100}%`;

    // Tombol disable sebelum kartu dibuka
    btnUlangiFc.disabled = true;
    btnHafalFc.disabled = true;
  }

  // ---------- FLIP KARTU ----------
  kartuFcEl.addEventListener("click", () => {
    kartuFcEl.classList.toggle("terbuka");
    if (kartuFcEl.classList.contains("terbuka")) {
      btnUlangiFc.disabled = false;
      btnHafalFc.disabled = false;
    }
  });

  // ---------- AKSI: SUDAH HAFAL ----------
  btnHafalFc.addEventListener("click", () => {
    if (!kartuSekarang) return;
    sudahHafal.push(kartuSekarang);
    antrian.shift();
    renderKartu();
  });

  // ---------- AKSI: ULANGI NANTI ----------
  btnUlangiFc.addEventListener("click", () => {
    if (!kartuSekarang) return;
    const kartu = antrian.shift();
    antrian.push(kartu);
    renderKartu();
  });

  // ---------- KELUAR ----------
  btnKeluarFc.addEventListener("click", () => {
    if (window.kembaliKeDaftarPaket) window.kembaliKeDaftarPaket();
    else window.location.reload();
  });

  // ---------- HASIL ----------
  function tampilkanHasil() {
    tampilkanLayar(layarHasilFc);

    const jumlahHafal = sudahHafal.length;
    judulHasilFcEl.textContent = `Selesai: ${paketFc.judul}`;
    skorHafalEl.textContent = `${jumlahHafal}/${totalKartu}`;

    const persen = Math.round((jumlahHafal / totalKartu) * 100);
    let pesan;
    if (persen === 100) pesan = "Sempurna! Semua kartu sudah kamu hafal 🎉";
    else if (persen >= 70) pesan = "Bagus! Tinggal sedikit lagi.";
    else if (persen >= 40) pesan = "Lumayan, ayo ulangi lagi biar makin hafal.";
    else pesan = "Belum apa-apa, wajar. Ulangi terus ya!";
    ringkasanFcEl.textContent = pesan;

    // Simpan kartu yang belum hafal untuk sesi ulang
    window._kartuBelumHafal = [...antrian];
  }

  // ---------- TOMBOL DI LAYAR HASIL ----------
  btnUlangiSesiFc.addEventListener("click", () => {
    let kartuUntukDiulang = window._kartuBelumHafal;
    if (!kartuUntukDiulang || kartuUntukDiulang.length === 0) {
      // Kalau semua sudah hafal, ulang dari awal
      kartuUntukDiulang = [...paketFc.kartu];
    }
    paketFc = { ...paketFc, kartu: kartuUntukDiulang };
    mulaiFlashcard(paketFc);
  });

  btnPaketLainFc.addEventListener("click", () => {
    if (window.kembaliKeDaftarPaket) window.kembaliKeDaftarPaket();
    else window.location.reload();
  });

  // ---------- EXPORT ----------
  window.mulaiFlashcard = mulaiFlashcard;
})();
