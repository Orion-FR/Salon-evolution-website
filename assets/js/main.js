// =========================================================
// Salon Évolution — interactions
// =========================================================

// ---------- Theme init (runs ASAP to avoid FOUC) ----------
(function () {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
})();

document.addEventListener("DOMContentLoaded", () => {

  // ---------- Footer year ----------
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Navbar scroll state ----------
  const navbar = document.getElementById("navbar");
  const fab = document.getElementById("fab");

  const onScroll = () => {
    const y = window.scrollY;
    if (navbar) navbar.classList.toggle("scrolled", y > 40);
    if (fab) fab.classList.toggle("visible", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Mobile menu ----------
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".nav-links a");
  if (toggle) {
    toggle.addEventListener("click", () => {
      document.body.classList.toggle("nav-open");
    });
  }
  navLinks.forEach(a => a.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
  }));

  // ---------- Scroll reveal ----------
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("visible"));
  }

  // ---------- Smooth scroll for anchors ----------
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });

  // ---------- Theme toggle ----------
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
    });
  }

  // Follow system theme if user hasn't explicitly chosen
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      const next = e.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
    }
  });

  // ---------- Leaflet map (contact page) ----------
  const mapEl = document.getElementById("map");
  if (mapEl && typeof L !== "undefined") {
    const SALON_COORDS = [43.76643, 1.69161];

    const TILES = {
      light: {
        url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        options: {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20
        }
      },
      dark: {
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        options: {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20
        }
      }
    };

    const map = L.map("map", {
      center: SALON_COORDS,
      zoom: 16,
      scrollWheelZoom: false,
      zoomControl: true,
    });

    let currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    let tileLayer = L.tileLayer(TILES[currentTheme].url, TILES[currentTheme].options).addTo(map);

    const icon = L.divIcon({
      className: "custom-marker",
      html: '<div class="marker-pin"></div>',
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -32]
    });

    L.marker(SALON_COORDS, { icon }).addTo(map)
      .bindPopup('<strong>Salon Évolution</strong>Impasse Raoul Duffy<br/>81370 Saint-Sulpice')
      .openPopup();

    window.addEventListener("themechange", (e) => {
      const theme = e.detail.theme;
      if (theme !== currentTheme) {
        map.removeLayer(tileLayer);
        tileLayer = L.tileLayer(TILES[theme].url, TILES[theme].options).addTo(map);
        currentTheme = theme;
      }
    });
  }

});
