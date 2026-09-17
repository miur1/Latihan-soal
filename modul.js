/* =========================================================
   MODUL MODULE (PDF Viewer pakai PDF.js)
   + Full Screen
   + Anti-blur (devicePixelRatio + auto re-render)
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
  let skalaZoom = 1.0;
  let sedangRender = false;
  let renderTaskSekarang = null;

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

  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  // ---------- MULAI MODUL ----------
  async function mulaiModul(data) {
    tampilkanLayar(layarModul);
    judulModulEl.textContent = data.judul || "Modul";

    pdfDoc = null;
    halamanSekarang = 1;
    totalHalaman = 0;
    skalaZoom = 1.0;

    tampilkanStatus("loading");

    let loadSukses = false;

    try {
      const pdfUrl = new URL(data.filePdf, window.location.href).href;
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      pdfDoc = await loadingTask.promise;
      totalHalaman = pdfDoc.numPages;

      loadSukses = true;
      tampilkanStatus("ok");
      await renderHalaman(1);
    } catch (err) {
      console.error("PDF load error:", err);
      if (!loadSukses) {
        tampilkanStatus("error");
        if (pdfErrorEl) {
          pdfErrorEl.innerHTML = `
            <p><strong>Gagal memuat PDF.</strong></p>
            <p>File: <code>${data.filePdf}</code></p>
            <p>Error: <code>${err.name} — ${err.message}</code></p>
          `;
        }
      }
    }
  }

  // ---------- RENDER HALAMAN (anti-blur) ----------
  async function renderHalaman(nomor) {
    if (!pdfDoc) return;
    if (nomor < 1 || nomor > totalHalaman) return;

    // Batalin render lama kalau masih jalan
    if (renderTaskSekarang) {
      try { renderTaskSekarang.cancel(); } catch (e) {}
      renderTaskSekarang = null;
    }

    sedangRender = true;
    halamanSekarang = nomor;

    try {
      const halaman = await pdfDoc.getPage(nomor);

      let skalaPakai = skalaZoom;

      // Kalau full screen, auto-fit lebar layar
      if (isFullscreen()) {
        const lebarLayar = window.innerWidth;
        const viewportAsli = halaman.getViewport({ scale: 1 });
        const skalaFit = lebarLayar / viewportAsli.width;
        skalaPakai = skalaFit * skalaZoom;
      }

      // KUNCI ANTI-BLUR: multiply dengan devicePixelRatio
      const dpr = window.devicePixelRatio || 1;
      const viewport = halaman.getViewport({ scale: skalaPakai });

      const canvas = pdfCanvasEl;
      const ctx = canvas.getContext("2d");

      // Ukuran fisik canvas = viewport × DPR (resolusi tinggi)
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);

      // Ukuran CSS = viewport (tampil pas)
      canvas.style.width = viewport.width + "px";
      canvas.style.height = viewport.height + "px";

      // Reset transform dulu, baru scale DPR — biar nggak numpuk
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      renderTaskSekarang = halaman.render({
        canvasContext: ctx,
        viewport: viewport,
      });

      await renderTaskSekarang.promise;
      renderTaskSekarang = null;

      if (pdfNomorEl) {
        pdfNomorEl.textContent = `${halamanSekarang} / ${totalHalaman}`;
      }
      if (btnPrevPdf) btnPrevPdf.disabled = halamanSekarang <= 1;
      if (btnNextPdf) btnNextPdf.disabled = halamanSekarang >= totalHalaman;
    } catch (err) {
      if (err && err.name === "RenderingCancelledException") {
        console.log("Render dibatalkan (normal)");
      } else {
        console.warn("Render error:", err);
      }
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
      skalaZoom = Math.min(skalaZoom + 0.25, 3.0);
      renderHalaman(halamanSekarang);
    });
  }
  if (btnZoomOut) {
    btnZoomOut.addEventListener("click", () => {
      skalaZoom = Math.max(skalaZoom - 0.25, 0.5);
      renderHalaman(halamanSekarang);
    });
  }

  // ---------- FULL SCREEN ----------
  if (btnFullscreen) {
    btnFullscreen.addEventListener("click", () => {
      const wrap = layarModul;
      if (!isFullscreen()) {
        if (wrap.requestFullscreen) {
          wrap.requestFullscreen().catch(() => {
            alert("Full screen tidak didukung di browser ini.");
          });
        } else if (wrap.webkitRequestFullscreen) {
          wrap.webkitRequestFullscreen();
        } else {
          alert("Full screen tidak didukung di browser ini.");
        }
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    });
  }

  // ---------- HANDLE PERUBAHAN FULL SCREEN ----------
  function handleFullscreenChange() {
    const isFs = isFullscreen();
    if (btnFullscreen) {
      btnFullscreen.textContent = isFs ? "✕ Keluar Full Screen" : "⛶ Full Screen";
    }
    // RE-RENDER ulang biar canvas nyesuaikan ukuran + tajam
    if (pdfDoc) {
      setTimeout(() => renderHalaman(halamanSekarang), 150);
    }
  }

  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

  // ---------- HANDLE RESIZE (rotate HP) ----------
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (!pdfDoc) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderHalaman(halamanSekarang);
    }, 250);
  });

  // ---------- RESET ----------
  function resetModul() {
    if (isFullscreen()) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
    if (renderTaskSekarang) {
      try { renderTaskSekarang.cancel(); } catch (e) {}
      renderTaskSekarang = null;
    }

    pdfDoc = null;
    halamanSekarang = 1;
    totalHalaman = 0;
    skalaZoom = 1.0;

    if (pdfCanvasEl) {
      const ctx = pdfCanvasEl.getContext("2d");
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, pdfCanvasEl.width, pdfCanvasEl.height);
      pdfCanvasEl.width = 0;
      pdfCanvasEl.height = 0;
      pdfCanvasEl.style.width = "";
      pdfCanvasEl.style.height = "";
    }
    if (judulModulEl) judulModulEl.textContent = "";
    if (layarModul) layarModul.classList.add("tersembunyi");
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
