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
  const drawerCloseBtn = document.getElementById("drawer-close-btn");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  const openDrawer = () => {
    if (navDrawer && menuToggle) {
      navDrawer.classList.add("active");
      menuToggle.setAttribute("aria-expanded", "true");
    }
  };

  const closeDrawer = () => {
    if (navDrawer && menuToggle) {
      navDrawer.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  };

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navDrawer && navDrawer.classList.contains("active");
      if (isOpen) closeDrawer(); else openDrawer();
    });
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener("click", closeDrawer);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener("click", () => {
      closeDrawer();
    });
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
  // 7. INITIALIZE TRANSLATION & TYPEWRITER ON LOAD
  // ==========================================================================
  applyTranslations(currentLang);
  const initialSubKey = "hero.subtitle";
  if (typeof translations !== "undefined" && translations[currentLang] && translations[currentLang][initialSubKey]) {
    startTypewriter(translations[currentLang][initialSubKey]);
  }
});
