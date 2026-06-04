

// ==========================================
// Heart System v2.0.4 - 最终修复版
// 修复长按变暗逻辑，消除所有冲突
// ==========================================

// -------------------------- 全局配置与变量 --------------------------
// 纪念日密码（请修改为你们的实际纪念日）
const CORRECT_PASSWORD = "0909";

// 开始日期（请修改为你们第一次见面的日期）
const START_DATE = new Date(2023, 8, 9, 0, 0, 0);

// 情话列表
const QUOTES = [
  "遇见你，是我这辈子最幸运的事",
  "我想和你一起看遍世界的风景",
  "你的笑容是我每天最期待的礼物",
  "往后余生，风雪是你，平淡是你",
  "我爱你，不止今天，而是每一天",
  "你是我所有温柔的来源和归属",
  "想和你一起度过每一个春夏秋冬",
  "跟你在一起的时候最舒服",
  "每次看到你都觉得今天是个好日子",
  "想你了，就这么简单",
  "有你在的地方我就安心",
  "你是我毫不犹豫的选择",
  "和你吃饭聊天散步就是最好的时光",
  "谢谢你出现在我的生活里",
  "你要好好的，我也会好好的",
  "不管干什么，跟你一起就行",
  "你就是我想宠着的那个人",
  "每天都想和你分享一些小事",
  "累了就靠着我，我在呢",
  "你值得这世间所有的美好"
];

// 照片列表（本地路径，与img目录匹配）
const PHOTOS = [
  { src: "https://s41.ax1x.com/2026/02/14/pZqWSIg.jpg", cap: "送你的第一个玩偶 🧸" },
  { src: "https://s41.ax1x.com/2026/02/14/pZqfG1s.jpg", cap: "早期约会，MTT adil 🤡" },
  { src: "https://s41.ax1x.com/2026/02/14/pZqRXsP.jpg", cap: "送你的第一束花 💐" },
  { src: "https://s41.ax1x.com/2026/02/14/pZqWUFe.jpg", cap: "陪你过的第一个生日 🎂" },
  { src: "https://s41.ax1x.com/2026/02/14/pZqWaJH.jpg", cap: "你第一次给我过生日 🎂" },
  { src: "https://s41.ax1x.com/2026/02/14/pZqcDVe.jpg", cap: "一起去乐8上班的时候 ~" },
  { src: "https://s41.ax1x.com/2026/02/14/pZqWrOP.jpg", cap: "撒狗粮 🐶" },
  { src: "https://s41.ax1x.com/2026/02/14/pZqcfr8.jpg", cap: "戒指我一直戴着 ❤️" }
];

// 退出登录
function doLogout() {
  localStorage.removeItem('loggedIn');
  switchView('login');
  var pwd = document.getElementById('passwordInput');
  if (pwd) { pwd.value = ''; pwd.focus(); }
}

// 秘密彩蛋
const SECRETS = {
  520: "你点击了520次！我爱你❤️",
  1314: "一生一世，永远在一起❤️",
  999: "长长久久，永不分离❤️",
  2026: "2026年情人节快乐，我的宝贝❤️"
};

// DOM元素引用
let passwordInput, loginBtn, errorTip;

let currentPhotoIndex = 0;

// -------------------------- heart-config.js --------------------------
const CONFIG = {
  GRID: {
    BASE: 8,
    DESKTOP_MULTIPLIER: 1,
    MOBILE_MULTIPLIER: 0.75
  },
  CANVAS: {
    DESKTOP: { 
      cssWidth: 320,
      cssHeight: 368,
      renderWidth: 640,
      renderHeight: 736
    },
    MOBILE: { 
      cssWidth: 264,
      cssHeight: 304,
      renderWidth: 528,
      renderHeight: 608
    }
  },
  HEART: {
    SCALE: 6.8,
    BREATHE_PERIOD: 4000,
    BREATHE_AMPLITUDE: 0.025,
    BPM_BASE: 72,
    BPM_MIN: 68,
    BPM_MAX: 88
  },
  INTERACTION: {
    CLICK_THRESHOLD: 400,
    DOUBLE_CLICK_THRESHOLD: 300,
    SWIPE_THRESHOLD: 10,
    MAX_INTENSITY_TIME: 1500,
    FADE_OUT_TIME: 1200
  },
  GLOW: {
    AMBIENT_RADIUS: 280,
    EDGE_RADIUS: 140,
    CORE_RADIUS: 95,
    AMBIENT_OPACITY: 0.4,
    EDGE_OPACITY: 0.45,
    CORE_OPACITY: 0.55
  },
  PARTICLES: {
    COUNT: 16,
    SPEED: 0.25,
    SIZE_MIN: 1,
    SIZE_MAX: 2.5,
    ALPHA_MIN: 0.15,
    ALPHA_MAX: 0.5
  }
};

const STATES = {
  IDLE: {
    name: 'idle',
    glow: 'default',
    background: 'normal',
    color: { h: 340, s: 80, l: 75 },
    transitions: ['hover', 'press']
  },
  HOVER: {
    name: 'hover',
    glow: 'dim',
    background: 'normal',
    color: { h: 340, s: 90, l: 80 },
    transitions: ['click', 'press', 'leave']
  },
  PRESSED: {
    name: 'pressed',
    glow: 'active',
    background: 'normal',
    color: { h: 328, s: 90, l: 60 },
    transitions: ['hold', 'release']
  },
  HOLDING: {
    name: 'holding',
    glow: 'focus',
    background: 'dimmed',
    color: { h: 335, s: 100, l: 70 },
    transitions: ['release']
  },
  RELEASING: {
    name: 'releasing',
    glow: 'fade',
    background: 'restoring',
    color: { h: 340, s: 80, l: 75 },
    transitions: ['idle']
  }
};

const EASING = {
  SPRING: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  STANDARD: 'cubic-bezier(0.4, 0, 0.2, 1)',
  ENTER: 'cubic-bezier(0, 0, 0.2, 1)',
  EXIT: 'cubic-bezier(0.4, 0, 1, 1)',
  GENTLE: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
};

const DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 400,
  GENTLE: 1200
};

// -------------------------- heart-core.js --------------------------
class HeartCore {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.cssWidth = 0;
    this.cssHeight = 0;
    this.renderWidth = 0;
    this.renderHeight = 0;
    this.cx = 0;
    this.cy = 0;
    
    this.time = 0;
    this.lastFrameTime = 0;
    this.bpm = CONFIG.HEART.BPM_BASE;
    this.msPerBeat = 60000 / this.bpm;
    this.lastBeatTime = 0;
    
    this.breathePhase = 0;
    this.currentColor = { ...STATES.IDLE.color };
    this.targetColor = { ...STATES.IDLE.color };
    
    this.clickCount = parseInt(localStorage.getItem("mhClick") || "0");
    this.combo = 0;
    this.comboTimer = null;
    this.lastClickTime = 0;
    this.lastCheck = 0;
    
    this.particles = [];
    this.rings = [];
    this.ecgData = [];
    
    this.squish = 0;
    this.squishVelocity = 0;
    this.pulseScale = 1.0;
    this.pulseVelocity = 0;
    
    this.glowIntensity = 0;
    this.state = null;
  }
  
  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return false;
    
    this.ctx = this.canvas.getContext('2d');
    
    const isMobile = window.innerWidth < 420;
    const size = isMobile ? CONFIG.CANVAS.MOBILE : CONFIG.CANVAS.DESKTOP;
    
    this.cssWidth = size.cssWidth;
    this.cssHeight = size.cssHeight;
    this.renderWidth = size.renderWidth;
    this.renderHeight = size.renderHeight;
    
    this.canvas.width = this.renderWidth;
    this.canvas.height = this.renderHeight;
    this.canvas.style.width = `${this.cssWidth}px`;
    this.canvas.style.height = `${this.cssHeight}px`;
    
    this.cx = this.renderWidth / 2;
    this.cy = this.renderHeight / 2 - 32;
    
    this.ecgData = new Array(this.renderWidth).fill(0);
    
    this.initParticles();
    
    this.lastFrameTime = performance.now();
    this.lastBeatTime = this.lastFrameTime;
    
    return true;
  }
  
  initParticles() {
    this.particles = [];
    for (let i = 0; i < CONFIG.PARTICLES.COUNT; i++) {
      this.particles.push({
        x: Math.random() * this.renderWidth,
        y: Math.random() * this.renderHeight,
        vx: (Math.random() - 0.5) * CONFIG.PARTICLES.SPEED,
        vy: -Math.random() * 0.4 - 0.2,
        size: Math.random() * (CONFIG.PARTICLES.SIZE_MAX - CONFIG.PARTICLES.SIZE_MIN) + CONFIG.PARTICLES.SIZE_MIN,
        alpha: Math.random() * (CONFIG.PARTICLES.ALPHA_MAX - CONFIG.PARTICLES.ALPHA_MIN) + CONFIG.PARTICLES.ALPHA_MIN,
        phase: Math.random() * Math.PI * 2
      });
    }
  }
  
  update(deltaTime) {
    this.time += deltaTime;
    
    if (this.time - this.lastBeatTime > this.msPerBeat) {
      this.lastBeatTime = this.time;
    }
    
    this.breathePhase = (this.time % CONFIG.HEART.BREATHE_PERIOD) / CONFIG.HEART.BREATHE_PERIOD;
    
    // 色相平滑过渡（最短路径），饱和度和明度直接跳
    var dh = this.targetColor.h - this.currentColor.h;
    if (dh > 180) dh -= 360;
    else if (dh < -180) dh += 360;
    this.currentColor.h += dh * 0.04;
    if (this.currentColor.h < 0) this.currentColor.h += 360;
    else if (this.currentColor.h >= 360) this.currentColor.h -= 360;
    this.currentColor.s = this.targetColor.s;
    this.currentColor.l = this.targetColor.l;
    
    // 脉冲弹簧（松手时弹大再缩回）
    var pulseTarget = this._pulseTarget || 1.0;
    this.pulseVelocity += (pulseTarget - this.pulseScale) * 0.08 - this.pulseVelocity * 0.35;
    this.pulseScale += this.pulseVelocity;
    if (Math.abs(this.pulseScale - 1.0) < 0.001 && Math.abs(this.pulseVelocity) < 0.001) {
      this.pulseScale = 1.0;
      this.pulseVelocity = 0;
      this._pulseTarget = 1.0;
    }
    
    const targetSquish = this.state?.name === 'pressed' || this.state?.name === 'holding' ? -0.1 : 0;
    this.squish += this.squishVelocity;
    this.squishVelocity += (targetSquish - this.squish) * 0.2 - this.squishVelocity * 0.6;
    
    this.updateParticles();
    this.updateRings(deltaTime);
  }
  
  updateParticles() {
    for (let p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.phase += 0.015;
      p.alpha = CONFIG.PARTICLES.ALPHA_MIN + Math.sin(p.phase) * 0.12;
      
      if (p.y < -10) p.y = this.renderHeight + 10;
      if (p.x < -10) p.x = this.renderWidth + 10;
      if (p.x > this.renderWidth + 10) p.x = -10;
    }
  }
  
  updateRings(deltaTime) {
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      if (r.delay > 0) {
        r.delay -= deltaTime;
        continue;
      }
      r.r += 0.45 + r.w * 0.12;
      r.life -= 0.005;
      if (r.life <= 0 || r.r >= r.maxR) {
        this.rings.splice(i, 1);
      }
    }
  }
  
  getBeatValue() {
    const b = Math.min((this.time - this.lastBeatTime) / this.msPerBeat, 1);
    let beat = 0;
    
    if (b < 0.08) beat = Math.sin(b / 0.08 * Math.PI) * 0.09;
    else if (b < 0.15) beat = 0.09 - (b - 0.08) / 0.07 * 0.025;
    else if (b < 0.25) {
      const d = (b - 0.15) / 0.10;
      beat = 0.065 + Math.sin(d * Math.PI) * 0.045;
    }
    else if (b < 0.40) beat = 0.065 * (1 - (b - 0.25) / 0.15);
    
    return beat;
  }
  
  getBreatheValue() {
    return Math.sin(this.breathePhase * Math.PI * 2) * CONFIG.HEART.BREATHE_AMPLITUDE;
  }
  
  getHeartPoints(scale, cx = this.cx, cy = this.cy) {
    const pts = [];
    const n = 100;
    for (let i = 0; i <= n; i++) {
      const t = i / n * Math.PI * 2;
      pts.push({
        x: cx + 16 * Math.pow(Math.sin(t), 3) * scale * 1.2,
        y: cy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale * 1.2
      });
    }
    return pts;
  }
  
  drawHeartPath(ctx, scale, beat = 0, breathe = 0) {
    var ps = this.pulseScale || 1.0;
    const totalScale = CONFIG.HEART.SCALE * (1 + breathe) * (1 + this.glowIntensity * 0.1) * ps;
    const pts = this.getHeartPoints(totalScale);
    
    ctx.save();
    ctx.translate(this.cx, this.cy);
    const sf = 1 + this.squish;
    ctx.scale(sf * (1 + beat * 0.07), sf * (1 - beat * 0.025));
    ctx.translate(-this.cx, -this.cy);
    
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();
    ctx.restore();
  }
  
  addRings(count, maxR = 112) {
    for (let w = 0; w < count; w++) {
      this.rings.push({
        x: this.cx, y: this.cy, r: 3, maxR: maxR,
        w: w % 5, life: 1, delay: w * 24
      });
    }
  }
  
  setStateColor(color) {
    this.targetColor = { ...color };
  }
  
  incrementClickCount() {
    this.clickCount++;
    localStorage.setItem("mhClick", this.clickCount.toString());
    
    const now = this.time;
    if (now - this.lastClickTime < 1500) {
      this.combo++;
      if (this.comboTimer) clearTimeout(this.comboTimer);
    } else {
      this.combo = 0;
    }
    this.lastClickTime = now;
    this.comboTimer = setTimeout(() => { this.combo = 0; }, 1500);
    
    this.bpm = CONFIG.HEART.BPM_MIN + Math.floor(Math.random() * (CONFIG.HEART.BPM_MAX - CONFIG.HEART.BPM_MIN));
    this.msPerBeat = 60000 / this.bpm;
    
    // 检查秘密彩蛋（防御性调用，不依赖全局函数）
    if (typeof checkSecret !== "undefined") {
      checkSecret(this.clickCount);
    }
    
    return this.clickCount;
  }
  
  clear() {
    this.ctx.clearRect(0, 0, this.renderWidth, this.renderHeight);
  }
  
  getContext() { return this.ctx; }
  getCenter() { return { x: this.cx, y: this.cy }; }
  getCurrentColor() { return this.currentColor; }
}

