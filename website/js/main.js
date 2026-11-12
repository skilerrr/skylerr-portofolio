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
  // 5. INITIALIZE TRANSLATION ON LOAD
  // ==========================================================================
  applyTranslations(currentLang);
});
