// components/map-canvas/map-canvas.js
const { MAP_IMAGE, MAP_WIDTH, MAP_HEIGHT, START_NODE_ID, NODE_TYPES, edges } = require('../../data/map-data.js');

Component({
  properties: {
    nodes: { type: Array, value: [] },
    currentNodeId: { type: String, value: START_NODE_ID },
    visitedNodes: { type: Array, value: [] },
    reachableNodes: { type: Array, value: [] },
    currentRoute: { type: Object, value: null },
    routeHistory: { type: Array, value: [] },
    canvasWidth: { type: Number, value: 350 },
    canvasHeight: { type: Number, value: 513 }
  },

  data: {
    _canvas: null,
    _ctx: null,
    _mapImage: null,
    _mapImageReady: false,
    _canvasRect: null,
    _dpr: 1,
    _scaleX: 1,
    _scaleY: 1,
    _zoom: 1,
    _minZoom: 1,
    _maxZoom: 3,
    _offsetX: 0,
    _offsetY: 0,
    _lastTouch: null,
    _gestureMoved: false,
    _tapSuppressed: false,
    _animFrame: 0,
    _pulsePhase: 0,
    _pathReveal: 1,
    _lastSegmentKey: ''
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
    'nodes, currentNodeId, visitedNodes, reachableNodes, currentRoute, routeHistory': function() {
      this._preparePathReveal();
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
          this.data._scaleX = this.data.canvasWidth / MAP_WIDTH;
          this.data._scaleY = this.data.canvasHeight / MAP_HEIGHT;

          this._refreshCanvasRect();
          this._loadMapImage(canvas);
          this._draw();
          this._startPulseAnimation();
        });
    },

    _loadMapImage(canvas) {
      const image = canvas.createImage();
      image.onload = () => {
        this.data._mapImage = image;
        this.data._mapImageReady = true;
        this._draw();
      };
      image.onerror = () => {
        this.data._mapImage = null;
        this.data._mapImageReady = false;
        this._draw();
      };
      image.src = MAP_IMAGE;
    },

    _refreshCanvasRect() {
      const query = wx.createSelectorQuery().in(this);
      query.select('#mapCanvas').boundingClientRect(rect => {
        if (rect) this.data._canvasRect = rect;
      }).exec();
    },

    _startPulseAnimation() {
      this._animTimer = setInterval(() => {
        this.data._pulsePhase = (this.data._pulsePhase + 0.08) % (Math.PI * 2);
        if (this.data._pathReveal < 1) {
          this.data._pathReveal = Math.min(1, this.data._pathReveal + 0.085);
        }
        if (this.data._ctx) this._draw();
      }, 50);
    },

    _preparePathReveal() {
      const history = this.properties.routeHistory || [];
      if (history.length < 2) return;
      const from = history[history.length - 2];
      const to = history[history.length - 1];
      const key = `${from}->${to}`;
      if (key !== this.data._lastSegmentKey) {
        this.data._lastSegmentKey = key;
        this.data._pathReveal = 0;
      }
    },

    _draw() {
      const ctx = this.data._ctx;
      const w = this.data.canvasWidth;
      const h = this.data.canvasHeight;
      const scaleX = this.data._scaleX;
      const scaleY = this.data._scaleY;

      ctx.clearRect(0, 0, w, h);
      this._drawBackground(ctx, w, h);
      this._drawEdges(ctx, scaleX, scaleY);
      this._drawNodes(ctx, scaleX, scaleY);
    },

    _drawBackground(ctx, w, h) {
      if (this.data._mapImageReady && this.data._mapImage) {
        ctx.drawImage(
          this.data._mapImage,
          this.data._offsetX,
          this.data._offsetY,
          w * this.data._zoom,
          h * this.data._zoom
        );
        return;
      }

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

    _drawEdges(ctx, scaleX, scaleY) {
      const nodeMap = {};
      this.properties.nodes.forEach(n => { nodeMap[n.id] = n; });
      const routeEdgeKeys = this._getRouteEdgeKeys();
      const historyEdgeKeys = this._getHistoryEdgeKeys();

      edges.forEach(edge => {
        const from = nodeMap[edge.from];
        const to = nodeMap[edge.to];
        if (!from || !to) return;

        const key = this._edgeKey(from.id, to.id);
        const routeOn = routeEdgeKeys[key];
        const historyOn = historyEdgeKeys[key];
        const isLastSegment = this._isLastSegment(from.id, to.id);
        const reachable = this.properties.reachableNodes;
        const current = this.properties.currentNodeId;
        const isReachablePath =
          (from.id === current && reachable.includes(to.id)) ||
          (to.id === current && reachable.includes(from.id));

        if (!routeOn && !historyOn && !isReachablePath) {
          this._drawTreasureEdge(ctx, from, to, scaleX, scaleY, {
            stroke: 'rgba(92, 70, 44, 0.18)',
            width: 1.4,
            dash: [2, 8],
            progress: 1
          });
          return;
        }

        if (routeOn) {
          this._drawTreasureEdge(ctx, from, to, scaleX, scaleY, {
            stroke: 'rgba(255, 250, 238, 0.82)',
            width: 6.8,
            dash: [],
            progress: 1
          });
          this._drawTreasureEdge(ctx, from, to, scaleX, scaleY, {
            stroke: 'rgba(118, 76, 34, 0.82)',
            width: 3.8,
            dash: [8, 9],
            progress: 1
          });
        }

        if (isReachablePath && !historyOn) {
          this._drawTreasureEdge(ctx, from, to, scaleX, scaleY, {
            stroke: 'rgba(255, 250, 238, 0.9)',
            width: 7.4,
            dash: [],
            progress: 1
          });
          this._drawTreasureEdge(ctx, from, to, scaleX, scaleY, {
            stroke: 'rgba(166, 33, 33, 0.86)',
            width: 4.2,
            dash: [9, 8],
            progress: 1
          });
        }

        if (historyOn) {
          this._drawTreasureEdge(ctx, from, to, scaleX, scaleY, {
            stroke: 'rgba(255, 246, 228, 0.95)',
            width: 8.4,
            dash: [],
            progress: isLastSegment ? this.data._pathReveal : 1
          });
          this._drawTreasureEdge(ctx, from, to, scaleX, scaleY, {
            stroke: 'rgba(166, 33, 33, 0.95)',
            width: 5,
            dash: [10, 7],
            progress: isLastSegment ? this.data._pathReveal : 1,
            drawMarks: true
          });
        }
      });
    },

    _drawTreasureEdge(ctx, from, to, scaleX, scaleY, options) {
      const fromPos = this._mapToScreen(from.x, from.y, scaleX, scaleY);
      const toPos = this._mapToScreen(to.x, to.y, scaleX, scaleY);
      const fx = fromPos.x;
      const fy = fromPos.y;
      const tx = toPos.x;
      const ty = toPos.y;
      const mx = (fx + tx) / 2;
      const my = (fy + ty) / 2;
      const dx = tx - fx;
      const dy = ty - fy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (!dist) return;

      const curve = dist * 0.18;
      const cx = mx - dy / dist * curve;
      const cy = my + dx / dist * curve;
      const rawProgress = typeof options.progress === 'number' ? options.progress : 1;
      const progress = Math.max(0, Math.min(1, rawProgress));

      ctx.save();
      ctx.strokeStyle = options.stroke;
      ctx.lineWidth = options.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash(options.dash || []);
      ctx.beginPath();
      this._drawPartialQuadratic(ctx, fx, fy, cx, cy, tx, ty, progress);
      ctx.stroke();
      ctx.setLineDash([]);

      if (options.drawMarks && progress > 0.15) {
        this._drawRouteMarks(ctx, fx, fy, cx, cy, tx, ty, progress, options.stroke);
      }
      ctx.restore();
    },

    _drawPartialQuadratic(ctx, fx, fy, cx, cy, tx, ty, progress) {
      const steps = Math.max(2, Math.ceil(26 * progress));
      ctx.moveTo(fx, fy);
      for (let i = 1; i <= steps; i++) {
        const t = progress * i / steps;
        const p = this._quadraticPoint(fx, fy, cx, cy, tx, ty, t);
        ctx.lineTo(p.x, p.y);
      }
    },

    _drawRouteMarks(ctx, fx, fy, cx, cy, tx, ty, progress, color) {
      const marks = [0.34, 0.67];
      marks.forEach(t => {
        if (t > progress) return;
        const p = this._quadraticPoint(fx, fy, cx, cy, tx, ty, t);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(Math.sin(t * 12) * 0.6);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-3, -3);
        ctx.lineTo(3, 3);
        ctx.moveTo(3, -3);
        ctx.lineTo(-3, 3);
        ctx.stroke();
        ctx.restore();
      });
    },

    _quadraticPoint(fx, fy, cx, cy, tx, ty, t) {
      const a = (1 - t) * (1 - t);
      const b = 2 * (1 - t) * t;
      const c = t * t;
      return {
        x: a * fx + b * cx + c * tx,
        y: a * fy + b * cy + c * ty
      };
    },

    _getRouteEdgeKeys() {
      const keys = {};
      const route = this.properties.currentRoute;
      const routeNodes = route && route.nodes ? route.nodes : [];
      for (let i = 1; i < routeNodes.length; i++) {
        keys[this._edgeKey(routeNodes[i - 1], routeNodes[i])] = true;
      }
      return keys;
    },

    _getHistoryEdgeKeys() {
      const keys = {};
      const history = this.properties.routeHistory || [];
      for (let i = 1; i < history.length; i++) {
        keys[this._edgeKey(history[i - 1], history[i])] = true;
      }
      return keys;
    },

    _edgeKey(a, b) {
      return [a, b].sort().join('__');
    },

    _isLastSegment(a, b) {
      const history = this.properties.routeHistory || [];
      if (history.length < 2) return false;
      return this._edgeKey(history[history.length - 2], history[history.length - 1]) === this._edgeKey(a, b);
    },

    _drawNodes(ctx, scaleX, scaleY) {
      const { nodes, currentNodeId, visitedNodes, reachableNodes } = this.properties;
      const pulse = Math.sin(this.data._pulsePhase) * 0.5 + 0.5;
      const s = Math.min(scaleX, scaleY) * this.data._zoom;

      nodes.forEach(node => {
        const pos = this._mapToScreen(node.x, node.y, scaleX, scaleY);
        const x = pos.x;
        const y = pos.y;
        const typeConf = NODE_TYPES[node.type] || NODE_TYPES.story;
        const isCurrent = node.id === currentNodeId;
        const isVisited = visitedNodes.includes(node.id);
        const isReachable = reachableNodes.includes(node.id);
        const nodeRadius = 22 * s;
        const labelFontSize = Math.max(10, 9 * s);
        const labelY = y + nodeRadius + 13 * s;
        const labelWidth = Math.max(48, node.title.length * labelFontSize + 18);
        const labelHeight = Math.max(20, labelFontSize + 10);

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
        ctx.ellipse(x, y + nodeRadius * 0.72, nodeRadius * 0.72, nodeRadius * 0.32, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(35, 24, 16, 0.18)';
        ctx.fill();

        // 节点主体
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);

        const fillGrad = ctx.createRadialGradient(
          x - nodeRadius * 0.35, y - nodeRadius * 0.35, nodeRadius * 0.1,
          x, y, nodeRadius
        );
        fillGrad.addColorStop(0, '#ffffff');
        fillGrad.addColorStop(1, isVisited && !isCurrent ? 'rgba(234, 224, 206, 0.92)' : '#fff7eb');
        ctx.fillStyle = fillGrad;
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

        ctx.beginPath();
        ctx.arc(x - nodeRadius * 0.28, y - nodeRadius * 0.3, nodeRadius * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
        ctx.fill();

        // 节点图标
        ctx.font = `${14 * s}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isVisited && !isCurrent ? 'rgba(100,90,70,0.5)' : '#2C2C2C';
        ctx.fillText(typeConf.icon, x, y);

        // 节点名称（在节点下方）
        ctx.beginPath();
        const labelX = x - labelWidth / 2;
        const labelTop = labelY - labelHeight / 2;
        this._roundRect(ctx, labelX, labelTop, labelWidth, labelHeight, 8);
        ctx.fillStyle = isCurrent
          ? 'rgba(255, 250, 244, 0.94)'
          : 'rgba(255, 255, 255, 0.78)';
        ctx.fill();
        ctx.strokeStyle = isCurrent ? 'rgba(166, 33, 33, 0.22)' : 'rgba(84, 96, 107, 0.10)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = `bold ${labelFontSize}px "PingFang SC", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isCurrent ? '#C41E3A' : (isVisited ? 'rgba(100,90,70,0.5)' : '#54606B');
        ctx.fillText(node.title, x, labelY);
      });
    },

    _mapToScreen(x, y, scaleX, scaleY) {
      return {
        x: x * scaleX * this.data._zoom + this.data._offsetX,
        y: y * scaleY * this.data._zoom + this.data._offsetY
      };
    },

    _roundRect(ctx, x, y, w, h, r) {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    },

    _clampView() {
      const w = this.data.canvasWidth;
      const h = this.data.canvasHeight;
      const zoom = Math.max(this.data._minZoom, Math.min(this.data._maxZoom, this.data._zoom));
      const scaledW = w * zoom;
      const scaledH = h * zoom;
      const minX = Math.min(0, w - scaledW);
      const minY = Math.min(0, h - scaledH);

      this.data._zoom = zoom;
      this.data._offsetX = Math.max(minX, Math.min(0, this.data._offsetX));
      this.data._offsetY = Math.max(minY, Math.min(0, this.data._offsetY));
    },

    _getTouchDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    },

    _getTouchCenter(touches) {
      const rect = this.data._canvasRect;
      const clientX = (touches[0].clientX + touches[1].clientX) / 2;
      const clientY = (touches[0].clientY + touches[1].clientY) / 2;
      return {
        x: rect ? clientX - rect.left : clientX,
        y: rect ? clientY - rect.top : clientY
      };
    },

    onTouchStart(e) {
      const touches = e.touches || [];
      this.data._gestureMoved = false;
      this.data._tapSuppressed = false;

      if (touches.length === 1) {
        this.data._lastTouch = {
          mode: 'pan',
          x: touches[0].clientX,
          y: touches[0].clientY
        };
      } else if (touches.length >= 2) {
        this._refreshCanvasRect();
        this.data._lastTouch = {
          mode: 'pinch',
          distance: this._getTouchDistance(touches),
          center: this._getTouchCenter(touches),
          zoom: this.data._zoom,
          offsetX: this.data._offsetX,
          offsetY: this.data._offsetY
        };
        this.data._tapSuppressed = true;
      }
    },

    onTouchMove(e) {
      const touches = e.touches || [];
      const last = this.data._lastTouch;
      if (!last || touches.length === 0) return;

      if (touches.length === 1 && last.mode === 'pan') {
        const dx = touches[0].clientX - last.x;
        const dy = touches[0].clientY - last.y;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          this.data._gestureMoved = true;
          this.data._tapSuppressed = true;
        }
        this.data._offsetX += dx;
        this.data._offsetY += dy;
        this.data._lastTouch = {
          mode: 'pan',
          x: touches[0].clientX,
          y: touches[0].clientY
        };
        this._clampView();
        this._draw();
      } else if (touches.length >= 2) {
        const distance = this._getTouchDistance(touches);
        const center = this._getTouchCenter(touches);
        if (!last.distance) return;

        const nextZoom = last.zoom * distance / last.distance;
        const clampedZoom = Math.max(this.data._minZoom, Math.min(this.data._maxZoom, nextZoom));
        const prevZoom = last.zoom;
        const anchorX = center.x - last.offsetX;
        const anchorY = center.y - last.offsetY;
        const zoomRatio = clampedZoom / prevZoom;

        this.data._gestureMoved = true;
        this.data._tapSuppressed = true;
        this.data._zoom = clampedZoom;
        this.data._offsetX = center.x - anchorX * zoomRatio;
        this.data._offsetY = center.y - anchorY * zoomRatio;
        this._clampView();
        this._draw();
      }
    },

    onTouchEnd(e) {
      const touches = e.touches || [];
      if (touches.length === 0) {
        this.data._lastTouch = null;
        setTimeout(() => { this.data._tapSuppressed = false; }, 80);
      } else if (touches.length === 1) {
        this.data._lastTouch = {
          mode: 'pan',
          x: touches[0].clientX,
          y: touches[0].clientY
        };
      }
    },

    onCanvasTap(e) {
      if (this.data._tapSuppressed || this.data._gestureMoved) return;
      const { nodes, reachableNodes } = this.properties;
      const scaleX = this.data._scaleX;
      const scaleY = this.data._scaleY;
      const s = Math.min(scaleX, scaleY) * this.data._zoom;
      const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
      if (!touch) return;

      // 获取canvas的屏幕位置
      const query = wx.createSelectorQuery().in(this);
      query.select('#mapCanvas').boundingClientRect(rect => {
        if (!rect) return;
        const tapX = touch.clientX - rect.left;
        const tapY = touch.clientY - rect.top;

        // 检测点击了哪个节点
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          const pos = this._mapToScreen(node.x, node.y, scaleX, scaleY);
          const nx = pos.x;
          const ny = pos.y;
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
