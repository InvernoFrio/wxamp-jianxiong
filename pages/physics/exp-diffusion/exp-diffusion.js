// pages/physics/exp-diffusion/exp-diffusion.js
Page({
  data: {
    currentStep: 0,
    steps: [
      { title: '气体扩散现象', desc: '分子运动导致的自然扩散过程' },
      { title: '扩散原理', desc: '格雷厄姆定律与质量相关性' },
      { title: '实验模拟', desc: 'U-235 / U-238 扩散可视化' },
      { title: '结论', desc: '轻核更快扩散导致富集' }
    ],

    // 统计（仿 parity）
    lightCount: 0,
    heavyCount: 0,
    totalParticles: 0,
    enrichmentPercent: '0',

    experimentRunning: false,
    experimentDone: false
  },

  _ctx: null,
  _canvas: null,
  _particles: [],
  _width: 0,
  _height: 0,
  _animationId: null,

  onUnload() {
    this._stopAnimation();
  },

  // ======================
  // step控制（完全模仿 parity）
  // ======================
  onNextStep() {
    if (this.data.currentStep >= 3) return;

    const next = this.data.currentStep + 1;
    this.setData({ currentStep: next });

    if (next === 2) {
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
      lightCount: 0,
      heavyCount: 0,
      totalParticles: 0,
      enrichmentPercent: '0'
    });
  },

  // ======================
  // 实验控制（同 parity）
  // ======================
  onStartExperiment() {
    if (this.data.experimentRunning) return;

    this._particles = [];

    this.setData({
      experimentRunning: true,
      experimentDone: false,
      lightCount: 0,
      heavyCount: 0,
      totalParticles: 0
    });

    this._runAnimation();
  },

  onStopExperiment() {
    this._stopAnimation();
    this._calculateResults();
  },

  // ======================
  // canvas初始化（结构复刻 parity）
  // ======================
  _initCanvas() {
    const query = wx.createSelectorQuery();

    query.select('#diffCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {

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

        this._drawStatic();
      });
  },

  // ======================
  // 静态背景（对应 parity nucleus）
  // ======================
  _drawStatic() {
    const ctx = this._ctx;
    const w = this._width;
    const h = this._height;

    ctx.clearRect(0, 0, w, h);

    // 背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    // 中心源（扩散源）
    const cx = w / 2;
    const cy = h / 2;

    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#4FC3F7';
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText('Diffusion Source', cx - 40, cy + 40);

    ctx.draw?.();
  },

  // ======================
  // 动画核心（parity同构升级）
  // ======================
  _runAnimation() {
    const ctx = this._ctx;
    const cx = this._width / 2;
    const cy = this._height / 2;

    let frame = 0;

    const animate = () => {
      if (!this.data.experimentRunning) return;

      frame++;

      this._drawStatic();

      // ===== 粒子生成（轻/重差异）=====
      if (frame % 4 === 0) {
        const isLight = Math.random() < 0.2; // 20%轻核

        const speed = isLight ? 2.2 : 1.0;

        this._particles.push({
          x: cx,
          y: cy,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          type: isLight ? 'light' : 'heavy'
        });
      }

      let light = 0;
      let heavy = 0;
      let alive = [];

      // ===== 扩散运动 =====
      for (let p of this._particles) {
        p.x += p.vx;
        p.y += p.vy;

        const inBoundary =
          p.x > 0 && p.x < this._width &&
          p.y > 0 && p.y < this._height;

        if (!inBoundary) {
          if (p.type === 'light') light++;
          else heavy++;
          continue;
        }

        alive.push(p);

        // draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.type === 'light' ? '#4FC3F7' : '#C41E3A';
        ctx.fill();
      }

      this._particles = alive;

      if (light || heavy) {
        const total = this.data.lightCount + this.data.heavyCount + light + heavy;

        this.setData({
          lightCount: this.data.lightCount + light,
          heavyCount: this.data.heavyCount + heavy,
          totalParticles: total
        });
      }

      return this._animationId = setTimeout(animate, 16);
    };

    animate();
  },

  // ======================
  // 停止
  // ======================
  _stopAnimation() {
    clearTimeout(this._animationId);
    this.setData({ experimentRunning: false });
  },

  // ======================
  // 结果（对应 parity asymmetry）
  // ======================
  _calculateResults() {
    const total = this.data.lightCount + this.data.heavyCount;
    if (!total) return;

    const percent = Math.round((this.data.lightCount / total) * 100);

    this.setData({
      enrichmentPercent: String(percent),
      experimentDone: true,
      experimentRunning: false
    });
  }
});