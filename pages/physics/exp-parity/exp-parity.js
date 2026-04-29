// pages/physics/exp-parity/exp-parity.js
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
    canvasReady: false,
    
    // 新增数据字段
    mirrorMode: false,
    splitScreen: false,
    temperature: 50,
    showFormula: false
  },

  _canvas: null,
  _ctx: null,
  _mirrorCanvas: null,
  _mirrorCtx: null,
  _animationId: null,
  _particles: [],
  _width: 0,
  _height: 0,
  _isFallback: false,
  _isSliding: false,

  onLoad() {
    // 初始化时检查是否支持分屏
    const systemInfo = wx.getSystemInfoSync();
    const canSplitScreen = systemInfo.screenWidth > 600;
    this.setData({ 
      splitScreen: canSplitScreen,
      temperature: 50 
    });
  },

  onUnload() {
    this._stopAnimation();
  },

  // ========== 步骤导航 ==========
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
      particlesUp: 0,
      particlesDown: 0,
      totalParticles: 0,
      asymmetryPercent: '0',
      mirrorMode: false
    });
  },

  // ========== 公式弹窗 ==========
  onShowFormula() {
    this.setData({ showFormula: true });
    this._triggerVibration(50);
  },

  onHideFormula() {
    this.setData({ showFormula: false });
  },

  // ========== 镜像模式开关 ==========
  onToggleMirror() {
    const newMirrorMode = !this.data.mirrorMode;
    this.setData({ mirrorMode: newMirrorMode });
    this._triggerVibration(100);
    
    // 如果启用镜像模式且实验已完成，重新绘制
    if (this.data.experimentDone) {
      this._redrawCanvases();
    }
  },

  // ========== 温度控制 ==========
  onTemperatureChange(e) {
    this.setData({ temperature: e.detail.value });
    this._triggerVibration(20);
  },

  onSliderTouchStart() {
    this._isSliding = true;
  },

  onSliderTouchEnd() {
    this._isSliding = false;
    this._triggerVibration(30);
  },

  // ========== 重置实验 ==========
  onResetExperiment() {
    this._stopAnimation();
    this.setData({
      experimentRunning: false,
      experimentDone: false,
      particlesUp: 0,
      particlesDown: 0,
      totalParticles: 0,
      asymmetryPercent: '0',
      mirrorMode: false,
      temperature: 50,
      showFormula: false,
      _particles: []
    });
    this._particles = [];
    this._drawStatic();
    this._triggerVibration(50);
    wx.showToast({
      title: '已重置实验',
      icon: 'success',
      duration: 1500
    });
  },

  // ========== 分享结果 ==========
  onShareResult() {
    this._triggerVibration(80);
    wx.canvasToTempFilePath(
      {
        canvas: this._canvas,
        success: (res) => {
          wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
          });
          wx.onCopyUrl(() => {
            wx.setClipboardData({
              data: `我的宇称不守恒实验结果：向下发射比例${this.data.asymmetryPercent}%，极化温度${this.data.temperature}K`,
              success: () => {
                wx.showToast({
                  title: '结果已复制',
                  icon: 'success'
                });
              }
            });
          });
        }
      },
      this
    );
  },

  // ========== 实验控制 ==========
  onStartExperiment() {
    if (this.data.experimentRunning) return;
    this._particles = [];
    this.setData({
      experimentRunning: true,
      experimentDone: false,
      particlesUp: 0,
      particlesDown: 0,
      totalParticles: 0,
      asymmetryPercent: '0'
    });
    this._runAnimation();
  },

  onStopExperiment() {
    this._stopAnimation();
    this._calculateResults();
  },

  // ========== 画布初始化 ==========
  _initCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#physicsCanvas').fields({ node: true, size: true }).exec((res) => {
      if (res && res[0] && res[0].node) {
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
        this._isFallback = false;
        this.setData({ canvasReady: true });
        this._drawStatic();
        
        // 如果启用了分屏，初始化镜像画布
        if (this.data.splitScreen) {
          this._initMirrorCanvas();
        }
      } else {
        const ctx = wx.createCanvasContext('physicsCanvas', this);
        const query2 = wx.createSelectorQuery();
        query2.select('#physicsCanvas').boundingClientRect().exec((res2) => {
          if (res2 && res2[0]) {
            this._ctx = ctx;
            this._width = res2[0].width;
            this._height = res2[0].height;
            this._isFallback = true;
            this.setData({ canvasReady: true });
            this._drawStatic();
          }
        });
      }
    });
  },

  _initMirrorCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#mirrorCanvas').fields({ node: true, size: true }).exec((res) => {
      if (res && res[0] && res[0].node) {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);
        this._mirrorCanvas = canvas;
        this._mirrorCtx = ctx;
      }
    });
  },

  // ========== 静态背景绘制 ==========
  _drawStatic() {
    const ctx = this._ctx;
    if (!ctx) return;
    const w = this._width;
    const h = this._height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // 背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    // 磁场线（竖直方向）
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * 20, 0);
      ctx.lineTo(cx + i * 20, h);
      ctx.stroke();
    }

    // 上探测器
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, h * 0.12, w * 0.35, 20, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 下探测器
    ctx.strokeStyle = 'rgba(196, 30, 58, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, h * 0.88, w * 0.35, 20, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 探测器标签
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('↑ 上探测器', cx, h * 0.06);
    ctx.fillText('↓ 下探测器', cx, h * 0.96);

    // 极化钴-60核心
    this._drawNucleus(ctx, cx, cy);

    if (this._isFallback) {
      ctx.draw();
    }
  },

  // ========== 极化核绘制 ==========
  _drawNucleus(ctx, cx, cy) {
    // 核心圆形
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24);
    grad.addColorStop(0, '#4FC3F7');
    grad.addColorStop(1, '#0288D1');
    ctx.fillStyle = grad;
    ctx.fill();

    // 自旋方向箭头（向上或向下）
    ctx.strokeStyle = '#FFB74D';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 箭头方向：温度低 → 向下（强极化），温度高 → 无方向（随机）
    const polarization = 1 - (this.data.temperature / 100);
    
    if (polarization > 0.3) {
      // 绘制向下的自旋箭头
      ctx.beginPath();
      ctx.moveTo(cx, cy - 16);
      ctx.lineTo(cx, cy + 16);
      ctx.stroke();
      
      // 箭头头部
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + 10);
      ctx.lineTo(cx, cy + 16);
      ctx.lineTo(cx + 6, cy + 10);
      ctx.stroke();
    } else if (polarization > 0.1) {
      // 半随机状态，绘制多个小箭头
      for (let i = 0; i < 3; i++) {
        const angle = (Math.PI * 2 / 3) * i;
        const ax = cx + Math.cos(angle) * 14;
        const ay = cy + Math.sin(angle) * 14;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(cx, cy);
        ctx.stroke();
      }
    }
    // else: 高温，无极化，不绘制箭头

    // 核标签
    ctx.fillStyle = '#4FC3F7';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⁶⁰Co', cx, cy + 4);

    // 极化度指示器
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '9px sans-serif';
    ctx.fillText(`极化:${Math.round(polarization * 100)}%`, cx, cy - 35);
  },

  // ========== 动画循环 ==========
  _runAnimation() {
    if (!this._ctx) return;

    const cx = this._width / 2;
    const cy = this._height / 2;
    let frameCount = 0;

    const animate = () => {
      if (!this.data.experimentRunning) return;

      const ctx = this._ctx;
      frameCount++;

      this._drawStatic();

      // 根据温度计算β粒子偏向性
      const polarization = 1 - (this.data.temperature / 100);
      const downwardProbability = 0.5 + (polarization * 0.2); // 0.5~0.7

      // 生成新粒子
      if (frameCount % 3 === 0) {
        const goDown = Math.random() < downwardProbability;
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

      // 更新和绘制粒子
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

          // 绘制粒子
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fill();
          ctx.globalAlpha = 1;

          // 绘制尾迹
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 4, p.y - p.vy * 4);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = p.life * 0.3;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.globalAlpha = 1;
        } else {
          // 粒子到达边界
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

      // 绘制镜像画布（如果启用）
      if (this.data.splitScreen && this._mirrorCtx) {
        this._drawMirrorCanvas();
      }

      if (this._isFallback) {
        ctx.draw();
      }

      // 结束条件：300个粒子
      if (this.data.totalParticles >= 300) {
        this._stopAnimation();
        this._calculateResults();
        return;
      }

      this._animationId = this._requestFrame(animate);
    };

    this._animationId = this._requestFrame(animate);
  },

  // ========== 镜像画布 ==========
  _drawMirrorCanvas() {
    if (!this._mirrorCtx) return;
    
    const ctx = this._mirrorCtx;
    const w = this._width;
    const h = this._height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // 背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    // 左右翻转：使用 transform
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);

    // 磁场线（镜像）
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * 20, 0);
      ctx.lineTo(cx + i * 20, h);
      ctx.stroke();
    }

    // 探测器（镜像）
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, h * 0.12, w * 0.35, 20, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(196, 30, 58, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, h * 0.88, w * 0.35, 20, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 核心（镜像）
    this._drawNucleus(ctx, cx, cy);

    // 绘制镜像粒子（方向相反）
    for (let i = 0; i < this._particles.length; i++) {
      const p = this._particles[i];
      const mirrorX = w - p.x;

      ctx.beginPath();
      ctx.arc(mirrorX, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.moveTo(mirrorX, p.y);
      ctx.lineTo(mirrorX + p.vx * 4, p.y - p.vy * 4);
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = p.life * 0.3;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  },

  _redrawCanvases() {
    this._drawStatic();
    if (this.data.splitScreen && this._mirrorCtx) {
      this._drawMirrorCanvas();
    }
  },

  // ========== 结果计算 ==========
  _calculateResults() {
    const total = this.data.particlesUp + this.data.particlesDown;
    if (total === 0) return;
    const percent = Math.round((this.data.particlesDown / total) * 100);
    this.setData({
      asymmetryPercent: String(percent),
      experimentDone: true,
      experimentRunning: false
    });
  },

  // ========== 动画帧管理 ==========
  _stopAnimation() {
    if (this._animationId) {
      this._cancelFrame(this._animationId);
      this._animationId = null;
    }
    this.setData({ experimentRunning: false });
  },

  _requestFrame(fn) {
    if (this._canvas && typeof this._canvas.requestAnimationFrame === 'function') {
      return this._canvas.requestAnimationFrame(fn);
    }
    return setTimeout(fn, 16);
  },

  _cancelFrame(id) {
    if (this._canvas && typeof this._canvas.cancelAnimationFrame === 'function') {
      this._canvas.cancelAnimationFrame(id);
      return;
    }
    clearTimeout(id);
  },

  // ========== 交互反馈 ==========
  _triggerVibration(duration = 50) {
    wx.vibrateShort({
      type: 'medium',
      success: () => {},
      fail: () => {
        // 如果不支持振动，静默失败
      }
    });
  }
});