// -------------------------- heart-glow.js --------------------------
class HeartGlow {
  constructor(core) {
    this.core = core;
    this.ctx = core.getContext();
  }
  
  render(state, intensity) {
    if (!this.core || !this.ctx) return;
    
    const beat = this.core.getBeatValue();
    const breathe = this.core.getBreatheValue();
    const color = this.core.getCurrentColor();
    
    this.core.clear();
    
    this.drawParticles(color);
    
    if (intensity < 0.3) {
      this.drawBottomGlow(color, beat, breathe);
    }
    
    switch (state.glow) {
      case 'focus':
        this.drawFocusGlow(color, intensity);
        break;
      case 'fade':
        this.drawFocusGlow(color, intensity);
        break;
      case 'active':
        this.drawActiveGlow(color);
        break;
      default:
        this.drawDefaultGlow(color);
    }
    
    this.drawGlassHeart(color, intensity);
    this.drawRings(color);
    this.drawECG(color);
    this.drawUI(color);
  }
  
  drawParticles(color) {
    if (!this.core) return;
    
    for (let p of this.core.particles) {
      const g = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      g.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l + 5}%, ${p.alpha})`);
      g.addColorStop(1, `hsla(${color.h}, ${color.s - 10}%, ${color.l}%, 0)`);
      this.ctx.fillStyle = g;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  drawBottomGlow(color, beat, breathe) {
    if (!this.core) return;
    
    const breatheGlow = 0.45 + Math.sin(this.core.breathePhase * Math.PI * 2) * 0.25;
    const sy = this.core.cy + 64;
    const g = this.ctx.createRadialGradient(this.core.cx, sy, 0, this.core.cx, sy, 128 + beat * 16);
    g.addColorStop(0, `hsla(${color.h - 10}, ${color.s - 15}%, ${color.l}%, ${0.16 * breatheGlow})`);
    g.addColorStop(0.3, `hsla(${color.h - 10}, ${color.s - 20}%, ${color.l - 5}%, ${0.09 * breatheGlow})`);
    g.addColorStop(1, "hsla(0, 0%, 0%, 0)");
    this.ctx.fillStyle = g;
    this.ctx.beginPath();
    this.ctx.ellipse(this.core.cx, sy, 96 + beat * 12, 40 + beat * 6, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  drawDefaultGlow(color) {
    if (!this.core) return;
    
    const ambientGlow = this.ctx.createRadialGradient(
      this.core.cx, this.core.cy, 40,
      this.core.cx, this.core.cy, 160
    );
    ambientGlow.addColorStop(0, `hsla(${color.h}, ${color.s - 10}%, ${color.l + 5}%, 0.12)`);
    ambientGlow.addColorStop(1, `hsla(${color.h}, ${color.s - 20}%, ${color.l}%, 0)`);
    this.ctx.fillStyle = ambientGlow;
    this.ctx.beginPath();
    this.ctx.arc(this.core.cx, this.core.cy, 160, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  drawActiveGlow(color) {
    if (!this.core) return;
    
    const edgeGlow = this.ctx.createRadialGradient(
      this.core.cx, this.core.cy, 60,
      this.core.cx, this.core.cy, 144
    );
    edgeGlow.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l + 5}%, 0.22)`);
    edgeGlow.addColorStop(1, `hsla(${color.h}, ${color.s - 10}%, ${color.l}%, 0)`);
    this.ctx.fillStyle = edgeGlow;
    this.ctx.beginPath();
    this.ctx.arc(this.core.cx, this.core.cy, 144, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  drawFocusGlow(color, intensity) {
    if (!this.core) return;
    
    const ambientGlow = this.ctx.createRadialGradient(
      this.core.cx, this.core.cy, 40,
      this.core.cx, this.core.cy, CONFIG.GLOW.AMBIENT_RADIUS + intensity * 60
    );
    ambientGlow.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l + 10}%, ${CONFIG.GLOW.AMBIENT_OPACITY * intensity})`);
    ambientGlow.addColorStop(0.25, `hsla(${color.h + 5}, ${color.s - 5}%, ${color.l + 5}%, ${CONFIG.GLOW.AMBIENT_OPACITY * 0.6 * intensity})`);
    ambientGlow.addColorStop(0.6, `hsla(${color.h + 10}, ${color.s - 10}%, ${color.l}%, ${CONFIG.GLOW.AMBIENT_OPACITY * 0.2 * intensity})`);
    ambientGlow.addColorStop(1, `hsla(${color.h}, ${color.s - 15}%, ${color.l - 5}%, 0)`);
    this.ctx.fillStyle = ambientGlow;
    this.ctx.beginPath();
    this.ctx.arc(this.core.cx, this.core.cy, CONFIG.GLOW.AMBIENT_RADIUS + intensity * 60, 0, Math.PI * 2);
    this.ctx.fill();
    
    const edgeGlow = this.ctx.createRadialGradient(
      this.core.cx, this.core.cy, 70,
      this.core.cx, this.core.cy, CONFIG.GLOW.EDGE_RADIUS + intensity * 35
    );
    edgeGlow.addColorStop(0, `hsla(${color.h}, ${color.s + 5}%, ${color.l + 10}%, ${CONFIG.GLOW.EDGE_OPACITY * intensity})`);
    edgeGlow.addColorStop(0.5, `hsla(${color.h + 5}, ${color.s}%, ${color.l + 5}%, ${CONFIG.GLOW.EDGE_OPACITY * 0.4 * intensity})`);
    edgeGlow.addColorStop(1, `hsla(${color.h}, ${color.s - 5}%, ${color.l}%, 0)`);
    this.ctx.fillStyle = edgeGlow;
    this.ctx.beginPath();
    this.ctx.arc(this.core.cx, this.core.cy, CONFIG.GLOW.EDGE_RADIUS + intensity * 35, 0, Math.PI * 2);
    this.ctx.fill();
    
    const coreGlow = this.ctx.createRadialGradient(
      this.core.cx, this.core.cy, 15,
      this.core.cx, this.core.cy, CONFIG.GLOW.CORE_RADIUS + intensity * 25
    );
    coreGlow.addColorStop(0, `hsla(${color.h}, ${color.s + 10}%, ${color.l + 15}%, ${CONFIG.GLOW.CORE_OPACITY * intensity})`);
    coreGlow.addColorStop(0.6, `hsla(${color.h + 5}, ${color.s + 5}%, ${color.l + 10}%, ${CONFIG.GLOW.CORE_OPACITY * 0.4 * intensity})`);
    coreGlow.addColorStop(1, `hsla(${color.h}, ${color.s}%, ${color.l + 5}%, 0)`);
    this.ctx.fillStyle = coreGlow;
    this.ctx.beginPath();
    this.ctx.arc(this.core.cx, this.core.cy, CONFIG.GLOW.CORE_RADIUS + intensity * 25, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  drawGlassHeart(color, intensity) {
    if (!this.core) return;
    
    const beat = this.core.getBeatValue();
    const breathe = this.core.getBreatheValue();
    
    const bodyOpacity = 0.65 + intensity * 0.3;
    const bodySaturation = color.s + intensity * 15;
    const bodyLightness = color.l - intensity * 12;
    
    const bodyGrad = this.ctx.createLinearGradient(
      this.core.cx - 64, this.core.cy - 88,
      this.core.cx + 56, this.core.cy + 64
    );
    bodyGrad.addColorStop(0, `hsla(${color.h}, ${bodySaturation}%, ${bodyLightness + 8}%, ${bodyOpacity})`);
    bodyGrad.addColorStop(0.3, `hsla(${color.h + 3}, ${bodySaturation - 3}%, ${bodyLightness + 3}%, ${bodyOpacity - 0.04})`);
    bodyGrad.addColorStop(0.6, `hsla(${color.h + 8}, ${bodySaturation - 8}%, ${bodyLightness - 3}%, ${bodyOpacity - 0.08})`);
    bodyGrad.addColorStop(1, `hsla(${color.h + 12}, ${bodySaturation - 12}%, ${bodyLightness - 8}%, ${bodyOpacity - 0.12})`);
    
    this.core.drawHeartPath(this.ctx, CONFIG.HEART.SCALE, beat, breathe);
    this.ctx.fillStyle = bodyGrad;
    this.ctx.fill();
    

    
    this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 + intensity * 0.15})`;
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
    
    this.ctx.save();
    this.core.drawHeartPath(this.ctx, CONFIG.HEART.SCALE, beat, breathe);
    this.ctx.clip();
    
    const highlightOpacity = 0.45 + intensity * 0.3;
    
    const mainHighlight = this.ctx.createRadialGradient(
      this.core.cx - 56, this.core.cy - 88, 2,
      this.core.cx - 56, this.core.cy - 88, 48
    );
    mainHighlight.addColorStop(0, `rgba(255, 255, 255, ${highlightOpacity})`);
    mainHighlight.addColorStop(0.3, `rgba(255, 255, 255, ${highlightOpacity * 0.45})`);
    mainHighlight.addColorStop(0.7, `rgba(255, 255, 255, ${highlightOpacity * 0.12})`);
    mainHighlight.addColorStop(1, "rgba(255, 255, 255, 0)");
    this.ctx.fillStyle = mainHighlight;
    this.ctx.beginPath();
    this.ctx.ellipse(this.core.cx - 56, this.core.cy - 88, 36, 28, -0.4, 0, Math.PI * 2);
    this.ctx.fill();
    
    const subHighlight = this.ctx.createRadialGradient(
      this.core.cx + 40, this.core.cy - 104, 1,
      this.core.cx + 40, this.core.cy - 104, 20
    );
    subHighlight.addColorStop(0, `rgba(255, 255, 255, ${highlightOpacity * 0.75})`);
    subHighlight.addColorStop(0.5, `rgba(255, 255, 255, ${highlightOpacity * 0.25})`);
    subHighlight.addColorStop(1, "rgba(255, 255, 255, 0)");
    this.ctx.fillStyle = subHighlight;
    this.ctx.beginPath();
    this.ctx.arc(this.core.cx + 40, this.core.cy - 104, 20, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
    
    if (intensity > 0.25) {
      const innerCore = this.ctx.createRadialGradient(
        this.core.cx - 8, this.core.cy - 24, 0,
        this.core.cx - 8, this.core.cy - 24, 56
      );
      innerCore.addColorStop(0, `hsla(${color.h}, ${color.s + 10}%, ${color.l + 20}%, ${0.45 * intensity})`);
      innerCore.addColorStop(0.6, `hsla(${color.h}, ${color.s + 5}%, ${color.l + 15}%, ${0.18 * intensity})`);
      innerCore.addColorStop(1, `hsla(${color.h}, ${color.s}%, ${color.l + 10}%, 0)`);
      this.ctx.save();
      this.core.drawHeartPath(this.ctx, CONFIG.HEART.SCALE, beat, breathe);
      this.ctx.fillStyle = innerCore;
      this.ctx.fill();
      this.ctx.restore();
    }
  }
  
  drawRings(color) {
    if (!this.core) return;
    
    for (let r of this.core.rings) {
      if (r.delay > 0) continue;
      this.ctx.beginPath();
      this.ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      this.ctx.strokeStyle = `hsla(${color.h}, ${color.s}%, ${color.l}%, ${r.life * 0.12})`;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }
  
  drawECG(color) {
    if (!this.core) return;
    
    const b = Math.min((this.core.time - this.core.lastBeatTime) / this.core.msPerBeat, 1);
    let nv = 0;
    
    if (b < 0.02) {
      const t0 = b / 0.02; nv = Math.sin(t0 * Math.PI) * 2.5;
    } else if (b < 0.03) {
      const t1 = (b - 0.02) / 0.01; nv = 2.5 - Math.sin(t1 * Math.PI) * 2.5;
    } else if (b < 0.06) {
      const t2 = (b - 0.03) / 0.03;
      if (t2 < 0.2) nv = -Math.sin(t2 / 0.2 * Math.PI) * 5;
      else if (t2 < 0.6) nv = -5 + Math.sin((t2 - 0.2) / 0.4 * Math.PI) * 18;
      else nv = 13 - Math.sin((t2 - 0.6) / 0.4 * Math.PI) * 11;
    } else if (b < 0.12) {
      const t3 = (b - 0.06) / 0.06; nv = 1.2 * (1 - t3);
    } else if (b < 0.22) {
      const t4 = (b - 0.12) / 0.10; nv = Math.sin(t4 * Math.PI) * 3.5;
    } else {
      nv = (Math.random() - 0.5) * 0.15;
    }
    
    this.core.ecgData.push(nv);
    this.core.ecgData.shift();
    
    const eY = this.core.renderHeight - 120;
    const eS = 1.0;
    this.ctx.beginPath();
    this.ctx.moveTo(0, eY - this.core.ecgData[0] * eS);
    for (let i = 1; i < this.core.renderWidth; i++) {
      this.ctx.lineTo(i, eY - this.core.ecgData[i] * eS);
    }
    this.ctx.strokeStyle = `hsla(${color.h}, ${color.s - 10}%, ${color.l - 10}%, 0.55)`;
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
    
    const lv = this.core.ecgData[this.core.renderWidth - 1];
    const dx = this.core.renderWidth - 1, dy = eY - lv * eS;
    const dg = this.ctx.createRadialGradient(dx, dy, 1, dx, dy, 8);
    dg.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l - 5}%, 0.85)`);
    dg.addColorStop(0.3, `hsla(${color.h}, ${color.s - 5}%, ${color.l - 10}%, 0.3)`);
    dg.addColorStop(1, `hsla(${color.h}, ${color.s - 10}%, ${color.l - 15}%, 0)`);
    this.ctx.fillStyle = dg;
    this.ctx.beginPath();
    this.ctx.arc(dx, dy, 8, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  drawUI(color) {
    if (!this.core) return;
    
    const eY = this.core.renderHeight - 120;
    
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "top";
    this.ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Helvetica Neue\", sans-serif";
    this.ctx.fillStyle = `hsla(${color.h}, ${color.s - 15}%, ${color.l - 15}%, 0.75)`;
    this.ctx.fillText(Math.round(this.core.bpm) + " BPM", this.core.cx, eY + 18);
    
    this.ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Helvetica Neue\", sans-serif";
    this.ctx.fillStyle = `hsla(${color.h}, ${color.s - 20}%, ${color.l - 20}%, 0.55)`;
    this.ctx.textAlign = "left";
    this.ctx.fillText("❤ " + this.core.clickCount, 16, eY + 18);
    
    if (this.core.combo > 1 && this.core.time - this.core.lastClickTime < 1500) {
      this.ctx.textAlign = "right";
      this.ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Helvetica Neue\", sans-serif";
      this.ctx.fillStyle = `hsla(${color.h}, ${color.s}%, ${color.l - 5}%, 0.55)`;
      this.ctx.fillText(this.core.combo + "x", this.core.renderWidth - 16, 8);
    }
  }
  
  drawChargeIndicator(charge) {
    if (!this.core) return;
    
    const color = this.core.getCurrentColor();
    const cr = 16 + charge * 32;
    const cg = this.ctx.createRadialGradient(this.core.cx, this.core.cy, 0, this.core.cx, this.core.cy, cr);
    cg.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l}%, ${charge * 0.22})`);
    cg.addColorStop(0.5, `hsla(${color.h}, ${color.s - 5}%, ${color.l - 5}%, ${charge * 0.1})`);
    cg.addColorStop(1, "hsla(0, 0%, 0%, 0)");
    this.ctx.fillStyle = cg;
    this.ctx.beginPath();
    this.ctx.arc(this.core.cx, this.core.cy, cr, 0, Math.PI * 2);
    this.ctx.fill();
    
    if (charge > 0.2) {
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.font = "bold 12px -apple-system,sans-serif";
      this.ctx.fillStyle = `hsla(${color.h}, ${color.s}%, ${color.l + 5}%, ${charge * 0.5})`;
      this.ctx.fillText(Math.round(charge * 100) + "%", this.core.cx, this.core.cy + 56);
    }
  }
}

