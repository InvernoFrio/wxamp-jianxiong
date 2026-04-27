// pages/physics/exp-entanglement/exp-entanglement.js
Page({
  data: {
    currentStep: 0,
    steps: [
      { title: '量子纠缠', desc: '超越经典物理的神秘关联' },
      { title: '什么是纠缠', desc: '两个粒子共享同一个量子态' },
      { title: '实验演示', desc: 'EPR纠缠光子对模拟' },
      { title: '实验结论', desc: '非局域关联的存在' }
    ],

    // 统计
    sameCount: 0,
    diffCount: 0,
    totalPairs: 0,
    correlation: '0',

    experimentRunning: false,
    experimentDone: false
  },

  _ctx: null,
  _particles: [],
  _animationId: null,
  _width: 0,
  _height: 0,

  onNextStep() {
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

  onStartExperiment() {
    this._particles = []
    this.setData({
      experimentRunning: true,
      experimentDone: false,
      sameCount: 0,
      diffCount: 0,
      totalPairs: 0
    })
    this._run()
  },

  onStopExperiment() {
    this._stop()
    this._calc()
  },

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
        this._width = res[0].width
        this._height = res[0].height

        this._drawStatic()
      })
  },

  _drawStatic() {
    const ctx = this._ctx
    const w = this._width
    const h = this._height

    ctx.clearRect(0, 0, w, h)

    // 背景
    ctx.fillStyle = '#0f2027'
    ctx.fillRect(0, 0, w, h)

    // 中心源
    ctx.beginPath()
    ctx.arc(w/2, h/2, 20, 0, Math.PI*2)
    ctx.fillStyle = '#FFD54F'
    ctx.fill()

    // 左右探测器
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.fillRect(20, h/2 - 40, 10, 80)
    ctx.fillRect(w-30, h/2 - 40, 10, 80)

    ctx.fillStyle = '#fff'
    ctx.fillText('A', 30, h/2 - 50)
    ctx.fillText('B', w-30, h/2 - 50)
  },

  _run() {
    const ctx = this._ctx
    const cx = this._width / 2
    const cy = this._height / 2

    const loop = () => {
      if (!this.data.experimentRunning) return

      this._drawStatic()

      // 生成纠缠对
      if (Math.random() < 0.3) {
        const state = Math.random() > 0.5 ? 1 : -1

        this._particles.push({
          x: cx,
          y: cy,
          vx: -2,
          state
        })

        this._particles.push({
          x: cx,
          y: cy,
          vx: 2,
          state: -state
        })
      }

      let same = 0
      let diff = 0

      const alive = []

      for (let i = 0; i < this._particles.length; i+=2) {
        const p1 = this._particles[i]
        const p2 = this._particles[i+1]

        if (!p2) continue

        p1.x += p1.vx
        p2.x += p2.vx

        // 画粒子
        ctx.beginPath()
        ctx.arc(p1.x, p1.y, 3, 0, Math.PI*2)
        ctx.fillStyle = p1.state > 0 ? '#4FC3F7' : '#C41E3A'
        ctx.fill()

        ctx.beginPath()
        ctx.arc(p2.x, p2.y, 3, 0, Math.PI*2)
        ctx.fillStyle = p2.state > 0 ? '#4FC3F7' : '#C41E3A'
        ctx.fill()

        // 到边界
        if (p1.x < 20 || p2.x > this._width-20) {
          if (p1.state === p2.state) same++
          else diff++
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
      experimentDone: true
    })
  }
})