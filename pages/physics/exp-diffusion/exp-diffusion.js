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

    // 左右统计
    leftLight: 0,
    leftHeavy: 0,
    rightLight: 0,
    rightHeavy: 0,

    enrichmentPercent: '0',

    experimentRunning: false,
    experimentDone: false,

    // 级联相关
    cascadeLevel: 0,           // 当前已叠加的级数（0 = 单级演示）
    totalLevels: 4000,         // 武器级所需总级数
    abundancePercent: '0.70',  // 当前 U-235 丰度（百分比字符串）
    separationFactor: '1.0043',// 分离系数 α

    // 级联档位
    cascadeStages: [
      { level: 1,    abundance: 0.70 },
      { level: 10,   abundance: 0.72 },
      { level: 50,   abundance: 1.40 },
      { level: 200,  abundance: 3.00 },
      { level: 600,  abundance: 20.0 },
      { level: 1200, abundance: 60.0 },
      { level: 4000, abundance: 90.0 }
    ],
    cascadeStageIndex: 0,

    // 加速
    speedMultiplier: 1,

    // 弹窗
    showInfoModal: false,

    // 步骤引导提示
    guideText: '① 点击「启动扩散」观察分子穿膜　② 点击「停止」查看结果　③ 点击「增加一级」模拟级联',
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
  // step 导航
  // ======================
  onNextStep() {
    if (this.data.currentStep >= 3) {
      wx.navigateBack({
        delta: 1
      });
      return;
    }
    const next = this.data.currentStep + 1;
    this.setData({ currentStep: next });
    if (next === 2) {
      setTimeout(() => this._initCanvas(), 300);
    }
    this._vibrate();
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
      enrichmentPercent: '0',
      cascadeLevel: 0,
      cascadeStageIndex: 0,
      abundancePercent: '0.70',
      speedMultiplier: 1
    });
    this._vibrate();
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
      rightHeavy: 0,
      guideText: '分子正在扩散中… 观察右侧 U-235 粒子逐渐增多'
    });
    this._run();
    this._vibrate();
  },

  onStopExperiment() {
    this._stop();
    this._calc();
    this.setData({
      guideText: '实验已停止。查看右侧富集结果，或点击「增加一级」叠加级联效果'
    });
    this._vibrate();
  },

  onResetExperiment() {
    this._stop();
    this._particles = [];
    this.setData({
      experimentRunning: false,
      experimentDone: false,
      leftLight: 0,
      leftHeavy: 0,
      rightLight: 0,
      rightHeavy: 0,
      enrichmentPercent: '0',
      cascadeLevel: 0,
      cascadeStageIndex: 0,
      abundancePercent: '0.70',
      speedMultiplier: 1,
      guideText: '① 点击「启动扩散」观察分子穿膜　② 点击「停止」查看结果　③ 点击「增加一级」模拟级联'
    });
    if (this._ctx) this._drawStatic();
    this._vibrate();
  },

  // ======================
  // 级联叠加
  // ======================
  onAddCascade() {
    const stages = this.data.cascadeStages;
    let idx = this.data.cascadeStageIndex + 1;
    if (idx >= stages.length) idx = stages.length - 1;

    const stage = stages[idx];
    const abundance = stage.abundance.toFixed(2);

    // 动态分离系数：随丰度提高，系数趋近于1（级数递减效益）
    const alpha = idx === 0 ? 1.0043 : (1 + 0.0043 / (1 + idx * 0.3)).toFixed(4);

    this.setData({
      cascadeStageIndex: idx,
      cascadeLevel: stage.level,
      abundancePercent: String(abundance),
      separationFactor: String(alpha)
    });
    this._vibrate();
  },

  // ======================
  // 加速/信息弹窗
  // ======================
  onSpeedUp() {
    const cur = this.data.speedMultiplier;
    const next = cur >= 4 ? 1 : cur * 2;
    this.setData({ speedMultiplier: next });
    this._vibrate();
  },

  onShowInfo() {
    this.setData({ showInfoModal: true });
  },

  onCloseInfo() {
    this.setData({ showInfoModal: false });
  },

  // ======================
  // 截图
  // ======================
  onSaveScreenshot() {
    wx.canvasToTempFilePath({
      canvas: this._canvasNode,
      success(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success() {
            wx.showToast({ title: '已保存到相册', icon: 'success' });
          },
          fail() {
            wx.showToast({ title: '保存失败，请授权相册权限', icon: 'none' });
          }
        });
      }
    });
  },

  // ======================
  // 震动反馈
  // ======================
  _vibrate() {
    wx.vibrateShort({ type: 'light' }).catch(() => {});
  },

  // ======================
  // canvas 初始化
  // ======================
  _initCanvas() {
    const query = wx.createSelectorQuery().in(this);
    query.select('#diffCanvas')
      .fields({ node: true, size: true })
      .exec(res => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio || 1;

        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        this._ctx = ctx;
        this._canvasNode = canvas;
        this._width = res[0].width;
        this._height = res[0].height;

        this._drawStatic();
      });
  },

  // ======================
  // 背景 + 多孔隔板
  // ======================
  _drawStatic() {
    const ctx = this._ctx;
    const w = this._width;
    const h = this._height;

    ctx.clearRect(0, 0, w, h);

    // 背景
    ctx.fillStyle = '#0b1020';
    ctx.fillRect(0, 0, w, h);

    // 左侧区域微光
    const gradL = ctx.createRadialGradient(w * 0.25, h * 0.5, 0, w * 0.25, h * 0.5, w * 0.3);
    gradL.addColorStop(0, 'rgba(79,195,247,0.07)');
    gradL.addColorStop(1, 'transparent');
    ctx.fillStyle = gradL;
    ctx.fillRect(0, 0, w / 2, h);

    // 右侧区域微光
    const gradR = ctx.createRadialGradient(w * 0.75, h * 0.5, 0, w * 0.75, h * 0.5, w * 0.3);
    gradR.addColorStop(0, 'rgba(255,82,82,0.07)');
    gradR.addColorStop(1, 'transparent');
    ctx.fillStyle = gradR;
    ctx.fillRect(w / 2, 0, w / 2, h);

    // 多孔膜隔板
    ctx.fillStyle = '#556';
    ctx.fillRect(w / 2 - 4, 0, 8, h);

    // 小孔（矩形镂空）
    const holeCount = 8;
    const holeH = 14;
    const gap = h / (holeCount + 1);
    for (let i = 0; i < holeCount; i++) {
      const y = (i + 1) * gap;
      ctx.clearRect(w / 2 - 4, y - holeH / 2, 8, holeH);
      // 小孔高光
      ctx.fillStyle = 'rgba(79,195,247,0.3)';
      ctx.fillRect(w / 2 - 5, y - holeH / 2, 1, holeH);
      ctx.fillStyle = '#556';
    }

    // 膜标注
    ctx.fillStyle = 'rgba(180,200,255,0.4)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('多孔膜', w / 2, 12);
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

      const speed = this.data.speedMultiplier;

      // 生成粒子（只在左侧）
      const spawnRate = 0.25 * speed;
      if (Math.random() < spawnRate) {
        const isLight = Math.random() < 0.2; // 初始 20% 轻（相当于夸大演示）
        const baseSpeed = isLight ? 2.4 : 1.3;
        const s = baseSpeed * (0.8 + Math.random() * 0.4) * Math.sqrt(speed);

        this._particles.push({
          x: w * 0.1 + Math.random() * w * 0.35,
          y: Math.random() * h,
          vx: (Math.random() > 0.5 ? 1 : -1) * s * (0.5 + Math.random() * 0.5),
          vy: (Math.random() - 0.5) * s,
          type: isLight ? 'light' : 'heavy',
          trail: []
        });
      }

      // 限制粒子总数
      if (this._particles.length > 180) {
        this._particles.splice(0, this._particles.length - 180);
      }

      let leftLight = 0, leftHeavy = 0;
      let rightLight = 0, rightHeavy = 0;

      for (let p of this._particles) {
        // 记录轨迹
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 6) p.trail.shift();

        // 运动
        p.x += p.vx * speed;
        p.y += p.vy * speed;

        // 上下反弹
        if (p.y < 2) { p.y = 2; p.vy = Math.abs(p.vy); }
        if (p.y > h - 2) { p.y = h - 2; p.vy = -Math.abs(p.vy); }

        // 隔板穿越判断
        const crossingLeft  = p.vx > 0 && p.x >= w / 2 - 4 && p.x - p.vx * speed < w / 2 - 4;
        const crossingRight = p.vx < 0 && p.x <= w / 2 + 4 && p.x - p.vx * speed > w / 2 + 4;

        if (crossingLeft || crossingRight) {
          const passProb = p.type === 'light' ? 0.28 : 0.09;
          if (Math.random() >= passProb) {
            p.vx *= -1;
            p.x += p.vx * 2;
          }
        }

        // 左右边界弹回
        if (p.x < 2) { p.x = 2; p.vx = Math.abs(p.vx); }
        if (p.x > w - 2) { p.x = w - 2; p.vx = -Math.abs(p.vx); }

        // 统计
        if (p.x < w / 2) {
          if (p.type === 'light') leftLight++; else leftHeavy++;
        } else {
          if (p.type === 'light') rightLight++; else rightHeavy++;
        }

        // 绘制轨迹（淡色）
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t of p.trail) ctx.lineTo(t.x, t.y);
          ctx.strokeStyle = p.type === 'light'
            ? 'rgba(79,195,247,0.15)'
            : 'rgba(196,30,58,0.12)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // 绘制分子（发光圆点）
        const r = p.type === 'light' ? 4 : 5.5;
        const color = p.type === 'light' ? '#4FC3F7' : '#C41E3A';

        // 光晕
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.5);
        glow.addColorStop(0, p.type === 'light' ? 'rgba(79,195,247,0.5)' : 'rgba(196,30,58,0.4)');
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // 主体
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // 高光
        ctx.beginPath();
        ctx.arc(p.x - r * 0.3, p.y - r * 0.3, r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fill();
      }

      this.setData({ leftLight, leftHeavy, rightLight, rightHeavy });

      this._animationId = setTimeout(animate, 16);
    };

    animate();
  },

  _stop() {
    clearTimeout(this._animationId);
    this.setData({ experimentRunning: false });
  },

  // ======================
  // 结果计算（丰度 + 右侧粒子比）
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
