// Main Application Logic - skylerproject_ Portfolio Website

document.addEventListener("DOMContentLoaded", () => {
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
  let currentLang = localStorage.getItem("lang") || "en"; // English is now default

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
          startTypewriter(translations[lang][key]);
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

  // Set default initial volume to low (30%)
  bgMusic.volume = 0.3;
  let isPlaying = false;

  // Volume stages configuration: 10% -> 30% -> 60% -> 100% -> Muted
  const volumeStages = [
    { value: 0.1, label: "VOL: 10%" },
    { value: 0.3, label: "VOL: 30%" },
    { value: 0.6, label: "VOL: 60%" },
    { value: 1.0, label: "VOL: 100%" },
    { value: 0.0, label: "VOL: MUTED" }
  ];
  let currentVolStageIndex = 0; // Starts at index 0 (10%)

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

    // Update volume button text
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

  // Play button click handler
  playBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePlay();
  });

  // Volume cycle button handler: 10% -> 30% -> 60% -> 100% -> Muted -> 10%
  volBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    currentVolStageIndex = (currentVolStageIndex + 1) % volumeStages.length;
    const activeStage = volumeStages[currentVolStageIndex];

    bgMusic.volume = activeStage.value;

    // If volume is changed while audio is paused, play it automatically to show response
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

  // Auto-play attempt on first user click anywhere on page
  const initAudioOnInteraction = () => {
    if (!isPlaying && bgMusic.paused) {
      bgMusic.play()
        .then(() => {
          isPlaying = true;
          updatePlayerUI();
          appendTerminalLine("Audio initialized on user interaction.");
        })
        .catch(() => { });
    }
    // Remove listeners once audio starts
    document.removeEventListener("click", initAudioOnInteraction);
    document.removeEventListener("keydown", initAudioOnInteraction);
  };

  document.addEventListener("click", initAudioOnInteraction);
  document.addEventListener("keydown", initAudioOnInteraction);

  // ==========================================================================
  // 5. FOOTER SYSTEM CLOCK
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
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const formattedHours = String(hours).padStart(2, '0');

      systemClockEl.textContent = `${formattedHours}:${minutes}:${seconds} ${ampm}`;
    }
  };

  setInterval(tickClock, 1000);
  tickClock(); // Immediate call

  // ==========================================================================
  // 6. MOCK TERMINAL CLI SYSTEM
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
            "  about     - Menampilkan detail profil dan bio singkat\n" +
            "  skills    - Menampilkan keahlian utama skylerproject_\n" +
            "  projects  - Menampilkan daftar proyek unggulan\n" +
            "  socials   - Tautan langsung ke media sosial terhubung\n" +
            "  clear     - Membersihkan layar terminal shell");
        } else {
          appendTerminalLine("Available commands:\n" +
            "  help      - Show this help guide\n" +
            "  about     - Show profile and short biography\n" +
            "  skills    - Show core competencies of skylerproject_\n" +
            "  projects  - Show featured tech projects\n" +
            "  socials   - Show social media and channel links\n" +
            "  clear     - Clear terminal screen output");
        }
        break;

      case "about":
        if (currentLang === "id") {
          appendTerminalLine("PROFIL skylerproject_:\n" +
            "skylerproject_ adalah seorang pengembang front-end dan kreator konten digital. Aktif membagikan video gaming CDID Roblox di YouTube dan meme Formula 1 di Tiktok, serta menulis panduan teknologi mendalam di Notion.");
        } else {
          appendTerminalLine("ABOUT skylerproject_:\n" +
            "skylerproject_ is a front-end developer and tech content creator. Actively producing CDID Roblox gaming videos on YouTube, Formula 1 memes on Tiktok, and deep-dive technical blogs on Notion.");
        }
        break;

      case "skills":
        appendTerminalLine("COMPETENCIES:\n" +
          "  - HTML5/CSS3\n" +
          "  - Javascript\n" +
          "  - PHP\n" +
          "  - Typescript\n" +
          "  - UI/UX\n" +
          "  - Video Editing");
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
        appendTerminalLine("SOCIAL CHANNELS:\n" +
          "  - YouTube: https://www.youtube.com/JustSkylerProject (CDID Roblox)\n" +
          "  - Tiktok: https://www.tiktok.com/@skylerf1freak (Formula 1 Memes)\n" +
          "  - Notion Blog: https://bit.ly/techguidesbyskyler (Tech Guides)\n" +
          "  - Instagram: https://www.instagram.com/skylerproject_\n" +
          "  - Github: https://github.com/skilerrr\n" +
          "  - Whatsapp: https://wa.me/62817769084");
        break;

      case "clear":
        terminalOutput.innerHTML = "";
        break;

      default:
        if (currentLang === "id") {
          appendTerminalLine("Kesalahan: Perintah '" + cleanCmd + "' tidak dikenali. Ketik 'help' untuk daftar perintah.");
        } else {
          appendTerminalLine("Error: Command '" + cleanCmd + "' not recognized. Type 'help' for available commands.");
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
});
