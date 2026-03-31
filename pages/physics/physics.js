// pages/physics/physics.js
Page({
  data: {
    currentStep: 0,
    steps: [
      { title: '宇称不守恒', desc: '物理学史上最震撼的发现之一' },
      { title: '什么是宇称', desc: '镜像对称的基本概念' },
      { title: '实验演示', desc: '钴-60 β衰变实验可视化' },
      { title: '历史结论', desc: '推翻了数百年的物理定律' }
    ],
    particlesUp: 0,
    particlesDown: 0,
    totalParticles: 0,
    asymmetryPercent: '0',
    experimentRunning: false,
    experimentDone: false,
    canvasReady: false
  },

  _canvas: null,
  _ctx: null,
  _animationId: null,
  _particles: [],
  _width: 0,
  _height: 0,

  onLoad() {
    // Delay canvas init until step changes
  },

  onUnload() {
    this._stopAnimation();
  },

  onNextStep() {
    if (this.data.currentStep >= 3) return;
    const next = this.data.currentStep + 1;
    this.setData({ currentStep: next });
    if (next === 2) {
      // Delay to let canvas render
      setTimeout(() => {
        this._initCanvas();
      }, 300);
    }
  },

  onPrevStep() {
    if (this.data.currentStep <= 0) return;
    this._stopAnimation();
    this.setData({
      currentStep: this.data.currentStep - 1,
      experimentRunning: false,
      experimentDone: false,
      particlesUp: 0,
      particlesDown: 0,
      totalParticles: 0,
      asymmetryPercent: '0'
    });
  },

  onStartExperiment() {
    if (this.data.experimentRunning) return;
    this._particles = [];
    this.setData({
      experimentRunning: true,
      experimentDone: false,
      particlesUp: 0,
      particlesDown: 0,
      totalParticles: 0
    });
    this._runAnimation();
  },

  onStopExperiment() {
    this._stopAnimation();
    this._calculateResults();
  },

  _initCanvas() {
    const query = this.createSelectorQuery();
    query.select('#physicsCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res || !res[0] || !res[0].node) {
        // Fallback for non-node canvas
        const query2 = this.createSelectorQuery();
        query2.select('#physicsCanvas').boundingClientRect().exec((res2) => {
          if (res2 && res2[0]) {
            this._width = res2[0].width;
            this._height = res2[0].height;
            this.setData({ canvasReady: true });
          }
        });
        return;
      }
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getSystemInfoSync().pixelRatio;
      canvas.width = res[0].width * dpr;
      canvas.height = res[0].height * dpr;
      ctx.scale(dpr, dpr);
      this._canvas = canvas;
      this._ctx = ctx;
      this._width = res[0].width;
      this._height = res[0].height;
      this.setData({ canvasReady: true });
      this._drawStatic();
    });
  },

  _drawStatic() {
    const ctx = this._ctx;
    if (!ctx) return;
    const w = this._width;
    const h = this._height;
    const cx = w / 2;
    const cy = h / 2;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    // Central cobalt-60 nucleus
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24);
    grad.addColorStop(0, '#4FC3F7');
    grad.addColorStop(1, '#0288D1');
    ctx.fillStyle = grad;
    ctx.fill();

    // Magnetic field lines (vertical)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * 20, 0);
      ctx.lineTo(cx + i * 20, h);
      ctx.stroke();
    }

    // Detector rings (top and bottom)
    ctx.strokeStyle = 'rgba(196, 30, 58, 0.4)';
    ctx.lineWidth = 2;

    // Top detector
    ctx.beginPath();
    ctx.ellipse(cx, h * 0.12, w * 0.35, 20, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Bottom detector
    ctx.beginPath();
    ctx.ellipse(cx, h * 0.88, w * 0.35, 20, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('上探测器', cx, h * 0.06);
    ctx.fillText('下探测器', cx, h * 0.96);

    // Co-60 label
    ctx.fillStyle = '#4FC3F7';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('⁶⁰Co', cx, cy + 4);
  },

  _runAnimation() {
    if (!this._ctx) return;

    const cx = this._width / 2;
    const cy = this._height / 2;
    let frameCount = 0;

    const animate = () => {
      if (!this.data.experimentRunning) return;

      const ctx = this._ctx;
      frameCount++;

      // Redraw static elements
      this._drawStatic();

      // Spawn new particles (70% go down = parity violation)
      if (frameCount % 3 === 0) {
        const goDown = Math.random() < 0.7;
        const angle = (Math.random() - 0.5) * Math.PI * 0.6;
        const speed = 1.5 + Math.random() * 2;
        this._particles.push({
          x: cx,
          y: cy,
          vx: Math.sin(angle) * speed,
          vy: goDown ? Math.abs(Math.cos(angle) * speed) : -Math.abs(Math.cos(angle) * speed),
          life: 1.0,
          isDown: goDown,
          color: goDown ? '#C41E3A' : '#4FC3F7'
        });
      }

      // Update and draw particles
      let upCount = 0;
      let downCount = 0;
      const alive = [];

      for (let i = 0; i < this._particles.length; i++) {
        const p = this._particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.008;

        if (p.life > 0 && p.y > 0 && p.y < this._height) {
          alive.push(p);

          // Draw particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fill();
          ctx.globalAlpha = 1;

          // Draw trail
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 4, p.y - p.vy * 4);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = p.life * 0.3;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.globalAlpha = 1;
        } else {
          // Count at boundary
          if (p.isDown) {
            downCount++;
          } else {
            upCount++;
          }
        }
      }

      this._particles = alive;

      if (upCount > 0 || downCount > 0) {
        this.setData({
          particlesUp: this.data.particlesUp + upCount,
          particlesDown: this.data.particlesDown + downCount,
          totalParticles: this.data.particlesUp + this.data.particlesDown + upCount + downCount
        });
      }

      // End after 300 total particles
      if (this.data.totalParticles >= 300) {
        this._stopAnimation();
        this._calculateResults();
        return;
      }

      this._animationId = requestAnimationFrame(animate);
    };

    this._animationId = requestAnimationFrame(animate);
  },

  _stopAnimation() {
    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
      this._animationId = null;
    }
    this.setData({ experimentRunning: false });
  },

  _calculateResults() {
    const total = this.data.particlesUp + this.data.particlesDown;
    if (total === 0) return;
    const percent = Math.round((this.data.particlesDown / total) * 100);
    this.setData({
      asymmetryPercent: String(percent),
      experimentDone: true,
      experimentRunning: false
    });
  }
});
