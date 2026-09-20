/* =========================================================
   FLASHCARD MODULE (Kotoba)
   Fitur: navigasi kiri-kanan, hafal/belum, statistik, reset
   + Latihan yang Belum Hafal
   + Support 2 format kartu:
     - Standar: { kanji, baca, arti }
     - Berpasangan: { depan_kata, depan_arti, belakang_kata, belakang_arti }
   ========================================================= */

(function () {
  // ---------- ELEMEN DOM ----------
  const layarFlashcard = document.getElementById("layar-flashcard");

  const judulFcEl = document.getElementById("judul-fc");
  const nomorFcEl = document.getElementById("nomor-fc");
  const isiProgresFcEl = document.getElementById("isi-progres-fc");

  const statHafalEl = document.getElementById("stat-hafal");
  const statBelumEl = document.getElementById("stat-belum");
  const statTotalEl = document.getElementById("stat-total");

  const kartuFcEl = document.getElementById("kartu-fc");
  const teksKanjiEl = document.getElementById("teks-kanji");
  const teksBacaEl = document.getElementById("teks-baca");
  const teksArtiEl = document.getElementById("teks-arti");

  const btnKeluarFc = document.getElementById("btn-keluar-fc");
  const btnPrevFc = document.getElementById("btn-prev-fc");
  const btnNextFc = document.getElementById("btn-next-fc");
  const btnBelumFc = document.getElementById("btn-belum-fc");
  const btnHafalFc = document.getElementById("btn-hafal-fc");
  const btnResetFc = document.getElementById("btn-reset-fc");
  const btnUlangBelumFc = document.getElementById("btn-ulang-belum-fc");

  // ---------- STATE ----------
  let paketFc = null;
  let daftarKartu = [];
  let indexSekarang = 0;
  let statusKartu = [];
  let totalKartu = 0;
  let modeLatihanBelum = false;

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

  /**
   * Deteksi tipe kartu.
   * Return: "pasangan" | "standar"
   */
  function tipeKartu(kartu) {
    if (kartu.depan_kata || kartu.belakang_kata) return "pasangan";
    return "standar";
  }

  /**
   * Render isi kartu ke elemen DOM (depan + belakang).
   */
  function renderIsiKartu(kartu) {
    const tipe = tipeKartu(kartu);

    if (tipe === "pasangan") {
      // Format berpasangan (Jidoushi/Tadoushi)
      // Depan: kata utama (besar) + arti (kecil)
      teksKanjiEl.textContent = kartu.depan_kata || "";
      teksBacaEl.textContent = kartu.depan_arti || "";

      // Belakang: pasangan kata + arti
      teksArtiEl.innerHTML = `
        <span class="teks-pasangan-kata">${kartu.belakang_kata || ""}</span>
        <span class="teks-pasangan-arti">${kartu.belakang_arti || ""}</span>
      `;
    } else {
      // Format standar (kanji/baca/arti)
      teksKanjiEl.textContent = kartu.kanji || "";

      const baca = kartu.baca || "";
      const kanji = kartu.kanji || "";
      if (baca && baca !== kanji) {
        teksBacaEl.textContent = baca;
        teksBacaEl.style.display = "";
      } else {
        teksBacaEl.textContent = "";
        teksBacaEl.style.display = "none";
      }

      teksArtiEl.textContent = kartu.arti || "";
    }
  }

  // ---------- MULAI SESI ----------
  function mulaiFlashcard(data) {
    paketFc = data;
    daftarKartu = data.kartu.length > 4 ? acak(data.kartu) : [...data.kartu];
    statusKartu = new Array(daftarKartu.length).fill(null);
    indexSekarang = 0;
    totalKartu = daftarKartu.length;
    modeLatihanBelum = false;

    judulFcEl.textContent = paketFc.judul;
    tampilkanLayar(layarFlashcard);
    renderKartu();
  }

  // ---------- RENDER KARTU ----------
  function renderKartu() {
    const kartu = daftarKartu[indexSekarang];

    // Reset flip
    kartuFcEl.classList.remove("terbuka");

    // Render isi kartu (depan + belakang)
    renderIsiKartu(kartu);

    // Nomor kartu
    nomorFcEl.textContent = `${indexSekarang + 1} / ${totalKartu}`;

    // Tombol aktif/nonaktif
    btnPrevFc.disabled = indexSekarang === 0;
    btnNextFc.disabled = indexSekarang === totalKartu - 1;

    // Tandai tombol kalau kartu ini sudah diputuskan
    const status = statusKartu[indexSekarang];
    btnHafalFc.classList.toggle("aktif", status === "hafal");
    btnBelumFc.classList.toggle("aktif", status === "belum");

    updateStatistik();
  }

  // ---------- STATISTIK & PROGRESS ----------
  function updateStatistik() {
    const hafal = statusKartu.filter((s) => s === "hafal").length;
    const belum = statusKartu.filter((s) => s === "belum").length;
    const dipelajari = hafal + belum;

    if (statHafalEl) statHafalEl.textContent = hafal;
    if (statBelumEl) statBelumEl.textContent = belum;
    if (statTotalEl) statTotalEl.textContent = `${dipelajari} / ${totalKartu}`;

    if (isiProgresFcEl) {
      isiProgresFcEl.style.width = `${(dipelajari / totalKartu) * 100}%`;
    }
  }

  // ---------- FLIP KARTU ----------
  kartuFcEl.addEventListener("click", () => {
    kartuFcEl.classList.toggle("terbuka");
  });

  // ---------- NAVIGASI ----------
  function keKartuSebelumnya() {
    if (indexSekarang > 0) {
      indexSekarang--;
      renderKartu();
    }
  }

  function keKartuBerikutnya() {
    if (indexSekarang < totalKartu - 1) {
      indexSekarang++;
      renderKartu();
    }
  }

  btnPrevFc.addEventListener("click", keKartuSebelumnya);
  btnNextFc.addEventListener("click", keKartuBerikutnya);

  // ---------- AKSI: HAFAL / BELUM ----------
  function tandaiKartu(status) {
    statusKartu[indexSekarang] = status;
    renderKartu();
    if (indexSekarang < totalKartu - 1) {
      setTimeout(() => {
        keKartuBerikutnya();
      }, 250);
    }
  }

  btnHafalFc.addEventListener("click", () => tandaiKartu("hafal"));
  btnBelumFc.addEventListener("click", () => tandaiKartu("belum"));

  // ---------- LATIHAN YANG BELUM HAFAL ----------
  function latihanYangBelum() {
    const kartuBelum = daftarKartu.filter((kartu, i) => statusKartu[i] === "belum");

    if (kartuBelum.length === 0) {
      alert(
        "Belum ada kartu yang ditandai 'Belum'.\n\n" +
        "Tandai dulu beberapa kartu dengan tombol '✗ Belum', " +
        "terus klik tombol ini lagi."
      );
      return;
    }

    const konfirmasi = confirm(
      `Latihan ${kartuBelum.length} kartu yang belum hafal?\n\n` +
      `Progress kartu "hafal" tetap disimpan.`
    );
    if (!konfirmasi) return;

    daftarKartu = [...kartuBelum];
    statusKartu = new Array(daftarKartu.length).fill(null);
    indexSekarang = 0;
    totalKartu = daftarKartu.length;
    modeLatihanBelum = true;

    judulFcEl.textContent = (paketFc?.judul || "Kotoba") + " — Latihan yang Belum";

    renderKartu();
  }

  if (btnUlangBelumFc) {
    btnUlangBelumFc.addEventListener("click", latihanYangBelum);
  }

  // ---------- RESET PROGRESS ----------
  btnResetFc.addEventListener("click", () => {
    const konfirmasi = confirm(
      "Reset semua progress dan mulai dari awal?\n\n" +
      "Semua kartu (termasuk yang hafal/belum) akan di-reset."
    );
    if (!konfirmasi) return;

    if (paketFc && paketFc.kartu) {
      daftarKartu = [...paketFc.kartu];
      totalKartu = daftarKartu.length;
    }

    statusKartu = new Array(daftarKartu.length).fill(null);
    indexSekarang = 0;
    modeLatihanBelum = false;

    judulFcEl.textContent = paketFc?.judul || "Kotoba";

    renderKartu();
  });

  // ---------- RESET FLASHCARD ----------
  function resetFlashcard() {
    paketFc = null;
    daftarKartu = [];
    statusKartu = [];
    indexSekarang = 0;
    totalKartu = 0;
    modeLatihanBelum = false;

    if (kartuFcEl) kartuFcEl.classList.remove("terbuka");
    if (teksKanjiEl) teksKanjiEl.textContent = "";
    if (teksBacaEl) teksBacaEl.textContent = "";
    if (teksArtiEl) teksArtiEl.textContent = "";
    if (nomorFcEl) nomorFcEl.textContent = "";
    if (isiProgresFcEl) isiProgresFcEl.style.width = "0%";
    if (statHafalEl) statHafalEl.textContent = "0";
    if (statBelumEl) statBelumEl.textContent = "0";
    if (statTotalEl) statTotalEl.textContent = "0 / 0";

    if (layarFlashcard) layarFlashcard.classList.add("tersembunyi");
  }

  // ---------- KELUAR ----------
  btnKeluarFc.addEventListener("click", () => {
    resetFlashcard();
    if (window.kembaliKeDaftarPaket) window.kembaliKeDaftarPaket();
    else window.location.reload();
  });

  // ---------- EXPORT KE GLOBAL ----------
  window.resetFlashcard = resetFlashcard;
  window.mulaiFlashcard = mulaiFlashcard;
})();