// -------------------------- heart-interact.js --------------------------
class HeartInteract {
  constructor(core, glow) {
    this.core = core;
    this.glow = glow;
    this.state = STATES.IDLE;
    this.core.state = this.state;
    this.core.setStateColor(this.state.color);
    
    this.pressStartTime = 0;
    this.lastClickTime = 0;
    this.isPressed = false;
    
    this.heartBox = null;
    this.heartRing = null;
    this.heartContainer = null;
    this.backgroundLayer = null;
    
    this.palettes = [
      {n:'深玫', h:328},
      {n:'热红', h:0},
      {n:'暖粉', h:340},
      {n:'珊瑚', h:15},
      {n:'艳粉', h:310},
      {n:'紫粉', h:290}
    ];
    this.currPal = 0;
    this.animationFrameId = null;
    this.lastFrameTime = 0;
  }
  
  init(heartBoxId) {
    this.heartBox = document.getElementById(heartBoxId);
    if (!this.heartBox) return false;
    
    this.heartRing = document.querySelector('.heart-ring');
    this.heartContainer = document.querySelector('.heart-container');
    this.backgroundLayer = document.getElementById('backgroundLayer');
    
    this.heartBox.addEventListener('pointerdown', this.onPointerDown.bind(this));
    this.heartBox.addEventListener('pointerup', this.onPointerUp.bind(this));
    this.heartBox.addEventListener('pointerleave', this.onPointerLeave.bind(this));
    this.heartBox.addEventListener('pointerenter', this.onPointerEnter.bind(this));
    
    this.lastFrameTime = performance.now();
    this.mainLoop();
    
    return true;
  }
  
