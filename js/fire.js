/* ============================================
   GOONFREE — Fire Animation Engine
   Canvas-based particle system
   ============================================ */

const FireEngine = (() => {
  // Level-specific fire configurations (16 levels, 0–15)
  const LEVEL_CONFIGS = [
    { // Level 0 — Grey smoke only
      spawnRate: 2,
      colors: ['#2a2a2a', '#333', '#2e2e2e', '#252525'],
      coreColors: ['#333', '#3a3a3a'],
      speed: { min: 0.3, max: 0.8 },
      spread: 1.2,
      baseSize: 14,
      sizeVariance: 8,
      life: 120,
      glow: 0,
      glowColor: 'transparent',
      embers: false,
      coreIntensity: 0,
      flameHeight: 0.35,
      flameWidth: 0.35,
      isSmoke: true
    },
    { // Level 1 — Dull orange
      spawnRate: 5,
      colors: ['#FF8C42', '#FF6A00', '#E65100', '#CC5500'],
      coreColors: ['#FFAB40', '#FFD180'],
      speed: { min: 1.0, max: 2.2 },
      spread: 2.2,
      baseSize: 10,
      sizeVariance: 5,
      life: 80,
      glow: 12,
      glowColor: 'rgba(255,140,66,0.3)',
      embers: false,
      coreIntensity: 0.25,
      flameHeight: 0.4,
      flameWidth: 0.3
    },
    { // Level 2 — Strong orange
      spawnRate: 7,
      colors: ['#FF6A00', '#FF4500', '#E64A19', '#FF5722'],
      coreColors: ['#FF9100', '#FFAB40'],
      speed: { min: 1.2, max: 2.6 },
      spread: 2.6,
      baseSize: 11,
      sizeVariance: 5,
      life: 83,
      glow: 18,
      glowColor: 'rgba(255,106,0,0.35)',
      embers: false,
      coreIntensity: 0.3,
      flameHeight: 0.45,
      flameWidth: 0.33
    },
    { // Level 3 — Amber
      spawnRate: 9,
      colors: ['#FFB300', '#FF8F00', '#FFA000', '#FF6F00'],
      coreColors: ['#FFD54F', '#FFECB3'],
      speed: { min: 1.3, max: 2.9 },
      spread: 2.8,
      baseSize: 11,
      sizeVariance: 5,
      life: 85,
      glow: 22,
      glowColor: 'rgba(255,179,0,0.35)',
      embers: false,
      coreIntensity: 0.4,
      flameHeight: 0.48,
      flameWidth: 0.35
    },
    { // Level 4 — Gold
      spawnRate: 11,
      colors: ['#FFD700', '#FFC107', '#FFB300', '#FFAB00'],
      coreColors: ['#FFF176', '#FFF9C4'],
      speed: { min: 1.4, max: 3.2 },
      spread: 3.0,
      baseSize: 12,
      sizeVariance: 5,
      life: 88,
      glow: 26,
      glowColor: 'rgba(255,215,0,0.4)',
      embers: false,
      coreIntensity: 0.45,
      flameHeight: 0.52,
      flameWidth: 0.37
    },
    { // Level 5 — Bright yellow
      spawnRate: 13,
      colors: ['#FFEE58', '#FFD600', '#FFEB3B', '#FFC107'],
      coreColors: ['#FFFDE7', '#FFF9C4'],
      speed: { min: 1.5, max: 3.5 },
      spread: 3.2,
      baseSize: 12,
      sizeVariance: 5,
      life: 90,
      glow: 30,
      glowColor: 'rgba(255,238,88,0.4)',
      embers: false,
      coreIntensity: 0.5,
      flameHeight: 0.55,
      flameWidth: 0.39
    },
    { // Level 6 — White-hot
      spawnRate: 15,
      colors: ['#FFFFFF', '#FFF8E1', '#FFD700', '#FFC107'],
      coreColors: ['#FFFFFF', '#FFF9C4'],
      speed: { min: 1.7, max: 3.8 },
      spread: 3.5,
      baseSize: 13,
      sizeVariance: 6,
      life: 91,
      glow: 35,
      glowColor: 'rgba(255,255,255,0.4)',
      embers: true,
      emberColors: ['#FFD700', '#FFFFFF', '#FFC107'],
      coreIntensity: 0.55,
      flameHeight: 0.58,
      flameWidth: 0.41
    },
    { // Level 7 — Blue + gold
      spawnRate: 17,
      colors: ['#2979FF', '#448AFF', '#FFD700', '#FFC107'],
      coreColors: ['#82B1FF', '#BBDEFB'],
      speed: { min: 1.9, max: 4.0 },
      spread: 3.8,
      baseSize: 13,
      sizeVariance: 6,
      life: 93,
      glow: 40,
      glowColor: 'rgba(41,121,255,0.4)',
      embers: true,
      emberColors: ['#2979FF', '#448AFF', '#FFD700'],
      coreIntensity: 0.6,
      flameHeight: 0.62,
      flameWidth: 0.43
    },
    { // Level 8 — Electric blue
      spawnRate: 19,
      colors: ['#00E5FF', '#00B8D4', '#18FFFF', '#00BCD4'],
      coreColors: ['#E0F7FA', '#FFFFFF'],
      speed: { min: 2.1, max: 4.3 },
      spread: 4.0,
      baseSize: 14,
      sizeVariance: 6,
      life: 94,
      glow: 45,
      glowColor: 'rgba(0,229,255,0.45)',
      embers: true,
      emberColors: ['#00E5FF', '#18FFFF', '#84FFFF'],
      coreIntensity: 0.65,
      flameHeight: 0.65,
      flameWidth: 0.44
    },
    { // Level 9 — Violet
      spawnRate: 21,
      colors: ['#7C4DFF', '#651FFF', '#B388FF', '#6200EA'],
      coreColors: ['#D1C4E9', '#EDE7F6'],
      speed: { min: 2.3, max: 4.5 },
      spread: 4.2,
      baseSize: 14,
      sizeVariance: 6,
      life: 95,
      glow: 50,
      glowColor: 'rgba(124,77,255,0.45)',
      embers: true,
      emberColors: ['#7C4DFF', '#B388FF', '#EA80FC'],
      coreIntensity: 0.7,
      flameHeight: 0.68,
      flameWidth: 0.45
    },
    { // Level 10 — Deep purple
      spawnRate: 23,
      colors: ['#651FFF', '#6200EA', '#AA00FF', '#D500F9'],
      coreColors: ['#EA80FC', '#F3E5F5'],
      speed: { min: 2.5, max: 4.8 },
      spread: 4.4,
      baseSize: 15,
      sizeVariance: 6,
      life: 96,
      glow: 55,
      glowColor: 'rgba(101,31,255,0.5)',
      embers: true,
      emberColors: ['#651FFF', '#AA00FF', '#EA80FC'],
      coreIntensity: 0.75,
      flameHeight: 0.71,
      flameWidth: 0.46
    },
    { // Level 11 — Pink plasma
      spawnRate: 25,
      colors: ['#FF4081', '#F50057', '#FF80AB', '#E91E63'],
      coreColors: ['#FCE4EC', '#FFFFFF'],
      speed: { min: 2.6, max: 5.0 },
      spread: 4.6,
      baseSize: 15,
      sizeVariance: 7,
      life: 97,
      glow: 58,
      glowColor: 'rgba(255,64,129,0.5)',
      embers: true,
      emberColors: ['#FF4081', '#FF80AB', '#F8BBD0', '#E040FB'],
      coreIntensity: 0.8,
      flameHeight: 0.74,
      flameWidth: 0.47
    },
    { // Level 12 — Emerald green-cyan
      spawnRate: 27,
      colors: ['#00E676', '#00C853', '#69F0AE', '#00E5FF'],
      coreColors: ['#B9F6CA', '#E0F7FA'],
      speed: { min: 2.7, max: 5.2 },
      spread: 4.7,
      baseSize: 15,
      sizeVariance: 7,
      life: 97,
      glow: 60,
      glowColor: 'rgba(0,230,118,0.5)',
      embers: true,
      emberColors: ['#00E676', '#69F0AE', '#18FFFF', '#A7FFEB'],
      coreIntensity: 0.82,
      flameHeight: 0.76,
      flameWidth: 0.48
    },
    { // Level 13 — Crimson red-gold
      spawnRate: 29,
      colors: ['#FF1744', '#D50000', '#FF6D00', '#FF8A80'],
      coreColors: ['#FFCDD2', '#FFF3E0'],
      speed: { min: 2.8, max: 5.4 },
      spread: 4.9,
      baseSize: 16,
      sizeVariance: 7,
      life: 98,
      glow: 62,
      glowColor: 'rgba(255,23,68,0.5)',
      embers: true,
      emberColors: ['#FF1744', '#FF6D00', '#FFD700', '#FF8A80'],
      coreIntensity: 0.85,
      flameHeight: 0.78,
      flameWidth: 0.49
    },
    { // Level 14 — White prism celestial
      spawnRate: 32,
      colors: ['#FFFFFF', '#E8EAF6', '#CE93D8', '#80D8FF', '#B388FF'],
      coreColors: ['#FFFFFF', '#FAFAFA'],
      speed: { min: 3.0, max: 5.6 },
      spread: 5.0,
      baseSize: 16,
      sizeVariance: 7,
      life: 99,
      glow: 65,
      glowColor: 'rgba(255,255,255,0.55)',
      embers: true,
      emberColors: ['#FFFFFF', '#80D8FF', '#CE93D8', '#B388FF', '#80CBC4'],
      coreIntensity: 0.9,
      flameHeight: 0.8,
      flameWidth: 0.5
    },
    { // Level 15 — Ultra celestial rainbow
      spawnRate: 36,
      colors: ['#FFFFFF', '#FF80AB', '#80D8FF', '#B9F6CA', '#CE93D8', '#FFECB3'],
      coreColors: ['#FFFFFF', '#FAFAFA'],
      speed: { min: 3.2, max: 6.0 },
      spread: 5.2,
      baseSize: 17,
      sizeVariance: 8,
      life: 100,
      glow: 75,
      glowColor: 'rgba(255,255,255,0.6)',
      embers: true,
      emberColors: ['#FFFFFF', '#FF80AB', '#80D8FF', '#B9F6CA', '#EA80FC', '#FFD740'],
      coreIntensity: 0.95,
      flameHeight: 0.84,
      flameWidth: 0.52
    }
  ];

  let canvas, ctx;
  let particles = [];
  let embers = [];
  let animationId;
  let currentLevel = 0;
  let targetConfig = LEVEL_CONFIGS[0];
  let activeConfig = null;
  let transitioning = false;
  let transitionProgress = 0;
  let prevConfig = null;
  let width, height;
  let dpr = 1;
  let time = 0;
  let extinguishing = false;
  let extinguishProgress = 0;

  // Particle class
  class Particle {
    constructor(isCore) {
      this.reset(isCore);
    }

    reset(isCore) {
      const cfg = activeConfig;
      const cx = width / 2;
      const baseY = height * 0.95;
      const fw = width * cfg.flameWidth;

      this.isCore = isCore && cfg.coreIntensity > 0;
      const spreadMult = this.isCore ? 0.4 : 1;
      this.x = cx + (Math.random() - 0.5) * fw * spreadMult;
      this.y = baseY + (Math.random() - 0.5) * 10;
      this.originX = this.x;

      const speedRange = cfg.speed.max - cfg.speed.min;
      this.vy = -(cfg.speed.min + Math.random() * speedRange);
      this.vx = (Math.random() - 0.5) * cfg.spread * 0.3;

      const colors = this.isCore ? cfg.coreColors : cfg.colors;
      this.color = colors[Math.floor(Math.random() * colors.length)];

      const sizeMult = this.isCore ? 0.6 : 1;
      this.size = (cfg.baseSize + Math.random() * cfg.sizeVariance) * sizeMult;
      this.maxLife = cfg.life + Math.random() * 20;
      this.life = this.maxLife;

      // Organic movement params
      this.wobbleSpeed = 0.02 + Math.random() * 0.03;
      this.wobbleAmount = 1 + Math.random() * 2;
      this.wobbleOffset = Math.random() * Math.PI * 2;
    }

    update() {
      const cfg = activeConfig;
      const progress = 1 - (this.life / this.maxLife);

      // Organic horizontal wobble
      this.x = this.originX + Math.sin(time * this.wobbleSpeed + this.wobbleOffset) * this.wobbleAmount * (1 + progress);
      this.originX += this.vx * 0.3;

      // Taper: reduce horizontal spread as particle rises
      const taperForce = progress * 0.5;
      this.originX += (width / 2 - this.originX) * taperForce * 0.02;

      this.y += this.vy;
      this.life--;

      // Shrink as particle ages
      const shrink = 1 - progress * 0.8;
      this.currentSize = this.size * shrink;

      // Opacity: fade in briefly, then fade out
      const isSmoke = activeConfig.isSmoke;
      if (progress < 0.05) {
        this.alpha = progress / 0.05;
      } else {
        this.alpha = (1 - progress) * (this.isCore ? 0.35 : 0.45);
      }
      // Smoke is much fainter
      if (isSmoke) {
        this.alpha *= 0.3;
      }

      return this.life > 0 && this.currentSize > 0.5;
    }

    draw() {
      if (this.alpha <= 0 || this.currentSize <= 0) return;
      ctx.globalAlpha = this.alpha * (extinguishing ? (1 - extinguishProgress) : 1);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Ember class — small bright sparks that fly upward
  class Ember {
    constructor() {
      this.reset();
    }

    reset() {
      const cfg = activeConfig;
      const cx = width / 2;
      const baseY = height * 0.75;
      const fw = width * cfg.flameWidth * 0.6;

      this.x = cx + (Math.random() - 0.5) * fw;
      this.y = baseY + Math.random() * (height * 0.15);
      this.vy = -(1.5 + Math.random() * 3);
      this.vx = (Math.random() - 0.5) * 3;
      this.size = 1.5 + Math.random() * 2.5;
      this.life = 60 + Math.random() * 80;
      this.maxLife = this.life;

      const colors = cfg.emberColors || cfg.colors;
      this.color = colors[Math.floor(Math.random() * colors.length)];

      this.twinkleSpeed = 0.1 + Math.random() * 0.15;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.99;
      this.vy *= 0.995;
      this.life--;

      const progress = 1 - this.life / this.maxLife;
      this.alpha = Math.sin(progress * Math.PI) * 0.9;
      // Twinkle effect
      this.alpha *= 0.7 + Math.sin(time * this.twinkleSpeed) * 0.3;

      return this.life > 0;
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.globalAlpha = this.alpha * (extinguishing ? (1 - extinguishProgress) : 1);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function init(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    resize();
    activeConfig = { ...LEVEL_CONFIGS[0] };
    window.addEventListener('resize', resize);
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function setLevel(level) {
    level = Math.min(level, 15);
    if (level === currentLevel && !extinguishing) return;

    prevConfig = { ...activeConfig };
    targetConfig = LEVEL_CONFIGS[level];
    currentLevel = level;
    transitioning = true;
    transitionProgress = 0;
    extinguishing = false;
    extinguishProgress = 0;
  }

  // Interpolate numeric values between configs
  function lerpConfig(a, b, t) {
    return {
      spawnRate: a.spawnRate + (b.spawnRate - a.spawnRate) * t,
      colors: t < 0.5 ? a.colors : b.colors,
      coreColors: t < 0.5 ? a.coreColors : b.coreColors,
      speed: {
        min: a.speed.min + (b.speed.min - a.speed.min) * t,
        max: a.speed.max + (b.speed.max - a.speed.max) * t
      },
      spread: a.spread + (b.spread - a.spread) * t,
      baseSize: a.baseSize + (b.baseSize - a.baseSize) * t,
      sizeVariance: a.sizeVariance + (b.sizeVariance - a.sizeVariance) * t,
      life: a.life + (b.life - a.life) * t,
      glow: a.glow + (b.glow - a.glow) * t,
      glowColor: t < 0.5 ? a.glowColor : b.glowColor,
      embers: t > 0.5 ? b.embers : a.embers,
      emberColors: t > 0.5 ? (b.emberColors || b.colors) : (a.emberColors || a.colors),
      coreIntensity: a.coreIntensity + (b.coreIntensity - a.coreIntensity) * t,
      flameHeight: a.flameHeight + (b.flameHeight - a.flameHeight) * t,
      flameWidth: a.flameWidth + (b.flameWidth - a.flameWidth) * t,
      isSmoke: t < 0.5 ? a.isSmoke : b.isSmoke
    };
  }

  function extinguish(callback) {
    extinguishing = true;
    extinguishProgress = 0;
    const extinguishInterval = setInterval(() => {
      extinguishProgress += 0.02;
      if (extinguishProgress >= 1) {
        extinguishProgress = 1;
        clearInterval(extinguishInterval);
        particles = [];
        embers = [];
        if (callback) callback();
      }
    }, 16);
  }

  function animate() {
    time++;
    ctx.clearRect(0, 0, width, height);

    // Handle level transition
    if (transitioning && prevConfig) {
      transitionProgress += 0.008;
      if (transitionProgress >= 1) {
        transitionProgress = 1;
        transitioning = false;
        activeConfig = { ...targetConfig };
      } else {
        const eased = easeInOutCubic(transitionProgress);
        activeConfig = lerpConfig(prevConfig, targetConfig, eased);
      }
    }

    if (!activeConfig) {
      animationId = requestAnimationFrame(animate);
      return;
    }

    // Draw ambient glow
    if (activeConfig.glow > 0 && !extinguishing) {
      const cx = width / 2;
      const cy = height * 0.75;
      const glowRadius = width * 0.6 * (activeConfig.glow / 70);
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
      gradient.addColorStop(0, activeConfig.glowColor);
      gradient.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    // Spawn new particles
    const spawnCount = Math.ceil(activeConfig.spawnRate * (extinguishing ? (1 - extinguishProgress) : 1));
    for (let i = 0; i < spawnCount; i++) {
      const isCore = Math.random() < activeConfig.coreIntensity;
      particles.push(new Particle(isCore));
    }

    // Spawn embers at higher levels
    if (activeConfig.embers && !extinguishing && Math.random() < 0.3) {
      embers.push(new Ember());
    }

    // Smoke uses normal blending; fire uses additive for glow
    ctx.globalCompositeOperation = activeConfig.isSmoke ? 'source-over' : 'lighter';

    // Update and draw particles
    particles = particles.filter(p => {
      const alive = p.update();
      if (alive) p.draw();
      return alive;
    });

    // Update and draw embers
    embers = embers.filter(e => {
      const alive = e.update();
      if (alive) e.draw();
      return alive;
    });

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    animationId = requestAnimationFrame(animate);
  }

  function start() {
    if (animationId) cancelAnimationFrame(animationId);
    animate();
  }

  function stop() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  return { init, start, stop, setLevel, extinguish, resize };
})();
