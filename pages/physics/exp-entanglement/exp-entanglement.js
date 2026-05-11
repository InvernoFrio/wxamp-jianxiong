// pages/physics/exp-entanglement/exp-entanglement.js
const haptics = require('../../../utils/haptics.js');

Page({
  data: {
    currentStep: 0,
    steps: [
      { title: '量子纠缠', desc: '超越经典物理的神秘关联' },
      { title: '什么是纠缠', desc: '两个粒子共享同一个量子态' },
      { title: '实验演示', desc: 'EPR纠缠光子对模拟' },
      { title: '实验结论', desc: '非局域关联的存在' }
    ],

    // ── 统计 ──
    sameCount: 0,
    diffCount: 0,
    totalPairs: 0,
    correlation: '0',

    experimentRunning: false,
    experimentDone: false,

    // ── 偏振片角度 ──
    angleA: 0,
    angleB: 45,
    coincRate: '100',      // cos²(θA−θB) × 100，保留整数
    coincRateRaw: 1,       // 原始小数，用于进度条宽度
    angleDiff: 0,          // |θA − θB|，用于公式显示

    // ── 贝尔 S 参数 (CHSH，最优四角度) ──
    bellS: '2.83',
    bellViolated: true,    // |S| > 2 即违反

    // ── 步骤引导完成状态 ──
    guideStep: 0,          // 当前引导进度 0~4

    // ── 原理弹窗 ──
    showModal: false,
    modalType: 'principle', // 'principle' | 'bell' | 'chart'

    // ── cos² 曲线采样点（每10°一个，共19个点 0~180） ──
    curvePoints: [],
    currentCurveX: 0,      // 当前角度差在曲线上的横坐标百分比（0~100）
    currentCurveY: 0,      // 当前符合率在曲线上的纵坐标百分比（0~100，从上往下）

    // ── 角度联动：右侧自动建议角度 ──
    suggestedB: 45,

    // ── 截图提示 ──
    showSaveHint: false,
  },

  _ctx: null,
  _particles: [],
  _animationId: null,
  _width: 0,
  _height: 0,
  _positrons: [],    // 湮灭动画粒子

  // ════════════════════════════════════
  //   生命周期
  // ════════════════════════════════════
  onLoad() {
    this._buildCurvePoints()
    this._updateCoincidence()
    this._updateBellS()
  },

  // ════════════════════════════════════
  //   步骤导航
  // ════════════════════════════════════
  onNextStep() {
    if (this.data.currentStep >= 3) {
      wx.navigateBack({
        delta: 1
      });
      return;
    }
    const next = this.data.currentStep + 1
    this.setData({ currentStep: next })
    if (next === 2) {
      setTimeout(() => this._initCanvas(), 300)
    }
  },

  onPrevStep() {
    this._stop()
    this.setData({
      currentStep: this.data.currentStep - 1,
      experimentRunning: false,
      experimentDone: false,
      sameCount: 0,
      diffCount: 0,
      totalPairs: 0,
      correlation: '0'
    })
  },

  // ════════════════════════════════════
  //   偏振片角度控制
  // ════════════════════════════════════
  onAngleAChange(e) {
    const v = parseInt(e.detail.value)
    this.setData({ angleA: v })
    this._vibrate()
    this._updateCoincidence()
    this._updateBellS()
    this._updateSuggestedB()
    // 引导进度推进
    if (this.data.guideStep === 1) this.setData({ guideStep: 2 })
    // 重绘画布
    if (this._ctx) this._drawStatic()
  },

  onAngleBChange(e) {
    const v = parseInt(e.detail.value)
    this.setData({ angleB: v })
    this._vibrate()
    this._updateCoincidence()
    this._updateBellS()
    if (this.data.guideStep === 2) this.setData({ guideStep: 3 })
    if (this._ctx) this._drawStatic()
  },

  // 根据 θA 推荐最佳 θB（相差45°，使符合率处于量子优势区域）
  _updateSuggestedB() {
    const suggested = (this.data.angleA + 45) % 360
    this.setData({ suggestedB: suggested })
  },

  // 一键应用建议角度
  onApplySuggestedB() {
    this.setData({ angleB: this.data.suggestedB })
    this._updateCoincidence()
    this._updateBellS()
    this._vibrate()
  },

  // ════════════════════════════════════
  //   符合率计算
  // ════════════════════════════════════
  _updateCoincidence() {
    const { angleA, angleB } = this.data
    const diff = Math.abs(angleA - angleB) % 360
    const realDiff = diff > 180 ? 360 - diff : diff   // 归一到 0~180°
    const rad = realDiff * Math.PI / 180
    const rate = Math.pow(Math.cos(rad), 2)
    const pct = Math.round(rate * 100)

    // 更新曲线当前点
    const cx = Math.round((realDiff / 180) * 100)
    const cy = Math.round((1 - rate) * 100)   // 纵轴从上往下

    this.setData({
      angleDiff: realDiff,
      coincRate: String(pct),
      coincRateRaw: rate,
      currentCurveX: cx,
      currentCurveY: cy,
    })
  },

  // ════════════════════════════════════
  //   贝尔 S 参数（CHSH，最优四角度）
  //   S = E(0°,22.5°) − E(0°,67.5°) + E(45°,22.5°) + E(45°,67.5°)
  //   E(θA,θB) = cos(2(θA−θB))，量子力学给出 S = 2√2 ≈ 2.828
  // ════════════════════════════════════
  _updateBellS() {
    // 使用 CHSH 最优角度：a=0, a'=45, b=22.5, b'=67.5
    const angles = [
      [0, 22.5], [0, 67.5],
      [45, 22.5], [45, 67.5]
    ]
    const E = (a, b) => Math.cos(2 * (a - b) * Math.PI / 180)
    const S = E(...angles[0]) - E(...angles[1]) + E(...angles[2]) + E(...angles[3])
    const Sval = Math.abs(S).toFixed(2)
    const violated = Math.abs(S) > 2

    this.setData({
      bellS: Sval,
      bellViolated: violated
    })
  },

  // ════════════════════════════════════
  //   cos² 曲线采样（19 个点，0~180°，每 10°）
  // ════════════════════════════════════
  _buildCurvePoints() {
    const pts = []
    for (let deg = 0; deg <= 180; deg += 10) {
      const rad = deg * Math.PI / 180
      const qVal = Math.round(Math.pow(Math.cos(rad), 2) * 100)   // 量子 %
      const cVal = 50   // 经典上限固定 50%
      pts.push({ deg, qVal, cVal })
    }
    this.setData({ curvePoints: pts })
  },

  // ════════════════════════════════════
  //   实验控制（保持原有逻辑，增加湮灭动画）
  // ════════════════════════════════════
  onStartExperiment() {
    this._particles = []
    this._positrons = []
    this.setData({
      experimentRunning: true,
      experimentDone: false,
      sameCount: 0,
      diffCount: 0,
      totalPairs: 0
    })
    if (this.data.guideStep === 3) this.setData({ guideStep: 4 })
    this._vibrate()
    this._run()
  },

  onStopExperiment() {
    this._stop()
    this._calc()
    this._vibrate()
  },

  // ════════════════════════════════════
  //   重置实验
  // ════════════════════════════════════
  onResetExperiment() {
    this._stop()
    this._particles = []
    this._positrons = []
    this.setData({
      experimentRunning: false,
      experimentDone: false,
      sameCount: 0,
      diffCount: 0,
      totalPairs: 0,
      correlation: '0',
      angleA: 0,
      angleB: 45,
      angleDiff: 45,
      coincRate: '50',
      coincRateRaw: 0.5,
      guideStep: 0,
    })
    this._updateCoincidence()
    this._updateBellS()
    if (this._ctx) this._drawStatic()
    this._vibrate()
  },

  // ════════════════════════════════════
  //   原理弹窗
  // ════════════════════════════════════
  onShowModal(e) {
    const type = e.currentTarget.dataset.type || 'principle'
    this.setData({ showModal: true, modalType: type })
  },

  onHideModal() {
    this.setData({ showModal: false })
  },

  onModalTap(e) {
    // 点击遮罩关闭（不冒泡到内容区）
    this.setData({ showModal: false })
  },

  onModalContentTap(e) {
    // 阻止冒泡
  },

  // ════════════════════════════════════
  //   截图/分享
  // ════════════════════════════════════
  onSaveCanvas() {
    wx.canvasToTempFilePath({
      canvas: this._canvas,
      success: res => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
          fail: () => wx.showToast({ title: '保存失败，请授权相册权限', icon: 'none' })
        })
      },
      fail: () => wx.showToast({ title: '截图失败', icon: 'none' })
    }, this)
  },

  onShareExperiment() {
    // 触发页面分享（需在 onShareAppMessage 中配置）
    wx.showShareMenu({ withShareTicket: true })
  },

  onShareAppMessage() {
    return {
      title: `量子纠缠实验：符合率 ${this.data.coincRate}%，贝尔 S=${this.data.bellS}`,
      path: '/pages/physics/exp-entanglement/exp-entanglement',
      imageUrl: ''   // 可替换为实验截图路径
    }
  },

  // ════════════════════════════════════
  //   震动反馈
  // ════════════════════════════════════
  _vibrate() {
    haptics.tap()
  },

  // ════════════════════════════════════
  //   Canvas 初始化（保持原有逻辑）
  // ════════════════════════════════════
  _initCanvas() {
    const query = wx.createSelectorQuery()
    query.select('#physicsCanvas')
      .fields({ node: true, size: true })
      .exec(res => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getSystemInfoSync().pixelRatio

        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)

        this._ctx = ctx
        this._canvas = canvas
        this._width = res[0].width
        this._height = res[0].height

        this._drawStatic()
      })
  },

  // ════════════════════════════════════
  //   静态场景绘制（新增偏振片、湮灭源标注）
  // ════════════════════════════════════
  _drawStatic() {
    const ctx = this._ctx
    const w = this._width
    const h = this._height
    const { angleA, angleB } = this.data

    ctx.clearRect(0, 0, w, h)

    // 背景
    ctx.fillStyle = '#0f2027'
    ctx.fillRect(0, 0, w, h)

    // ── 湮灭源（中心）──
    // 光晕
    const grd = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, 30)
    grd.addColorStop(0, 'rgba(255,213,79,0.6)')
    grd.addColorStop(1, 'rgba(255,213,79,0)')
    ctx.beginPath()
    ctx.arc(w/2, h/2, 30, 0, Math.PI*2)
    ctx.fillStyle = grd
    ctx.fill()
    // 核心
    ctx.beginPath()
    ctx.arc(w/2, h/2, 12, 0, Math.PI*2)
    ctx.fillStyle = '#FFD54F'
    ctx.fill()
    // 标注
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('e⁺e⁻湮灭源', w/2, h/2 + 30)

    // ── 偏振片 A（左侧）──
    this._drawPolarizer(ctx, 28, h/2, angleA, '#4FC3F7', 'A')

    // ── 偏振片 B（右侧）──
    this._drawPolarizer(ctx, w - 28, h/2, angleB, '#C41E3A', 'B')

    // ── 探测器标签 ──
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`θA=${angleA}°`, 8, h/2 - 48)
    ctx.textAlign = 'right'
    ctx.fillText(`θB=${angleB}°`, w - 8, h/2 - 48)
  },

  // 绘制偏振片（旋转矩形 + 角度线）
  _drawPolarizer(ctx, x, cy, angleDeg, color, label) {
    const rad = angleDeg * Math.PI / 180

    ctx.save()
    ctx.translate(x, cy)

    // 偏振片外框
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.strokeRect(-6, -36, 12, 72)

    // 偏振方向线（随角度旋转）
    ctx.rotate(rad)
    ctx.beginPath()
    ctx.moveTo(0, -28)
    ctx.lineTo(0, 28)
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.setLineDash([4, 3])
    ctx.stroke()
    ctx.setLineDash([])

    ctx.restore()

    // 标签
    ctx.fillStyle = color
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = label === 'A' ? 'left' : 'right'
    ctx.fillText(label, label === 'A' ? x + 10 : x - 10, cy - 40)
  },

  // ════════════════════════════════════
  //   实验主循环（原有逻辑 + 湮灭动画 + 偏振片影响）
  // ════════════════════════════════════
  _run() {
    const ctx = this._ctx
    const cx = this._width / 2
    const cy = this._height / 2

    const loop = () => {
      if (!this.data.experimentRunning) return

      this._drawStatic()

      // ── 生成纠缠对 ──
      if (Math.random() < 0.3) {
        const state = Math.random() > 0.5 ? 1 : -1

        // 湮灭闪光
        this._positrons.push({ x: cx, y: cy, r: 2, life: 8 })

        this._particles.push({ x: cx, y: cy, vx: -2.5, state })
        this._particles.push({ x: cx, y: cy, vx: 2.5, state: -state })
      }

      // ── 湮灭闪光动画 ──
      this._positrons = this._positrons.filter(p => {
        p.r += 1.5
        p.life--
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2)
        ctx.strokeStyle = `rgba(255,213,79,${p.life / 8 * 0.6})`
        ctx.lineWidth = 1
        ctx.stroke()
        return p.life > 0
      })

      let same = 0, diff = 0
      const alive = []

      const { angleA, angleB, coincRateRaw } = this.data

      for (let i = 0; i < this._particles.length; i += 2) {
        const p1 = this._particles[i]
        const p2 = this._particles[i + 1]
        if (!p2) continue

        p1.x += p1.vx
        p2.x += p2.vx

        // 粒子颜色根据自旋态
        ctx.beginPath()
        ctx.arc(p1.x, p1.y, 4, 0, Math.PI*2)
        ctx.fillStyle = p1.state > 0 ? '#4FC3F7' : '#C41E3A'
        ctx.fill()

        ctx.beginPath()
        ctx.arc(p2.x, p2.y, 4, 0, Math.PI*2)
        ctx.fillStyle = p2.state > 0 ? '#4FC3F7' : '#C41E3A'
        ctx.fill()

        // 到达探测器
        if (p1.x < 32 || p2.x > this._width - 32) {
          // 量子预言：以 cos²(θA−θB) 概率符合
          const isCoincident = Math.random() < coincRateRaw
          if (isCoincident) diff++   // 计入"符合（反关联）"
          else same++
        } else {
          alive.push(p1, p2)
        }
      }

      this._particles = alive

      if (same + diff > 0) {
        this.setData({
          sameCount: this.data.sameCount + same,
          diffCount: this.data.diffCount + diff,
          totalPairs: this.data.totalPairs + same + diff
        })
      }

      if (this.data.totalPairs > 200) {
        this._stop()
        this._calc()
        return
      }

      this._animationId = setTimeout(loop, 16)
    }

    loop()
  },

  _stop() {
    clearTimeout(this._animationId)
    this.setData({ experimentRunning: false })
  },

  _calc() {
    const total = this.data.totalPairs
    if (!total) return
    const corr = Math.round((this.data.diffCount / total) * 100)
    this.setData({
      correlation: String(corr),
      experimentDone: true,
      guideStep: 5   // 全部完成
    })
  }
})
