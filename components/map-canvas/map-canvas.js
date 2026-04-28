// components/map-canvas/map-canvas.js
const { MAP_WIDTH, MAP_HEIGHT, NODE_TYPES, edges } = require('../../data/map-data.js');

Component({
  properties: {
    nodes: { type: Array, value: [] },
    currentNodeId: { type: String, value: 'start' },
    visitedNodes: { type: Array, value: [] },
    reachableNodes: { type: Array, value: [] },
    canvasWidth: { type: Number, value: 350 },
    canvasHeight: { type: Number, value: 513 }
  },

  data: {
    _canvas: null,
    _ctx: null,
    _dpr: 1,
    _scale: 1,
    _animFrame: 0,
    _pulsePhase: 0
  },

  lifetimes: {
    attached() {
      // 延迟初始化canvas，确保节点已渲染
      wx.nextTick(() => this._initCanvas());
    },
    detached() {
      if (this._animTimer) clearInterval(this._animTimer);
    }
  },

  observers: {
    'nodes, currentNodeId, visitedNodes, reachableNodes': function() {
      if (this.data._ctx) this._draw();
    }
  },

  methods: {
    _initCanvas() {
      const query = wx.createSelectorQuery().in(this);
      query.select('#mapCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res || !res[0] || !res[0].node) return;
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          const dpr = wx.getWindowInfo().pixelRatio || 2;

          canvas.width = this.data.canvasWidth * dpr;
          canvas.height = this.data.canvasHeight * dpr;
          ctx.scale(dpr, dpr);

          this.data._canvas = canvas;
          this.data._ctx = ctx;
          this.data._dpr = dpr;
          this.data._scale = this.data.canvasWidth / MAP_WIDTH;

          this._draw();
          this._startPulseAnimation();
        });
    },

    _startPulseAnimation() {
      this._animTimer = setInterval(() => {
        this.data._pulsePhase = (this.data._pulsePhase + 0.08) % (Math.PI * 2);
        if (this.data._ctx) this._draw();
      }, 50);
    },

    _draw() {
      const ctx = this.data._ctx;
      const w = this.data.canvasWidth;
      const h = this.data.canvasHeight;
      const s = this.data._scale;

      ctx.clearRect(0, 0, w, h);
      this._drawBackground(ctx, w, h);
      this._drawEdges(ctx, s);
      this._drawNodes(ctx, s);
    },

    _drawBackground(ctx, w, h) {
      // 宣纸底色
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#f5eed8');
      grad.addColorStop(0.5, '#f0e6c8');
      grad.addColorStop(1, '#e8dbb8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // 装饰性纹理点
      ctx.fillStyle = 'rgba(180, 160, 120, 0.08)';
      for (let i = 0; i < 60; i++) {
        const px = (Math.sin(i * 7.3) * 0.5 + 0.5) * w;
        const py = (Math.cos(i * 4.7) * 0.5 + 0.5) * h;
        const r = 2 + (i % 5) * 1.5;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 地图边框装饰
      ctx.strokeStyle = 'rgba(160, 130, 80, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(8, 8, w - 16, h - 16);
    },

    _drawEdges(ctx, s) {
      const nodeMap = {};
      this.properties.nodes.forEach(n => { nodeMap[n.id] = n; });

      edges.forEach(edge => {
        const from = nodeMap[edge.from];
        const to = nodeMap[edge.to];
        if (!from || !to) return;

        const fx = from.x * s;
        const fy = from.y * s;
        const tx = to.x * s;
        const ty = to.y * s;

        // 判断是否为可达路径
        const reachable = this.properties.reachableNodes;
        const current = this.properties.currentNodeId;
        const isReachablePath =
          (from.id === current && reachable.includes(to.id)) ||
          (to.id === current && reachable.includes(from.id));

        // 贝塞尔曲线控制点（让路径有弧度）
        const mx = (fx + tx) / 2;
        const my = (fy + ty) / 2;
        const dx = tx - fx;
        const dy = ty - fy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // 垂直偏移量，让曲线有弧度
        const curve = dist * 0.15;
        const cx = mx - dy / dist * curve;
        const cy = my + dx / dist * curve;

        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.quadraticCurveTo(cx, cy, tx, ty);

        if (isReachablePath) {
          ctx.strokeStyle = 'rgba(166, 33, 33, 0.6)';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = 'rgba(160, 130, 80, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // 路径方向箭头（在曲线中点附近）
        if (isReachablePath) {
          const t = 0.5;
          const ax = (1-t)*(1-t)*fx + 2*(1-t)*t*cx + t*t*tx;
          const ay = (1-t)*(1-t)*fy + 2*(1-t)*t*cy + t*t*ty;
          // 切线方向
          const tdx = 2*(1-t)*(cx-fx) + 2*t*(tx-cx);
          const tdy = 2*(1-t)*(cy-fy) + 2*t*(ty-cy);
          const angle = Math.atan2(tdy, tdx);

          ctx.save();
          ctx.translate(ax, ay);
          ctx.rotate(angle);
          ctx.fillStyle = 'rgba(166, 33, 33, 0.6)';
          ctx.beginPath();
          ctx.moveTo(8, 0);
          ctx.lineTo(-4, -4);
          ctx.lineTo(-4, 4);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      });
    },

    _drawNodes(ctx, s) {
      const { nodes, currentNodeId, visitedNodes, reachableNodes } = this.properties;
      const pulse = Math.sin(this.data._pulsePhase) * 0.5 + 0.5;

      nodes.forEach(node => {
        const x = node.x * s;
        const y = node.y * s;
        const typeConf = NODE_TYPES[node.type] || NODE_TYPES.story;
        const isCurrent = node.id === currentNodeId;
        const isVisited = visitedNodes.includes(node.id);
        const isReachable = reachableNodes.includes(node.id);
        const nodeRadius = 22 * s;

        // 可达节点脉冲光晕
        if (isReachable) {
          const glowRadius = nodeRadius + 8 + pulse * 6;
          const alpha = 0.15 + pulse * 0.15;
          ctx.beginPath();
          ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(166, 33, 33, ${alpha})`;
          ctx.fill();
        }

        // 当前节点光晕
        if (isCurrent) {
          ctx.beginPath();
          ctx.arc(x, y, nodeRadius + 10, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(166, 33, 33, 0.2)';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, y, nodeRadius + 5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(166, 33, 33, 0.15)';
          ctx.fill();
        }

        // 节点阴影
        ctx.beginPath();
        ctx.arc(x, y + 2, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fill();

        // 节点主体
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);

        if (isVisited && !isCurrent) {
          ctx.fillStyle = 'rgba(200, 190, 170, 0.7)';
        } else {
          ctx.fillStyle = '#fff';
        }
        ctx.fill();

        // 节点边框
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
        if (isCurrent) {
          ctx.strokeStyle = '#C41E3A';
          ctx.lineWidth = 2.5;
        } else if (isReachable) {
          ctx.strokeStyle = typeConf.color;
          ctx.lineWidth = 2;
        } else if (isVisited) {
          ctx.strokeStyle = 'rgba(160, 140, 100, 0.4)';
          ctx.lineWidth = 1;
        } else {
          ctx.strokeStyle = 'rgba(160, 140, 100, 0.3)';
          ctx.lineWidth = 1;
        }
        ctx.stroke();

        // 节点图标
        ctx.font = `${14 * s}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isVisited && !isCurrent ? 'rgba(100,90,70,0.5)' : '#2C2C2C';
        ctx.fillText(typeConf.icon, x, y);

        // 节点名称（在节点下方）
        ctx.font = `bold ${9 * s}px "PingFang SC", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = isCurrent ? '#C41E3A' : (isVisited ? 'rgba(100,90,70,0.5)' : '#54606B');
        ctx.fillText(node.title, x, y + nodeRadius + 12 * s);
      });
    },

    onCanvasTap(e) {
      const { nodes, reachableNodes } = this.properties;
      const s = this.data._scale;
      const touch = e.touches[0];

      // 获取canvas的屏幕位置
      const query = wx.createSelectorQuery().in(this);
      query.select('#mapCanvas').boundingClientRect(rect => {
        if (!rect) return;
        const tapX = touch.clientX - rect.left;
        const tapY = touch.clientY - rect.top;

        // 检测点击了哪个节点
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          const nx = node.x * s;
          const ny = node.y * s;
          const dist = Math.sqrt((tapX - nx) ** 2 + (tapY - ny) ** 2);
          const hitRadius = 28 * s; // 稍大的点击区域

          if (dist <= hitRadius) {
            if (reachableNodes.includes(node.id)) {
              this.triggerEvent('nodetap', { nodeId: node.id });
            }
            return;
          }
        }
      }).exec();
    }
  }
});