  mainLoop() {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    
    this.core.update(deltaTime);
    this.updateState(deltaTime);
    this.glow.render(this.state, this.core.glowIntensity);
    
    if (this.state === STATES.PRESSED && this.core.glowIntensity === 0) {
      const pressDur = now - this.pressStartTime;
      const charge = pressDur / CONFIG.INTERACTION.CLICK_THRESHOLD;
      this.glow.drawChargeIndicator(charge);
    }
    
    this.animationFrameId = requestAnimationFrame(this.mainLoop.bind(this));
  }
  
  updateState(deltaTime) {
    switch (this.state) {
      case STATES.PRESSED:
        const pressDur = performance.now() - this.pressStartTime;
        if (pressDur >= CONFIG.INTERACTION.CLICK_THRESHOLD) {
          this.transitionTo(STATES.HOLDING);
        }
        break;
        
      case STATES.HOLDING:
        const holdDur = performance.now() - this.pressStartTime - CONFIG.INTERACTION.CLICK_THRESHOLD;
        this.core.glowIntensity = Math.min(holdDur / CONFIG.INTERACTION.MAX_INTENSITY_TIME, 1);
        break;
        
      case STATES.RELEASING:
        this.core.glowIntensity -= deltaTime / CONFIG.INTERACTION.FADE_OUT_TIME;
        if (this.core.glowIntensity <= 0) {
          this.core.glowIntensity = 0;
          this.transitionTo(STATES.IDLE);
        }
        break;
    }
  }
  
