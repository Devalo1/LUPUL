/* Samsung Galaxy Optimization Script */
(function () {
  "use strict";

  // Detectează dacă este un dispozitiv Samsung Galaxy
  function isSamsungGalaxy() {
    const userAgent = navigator.userAgent;
    return (
      /Samsung|SM-|Galaxy/i.test(userAgent) ||
      /Android.*Chrome/i.test(userAgent)
    );
  }

  // Optimizări pentru Galaxy S24 FE
  function optimizeForGalaxy() {
    // Adaugă clase CSS specifice pentru Galaxy
    document.documentElement.classList.add("galaxy-device");

    // Optimizează viewport pentru Galaxy S24 FE
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport && window.innerWidth <= 428) {
      viewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, viewport-fit=cover"
      );
    }

    // Previne zoom-ul nedorit
    document.addEventListener("gesturestart", function (e) {
      e.preventDefault();
    });

    document.addEventListener("gesturechange", function (e) {
      e.preventDefault();
    });

    document.addEventListener("gestureend", function (e) {
      e.preventDefault();
    });

    // Optimizează scroll-ul pentru Galaxy
    document.addEventListener(
      "touchmove",
      function (e) {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    // Asigură încărcarea corectă a background-ului
    const img = new Image();
    img.onload = function () {
      document.body.classList.add("bg-loaded");
      // Forțează re-paint pentru Galaxy
      document.body.style.transform = "translateZ(0)";
    };
    img.onerror = function () {
      // Fallback pentru Galaxy dacă imaginea nu se încarcă
      document.body.style.backgroundColor = "#1a202c";
      document.body.classList.add("bg-fallback");
    };
    img.src = "/images/background.jpeg";

    // Optimizează performance pentru Galaxy
    if ("requestIdleCallback" in window) {
      requestIdleCallback(function () {
        // Optimizări suplimentare când browser-ul este idle
        const elements = document.querySelectorAll(
          ".content-container, .btn, button"
        );
        elements.forEach((el) => {
          el.style.willChange = "transform";
          el.style.transform = "translateZ(0)";
        });
      });
    }

    // Fix pentru probleme de redimensionare pe Galaxy
    let resizeTimeout;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function () {
        // Forțează recalcularea layout-ului
        document.body.style.height = window.innerHeight + "px";
        setTimeout(() => {
          document.body.style.height = "";
        }, 100);
      }, 250);
    });

    // Optimizează pentru orientarea dispozitivului
    window.addEventListener("orientationchange", function () {
      setTimeout(function () {
        // Recalculează viewport-ul după rotație
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", vh + "px");

        // Forțează reflow pentru Galaxy
        document.body.style.minHeight = window.innerHeight + "px";
        setTimeout(() => {
          document.body.style.minHeight = "100vh";
        }, 200);
      }, 300);
    });

    // Setează variabilele CSS pentru height
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", vh + "px");
  }

  // Optimizări pentru butoane și interacțiuni touch
  function optimizeTouchInteractions() {
    document.addEventListener("DOMContentLoaded", function () {
      // Adaugă clase pentru butoane mai mari pe Galaxy
      const buttons = document.querySelectorAll(
        'button, .btn, a[role="button"]'
      );
      buttons.forEach((button) => {
        button.classList.add("galaxy-touch-target");

        // Optimizează feedback-ul tactil
        button.addEventListener("touchstart", function () {
          this.classList.add("touch-active");
        });

        button.addEventListener("touchend", function () {
          const self = this;
          setTimeout(() => {
            self.classList.remove("touch-active");
          }, 150);
        });
      });

      // Optimizează input-urile pentru Galaxy
      const inputs = document.querySelectorAll("input, textarea, select");
      inputs.forEach((input) => {
        input.style.fontSize = "16px"; // Previne zoom-ul pe Galaxy
        input.addEventListener("focus", function () {
          // Scroll pentru a aduce input-ul în view pe Galaxy
          setTimeout(() => {
            this.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        });
      });
    });
  }

  // Rulează optimizările dacă este Galaxy
  if (isSamsungGalaxy()) {
    console.log("Galaxy device detected - applying optimizations");
    optimizeForGalaxy();
    optimizeTouchInteractions();

    // Înregistrează service worker pentru Galaxy
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker
          .register("/sw-galaxy.js")
          .then(function (registration) {
            console.log("SW registered for Galaxy: ", registration.scope);
            // Trimite mesaj pentru optimizări Galaxy
            registration.active &&
              registration.active.postMessage({
                type: "GALAXY_OPTIMIZATION",
              });
          })
          .catch(function (error) {
            console.log("SW registration failed: ", error);
          });
      });
    }
  }

  // Optimizări generale pentru mobile
  if (window.innerWidth <= 768) {
    document.documentElement.classList.add("mobile-device");

    // Previne double-tap zoom pe mobile
    let lastTouchEnd = 0;
    document.addEventListener(
      "touchend",
      function (event) {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      },
      false
    );
  }
})();
