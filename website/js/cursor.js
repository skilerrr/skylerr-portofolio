// Custom Cursor and Interactive Canvas Grid

class RetroCursorController {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.cursorX = 0;
    this.cursorY = 0;
    
    // Grid cell highlight tracking
    this.gridSize = 32;
    this.activeCells = {}; // format: "col,row": { opacity: 1.0, timestamp: Date.now() }
    
    // Trail particles
    this.particles = [];
    
    this.cursorEl = null;
    this.cursorTextEl = null;
    this.cursorText = "SKYLER";
    this.hasMoved = false;
    
    this.init();
  }

  init() {
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!hasFinePointer) {
      return;
    }

    // 1. Create Background Canvas
    this.canvas = document.createElement("canvas");
    this.canvas.id = "bg-grid-canvas";
    Object.assign(this.canvas.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      zIndex: "-1",
      pointerEvents: "none",
      display: "block"
    });
    document.body.prepend(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    // 2. Create Custom Cursor DOM Elements
    this.cursorEl = document.createElement("div");
    this.cursorEl.id = "custom-cursor";
    
    this.cursorTextEl = document.createElement("div");
    this.cursorTextEl.className = "custom-cursor-text";
    this.cursorEl.appendChild(this.cursorTextEl);
    document.body.appendChild(this.cursorEl);

    Object.assign(this.cursorEl.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      border: "2px solid var(--text-color, #ffffff)",
      pointerEvents: "none",
      transform: "translate(-50%, -50%)",
      zIndex: "10001",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: "0",
      backgroundColor: "var(--cursor-bg)",
      transition: "width 0.2s, height 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.15s"
    });

    Object.assign(this.cursorTextEl.style, {
      position: "absolute",
      top: "24px",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "8px",
      color: "var(--text-color, #ffffff)",
      whiteSpace: "nowrap",
      pointerEvents: "none",
      textTransform: "uppercase",
      letterSpacing: "1px",
      opacity: "0.8",
      transform: "scale(0.8)",
      transition: "color 0.2s"
    });

    document.documentElement.style.cursor = "none";

    window.addEventListener("resize", () => this.resizeCanvas());
    window.addEventListener("mousemove", (e) => this.onMouseMove(e));
    window.addEventListener("scroll", () => this.onScroll(), { passive: true });

    this.setupInteractivity();
    this.resizeCanvas();
    requestAnimationFrame((t) => this.tick(t));
  }

  resizeCanvas() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  onMouseMove(e) {
    if (!this.hasMoved) {
      this.hasMoved = true;
      this.cursorX = e.clientX;
      this.cursorY = e.clientY;
      if (this.cursorEl) this.cursorEl.style.opacity = "1";
    }
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    
    // Add highlighted grid cell
    const col = Math.floor(this.mouseX / this.gridSize);
    const row = Math.floor(this.mouseY / this.gridSize);
    const cellKey = `${col},${row}`;
    this.activeCells[cellKey] = {
      opacity: 1.0,
      x: col * this.gridSize,
      y: row * this.gridSize
    };

    // Spawn retro square particles
    const speed = Math.min(10, Math.sqrt(e.movementX * e.movementX + e.movementY * e.movementY));
    const count = speed > 5 ? 2 : 1;
    
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.mouseX,
        y: this.mouseY,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2 - 1, // float up
        size: Math.random() > 0.5 ? 8 : 4,
        life: 1.0,
        decay: 0.03 + Math.random() * 0.03
      });
    }
  }

  onScroll() {
    this.activeCells = {};
  }

  setupInteractivity() {
    const updateHoverState = (el, text) => {
      el.addEventListener("mouseenter", () => {
        this.cursorText = text;
        this.cursorEl.style.width = "38px";
        this.cursorEl.style.height = "38px";
        this.cursorEl.classList.add("hovered");
        this.cursorEl.style.backgroundColor = "var(--cursor-hover-bg)";
        this.cursorTextEl.style.color = "var(--text-color, #ffffff)";
        this.cursorTextEl.style.transform = "scale(1)";
        this.cursorTextEl.style.fontWeight = "bold";
      });

      el.addEventListener("mouseleave", () => {
        this.cursorText = "SKYLER";
        this.cursorEl.style.width = "20px";
        this.cursorEl.style.height = "20px";
        this.cursorEl.classList.remove("hovered");
        this.cursorEl.style.backgroundColor = "var(--cursor-bg)";
        this.cursorTextEl.style.color = "var(--text-color, #ffffff)";
        this.cursorTextEl.style.transform = "scale(0.8)";
        this.cursorTextEl.style.fontWeight = "normal";
      });
    };

    document.querySelectorAll("a, button, .theme-toggle-btn, .lang-btn, .discord-id-badge").forEach(el => {
      let msg = "CLICK";
      if (el.href && el.href.includes("github")) msg = "GITHUB";
      else if (el.href && el.href.includes("instagram")) msg = "INSTA";
      else if (el.href && el.href.includes("youtube")) msg = "YOUTUBE";
      else if (el.href && el.href.includes("tiktok")) msg = "TIKTOK";
      else if (el.href && el.href.includes("wa.me")) msg = "CHAT";
      else if (el.href && el.href.includes("mailto")) msg = "EMAIL";
      else if (el.classList.contains("lang-btn")) msg = "LANG";
      else if (el.classList.contains("theme-toggle-btn")) msg = "THEME";
      else if (el.id === "discord-id-display") msg = "COPY";
      updateHoverState(el, msg);
    });

    document.querySelectorAll(".project-card, .media-card").forEach(el => {
      updateHoverState(el, el.classList.contains("media-card") ? "OPEN" : "VIEW");
    });
  }

  tick() {
    // Update Custom Cursor Position with LERP
    const lerpFactor = 0.2;
    this.cursorX += (this.mouseX - this.cursorX) * lerpFactor;
    this.cursorY += (this.mouseY - this.cursorY) * lerpFactor;
    
    this.cursorEl.style.left = `${this.cursorX}px`;
    this.cursorEl.style.top = `${this.cursorY}px`;
    this.cursorTextEl.textContent = this.cursorText;

    // Draw on Canvas
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const isDarkMode = document.documentElement.getAttribute("data-theme") !== "light";
      // Draw active cells
      for (const key in this.activeCells) {
        const cell = this.activeCells[key];
        
        this.ctx.fillStyle = isDarkMode 
          ? `rgba(166, 38, 38, ${cell.opacity * 0.08})` 
          : `rgba(140, 28, 28, ${cell.opacity * 0.06})`;
        this.ctx.fillRect(cell.x, cell.y, this.gridSize, this.gridSize);

        this.ctx.strokeStyle = isDarkMode 
          ? `rgba(166, 38, 38, ${cell.opacity * 0.25})` 
          : `rgba(140, 28, 28, ${cell.opacity * 0.2})`;
        this.ctx.strokeRect(cell.x, cell.y, this.gridSize, this.gridSize);

        cell.opacity -= 0.015;
        if (cell.opacity <= 0) {
          delete this.activeCells[key];
        }
      }

      // Draw trails
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        const currentSize = p.size * p.life;
        const opacity = p.life * 0.6;
        
        this.ctx.strokeStyle = isDarkMode 
          ? `rgba(166, 38, 38, ${opacity})` 
          : `rgba(140, 28, 28, ${opacity})`;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(p.x - currentSize / 2, p.y - currentSize / 2, currentSize, currentSize);
      }
    }

    requestAnimationFrame((t) => this.tick(t));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new RetroCursorController();
});