  transitionTo(newState) {
    
    this.state = newState;
    this.core.state = newState;
    this.core.setStateColor(newState.color);
    
    this.onStateEnter(newState);
  }
  
  onStateEnter(state) {
    switch (state.name) {
      case 'hover':
        if (this.heartRing) {
          this.heartRing.classList.add('active');
        }
        this.heartBox.style.transform = 'scale(1.02)';
        this.heartBox.style.transition = `transform ${DURATION.NORMAL}ms ${EASING.STANDARD}`;
        break;
        
      case 'pressed':
        this.heartBox.style.transform = 'scale(0.97)';
        this.heartBox.style.transition = `transform ${DURATION.FAST}ms ${EASING.SPRING}`;
        break;
        
      case 'holding':
        if (this.heartRing) {
          this.heartRing.classList.add('shrinking');
          setTimeout(() => {
            if (this.state === STATES.HOLDING) {
              this.heartRing.classList.add('vibrating');
            }
          }, 1000);
        }
        // 长按 - 全页变黑，心形保持明亮（径向渐变过渡）
        var overlay = document.getElementById('dimOverlay');
        if (overlay && this.heartContainer) {
          var rect = this.heartContainer.getBoundingClientRect();
          var cx = rect.left + rect.width / 2;
          var cy = rect.top + rect.height / 2;
          overlay.style.height = Math.max(document.documentElement.scrollHeight, window.innerHeight) + 'px';
          overlay.style.background = 'radial-gradient(circle at ' + cx + 'px ' + cy + 'px, transparent 0px, transparent 180px, rgba(0,0,0,1) 450px, rgba(0,0,0,1) 100%)';
          overlay.classList.add('active');
        }
        this.heartContainer.classList.add('glowing');
        break;
        
      case 'releasing':
        if (this.heartRing) {
          this.heartRing.classList.remove('shrinking', 'vibrating');
        }
        // 松手 - 弹出一圈涟漪 + 弹簧脉冲（自然弹大再缩回）
                // 正圆光晕闪烁（动态创建，用完销毁）
        var pulseGlow = document.createElement('div');
        pulseGlow.className = 'pulse-glow';
        pulseGlow.id = 'pulseGlow';
        if (this.heartContainer) {
          this.heartContainer.appendChild(pulseGlow);
          void pulseGlow.offsetWidth;
          pulseGlow.classList.add('active');
          setTimeout(function() { if (pulseGlow.parentNode) pulseGlow.parentNode.removeChild(pulseGlow); }, 700);
        }
        if (this.core) {
          this.core.addRings(12, 160);
          this.core.bpm = CONFIG.HEART.BPM_BASE + 10;
          this.core.msPerBeat = 60000 / this.core.bpm;
          this.core._pulseTarget = 1.35;
          this.core.pulseVelocity = 0.15;
        }

        // 松手 - 爱心附近随机位置弹出情话泡泡，3秒后缩入爱心消失
        var qWrap = document.getElementById('loveQuoteWrap');
        var qText = document.getElementById('quoteText');
        if (qWrap && qText && typeof QUOTES !== 'undefined' && this.heartContainer) {
          var hr = this.heartContainer.getBoundingClientRect();
          var hcx = hr.left + hr.width / 2;
          var hcy = hr.top + hr.height / 2;
          // 随机方向，贴爱心近一点，可以挡住爱心
          var dir = Math.floor(Math.random() * 4);
          var dist = 10 + Math.random() * 30; // 距离10-40px
          var qx = hcx, qy = hcy;
          var tx = '-50%', ty = '';
          if (dir === 0) { qy = hcy - hr.height/2 - dist; ty = '-100%'; tx = '-50%'; }
          else if (dir === 1) { qy = hcy + hr.height/2 + dist; ty = '10px'; tx = '-50%'; }
          else if (dir === 2) { qx = hcx - hr.width/2 - dist; tx = '-100%'; ty = '-50%'; }
          else { qx = hcx + hr.width/2 + dist; tx = '10px'; ty = '-50%'; }
          qText.textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];
          qWrap.style.left = qx + 'px';
          qWrap.style.top = qy + 'px';
          qWrap.style.transform = 'translateX(' + tx + ') translateY(' + ty + ')';
          qWrap.style.opacity = '0';
          qWrap.style.transition = 'none';
          void qWrap.offsetWidth;
          qWrap.style.transition = 'opacity 0.3s ease';
          qWrap.style.opacity = '1';
          // 2秒后吸入爱心中心
          setTimeout(function() {
            var br = qWrap.getBoundingClientRect();
            qWrap.style.left = br.left + 'px';
            qWrap.style.top = br.top + 'px';
            qWrap.style.transform = 'none';
            void qWrap.offsetWidth;
            var dx = hcx - (br.left + br.width / 2);
            var dy = hcy - (br.top + br.height / 2);
            qWrap.style.transition = 'opacity 0.4s ease, transform 0.4s ease-in';
            qWrap.style.transform = 'translateX(' + dx + 'px) translateY(' + dy + 'px) scale(0.1)';
            qWrap.style.opacity = '0';
          }, 2000);
        }
        // 松手 - 恢复
        var overlay = document.getElementById('dimOverlay');
        if (overlay) {
          overlay.classList.remove('active');
        }
        this.heartContainer.classList.remove('glowing');
        break;
        
      case 'idle':
        this.isPressed = false;
        
        if (this.heartRing) {
          this.heartRing.classList.remove('active');
        }

        // 空闲 - 确保无叠加层
        var overlay = document.getElementById('dimOverlay');
        if (overlay) {
          overlay.classList.remove('active');
        }
        this.heartBox.style.transform = 'scale(1)';
        this.heartBox.style.transition = `transform ${DURATION.NORMAL}ms ${EASING.STANDARD}`;
        break;
    }
  }
  
  onPointerDown(e) {
    e.preventDefault();
    
    if (this.isPressed || this.state === STATES.RELEASING) {
      return;
    }
    
    this.isPressed = true;
    this.pressStartTime = performance.now();
    this.transitionTo(STATES.PRESSED);
  }
  
  onPointerUp(e) {
    e.preventDefault();
    
    const pressDur = performance.now() - this.pressStartTime;
    
    if (this.state === STATES.PRESSED && pressDur < CONFIG.INTERACTION.CLICK_THRESHOLD) {
      this.handleClick();
      this.isPressed = false;
      this.transitionTo(STATES.HOVER);
    } else if (this.state === STATES.HOLDING) {
      this.isPressed = false;
      this.transitionTo(STATES.RELEASING);
    }
  }
  
  onPointerLeave(e) {
    this.isPressed = false;
    
    if (this.state === STATES.HOVER) {
      this.transitionTo(STATES.IDLE);
    } else if (this.state === STATES.PRESSED) {
      this.transitionTo(STATES.IDLE);
    } else if (this.state === STATES.HOLDING) {
      this.transitionTo(STATES.RELEASING);
    }
  }
  
  onPointerEnter(e) {
    if (!this.isPressed && this.state === STATES.IDLE) {
      this.transitionTo(STATES.HOVER);
    }
  }
  
  handleClick() {
    const count = this.core.incrementClickCount();
    
    // 颜色循环切换 - 更新所有STATE的颜色
    this.currPal = (this.currPal + 1) % this.palettes.length;
    var pal = this.palettes[this.currPal];
    var h = pal.h;
    STATES.IDLE.color = { h: h, s: 80, l: 75 };
    STATES.HOVER.color = { h: h, s: 90, l: 80 };
    STATES.PRESSED.color = { h: Math.max(0, h-12), s: 90, l: 60 };
    STATES.HOLDING.color = { h: Math.max(0, h-5), s: 100, l: 70 };
    STATES.RELEASING.color = { h: h, s: 80, l: 75 };
    this.core.targetColor = { h: h, s: 80, l: 75 };
    
    const ringCount = 4 + this.core.combo * 2;
    this.core.addRings(ringCount, 104 + this.core.combo * 8);
    
    this.heartBox.style.transform = 'scale(1.05)';
    setTimeout(() => {
      if (this.state === STATES.HOVER) {
        this.heartBox.style.transform = 'scale(1.02)';
      }
    }, 100);
  }
}

