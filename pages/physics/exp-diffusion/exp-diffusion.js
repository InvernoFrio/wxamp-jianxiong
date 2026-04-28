// pages/physics/exp-diffusion/exp-diffusion.js
Page({
  data: {
    currentStep: 0,
    steps: [
      { title: '气体扩散现象', desc: '分子热运动驱动的扩散' },
      { title: '扩散原理', desc: '格雷厄姆定律—速率∝1/√m' },
      { title: '实验模拟', desc: '穿膜扩散与同位素分离' },
      { title: '结论', desc: '微观差异 → 宏观富集' }
    ],

    // 左右统计（核心升级）
    leftLight: 0,
    leftHeavy: 0,
    rightLight: 0,
    rightHeavy: 0,

    enrichmentPercent: '0',

    experimentRunning: false,
    experimentDone: false
  },

  _ctx: null,
  _particles: [],
  _width: 0,
  _height: 0,
  _animationId: null,

  onUnload() {
    this._stop();
  },

  // ======================
  // step
  // ======================
  onNextStep() {
    if (this.data.currentStep >= 3) return;

    const next = this.data.currentStep + 1;
    this.setData({ currentStep: next });

    if (next === 2) {
      setTimeout(() => this._initCanvas(), 300);
    }
  },

  onPrevStep() {
    this._stop();
    this.setData({
      currentStep: this.data.currentStep - 1,
      experimentRunning: false,
      experimentDone: false,
      leftLight: 0,
      leftHeavy: 0,
      rightLight: 0,
      rightHeavy: 0,
      enrichmentPercent: '0'
    });
  },

  // ======================
  // 控制
  // ======================
  onStartExperiment() {
    if (this.data.experimentRunning) return;

    this._particles = [];

    this.setData({
      experimentRunning: true,
      experimentDone: false,
      leftLight: 0,
      leftHeavy: 0,
      rightLight: 0,
      rightHeavy: 0
    });

    this._run();
  },

  onStopExperiment() {
    this._stop();
    this._calc();
  },

  onResetExperiment() {
    this._stop();
    this.onStartExperiment();
  },

  // ======================
  // canvas
  // ======================
  _initCanvas() {
    const query = wx.createSelectorQuery().in(this); // ✅ 确保在当前 page/component

    query.select('#diffCanvas')
      .fields({ node: true, size: true })
      .exec(res => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        const dpr = wx.getSystemInfoSync().pixelRatio || 1;

        // ⚠️ 物理像素
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;

        // ⚠️ 逻辑坐标缩放
        ctx.scale(dpr, dpr);

        this._ctx = ctx;

        // ⚠️ _width/_height 用逻辑坐标
        this._width = res[0].width;
        this._height = res[0].height;

        // ✅ 绘制静态元素
        this._drawStatic();
      });
  },

  // ======================
  // 背景 + 隔板
  // ======================
  _drawStatic() {
    const ctx = this._ctx;
    const w = this._width;
    const h = this._height;

    ctx.clearRect(0, 0, w, h);

    // 背景
    ctx.fillStyle = '#0b1020';
    ctx.fillRect(0, 0, w, h);

    // 隔板
    ctx.fillStyle = '#888';
    ctx.fillRect(w/2 - 2, 0, 4, h);

    // 小孔
    for (let i = 0; i < 6; i++) {
      const y = (i + 1) * h / 7;
      ctx.clearRect(w/2 - 2, y - 8, 4, 16);
    }
  },

  // ======================
  // 动画核心
  // ======================
  _run() {
    const ctx = this._ctx;
    const w = this._width;
    const h = this._height;

    const animate = () => {
      if (!this.data.experimentRunning) return;

      this._drawStatic();

      // 生成粒子（只在左侧）
      if (Math.random() < 0.3) {
        const isLight = Math.random() < 0.2;
        const speed = isLight ? 2.2 : 1.2;

        this._particles.push({
          x: w * 0.25,
          y: h * 0.5,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          type: isLight ? 'light' : 'heavy'
        });
      }

      let leftLight = 0, leftHeavy = 0;
      let rightLight = 0, rightHeavy = 0;

      for (let p of this._particles) {

        // 运动
        p.x += p.vx;
        p.y += p.vy;

        // 上下反弹
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // 隔板处理（核心）
        const nearWall = Math.abs(p.x - w/2) < 3;

        if (nearWall) {
          const passProb = p.type === 'light' ? 0.25 : 0.08;

          if (Math.random() < passProb) {
            p.x += p.vx;
          } else {
            p.vx *= -1;
          }
        }

        // 左右边界反弹
        if (p.x < 0 || p.x > w) p.vx *= -1;

        // 统计
        if (p.x < w/2) {
          if (p.type === 'light') leftLight++;
          else leftHeavy++;
        } else {
          if (p.type === 'light') rightLight++;
          else rightHeavy++;
        }

        // 绘制
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.type === 'light' ? '#4FC3F7' : '#C41E3A';
        ctx.fill();
      }

      this.setData({
        leftLight,
        leftHeavy,
        rightLight,
        rightHeavy
      });

      this._animationId = setTimeout(animate, 16);
    };

    animate();
  },

  _stop() {
    clearTimeout(this._animationId);
    this.setData({ experimentRunning: false });
  },

  // ======================
  // 结果（右侧富集）
  // ======================
  _calc() {
    const total = this.data.rightLight + this.data.rightHeavy;
    if (!total) return;

    const percent = Math.round(this.data.rightLight / total * 100);

    this.setData({
      enrichmentPercent: String(percent),
      experimentDone: true
    });
  }
});