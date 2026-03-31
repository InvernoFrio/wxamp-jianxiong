// pages/physics/physics.js

Page({
  data: {
    activeStep: 0,
    steps: ['介绍', '宇称概念', '实验演示', '结论'],
    experimentRunning: false,
    particles: [],
    canvas: null,
    ctx: null
  },

  onLoad() {
    // 初始化canvas
  },

  onReady() {
    // Canvas 2D 初始化
    const query = wx.createSelectorQuery();
    query.select('#experimentCanvas').fields({ node: true, size: true }).exec((res) => {
      if (res[0]) {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.ctx = ctx;
        this.initCanvas(canvas, res[0].width, res[0].height);
      }
    });
  },

  initCanvas(canvas, width, height) {
    const dpr = wx.getSystemInfoSync().pixelRatio;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    this.ctx.scale(dpr, dpr);
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.drawStaticScene();
  },

  drawStaticScene() {
    const ctx = this.ctx;
    const w = this.canvasWidth;
    const h = this.canvasHeight;

    // 清空画布
    ctx.clearRect(0, 0, w, h);

    // 背景
    ctx.fillStyle = 'rgba(245, 240, 232, 0.3)';
    ctx.fillRect(0, 0, w, h);

    // 中心：钴-60原子核
    const centerX = w / 2;
    const centerY = h / 2;

    // 磁场线（弧线）
    ctx.strokeStyle = 'rgba(139, 157, 175, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, 60 + i * 30, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();
    }

    // 探测器环
    ctx.strokeStyle = 'rgba(212, 165, 116, 0.5)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 160, 0, Math.PI * 2);
    ctx.stroke();

    // 原子核
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
    gradient.addColorStop(0, '#C41E3A');
    gradient.addColorStop(1, 'rgba(196, 30, 58, 0.3)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fill();

    // 标签
    ctx.fillStyle = '#2C2C2C';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Co-60', centerX, centerY + 5);
    ctx.fillText('钴-60原子核', centerX, centerY + 55);
    ctx.fillText('探测器', centerX, centerY - 170);
  },

  startExperiment() {
    if (this.data.experimentRunning) return;
    
    this.setData({ experimentRunning: true });
    this.particles = [];
    this.animationId = null;
    this.animateExperiment();
  },

  animateExperiment() {
    if (!this.data.experimentRunning) return;

    const ctx = this.ctx;
    const w = this.canvasWidth;
    const h = this.canvasHeight;
    const centerX = w / 2;
    const centerY = h / 2;

    // 重绘静态场景
    this.drawStaticScene();

    // 生成新粒子（每10帧）
    if (Math.random() < 0.3) {
      const angle = Math.random() * Math.PI * 2;
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * (2 + Math.random() * 2),
        vy: Math.sin(angle) * (2 + Math.random() * 2),
        life: 60,
        size: 3 + Math.random() * 3,
        color: `rgba(196, 30, 58, ${0.5 + Math.random() * 0.5})`
      });
    }

    // 更新和绘制粒子
    ctx.fillStyle = '#2C2C2C';
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      // 绘制粒子
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // 绘制轨迹
      ctx.strokeStyle = `rgba(196, 30, 58, ${p.life / 120})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 5, p.y - p.vy * 5);
      ctx.stroke();

      return p.life > 0 && Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2) < 180;
    });

    // 继续动画
    this.animationId = requestAnimationFrame(() => this.animateExperiment());
  },

  stopExperiment() {
    this.setData({ experimentRunning: false });
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  },

  resetExperiment() {
    this.stopExperiment();
    this.particles = [];
    this.drawStaticScene();
  },

  onCanvasTouch() {
    // 用户触摸画布时的交互
  },

  prevStep() {
    if (this.data.activeStep > 0) {
      this.setData({ activeStep: this.data.activeStep - 1 });
      if (this.data.activeStep !== 2) {
        this.stopExperiment();
      }
    }
  },

  nextStep() {
    if (this.data.activeStep < 3) {
      this.setData({ activeStep: this.data.activeStep + 1 });
      if (this.data.activeStep !== 2) {
        this.stopExperiment();
      }
    }
  },

  onUnload() {
    this.stopExperiment();
  }
});