// -------------------------- 页面功能逻辑 --------------------------
// 全局视图切换函数
window.switchView = function(viewName) {
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
    view.style.display = '';  // 清除inline display
  });
  var target = document.getElementById('view-' + viewName);
  if (target) {
    target.style.display = '';  // 确保无残留
    target.classList.add('active');
  }
};

// 密码验证
function handleLogin() {
  const password = passwordInput.value.trim();
  if (password === CORRECT_PASSWORD) {
    switchView("directory");
    localStorage.setItem("loggedIn", "1");
  } else {
    errorTip.classList.add("show");
    setTimeout(() => errorTip.classList.remove("show"), 2000);
  }
}

// 更新计时器
function updateTimer() {
  const now = new Date();
  const diff = now - START_DATE;
  
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  
  document.getElementById("dayNum").textContent = String(days).padStart(3, '0');
  document.getElementById("hourNum").textContent = String(hours).padStart(2, '0');
  document.getElementById("minNum").textContent = String(mins).padStart(2, '0');
  document.getElementById("secNum").textContent = String(secs).padStart(2, '0');
  
  // 计算情人节数量
  const currentYear = now.getFullYear();
  const valentineThisYear = new Date(currentYear, 1, 14);
  let valentineCount = currentYear - START_DATE.getFullYear();
  if (now < valentineThisYear) valentineCount--;
  document.getElementById("valentineNum").textContent = valentineCount + 1;
}

