/* =========================================================
   MODUL MODULE (PDF Viewer pakai PDF.js)
   Render PDF langsung di browser tanpa download.
   + Fitur Full Screen
   ========================================================= */

(function () {
  // ---------- ELEMEN DOM ----------
  const layarModul = document.getElementById("layar-modul");
  const judulModulEl = document.getElementById("judul-modul");
  const pdfCanvasEl = document.getElementById("pdf-canvas");
  const pdfLoadingEl = document.getElementById("pdf-loading");
  const pdfErrorEl = document.getElementById("pdf-error");
  const pdfKontrolEl = document.getElementById("pdf-kontrol");
  const pdfNomorEl = document.getElementById("pdf-nomor");
  const btnKeluarModul = document.getElementById("btn-keluar-modul");
  const btnPrevPdf = document.getElementById("btn-prev-pdf");
  const btnNextPdf = document.getElementById("btn-next-pdf");
  const btnZoomIn = document.getElementById("btn-zoom-in");
  const btnZoomOut = document.getElementById("btn-zoom-out");
  const btnFullscreen = document.getElementById("btn-fullscreen");

  // ---------- STATE ----------
  let pdfDoc = null;
  let halamanSekarang = 1;
  let totalHalaman = 0;
  let skala = 1.0;
  let sedangRender = false;

  // ---------- UTIL ----------
  function tampilkanLayar(el) {
    document.querySelectorAll(".layar").forEach((l) => l.classList.add("tersembunyi"));
    el.classList.remove("tersembunyi");
  }

  function tampilkanStatus(status) {
    if (pdfLoadingEl) pdfLoadingEl.classList.toggle("tersembunyi", status !== "loading");
    if (pdfErrorEl) pdfErrorEl.classList.toggle("tersembunyi", status !== "error");
    if (pdfCanvasEl) pdfCanvasEl.classList.toggle("tersembunyi", status !== "ok");
    if (pdfKontrolEl) pdfKontrolEl.classList.toggle("tersembunyi", status !== "ok");
  }

  // ---------- MULAI MODUL ----------
  async function mulaiModul(data) {
    tampilkanLayar(layarModul);
    judulModulEl.textContent = data.judul || "Modul";

    pdfDoc = null;
    halamanSekarang = 1;
    totalHalaman = 0;
    skala = 1.0;

    tampilkanStatus("loading");

    try {
      const pdfUrl = new URL(data.filePdf, window.location.href).href;
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      pdfDoc = await loadingTask.promise;
      totalHalaman = pdfDoc.numPages;

      tampilkanStatus("ok");
      await renderHalaman(1);
    } catch (err) {
      console.error("PDF load error:", err);
      tampilkanStatus("error");
      if (pdfErrorEl) {
        pdfErrorEl.innerHTML = `
          <p><strong>Gagal memuat PDF.</strong></p>
          <p>File: ${data.filePdf}</p>
          <p>Cek: pastikan file PDF ada dan nama file-nya benar (huruf besar/kecil).</p>
          <p style="font-size:12px;color:#888;">${err.message}</p>
        `;
      }
    }
  }

  // ---------- RENDER HALAMAN ----------
  async function renderHalaman(nomor) {
    if (!pdfDoc || sedangRender) return;
    if (nomor < 1 || nomor > totalHalaman) return;

    sedangRender = true;
    halamanSekarang = nomor;

    try {
      const halaman = await pdfDoc.getPage(nomor);

      // Di mode full screen, otomatis hitung skala biar pas lebar layar
      let skalaPakai = skala;
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        const lebarLayar = window.innerWidth;
        const viewportAsli = halaman.getViewport({ scale: 1 });
        const skalaFit = lebarLayar / viewportAsli.width;
        skalaPakai = skalaFit * skala;
      }

      const viewport = halaman.getViewport({ scale: skalaPakai });
      const canvas = pdfCanvasEl;
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await halaman.render({
        canvasContext: ctx,
        viewport: viewport,
      }).promise;

      if (pdfNomorEl) {
        pdfNomorEl.textContent = `${halamanSekarang} / ${totalHalaman}`;
      }

      if (btnPrevPdf) btnPrevPdf.disabled = halamanSekarang <= 1;
      if (btnNextPdf) btnNextPdf.disabled = halamanSekarang >= totalHalaman;
    } catch (err) {
      console.error("Render error:", err);
    } finally {
      sedangRender = false;
    }
  }

  // ---------- NAVIGASI HALAMAN ----------
  if (btnPrevPdf) {
    btnPrevPdf.addEventListener("click", () => {
      if (halamanSekarang > 1) renderHalaman(halamanSekarang - 1);
    });
  }

  if (btnNextPdf) {
    btnNextPdf.addEventListener("click", () => {
      if (halamanSekarang < totalHalaman) renderHalaman(halamanSekarang + 1);
    });
  }

  // ---------- ZOOM ----------
  if (btnZoomIn) {
    btnZoomIn.addEventListener("click", () => {
      skala = Math.min(skala + 0.25, 3.0);
      renderHalaman(halamanSekarang);
    });
  }

  if (btnZoomOut) {
    btnZoomOut.addEventListener("click", () => {
      skala = Math.max(skala - 0.25, 0.5);
      renderHalaman(halamanSekarang);
    });
  }

  // ---------- FULL SCREEN ----------
  if (btnFullscreen) {
    btnFullscreen.addEventListener("click", () => {
      const wrap = layarModul;
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        // Masuk full screen
        if (wrap.requestFullscreen) {
          wrap.requestFullscreen().catch((err) => {
            console.warn("Fullscreen error:", err);
            alert("Full screen tidak didukung di browser ini.");
          });
        } else if (wrap.webkitRequestFullscreen) {
          wrap.webkitRequestFullscreen();
        } else {
          alert("Full screen tidak didukung di browser ini.");
        }
      } else {
        // Keluar full screen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    });
  }

  // Update label tombol + re-render saat masuk/keluar full screen
  function handleFullscreenChange() {
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);

    if (btnFullscreen) {
      btnFullscreen.textContent = isFullscreen ? "✕ Keluar Full Screen" : "⛶ Full Screen";
    }

    // Re-render halaman biar ukurannya nyesuaikan
    if (pdfDoc) {
      setTimeout(() => {
        renderHalaman(halamanSekarang);
      }, 300);
    }
  }

  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

  // ---------- RESET ----------
  function resetModul() {
    // Keluar dari full screen kalau masih aktif
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }

    pdfDoc = null;
    halamanSekarang = 1;
    totalHalaman = 0;
    skala = 1.0;

    if (pdfCanvasEl) {
      const ctx = pdfCanvasEl.getContext("2d");
      ctx.clearRect(0, 0, pdfCanvasEl.width, pdfCanvasEl.height);
      pdfCanvasEl.width = 0;
      pdfCanvasEl.height = 0;
    }
    if (judulModulEl) judulModulEl.textContent = "";
    if (layarModul) layarModul.classList.add("tersembunyi");

    // Reset label tombol full screen
    if (btnFullscreen) btnFullscreen.textContent = "⛶ Full Screen";
  }

  // ---------- KELUAR ----------
  btnKeluarModul.addEventListener("click", () => {
    resetModul();
    if (typeof history !== "undefined" && history.length > 1) {
      history.back();
    } else if (window.kembaliKeDaftarPaket) {
      window.kembaliKeDaftarPaket();
    } else {
      window.location.reload();
    }
  });

  // ---------- EXPORT KE GLOBAL ----------
  window.mulaiModul = mulaiModul;
  window.resetModul = resetModul;
})();
