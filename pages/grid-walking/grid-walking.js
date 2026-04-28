// pages/grid-walking/grid-walking.js
const {
  MAP_WIDTH, MAP_HEIGHT, NODE_TYPES,
  nodes, edges, routes, contentMap
} = require('../../data/map-data.js');

Page({
  data: {
    // 地图数据
    nodes: nodes,
    nodeMap: {},
    canvasWidth: 350,
    canvasHeight: 513,

    // 游戏状态
    currentNodeId: 'start',
    currentNode: null,
    visitedNodes: ['start'],
    reachableNodes: [],
    routeHistory: ['start'],

    // 路线
    currentRoute: null,
    completedRoutes: [],
    availableRoutes: [],

    // UI状态
    panelVisible: true,
    showSummary: false,
    showRouteSelect: false,
    isEnd: false,

    // 节点信息
    nodeTypeIcon: '🚩',
    nodeTypeLabel: '起点',
    nodeTypeColor: '#4CAF50',
    contentBtnText: '查看内容',
    progressPercent: 0,
    totalProgressPercent: 0,
    allRoutesCompleted: false,
    completedRoutesInfo: []
  },

  onLoad(options) {
    // 构建节点映射
    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    // 计算画布尺寸
    const sysInfo = wx.getWindowInfo();
    const canvasWidth = sysInfo.windowWidth - 48; // 左右各24rpx padding
    const canvasHeight = Math.round(canvasWidth * MAP_HEIGHT / MAP_WIDTH);

    // 计算初始可达节点
    const reachable = this._getReachableNodes('start', []);

    // 加载保存的进度
    const saved = this._loadProgress();

    this.setData({
      nodeMap,
      canvasWidth,
      canvasHeight,
      reachableNodes: reachable,
      currentRoute: null,
      completedRoutes: saved.completedRoutes || [],
      visitedNodes: saved.visitedNodes || ['start']
    });

    // 显示路线选择
    this._updateAvailableRoutes();
    this.setData({ showRouteSelect: true });
  },

  // 获取可达节点（当前节点的直接邻居）
  _getReachableNodes(nodeId, visited) {
    const reachable = [];
    edges.forEach(edge => {
      if (edge.from === nodeId && !visited.includes(edge.to)) {
        reachable.push(edge.to);
      }
      // 双向通行：如果边的目标是当前节点，且来源未访问
      if (edge.to === nodeId && !visited.includes(edge.from)) {
        reachable.push(edge.from);
      }
    });
    return [...new Set(reachable)];
  },

  // 获取节点类型信息
  _getNodeType(node) {
    const conf = NODE_TYPES[node.type] || NODE_TYPES.story;
    return {
      icon: conf.icon,
      label: conf.label,
      color: conf.color
    };
  },

  // 更新内容按钮文本
  _updateContentBtnText(node) {
    if (!node.contentId) return '';
    const mapping = contentMap[node.contentId];
    if (!mapping) return '查看内容';

    switch (mapping.type) {
      case 'reader': return '进入阅读';
      case 'timeline': return '查看年表';
      case 'physics': return '体验实验';
      default: return '查看内容';
    }
  },

  // 更新可用路线
  _updateAvailableRoutes() {
    const { completedRoutes } = this.data;
    const available = routes.map(r => ({
      ...r,
      completed: completedRoutes.includes(r.id)
    }));
    const allCompleted = available.every(r => r.completed);
    this.setData({
      availableRoutes: available,
      allRoutesCompleted: allCompleted
    });
  },

  // 保存进度
  _saveProgress() {
    const { visitedNodes, completedRoutes } = this.data;
    try {
      wx.setStorageSync('grid_walking_progress', {
        visitedNodes,
        completedRoutes,
        lastUpdate: Date.now()
      });
    } catch (e) {
      console.warn('保存走格子进度失败', e);
    }
  },

  // 加载进度
  _loadProgress() {
    try {
      return wx.getStorageSync('grid_walking_progress') || {};
    } catch (e) {
      return {};
    }
  },

  // === 事件处理 ===

  // 节点点击
  onNodeTap(e) {
    const { nodeId } = e.detail;
    const { currentNodeId, visitedNodes, nodeMap, currentRoute } = this.data;

    // 验证是否可达
    const reachable = this._getReachableNodes(currentNodeId, visitedNodes);
    if (!reachable.includes(nodeId)) return;

    // 移动到新节点
    const newVisited = [...visitedNodes, nodeId];
    const newHistory = [...this.data.routeHistory, nodeId];
    const node = nodeMap[nodeId];
    const typeInfo = this._getNodeType(node);
    const newReachable = this._getReachableNodes(nodeId, newVisited);
    const isEnd = node.type === 'end';

    // 检查是否在路线中
    let routeComplete = false;
    if (currentRoute && isEnd) {
      routeComplete = true;
    }

    this.setData({
      currentNodeId: nodeId,
      currentNode: node,
      visitedNodes: newVisited,
      reachableNodes: newReachable,
      routeHistory: newHistory,
      isEnd,
      nodeTypeIcon: typeInfo.icon,
      nodeTypeLabel: typeInfo.label,
      nodeTypeColor: typeInfo.color,
      contentBtnText: this._updateContentBtnText(node),
      progressPercent: Math.round(newVisited.length / nodes.length * 100)
    });

    // 保存进度
    this._saveProgress();

    // 如果到达终点，标记路线完成
    if (routeComplete) {
      const completedRoutes = [...this.data.completedRoutes, currentRoute.id];
      this.setData({
        completedRoutes,
        totalProgressPercent: Math.round(newVisited.length / nodes.length * 100)
      });
      this._updateAvailableRoutes();
      this._saveProgress();
    }
  },

  // 查看内容
  onViewContent() {
    const { currentNode, nodeMap } = this.data;
    if (!currentNode || !currentNode.contentId) return;

    const mapping = contentMap[currentNode.contentId];
    if (!mapping) return;

    switch (mapping.type) {
      case 'reader':
        wx.navigateTo({
          url: `/pages/reader/reader?chapter=${mapping.chapterId}`
        });
        break;
      case 'timeline':
        wx.switchTab({
          url: '/pages/timeline/timeline'
        });
        break;
      case 'physics':
        if (mapping.experiment === 'parity') {
          wx.navigateTo({
            url: '/pages/physics/exp-parity/exp-parity'
          });
        } else if (mapping.experiment === 'diffusion') {
          wx.navigateTo({
            url: '/pages/physics/exp-diffusion/exp-diffusion'
          });
        } else {
          wx.switchTab({
            url: '/pages/physics/index'
          });
        }
        break;
      default:
        wx.showToast({ title: '内容开发中', icon: 'none' });
    }
  },

  // 显示摘要
  onShowSummary() {
    const { visitedNodes, currentRoute, completedRoutes } = this.data;
    const completedRoutesInfo = routes
      .filter(r => completedRoutes.includes(r.id))
      .map(r => ({ id: r.id, name: r.name, color: r.color }));

    this.setData({
      showSummary: true,
      totalProgressPercent: Math.round(visitedNodes.length / nodes.length * 100),
      completedRoutesInfo
    });
  },

  // 关闭摘要
  onCloseSummary() {
    this.setData({ showSummary: false });
  },

  // 重新开始
  onRestart() {
    this.setData({ showSummary: false });

    if (this.data.allRoutesCompleted) {
      // 所有路线完成，回到首页
      wx.showToast({ title: '恭喜完成所有探索！', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/home/home' });
      }, 1500);
      return;
    }

    // 显示路线选择
    this._updateAvailableRoutes();
    this.setData({ showRouteSelect: true });
  },

  // 选择路线
  onSelectRoute(e) {
    const routeId = e.currentTarget.dataset.routeId;
    const route = routes.find(r => r.id === routeId);
    if (!route) return;

    // 如果该路线已完成，不允许再选
    if (this.data.completedRoutes.includes(routeId)) {
      wx.showToast({ title: '该路线已完成', icon: 'none' });
      return;
    }

    // 重置游戏状态，开始新路线
    const reachable = this._getReachableNodes('start', ['start']);

    this.setData({
      currentNodeId: 'start',
      currentNode: nodes[0],
      visitedNodes: ['start'],
      reachableNodes: reachable,
      routeHistory: ['start'],
      currentRoute: route,
      isEnd: false,
      showRouteSelect: false,
      nodeTypeIcon: NODE_TYPES.start.icon,
      nodeTypeLabel: NODE_TYPES.start.label,
      nodeTypeColor: NODE_TYPES.start.color,
      contentBtnText: '',
      progressPercent: Math.round(1 / nodes.length * 100)
    });
  },

  // 关闭路线选择
  onCloseRouteSelect() {
    // 如果没有选择路线，不允许关闭
    if (!this.data.currentRoute) {
      wx.showToast({ title: '请先选择一条路线', icon: 'none' });
      return;
    }
    this.setData({ showRouteSelect: false });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '我在「健雄书韵」探索吴健雄的足迹，快来试试吧！',
      path: '/pages/grid-walking/grid-walking'
    };
  }
});
