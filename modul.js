/* =========================================================
   MODUL MODULE (PDF Viewer)
   Dipanggil oleh app.js saat file JSON bertipe "pdf".
   ========================================================= */

(function () {
  // ---------- ELEMEN DOM ----------
  const layarModul = document.getElementById("layar-modul");
  const judulModulEl = document.getElementById("judul-modul");
  const pdfFrameEl = document.getElementById("pdf-frame");
  const btnKeluarModul = document.getElementById("btn-keluar-modul");
  const btnBukaTabBaru = document.getElementById("btn-buka-tab-baru");

  // ---------- STATE ----------
  let paketModul = null;

  // ---------- UTIL ----------
  function tampilkanLayar(el) {
    document.querySelectorAll(".layar").forEach((l) => l.classList.add("tersembunyi"));
    el.classList.remove("tersembunyi");
  }

  // ---------- MULAI MODUL ----------
  function mulaiModul(data) {
    paketModul = data;
    judulModulEl.textContent = data.judul || "Modul";

    // Set PDF ke iframe
    pdfFrameEl.src = data.filePdf;

    // Set link "Buka di tab baru" (biar bisa full-screen kalau HP)
    btnBukaTabBaru.href = data.filePdf;

    tampilkanLayar(layarModul);
  }

  // ---------- RESET ----------
  function resetModul() {
    paketModul = null;
    if (pdfFrameEl) pdfFrameEl.src = "";
    if (judulModulEl) judulModulEl.textContent = "";
    if (layarModul) layarModul.classList.add("tersembunyi");
  }

  // ---------- KELUAR ----------
  btnKeluarModul.addEventListener("click", () => {
    resetModul();
    if (window.kembaliKeDaftarPaket) window.kembaliKeDaftarPaket();
    else window.location.reload();
  });

  // ---------- EXPORT KE GLOBAL ----------
  window.mulaiModul = mulaiModul;
  window.resetModul = resetModul;
})();
