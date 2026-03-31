// pages/physics/physics.js

Page({
  data: {
    activeStep: 0,
    steps: ['介绍', '宇称概念', '实验演示', '结论'],
    experimentRunning: false,
    particles: [],
    canvas: null,
    ctx: null,
    // 粒子统计
    countUp: 0,
    countDown: 0,
    totalCount: 0,
    showResult: false,
    asymmetryRatio: ''
  },

  onLoad() {
    this.canvasReady = false;
  },

  onReady() {
    this.initCanvasIfNeeded();
  },

  initCanvasIfNeeded() {
    if (this.canvasReady) return;
    
    const query = wx.createSelectorQuery();
    query.select('#experimentCanvas').fields({ node: true, size: true }).exec((res) => {
      if (res && res[0]) {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.ctx = ctx;
        this.canvasReady = true;
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

    ctx.clearRect(0, 0, w, h);

    // 背景
    ctx.fillStyle = 'rgba(245, 240, 232, 0.3)';
    ctx.fillRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;

    // 磁场线（更清晰的弧线，带方向箭头）
    this.drawMagneticFieldLines(ctx, centerX, centerY);

    // 探测器环（外环 + 内环双层效果）
    ctx.strokeStyle = 'rgba(212, 165, 116, 0.4)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 160, 0, Math.PI * 2);
    ctx.stroke();
    // 内层发光
    ctx.strokeStyle = 'rgba(212, 165, 116, 0.15)';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 160, 0, Math.PI * 2);
    ctx.stroke();
    // 探测器刻度标记
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x1 = centerX + Math.cos(angle) * 154;
      const y1 = centerY + Math.sin(angle) * 154;
      const x2 = centerX + Math.cos(angle) * 166;
      const y2 = centerY + Math.sin(angle) * 166;
      ctx.strokeStyle = 'rgba(212, 165, 116, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

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
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Co-60', centerX, centerY + 5);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#8B9DAF';
    ctx.fillText('钴-60原子核', centerX, centerY + 55);
    ctx.fillText('探测器环', centerX, centerY - 170);

    // 方向标识
    ctx.fillStyle = 'rgba(139, 157, 175, 0.5)';
    ctx.font = '11px sans-serif';
    ctx.fillText('↑ 上', centerX, centerY - 135);
    ctx.fillText('↓ 下', centerX, centerY + 145);
  },

  drawMagneticFieldLines(ctx, cx, cy) {
    // 绘制更专业、更清晰的磁场线
    const lineCount = 7;
    for (let i = 0; i < lineCount; i++) {
      const offset = (i - 3) * 22;
      const alpha = 0.15 + 0.1 * (1 - Math.abs(i - 3) / 3);
      
      ctx.strokeStyle = `rgba(139, 157, 175, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      
      // 左侧弧线
      ctx.beginPath();
      ctx.moveTo(cx - 45 + offset, cy - 140);
      ctx.quadraticCurveTo(cx - 70 + offset * 0.5, cy, cx - 45 + offset, cy + 140);
      ctx.stroke();

      // 右侧弧线
      ctx.beginPath();
      ctx.moveTo(cx + 45 - offset, cy - 140);
      ctx.quadraticCurveTo(cx + 70 - offset * 0.5, cy, cx + 45 - offset, cy + 140);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 磁场方向标识 B↑
    const arrowX = cx;
    const arrowY = cy - 195;
    ctx.save();
    ctx.strokeStyle = 'rgba(139, 157, 175, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY + 20);
    ctx.lineTo(arrowX, arrowY - 10);
    ctx.moveTo(arrowX - 6, arrowY - 4);
    ctx.lineTo(arrowX, arrowY - 10);
    ctx.lineTo(arrowX + 6, arrowY - 4);
    ctx.stroke();
    ctx.fillStyle = '#8B9DAF';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('B', arrowX + 14, arrowY);
    ctx.restore();
  },

  // 探测器闪烁效果
  detectorFlashes: [],

  drawDetectorFlash(ctx, cx, cy, angle, intensity) {
    const x = cx + Math.cos(angle) * 160;
    const y = cy + Math.sin(angle) * 160;
    
    // 发光效果
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
    gradient.addColorStop(0, `rgba(196, 30, 58, ${intensity * 0.8})`);
    gradient.addColorStop(0.5, `rgba(212, 165, 116, ${intensity * 0.4})`);
    gradient.addColorStop(1, 'rgba(212, 165, 116, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // 核心亮点
    ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.9})`;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  },

  startExperiment() {
    if (this.data.experimentRunning) return;
    
    this.setData({ 
      experimentRunning: true,
      countUp: 0,
      countDown: 0,
      totalCount: 0,
      showResult: false,
      asymmetryRatio: ''
    });
    this.particles = [];
    this.detectorFlashes = [];
    this.animationId = null;
    this.experimentFrames = 0;
    this.animateExperiment();
  },

  animateExperiment() {
    if (!this.data.experimentRunning) return;

    const ctx = this.ctx;
    const w = this.canvasWidth;
    const h = this.canvasHeight;
    const centerX = w / 2;
    const centerY = h / 2;
    const detectorRadius = 155;

    this.experimentFrames++;

    // 重绘静态场景
    this.drawStaticScene();

    // 磁场方向标识
    ctx.save();
    ctx.strokeStyle = 'rgba(139, 157, 175, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 200);
    ctx.lineTo(centerX, centerY - 230);
    ctx.moveTo(centerX - 8, centerY - 222);
    ctx.lineTo(centerX, centerY - 230);
    ctx.lineTo(centerX + 8, centerY - 222);
    ctx.stroke();
    ctx.fillStyle = '#8B9DAF';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('磁场 B ↑', centerX, centerY - 240);
    ctx.restore();

    // 生成新粒子（宇称不守恒：70% 向下发射）
    if (Math.random() < 0.25) {
      let angle;
      if (Math.random() < 0.7) {
        angle = Math.random() * Math.PI; // 下半球
      } else {
        angle = Math.PI + Math.random() * Math.PI; // 上半球
      }
      
      const speed = 2.5 + Math.random() * 2;
      const size = 3 + Math.random() * 2;
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 80,
        size: size,
        startAngle: angle,
        trail: []
      });
    }

    // 更新和绘制粒子
    let newCountUp = 0;
    let newCountDown = 0;
    
    this.particles = this.particles.filter(p => {
      // 保存轨迹点
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 8) p.trail.shift();

      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      const dist = Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2);

      // 检查是否到达探测器
      if (dist >= detectorRadius && dist < detectorRadius + 20) {
        const hitAngle = Math.atan2(p.y - centerY, p.x - centerX);
        this.detectorFlashes.push({ angle: hitAngle, intensity: 1.0, life: 20 });
        
        // 统计方向
        if (hitAngle > 0 && hitAngle < Math.PI) {
          newCountDown++;
        } else {
          newCountUp++;
        }
        return false;
      }

      // 绘制轨迹（蓝色电子尾迹）
      if (p.trail.length > 1) {
        for (let i = 1; i < p.trail.length; i++) {
          const alpha = (i / p.trail.length) * 0.4;
          ctx.strokeStyle = `rgba(60, 120, 216, ${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
          ctx.stroke();
        }
      }

      // 绘制 β 粒子（蓝色电子）
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
      glow.addColorStop(0, 'rgba(60, 140, 255, 0.9)');
      glow.addColorStop(0.5, 'rgba(60, 120, 216, 0.4)');
      glow.addColorStop(1, 'rgba(60, 120, 216, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // 粒子核心
      ctx.fillStyle = 'rgba(40, 100, 220, 0.95)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // 负电符号 e⁻
      if (p.size > 3.5) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('e⁻', p.x, p.y);
      }

      return p.life > 0 && dist < detectorRadius + 30;
    });

    // 更新计数
    if (newCountUp > 0 || newCountDown > 0) {
      this.setData({
        countUp: this.data.countUp + newCountUp,
        countDown: this.data.countDown + newCountDown,
        totalCount: this.data.totalCount + newCountUp + newCountDown
      });
    }

    // 绘制探测器闪烁
    this.detectorFlashes = this.detectorFlashes.filter(flash => {
      flash.life--;
      flash.intensity = flash.life / 20;
      this.drawDetectorFlash(ctx, centerX, centerY, flash.angle, flash.intensity);
      return flash.life > 0;
    });

    // 绘制实时统计（画布上）
    if (this.data.totalCount > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(44, 44, 44, 0.7)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`↑ 上: ${this.data.countUp}  ↓ 下: ${this.data.countDown}  总计: ${this.data.totalCount}`, 12, 20);
      ctx.restore();
    }

    // 实验自动结束（约 10 秒 / 600 帧）
    if (this.experimentFrames > 600) {
      this.finishExperiment();
      return;
    }

    this.animationId = requestAnimationFrame(() => this.animateExperiment());
  },

  finishExperiment() {
    this.setData({ experimentRunning: false });
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    const total = this.data.totalCount;
    if (total > 0) {
      const downPct = Math.round((this.data.countDown / total) * 100);
      const upPct = 100 - downPct;
      this.setData({
        showResult: true,
        asymmetryRatio: `${downPct}:${upPct}`
      });
    }
  },

  stopExperiment() {
    this.setData({ experimentRunning: false });
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    // 如果有足够粒子，也显示结果
    if (this.data.totalCount >= 5) {
      const total = this.data.totalCount;
      const downPct = Math.round((this.data.countDown / total) * 100);
      const upPct = 100 - downPct;
      this.setData({
        showResult: true,
        asymmetryRatio: `${downPct}:${upPct}`
      });
    }
  },

  resetExperiment() {
    this.stopExperiment();
    this.particles = [];
    this.detectorFlashes = [];
    this.setData({
      countUp: 0,
      countDown: 0,
      totalCount: 0,
      showResult: false,
      asymmetryRatio: ''
    });
    this.drawStaticScene();
  },

  onCanvasTouch() {
    // 用户触摸画布时的交互
  },

  prevStep() {
    if (this.data.activeStep > 0) {
      const newStep = this.data.activeStep - 1;
      this.setData({ activeStep: newStep });
      this.onStepChange(newStep);
    }
  },

  nextStep() {
    if (this.data.activeStep < 3) {
      const newStep = this.data.activeStep + 1;
      this.setData({ activeStep: newStep });
      this.onStepChange(newStep);
    }
  },

  onStepChange(newStep) {
    if (newStep === 2) {
      this.initCanvasIfNeeded();
    }
    if (newStep !== 2) {
      this.stopExperiment();
    }
  },

  onUnload() {
    this.stopExperiment();
  }
});
