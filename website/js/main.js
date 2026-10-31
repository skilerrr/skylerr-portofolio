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
  const drawerCloseBtn = document.getElementById("drawer-close-btn");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  const openDrawer = () => {
    if (!navDrawer || !menuToggle) return;
    navDrawer.classList.add("active");
    menuToggle.classList.add("active");
    menuToggle.setAttribute("aria-expanded", "true");
    if (navBackdrop) navBackdrop.classList.add("active");
    document.body.classList.add("menu-open");
  };

  const closeDrawer = () => {
    if (!navDrawer || !menuToggle) return;
    navDrawer.classList.remove("active");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    if (navBackdrop) navBackdrop.classList.remove("active");
    document.body.classList.remove("menu-open");
  };

  if (menuToggle) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = navDrawer && navDrawer.classList.contains("active");
      if (isOpen) closeDrawer(); else openDrawer();
    });
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeDrawer();
    });
  }

  if (navBackdrop) {
    navBackdrop.addEventListener("click", closeDrawer);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener("click", () => {
      closeDrawer();
    });
  });

  // Close drawer on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navDrawer && navDrawer.classList.contains("active")) {
      closeDrawer();
    }
  });

  // Close drawer when clicking outside
  document.addEventListener("click", (e) => {
    if (navDrawer && navDrawer.classList.contains("active")) {
      if (!navDrawer.contains(e.target) && !menuToggle.contains(e.target)) {
        closeDrawer();
      }
    }
  });

  // ==========================================================================
  // 3. TRANSLATION MANAGER (EN / ID)
  // ==========================================================================
  const langButtons = document.querySelectorAll(".lang-btn");
  let currentLang = localStorage.getItem("lang") || "id"; // Default to ID for local Indonesian visitor

  const applyTranslations = (lang) => {
    currentLang = lang;
    localStorage.setItem("lang", lang);

    // Update active button state
    langButtons.forEach(btn => {
      if (btn.dataset.lang === lang) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Translate all nodes with [data-t]
    document.querySelectorAll("[data-t]").forEach(el => {
      const key = el.dataset.t;
      if (typeof translations !== "undefined" && translations[lang] && translations[lang][key]) {
        if (el.id === "typewriter") {
          startTypewriter(translations[lang][key]);
        } else {
          el.innerHTML = translations[lang][key];
        }
      }
    });

    // Translate placeholder attributes with [data-t-placeholder]
    document.querySelectorAll("[data-t-placeholder]").forEach(el => {
      const key = el.dataset.tPlaceholder;
      if (typeof translations !== "undefined" && translations[lang] && translations[lang][key]) {
        el.setAttribute("placeholder", translations[lang][key]);
      }
    });

    // Set page HTML lang attribute
    document.documentElement.setAttribute("lang", lang);
  };

  langButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const selectedLang = btn.dataset.lang;
      applyTranslations(selectedLang);
    });
  });

  // ==========================================================================
  // 4. TYPEWRITER SUBTITLE EFFECT
  // ==========================================================================
  const typewriterEl = document.getElementById("typewriter");
  let typewriterTimeout = null;

  const startTypewriter = (text) => {
    if (!typewriterEl) return;
    if (typewriterTimeout) clearTimeout(typewriterTimeout);

    typewriterEl.textContent = "";
    let i = 0;

    const type = () => {
      if (i < text.length) {
        typewriterEl.textContent += text.charAt(i);
        i++;
        typewriterTimeout = setTimeout(type, 35);
      }
    };

    type();
  };

  // ==========================================================================
  // 5. DISCORD 1-CLICK COPY SYSTEM
  // ==========================================================================
  const discordCopyBtn = document.getElementById("discord-copy-btn");
  const discordIdDisplay = document.getElementById("discord-id-display");
  const copyFeedbackBanner = document.getElementById("copy-feedback-banner");
  const discordUsername = "skylerproject_";
  let copyResetTimer = null;

  const copyDiscordToClipboard = () => {
    navigator.clipboard.writeText(discordUsername).then(() => {
      if (copyFeedbackBanner) {
        copyFeedbackBanner.classList.add("active");
      }
      if (discordCopyBtn) {
        const labelEl = discordCopyBtn.querySelector(".copy-btn-label");
        if (labelEl) {
          labelEl.textContent = currentLang === "id" ? "USERNAME DISALIN!" : "COPIED TO CLIPBOARD!";
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
            labelEl.textContent = currentLang === "id" ? "SALIN USERNAME" : "COPY USERNAME";
          }
          discordCopyBtn.classList.remove("copied-success");
        }
      }, 3000);
    }).catch(err => {
      console.warn("Clipboard copy failed, fallback prompt:", err);
      prompt("Discord Username:", discordUsername);
    });
  };

  if (discordCopyBtn) {
    discordCopyBtn.addEventListener("click", copyDiscordToClipboard);
  }
  if (discordIdDisplay) {
    discordIdDisplay.addEventListener("click", copyDiscordToClipboard);
  }

  // ==========================================================================
  // 6. FOOTER SYSTEM CLOCK (WIB / MEDAN TIME)
  // ==========================================================================
  const systemClockEl = document.getElementById("system-clock");

  const tickClock = () => {
    if (systemClockEl) {
      const now = new Date();
      // Format to Asia/Jakarta (WIB)
      const options = {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      };
      try {
        const formatter = new Intl.DateTimeFormat("en-US", options);
        systemClockEl.textContent = formatter.format(now);
      } catch (e) {
        const pad = (n) => String(n).padStart(2, "0");
        systemClockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      }
    }
  };

  setInterval(tickClock, 1000);
  tickClock();

  // ==========================================================================
  // 7. CLIENT INSPECTION GALLERY LIGHTBOX & SLIDER
  // ==========================================================================
  const clientGalleries = {
    "elitebook-640-g11": {
      title: "HP EliteBook 640 G11 // Log Inspeksi & Handover",
      items: [
        {
          src: "assets/laptops/elitebook-box-unit.jpg",
          desc: "Unit mulus lengkap kardus original HP, charger bawaan, dan nota fisik pembelian."
        },
        {
          src: "assets/laptops/elitebook-hwinfo-diag.jpg",
          desc: "Audit diagnosa HWiNFO64: SKU motherboard, RAM 16GB DDR5-5600, sensor suhu, dan kesehatan SSD SK hynix 512GB (100% Health)."
        },
        {
          src: "assets/laptops/elitebook-taskmanager.jpg",
          desc: "Monitoring Task Manager: 12 Cores / 14 Threads Core Ultra 7 165U & utilitas RAM di Windows 11 Pro 24H2."
        },
        {
          src: "assets/laptops/elitebook-dual-desk.jpg",
          desc: "Uji beban panel display: Kecerahan layar, viewing angle, backlight bleed, dan kestabilan multitasking."
        },
        {
          src: "assets/laptops/elitebook-chassis-vpro.jpg",
          desc: "Pemeriksaan fisik luar: Trackpad presisi, sensor fingerprint, stiker Intel vPro, dan speaker Poly Studio."
        },
        {
          src: "assets/laptops/elitebook-client-handover.jpg",
          desc: "Serah terima langsung ke klien (COD Medan): Unit dites bareng di tempat sebelum transaksi selesai."
        }
      ]
    }
  };

  const modalEl = document.getElementById("image-lightbox-modal");
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalTitle = document.getElementById("lightbox-title");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCounter = document.getElementById("lightbox-counter");
  const lightboxDesc = document.getElementById("lightbox-desc");
  const lightboxDots = document.getElementById("lightbox-dots");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  let currentGallery = null;
  let currentIdx = 0;

  const updateLightbox = () => {
    if (!currentGallery || !currentGallery.items[currentIdx]) return;
    const item = currentGallery.items[currentIdx];

    if (lightboxImg) {
      lightboxImg.style.opacity = "0";
      lightboxImg.src = item.src;
      lightboxImg.alt = item.desc;
      lightboxImg.onload = () => {
        lightboxImg.style.opacity = "1";
      };
      if (lightboxImg.complete) {
        lightboxImg.style.opacity = "1";
      }
    }

    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentIdx + 1} / ${currentGallery.items.length}`;
    }
    if (lightboxDesc) {
      lightboxDesc.textContent = item.desc;
    }

    if (lightboxDots) {
      const dots = lightboxDots.querySelectorAll(".lightbox-dot");
      dots.forEach((dot, idx) => {
        if (idx === currentIdx) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
    }
  };

  const openLightbox = (galleryId) => {
    const gallery = clientGalleries[galleryId];
    if (!gallery || !modalEl) return;
    currentGallery = gallery;
    currentIdx = 0;

    if (modalTitle) modalTitle.textContent = gallery.title;

    if (lightboxDots) {
      lightboxDots.innerHTML = "";
      gallery.items.forEach((_, idx) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = `lightbox-dot ${idx === 0 ? "active" : ""}`;
        dot.setAttribute("aria-label", `Pindah ke foto ${idx + 1}`);
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
    document.body.classList.add("menu-open");
  };

  const closeLightbox = () => {
    if (!modalEl) return;
    modalEl.classList.remove("active");
    modalEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
    currentGallery = null;
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
    card.addEventListener("click", () => {
      const gId = card.dataset.galleryId;
      openLightbox(gId);
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const gId = card.dataset.galleryId;
        openLightbox(gId);
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
    viewerEl.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    viewerEl.addEventListener("touchend", (e) => {
      const diffX = e.changedTouches[0].clientX - startX;
      if (Math.abs(diffX) > 40) {
        if (diffX < 0) nextSlide();
        else prevSlide();
      }
    }, { passive: true });
  }

  // ==========================================================================
  // 8. INITIALIZE TRANSLATION & TYPEWRITER ON LOAD
  // ==========================================================================
  applyTranslations(currentLang);
  const initialSubKey = "hero.subtitle";
  if (typeof translations !== "undefined" && translations[currentLang] && translations[currentLang][initialSubKey]) {
    startTypewriter(translations[currentLang][initialSubKey]);
  }
});
