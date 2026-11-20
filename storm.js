/* Storm website: fills in release values from config.js, buy links, menu, download thank-you steps. */
(function () {
  "use strict";
  var R = window.STORM_RELEASE || {};
  var BUY = (window.STORM_BUY_BASE || "").replace(/\/+$/, "");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function all(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  function startDownload() {
    if (!R.downloadUrl) return;
    var a = document.createElement("a");
    a.href = R.downloadUrl;
    if (R.fileName) a.setAttribute("download", R.fileName);
    document.body.appendChild(a); a.click(); a.remove();
  }

  function showThanks(scroll) {
    var t = document.getElementById("thanks");
    if (!t) return false;
    t.classList.add("show");
    var intro = document.getElementById("dl-intro");
    if (intro) intro.hidden = true;
    if (scroll) window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    var h = t.querySelector("h1"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    return true;
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Release values
    all("[data-version]", function (el) { el.textContent = R.version || ""; });
    all("[data-release-date]", function (el) { el.textContent = R.date || ""; });
    all("[data-sha256]", function (el) { el.textContent = R.sha256 || ""; });
    all("[data-filename]", function (el) { el.textContent = R.fileName || "Storm.exe"; });
    all("[data-size]", function (el) { if (R.sizeLabel) el.textContent = R.sizeLabel; else el.hidden = true; });
    all("[data-buy]", function (a) { a.href = BUY + "/" + a.getAttribute("data-buy"); });

    // Download buttons: on the download page start the file and show the steps.
    // Elsewhere they go to download.html#thanks, which does the same.
    var onDownloadPage = !!document.getElementById("thanks");
    all("[data-download]", function (a) {
      if (!onDownloadPage) { a.href = "download.html#thanks"; return; }
      a.href = R.downloadUrl || "#";
      if (R.fileName) a.setAttribute("download", R.fileName);
      a.addEventListener("click", function () { setTimeout(function () { showThanks(true); }, 60); });
    });
    all("[data-retry]", function (a) {
      a.href = R.downloadUrl || "#";
      if (R.fileName) a.setAttribute("download", R.fileName);
    });
    if (onDownloadPage && location.hash === "#thanks") {
      showThanks(false);
      setTimeout(startDownload, 400);
    }

    // Copy buttons
    all("[data-copy]", function (b) {
      b.addEventListener("click", function () {
        var t = document.querySelector(b.getAttribute("data-copy"));
        if (!t || !navigator.clipboard) return;
        navigator.clipboard.writeText(t.textContent.trim()).then(function () {
          var o = b.textContent; b.textContent = "Copied"; setTimeout(function () { b.textContent = o; }, 1400);
        });
      });
    });

    // Menu
    var toggle = document.querySelector(".nav-toggle"), nav = document.getElementById("nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      nav.addEventListener("click", function (e) {
        if (e.target.closest("a")) { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
      });
    }

    // Top bar border once scrolled
    var bar = document.querySelector(".topbar");
    if (bar) {
      var onScroll = function () { bar.classList.toggle("scrolled", window.scrollY > 4); };
      window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    }

    var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();

    // Gentle fade-in
    if (reduce || !("IntersectionObserver" in window)) { all(".reveal", function (e) { e.classList.add("in"); }); }
    else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -6% 0px" });
      all(".reveal", function (e) { io.observe(e); });
    }
  });
})();
