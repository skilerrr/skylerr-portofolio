// Main Application Logic - skylerproject_ Portfolio Website

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================================================
  // 1. THEME MANAGER (DARK / LIGHT MODE)
  // ==========================================================================
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = themeToggle ? themeToggle.querySelector(".theme-toggle-icon") : null;

  const getTheme = () => localStorage.getItem("theme") || "dark";
  const setTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (themeIcon) {
      themeIcon.textContent = theme === "dark" ? "☼" : "☾";
    }
  };

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = getTheme();
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      setTheme(newTheme);
    });
  }

  // Initialize Theme (default dark)
  setTheme(getTheme());

  // ==========================================================================
  // 2. MOBILE DRAWER NAVIGATION
  // ==========================================================================
  const menuToggle = document.getElementById("mobile-menu-toggle");
  const navDrawer = document.getElementById("mobile-nav-drawer");
  const navBackdrop = document.getElementById("mobile-nav-backdrop");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
  let lastFocusedBeforeDrawer = null;

  const openDrawer = () => {
    if (!navDrawer || !menuToggle) return;
    lastFocusedBeforeDrawer = document.activeElement;
    navDrawer.classList.add("active");
    navDrawer.setAttribute("aria-hidden", "false");
    menuToggle.classList.add("active");
    menuToggle.setAttribute("aria-expanded", "true");
    if (navBackdrop) navBackdrop.classList.add("active");
    document.body.classList.add("menu-open");
    const firstLink = navDrawer.querySelector(".mobile-nav-link");
    if (firstLink) firstLink.focus();
  };

  const closeDrawer = (restoreFocus = false) => {
    if (!navDrawer || !menuToggle) return;
    navDrawer.classList.remove("active");
    navDrawer.setAttribute("aria-hidden", "true");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    if (navBackdrop) navBackdrop.classList.remove("active");
    document.body.classList.remove("menu-open");
    if (restoreFocus && lastFocusedBeforeDrawer && typeof lastFocusedBeforeDrawer.focus === "function") {
      lastFocusedBeforeDrawer.focus();
    }
    lastFocusedBeforeDrawer = null;
  };

  if (menuToggle) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = navDrawer && navDrawer.classList.contains("active");
      if (isOpen) closeDrawer(true);
      else openDrawer();
    });
  }

  if (navBackdrop) {
    navBackdrop.addEventListener("click", () => closeDrawer(true));
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener("click", () => {
      closeDrawer(false);
    });
  });

  // Close drawer on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navDrawer && navDrawer.classList.contains("active")) {
      closeDrawer(true);
    }
  });

  // Close drawer when clicking outside
  document.addEventListener("click", (e) => {
    if (navDrawer && navDrawer.classList.contains("active")) {
      if (!navDrawer.contains(e.target) && !menuToggle.contains(e.target)) {
        closeDrawer(false);
      }
    }
  });

  // ==========================================================================
  // 3. TRANSLATION MANAGER (EN / ID)
  // ==========================================================================
  const langButtons = document.querySelectorAll(".lang-btn");
  let currentLang = localStorage.getItem("lang") || "id";
  let updateModalTranslation = null;

  const applyTranslations = (lang) => {
    currentLang = lang;
    localStorage.setItem("lang", lang);

    langButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    document.querySelectorAll("[data-t]").forEach(el => {
      const key = el.dataset.t;
      if (typeof translations !== "undefined" && translations[lang] && translations[lang][key]) {
        el.innerHTML = translations[lang][key];
      }
    });

    document.documentElement.setAttribute("lang", lang);
    if (typeof updateModalTranslation === "function") {
      updateModalTranslation();
    }
  };

  langButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      applyTranslations(btn.dataset.lang);
    });
  });

  // ==========================================================================
  // 4. DISCORD 1-CLICK COPY SYSTEM
  // ==========================================================================
  const discordCopyBtn = document.getElementById("discord-copy-btn");
  const discordIdDisplay = document.getElementById("discord-id-display");
  const copyFeedbackBanner = document.getElementById("copy-feedback-banner");
  const discordUsername = "skylerproject_";
  let copyResetTimer = null;

  const showCopySuccess = () => {
    if (copyFeedbackBanner) {
      copyFeedbackBanner.classList.add("active");
    }
    if (discordCopyBtn) {
      const labelEl = discordCopyBtn.querySelector(".copy-btn-label");
      if (labelEl) {
        const copiedText = (typeof translations !== "undefined" && translations[currentLang]?.["contact.copied_btn"])
          || (currentLang === "id" ? "TERSALIN!" : "COPIED!");
        labelEl.textContent = copiedText;
      }
      discordCopyBtn.classList.add("copied-success");
    }

    if (copyResetTimer) clearTimeout(copyResetTimer);
    copyResetTimer = setTimeout(() => {
      if (copyFeedbackBanner) {
        copyFeedbackBanner.classList.remove("active");
      }
      if (discordCopyBtn) {
        const labelEl = discordCopyBtn.querySelector(".copy-btn-label");
        if (labelEl) {
          const copyText = (typeof translations !== "undefined" && translations[currentLang]?.["contact.copy_btn"])
            || (currentLang === "id" ? "SALIN USERNAME" : "COPY USERNAME");
          labelEl.textContent = copyText;
        }
        discordCopyBtn.classList.remove("copied-success");
      }
    }, 3000);
  };

  const fallbackSelectDiscordId = () => {
    if (!discordIdDisplay) return;
    const range = document.createRange();
    range.selectNodeContents(discordIdDisplay);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    try {
      document.execCommand("copy");
      showCopySuccess();
    } catch {
      if (copyFeedbackBanner) copyFeedbackBanner.classList.add("active");
    }
  };

  const copyDiscordToClipboard = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(discordUsername).then(showCopySuccess).catch(() => {
        fallbackSelectDiscordId();
      });
    } else {
      fallbackSelectDiscordId();
    }
  };

  if (discordCopyBtn) {
    discordCopyBtn.addEventListener("click", copyDiscordToClipboard);
  }
  if (discordIdDisplay) {
    discordIdDisplay.addEventListener("click", copyDiscordToClipboard);
    discordIdDisplay.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        copyDiscordToClipboard();
      }
    });
  }

  // ==========================================================================
  // 5. GALLERY LIGHTBOX (IMAGES ONLY, NO DESCRIPTIONS)
  // ==========================================================================
  const getLocalized = (val) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    return val[currentLang] || val["id"] || "";
  };

  const clientGalleries = {
    "elitebook-640-g11": {
      title: {
        id: "HP EliteBook 640 G11",
        en: "HP EliteBook 640 G11"
      },
      items: [
        { src: "assets/laptops/elitebook-box-unit.jpg", alt: "HP EliteBook 640 G11 fullset" },
        { src: "assets/laptops/elitebook-hwinfo-diag.jpg", alt: "HP EliteBook 640 G11 HWiNFO64" },
        { src: "assets/laptops/elitebook-taskmanager.jpg", alt: "HP EliteBook 640 G11 Task Manager" },
        { src: "assets/laptops/elitebook-dual-desk.jpg", alt: "HP EliteBook 640 G11 display check" },
        { src: "assets/laptops/elitebook-chassis-vpro.jpg", alt: "HP EliteBook 640 G11 chassis" },
        { src: "assets/laptops/elitebook-client-handover.jpg", alt: "HP EliteBook 640 G11 handover" }
      ]
    },
    "elitebook-645-g11": {
      title: {
        id: "HP EliteBook 645 G11",
        en: "HP EliteBook 645 G11"
      },
      items: [
        { src: "assets/laptops/elitebook-645-f1-lockscreen.jpg", alt: "HP EliteBook 645 G11 F1 lockscreen" },
        { src: "assets/laptops/elitebook-645-chassis.jpg", alt: "HP EliteBook 645 G11 chassis" },
        { src: "assets/laptops/elitebook-645-desk-setup.jpg", alt: "HP EliteBook 645 G11 desk setup" },
        { src: "assets/laptops/elitebook-645-car-mobile.jpg", alt: "HP EliteBook 645 G11 mobile setup" }
      ]
    }
  };

  const modalEl = document.getElementById("image-lightbox-modal");
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalTitle = document.getElementById("lightbox-title");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCounter = document.getElementById("lightbox-counter");
  const lightboxDots = document.getElementById("lightbox-dots");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  let currentGallery = null;
  let currentIdx = 0;
  let lastFocusedBeforeModal = null;

  const updateLightbox = () => {
    if (!currentGallery || !currentGallery.items[currentIdx]) return;
    const item = currentGallery.items[currentIdx];

    if (lightboxImg) {
      lightboxImg.style.opacity = "0";
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt || getLocalized(currentGallery.title);
      lightboxImg.onload = () => { lightboxImg.style.opacity = "1"; };
      lightboxImg.onerror = () => { lightboxImg.style.opacity = "1"; };
      if (lightboxImg.complete) {
        lightboxImg.style.opacity = "1";
      }
    }

    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentIdx + 1} / ${currentGallery.items.length}`;
    }

    if (lightboxDots) {
      const dots = lightboxDots.querySelectorAll(".lightbox-dot");
      dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === currentIdx);
      });
    }
  };

  const openLightbox = (galleryId) => {
    const gallery = clientGalleries[galleryId];
    if (!gallery || !modalEl) return;
    lastFocusedBeforeModal = document.activeElement;
    currentGallery = gallery;
    currentIdx = 0;

    if (modalTitle) modalTitle.textContent = getLocalized(gallery.title);

    if (lightboxDots) {
      lightboxDots.innerHTML = "";
      gallery.items.forEach((_, idx) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = `lightbox-dot ${idx === 0 ? "active" : ""}`;
        dot.setAttribute("aria-label", currentLang === "id" ? `Foto ${idx + 1}` : `Photo ${idx + 1}`);
        dot.addEventListener("click", (e) => {
          e.stopPropagation();
          currentIdx = idx;
          updateLightbox();
        });
        lightboxDots.appendChild(dot);
      });
    }

    updateLightbox();
    modalEl.classList.add("active");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    if (modalCloseBtn) modalCloseBtn.focus();
  };

  const closeLightbox = () => {
    if (!modalEl) return;
    modalEl.classList.remove("active");
    modalEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    currentGallery = null;
    if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === "function") {
      lastFocusedBeforeModal.focus();
    }
    lastFocusedBeforeModal = null;
  };

  updateModalTranslation = () => {
    if (currentGallery && modalTitle) {
      modalTitle.textContent = getLocalized(currentGallery.title);
    }
  };

  const nextSlide = () => {
    if (!currentGallery) return;
    currentIdx = (currentIdx + 1) % currentGallery.items.length;
    updateLightbox();
  };

  const prevSlide = () => {
    if (!currentGallery) return;
    currentIdx = (currentIdx - 1 + currentGallery.items.length) % currentGallery.items.length;
    updateLightbox();
  };

  document.querySelectorAll("[data-gallery-id]").forEach(card => {
    card.addEventListener("click", () => openLightbox(card.dataset.galleryId));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(card.dataset.galleryId);
      }
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeLightbox);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeLightbox);
  if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); nextSlide(); });
  if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); prevSlide(); });

  document.addEventListener("keydown", (e) => {
    if (!modalEl || !modalEl.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowLeft") prevSlide();
  });

  const viewerEl = document.querySelector(".editorial-modal-viewer");
  if (viewerEl) {
    let startX = 0;
    let startY = 0;
    viewerEl.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    viewerEl.addEventListener("touchend", (e) => {
      const diffX = e.changedTouches[0].clientX - startX;
      const diffY = e.changedTouches[0].clientY - startY;
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) nextSlide();
        else prevSlide();
      }
    }, { passive: true });
  }

  // ==========================================================================
  // 6. INITIALIZE TRANSLATION ON LOAD
  // ==========================================================================
  applyTranslations(currentLang);
});