// 情话轮播




// 照片墙 - 动态生成
function initPhotoGallery() {
  var area = document.getElementById('photoArea');
  var caption = document.getElementById('photoCaption');
  var dots = document.getElementById('photoDots');
  
  if (!area || PHOTOS.length === 0) return;
  
  // 清空
  area.innerHTML = '';
  dots.innerHTML = '';
  
  // 生成img
  PHOTOS.forEach(function(photo, i) {
    var img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.cap;
    if (i === 0) img.classList.add('active');
    area.appendChild(img);
  });
  
  // 生成dots
  PHOTOS.forEach(function(photo, i) {
    var dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', function() { goToPhoto(i); });
    dots.appendChild(dot);
  });
  
  // 设置初始caption
  if (PHOTOS.length > 0) {
    caption.textContent = PHOTOS[0].cap;
    caption.classList.add('active');
  }
  
  // 预加载
  PHOTOS.forEach(function(photo) {
    var img = new Image();
    img.src = photo.src;
  });
  
  // 自动轮播
  currentPhotoIndex = 0;
  setInterval(function() {
    currentPhotoIndex = (currentPhotoIndex + 1) % PHOTOS.length;
    goToPhoto(currentPhotoIndex);
  }, 5000);
}

function goToPhoto(index) {
  currentPhotoIndex = index;
  
  var area = document.getElementById('photoArea');
  var caption = document.getElementById('photoCaption');
  var dots = document.getElementById('photoDots');
  
  if (!area) return;
  
  // 切换img
  var imgs = area.querySelectorAll('img');
  imgs.forEach(function(img, i) {
    img.classList.toggle('active', i === index);
  });
  
  // 切换dots
  var dotEls = dots.querySelectorAll('span');
  dotEls.forEach(function(dot, i) {
    dot.classList.toggle('active', i === index);
  });
  
  // 切换caption
  if (PHOTOS[index]) {
    caption.textContent = PHOTOS[index].cap;
  }
}


// 秘密彩蛋
function checkSecret(count) {
  if (SECRETS[count]) {
    document.getElementById("secretMsg").textContent = SECRETS[count];
    document.getElementById("secretOverlay").classList.add("show");
  }
}

// -------------------------- 页面初始化 --------------------------
// 全局错误处理
window.addEventListener('error', function(e) {
  console.error('[Mihrigl Error]', e.message || e);
});

document.addEventListener('DOMContentLoaded', function() {
  // 1. 初始化心形系统（优先执行，确保Canvas尺寸正确）
  const core = new HeartCore();
  if (core.init('heartCanvas')) {
    const glow = new HeartGlow(core);
    const interact = new HeartInteract(core, glow);
    interact.init('heartBox');
  }
  
  // 2. 获取DOM元素
  passwordInput = document.getElementById("passwordInput");
  loginBtn = document.getElementById("loginBtn");
  errorTip = document.getElementById("errorTip");
  
  // 3. 绑定事件
  loginBtn.addEventListener("click", handleLogin);
  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleLogin();
  });
  
  document.getElementById('closeSecretBtn').addEventListener('click', () => {
    document.getElementById('secretOverlay').classList.remove('show');
  });
  
  document.getElementById('backBtn').addEventListener('click', function() {
    switchView('directory');
  });
  
  document.querySelectorAll('.dir-card').forEach(card => {
    card.addEventListener('click', function() {
      const view = this.getAttribute('data-view');
      if (view && !this.classList.contains('locked')) {
        switchView(view);
      }
    });
  });
  
  // 4. 初始化视图
  if (localStorage.getItem("loggedIn") === "1") {
    switchView('directory');
  } else {
    switchView('login');
    passwordInput.focus();
  }
  
  // 5. 启动计时器
  updateTimer();
  setInterval(updateTimer, 1000);
  
  // 6. 初始化照片墙并启动轮播
  initPhotoGallery();
  
  // 7. 情话已在长按时随机显示，不自动轮播
});
  
