// Main Application Logic - skylerproject_ Portfolio Website

document.addEventListener("DOMContentLoaded", () => {
  let isAppEntered = false;

  // ==========================================================================
  // 0. RETRO LOADER SYSTEM
  // ==========================================================================
  const loader       = document.getElementById("retro-loader");
  const progressFill = document.getElementById("loader-progress");
  const pctLabel     = document.getElementById("loader-pct");
  const enterPrompt  = document.getElementById("enter-prompt");
  const pageWrapper  = document.querySelector(".page-wrapper");

  // Lines to reveal sequentially
  const lineIds = ["load-line-1","load-line-2","load-line-3","load-line-4","load-line-5"];
  const lineEls = lineIds.map(id => document.getElementById(id));

  // Progress milestones at which each line appears (0–100)
  const lineMilestones = [0, 25, 50, 75, 95];
  let revealedLines = 0;
  let progress = 0;

  // This will be assigned once the audio & terminal systems are set up
  let onEnterCallbacks = [];

  const setProgress = (pct) => {
    const clamped = Math.min(100, Math.round(pct));
    progressFill.style.width = `${clamped}%`;
    if (pctLabel) pctLabel.textContent = `${clamped}%`;

    // Reveal lines at milestones
    for (let i = revealedLines; i < lineMilestones.length; i++) {
      if (clamped >= lineMilestones[i] && lineEls[i]) {
        lineEls[i].classList.add("visible");
        revealedLines = i + 1;
      }
    }
  };

  const simulateLoading = () => {
    const interval = setInterval(() => {
      progress += Math.random() * 10 + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setProgress(100);

        // Short pause, then show click-to-enter
        setTimeout(() => {
          if (pctLabel) pctLabel.closest(".loader-progress-label")
            .querySelector("span:first-child").textContent = "COMPLETE";
          enterPrompt.classList.add("active");
          setupLoaderInteraction();
        }, 400);
      } else {
        setProgress(progress);
      }
    }, 110);
  };

  const setupLoaderInteraction = () => {
    const startApp = () => {
      // Fade out loader
      loader.classList.add("loader-exit");
      setTimeout(() => { loader.style.display = "none"; }, 500);

      // Reveal main page
      pageWrapper.classList.remove("page-hidden");
      pageWrapper.classList.add("page-visible");

      isAppEntered = true;

      // Fire deferred callbacks (audio, typewriter)
      onEnterCallbacks.forEach(cb => cb());
      onEnterCallbacks = [];

      document.removeEventListener("click", startApp);
    };
    document.addEventListener("click", startApp);
  };

  simulateLoading();

  // ==========================================================================
  // 1. THEME MANAGER (DARK / LIGHT MODE)
  // ==========================================================================
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = themeToggle.querySelector(".theme-toggle-icon");

  const getTheme = () => localStorage.getItem("theme") || "light";
  const setTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (theme === "light") {
      themeIcon.textContent = "☾";
    } else {
      themeIcon.textContent = "☼";
    }
  };

  // Toggle Theme on Click
  themeToggle.addEventListener("click", () => {
    const currentTheme = getTheme();
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);

    // Output theme update in terminal
    appendTerminalLine(`System theme changed to: ${newTheme.toUpperCase()}`);
  });

  // Initialize Theme
  setTheme(getTheme());

  // ==========================================================================
  // 2. TRANSLATION MANAGER (EN / ID)
  // ==========================================================================
  const langButtons = document.querySelectorAll(".lang-btn");
  let currentLang = localStorage.getItem("lang") || "en"; // English is default

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
      if (translations[lang] && translations[lang][key]) {
        // Handle typewriter element separately to prevent interference
        if (el.id === "typewriter") {
          if (isAppEntered) {
            startTypewriter(translations[lang][key]);
          }
        } else {
          el.innerHTML = translations[lang][key];
        }
      }
    });

    // Translate placeholder attributes with [data-t-placeholder]
    document.querySelectorAll("[data-t-placeholder]").forEach(el => {
      const key = el.dataset.tPlaceholder;
      if (translations[lang] && translations[lang][key]) {
        el.setAttribute("placeholder", translations[lang][key]);
      }
    });

    // Set page HTML lang attribute
    document.documentElement.setAttribute("lang", lang);

    // Trigger localized terminal output
    appendTerminalLine(`Language locale updated: ${lang.toUpperCase()}`);
  };

  // Bind Language Switcher Buttons
  langButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const selectedLang = btn.dataset.lang;
      applyTranslations(selectedLang);
    });
  });

  // ==========================================================================
  // 3. TYPEWRITER SUBTITLE EFFECT
  // ==========================================================================
  const typewriterEl = document.getElementById("typewriter");
  let typewriterTimeout = null;

  const startTypewriter = (text) => {
    if (typewriterTimeout) {
      clearTimeout(typewriterTimeout);
    }

    typewriterEl.textContent = "";
    let i = 0;

    const type = () => {
      if (i < text.length) {
        typewriterEl.textContent += text.charAt(i);
        i++;
        typewriterTimeout = setTimeout(type, 40); // speed of typing
      }
    };

    type();
  };

  // ==========================================================================
  // 4. RETRO AUDIO PLAYER (REX ORANGE COUNTY - BEST FRIEND)
  // ==========================================================================
  const bgMusic = document.getElementById("bg-music");
  const playBtn = document.getElementById("music-play-btn");
  const volBtn = document.getElementById("music-vol-btn");
  const playerWrapper = document.querySelector(".music-player");
  const footerTrackLabel = document.getElementById("footer-track-name");

  bgMusic.volume = 0.3;
  let isPlaying = false;

  const volumeStages = [
    { value: 0.1, label: "VOL: 10%" },
    { value: 0.3, label: "VOL: 30%" },
    { value: 0.6, label: "VOL: 60%" },
    { value: 1.0, label: "VOL: 100%" },
    { value: 0.0, label: "VOL: MUTED" }
  ];
  let currentVolStageIndex = 0;

  const updatePlayerUI = () => {
    if (isPlaying) {
      playBtn.querySelector(".music-icon").textContent = "■";
      playBtn.querySelector(".music-text").textContent = "STOP SOUND";
      playerWrapper.classList.add("music-playing");
      if (footerTrackLabel) {
        footerTrackLabel.textContent = "BEST FRIEND (REX ORANGE COUNTY) - PLAYING";
      }
    } else {
      playBtn.querySelector(".music-icon").textContent = "▶";
      playBtn.querySelector(".music-text").textContent = "PLAY SOUND";
      playerWrapper.classList.remove("music-playing");
      if (footerTrackLabel) {
        footerTrackLabel.textContent = "BEST FRIEND (REX ORANGE COUNTY) - PAUSED";
      }
    }

    volBtn.textContent = volumeStages[currentVolStageIndex].label;
  };

  const togglePlay = () => {
    if (isPlaying) {
      bgMusic.pause();
      isPlaying = false;
      appendTerminalLine("Audio player paused.");
    } else {
      bgMusic.play()
        .then(() => {
          isPlaying = true;
          appendTerminalLine("Audio player started (Rex Orange County - Best Friend).");
          updatePlayerUI();
        })
        .catch(err => {
          console.warn("Autoplay blocked by browser policy. User interaction required first.", err);
          appendTerminalLine("Error: Audio play blocked. Click anywhere on the site to permit audio playback.");
        });
    }
    updatePlayerUI();
  };

  playBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePlay();
  });

  volBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    currentVolStageIndex = (currentVolStageIndex + 1) % volumeStages.length;
    const activeStage = volumeStages[currentVolStageIndex];

    bgMusic.volume = activeStage.value;

    if (activeStage.value > 0 && !isPlaying) {
      bgMusic.play()
        .then(() => {
          isPlaying = true;
          updatePlayerUI();
        })
        .catch(() => { });
    }

    updatePlayerUI();
    appendTerminalLine(`Audio volume set to: ${(activeStage.value * 100).toFixed(0)}%`);
  });

  onEnterCallbacks.push(() => {
    if (!isPlaying && bgMusic.paused) {
      bgMusic.play()
        .then(() => {
          isPlaying = true;
          updatePlayerUI();
          appendTerminalLine("Audio stream initialized on entry.");
        })
        .catch(() => {});
    }
  });

  // ==========================================================================
  // 5. DISCORD 1-CLICK COPY & INTERACTION SYSTEM
  // ==========================================================================
  const discordCopyBtn = document.getElementById("discord-copy-btn");
  const discordIdDisplay = document.getElementById("discord-id-display");
  const copyFeedbackBanner = document.getElementById("copy-feedback-banner");
  const discordUsername = "skylerproject_";
  let copyResetTimer = null;

  const copyDiscordToClipboard = () => {
    navigator.clipboard.writeText(discordUsername).then(() => {
      // Show feedback banner
      if (copyFeedbackBanner) {
        copyFeedbackBanner.classList.add("active");
      }

      // Update button label
      if (discordCopyBtn) {
        const labelEl = discordCopyBtn.querySelector(".copy-btn-label");
        if (labelEl) {
          labelEl.textContent = currentLang === "id" ? "USERNAME DISALIN!" : "COPIED TO CLIPBOARD!";
        }
        discordCopyBtn.classList.add("copied-success");
      }

      // Terminal announcement
      appendTerminalLine(`Discord handle copied: @${discordUsername}`);

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
      console.error("Failed to copy discord username:", err);
      // Fallback
      appendTerminalLine(`Discord Username: ${discordUsername}`);
    });
  };

  if (discordCopyBtn) {
    discordCopyBtn.addEventListener("click", copyDiscordToClipboard);
  }
  if (discordIdDisplay) {
    discordIdDisplay.addEventListener("click", copyDiscordToClipboard);
  }

  // ==========================================================================
  // 6. FOOTER SYSTEM CLOCK
  // ==========================================================================
  const systemClockEl = document.getElementById("system-clock");

  const tickClock = () => {
    if (systemClockEl) {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = String(hours).padStart(2, '0');

      systemClockEl.textContent = `${formattedHours}:${minutes}:${seconds} ${ampm}`;
    }
  };

  setInterval(tickClock, 1000);
  tickClock();

  // ==========================================================================
  // 7. MOCK TERMINAL CLI SYSTEM
  // ==========================================================================
  const terminalCli = document.getElementById("terminal-cli");
  const terminalOutput = document.getElementById("terminal-output");
  const terminalScreen = document.getElementById("terminal-screen");
  const helperButtons = document.querySelectorAll(".helper-btn");

  const appendTerminalLine = (text, isCommand = false, prefix = "") => {
    const line = document.createElement("div");
    line.className = "output-line";

    if (isCommand) {
      line.innerHTML = `<span class="terminal-prompt">${prefix}</span>${text}`;
    } else {
      line.textContent = text;
    }

    terminalOutput.appendChild(line);
    terminalScreen.scrollTop = terminalScreen.scrollHeight;
  };

  const executeCommand = (cmdText) => {
    const cleanCmd = cmdText.trim().toLowerCase();
    appendTerminalLine(cmdText, true, "guest@skylerproject_:~$ ");

    if (cleanCmd === "") return;

    switch (cleanCmd) {
      case "help":
        if (currentLang === "id") {
          appendTerminalLine("Perintah yang tersedia:\n" +
            "  help      - Menampilkan panduan bantuan ini\n" +
            "  work      - Info ketersediaan proyek, freelance & jasa\n" +
            "  discord   - Salin & tampilkan handle Discord resmi\n" +
            "  about     - Menampilkan profil dan bio singkat\n" +
            "  skills    - Menampilkan keahlian utama skylerproject_\n" +
            "  projects  - Menampilkan daftar proyek unggulan\n" +
            "  socials   - Tautan langsung ke seluruh media sosial\n" +
            "  clear     - Membersihkan layar terminal shell");
        } else {
          appendTerminalLine("Available commands:\n" +
            "  help      - Show this help guide\n" +
            "  work      - Show freelance, collaboration & services\n" +
            "  discord   - Direct Discord contact handle\n" +
            "  about     - Show profile and short biography\n" +
            "  skills    - Show core competencies of skylerproject_\n" +
            "  projects  - Show featured tech projects\n" +
            "  socials   - Show social media and channel links\n" +
            "  clear     - Clear terminal screen output");
        }
        break;

      case "work":
      case "hire":
      case "collab":
        if (currentLang === "id") {
          appendTerminalLine("STATUS: TERSEDIA UNTUK FREELANCE & KOLABORASI\n" +
            "Layanan Utama:\n" +
            "  1. Web Development (Neo-Brutalist & Modern Interactive Web)\n" +
            "  2. Video Editing & Motion (TikTok, Reels, YouTube Gaming)\n" +
            "  3. Laptop Enthusiast (Open to talk with! Rekomendasi & Diskusi Hardware)\n" +
            "Kontak Utama: DM Discord -> @skylerproject_");
        } else {
          appendTerminalLine("STATUS: OPEN FOR FREELANCE & COLLABORATION\n" +
            "Core Offerings:\n" +
            "  1. Web Development (Neo-Brutalist & Modern Interactive Web)\n" +
            "  2. Video Editing & Motion (TikTok, Reels, YouTube Gaming)\n" +
            "  3. Laptop Enthusiast (Open to talk with! Specs & Setup chats)\n" +
            "Primary Contact: Direct Discord -> @skylerproject_");
        }
        break;

      case "discord":
        copyDiscordToClipboard();
        appendTerminalLine("DISCORD HANDLE: skylerproject_\n" +
          ">> Direct DM channel open. Add 'skylerproject_' on Discord!");
        break;

      case "about":
        if (currentLang === "id") {
          appendTerminalLine("PROFIL skylerproject_:\n" +
            "skylerproject_ adalah seorang web developer, video editor, kreator konten, dan laptop enthusiast. Senang mengeksplorasi desain retro-futuristik, gameplay CDID Roblox, dunia balap F1, dan arsitektur hardware laptop.");
        } else {
          appendTerminalLine("ABOUT skylerproject_:\n" +
            "skylerproject_ is a web developer, video editor, content creator, and laptop enthusiast. Passionate about retro-futuristic web designs, CDID Roblox gaming, Formula 1 motorsport, and laptop hardware engineering.");
        }
        break;

      case "skills":
        appendTerminalLine("COMPETENCIES:\n" +
          "  - HTML5/CSS3\n" +
          "  - Javascript\n" +
          "  - PHP\n" +
          "  - Typescript\n" +
          "  - UI/UX\n" +
          "  - Video Editing\n" +
          "  - Laptop & Hardware Diagnostics");
        break;

      case "projects":
        if (currentLang === "id") {
          appendTerminalLine("PROYEK PILIHAN:\n" +
            "  Tech Guides by skylerproject_ -> https://bit.ly/techguidesbyskyler");
        } else {
          appendTerminalLine("FEATURED PROJECTS:\n" +
            "  Tech Guides by skylerproject_ -> https://bit.ly/techguidesbyskyler");
        }
        break;

      case "socials":
      case "contact":
        appendTerminalLine("CHANNELS & CONTACT:\n" +
          "  - Discord: @skylerproject_ (Direct DM)\n" +
          "  - WhatsApp: https://wa.me/62817769084\n" +
          "  - Email: diryaflop@gmail.com\n" +
          "  - YouTube: https://www.youtube.com/JustSkylerProject\n" +
          "  - Tiktok: https://www.tiktok.com/@skylerf1freak\n" +
          "  - Instagram: https://www.instagram.com/skylerproject_\n" +
          "  - Github: https://github.com/skilerrr");
        break;

      case "clear":
        terminalOutput.innerHTML = "";
        break;

      default:
        if (currentLang === "id") {
          appendTerminalLine("Kesalahan: Perintah '" + cleanCmd + "' tidak dikenali. Ketik 'help' atau 'work' untuk panduan.");
        } else {
          appendTerminalLine("Error: Command '" + cleanCmd + "' not recognized. Type 'help' or 'work' for commands.");
        }
        break;
    }

    terminalScreen.scrollTop = terminalScreen.scrollHeight;
  };

  // Listen for Enter Key in CLI
  terminalCli.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const text = terminalCli.value;
      executeCommand(text);
      terminalCli.value = "";
    }
  });

  // Bind Quick Helper Buttons
  helperButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const cmd = btn.dataset.cmd;
      executeCommand(cmd);
    });
  });

  // Auto-focus input when terminal area is clicked
  terminalScreen.addEventListener("click", () => {
    terminalCli.focus();
  });

  // Initialize Page Translations
  applyTranslations(currentLang);

  // Register typewriter start on enter via the loader gate
  onEnterCallbacks.push(() => {
    const key = "hero.subtitle";
    if (translations[currentLang] && translations[currentLang][key]) {
      startTypewriter(translations[currentLang][key]);
    }
  });
});
