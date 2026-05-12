// pages/grid-walking/grid-walking.js
const {
  MAP_WIDTH, MAP_HEIGHT, START_NODE_ID, NODE_TYPES,
  nodes, edges, routes, contentMap
} = require('../../data/map-data.js');
const chapterIndex = require('../../data/chapters/index.js');
const timelineData = require('../../data/timeline.js');

// 预建章节映射 { ch01: require('./ch01.js'), ... }
const chapterModules = {};
const chapterIds = ['ch00','ch01','ch02','ch03','ch04','ch05','ch06','ch07','ch08','ch09'];
chapterIds.forEach(id => {
  try { chapterModules[id] = require('../../data/chapters/' + id + '.js'); } catch(e) {}
});

Page({
  data: {
    nodes: nodes,
    nodeMap: {},
    canvasWidth: 350,
    canvasHeight: 513,

    currentNodeId: START_NODE_ID,
    currentNode: null,
    visitedNodes: [START_NODE_ID],
    reachableNodes: [],
    routeHistory: [START_NODE_ID],

    currentRoute: null,
    completedRoutes: [],
    availableRoutes: [],

    panelVisible: true,
    showSummary: false,
    showRouteSelect: false,
    isEnd: false,

    nodeTypeIcon: '🚩',
    nodeTypeLabel: '起点',
    nodeTypeColor: '#4CAF50',
    contentBtnText: '查看内容',
    progressPercent: 0,
    totalProgressPercent: 0,
    allRoutesCompleted: false,
    completedRoutesInfo: [],

    // 内容内嵌弹窗
    showContentModal: false,
    contentModalTitle: '',
    contentModalBody: [],
    // 存放解析后的真实地图背景图路径
    bgImageTempPath: ''
  },

  onLoad(options) {
    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    const sysInfo = wx.getWindowInfo();
    const canvasWidth = sysInfo.windowWidth - 48;
    const canvasHeight = Math.round(canvasWidth * MAP_HEIGHT / MAP_WIDTH);

    const reachable = this._getReachableNodes(START_NODE_ID);
    const saved = this._normalizeProgress(this._loadProgress(), nodeMap);
    const startNode = nodeMap[START_NODE_ID] || nodes[0];

    this.setData({
      nodeMap, canvasWidth, canvasHeight,
      reachableNodes: reachable,
      currentRoute: null,
      currentNodeId: START_NODE_ID,
      currentNode: startNode,
      completedRoutes: saved.completedRoutes || [],
      visitedNodes: saved.visitedNodes || [START_NODE_ID],
      routeHistory: saved.routeHistory || [START_NODE_ID],
      progressPercent: Math.round(1 / nodes.length * 100)
    });

    this._updateAvailableRoutes();
    this.setData({ showRouteSelect: true });
    // 底栏隐藏（加延迟确保生效）
    setTimeout(() => { wx.hideTabBar({ animation: false }); }, 100);
    // 在 onLoad 的最后调用获取云端图片的方法
    this._loadCloudMapImage(); 
  },

  // 处理云端图片下载的核心方法
  _loadCloudMapImage() {
    const cloudFileId = 'cloud://cloud1-d1g022q9nafce6169.636c-cloud1-d1g022q9nafce6169-1426049260/map/map.jpg'; // 链接

    // 使用 downloadFile 获取本地临时路径，这对于 Canvas 绘制是最稳定的
    wx.cloud.downloadFile({
      fileID: cloudFileId,
      success: res => {
        if (res.statusCode === 200) {
          // 获取到类似 http://tmp/... 的临时本地路径
          this.setData({
            bgImageTempPath: res.tempFilePath
          });
        }
      },
      fail: err => {
        console.error('地图背景下载失败', err);
        wx.showToast({ title: '地图加载失败', icon: 'error' });
      }
    });
  },

  onShow() {
    // 返回本页时确保底栏隐藏
    wx.hideTabBar({ animation: false });
  },

  /* ======== 核心逻辑 ======== */

  _getReachableNodes(nodeId) {
    const reachable = [];
    edges.forEach(edge => {
      if (edge.from === nodeId) reachable.push(edge.to);
      if (edge.to === nodeId) reachable.push(edge.from);
    });
    return [...new Set(reachable)];
  },

  _getNodeType(node) {
    const conf = NODE_TYPES[node.type] || NODE_TYPES.story;
    return { icon: conf.icon, label: conf.label, color: conf.color };
  },

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

  _updateAvailableRoutes() {
    const { completedRoutes, currentRoute } = this.data;
    const currentRouteId = currentRoute ? currentRoute.id : '';
    const available = routes.map(r => ({
      ...r,
      completed: completedRoutes.includes(r.id),
      selected: r.id === currentRouteId
    }));
    const allCompleted = available.every(r => r.completed);
    this.setData({ availableRoutes: available, allRoutesCompleted: allCompleted });
  },

  _saveProgress() {
    try {
      wx.setStorageSync('grid_walking_progress', {
        visitedNodes: this.data.visitedNodes,
        completedRoutes: this.data.completedRoutes,
        lastUpdate: Date.now()
      });
    } catch (e) { /* ignore */ }
  },

  _loadProgress() {
    try { return wx.getStorageSync('grid_walking_progress') || {}; } catch (e) { return {}; }
  },

  _normalizeProgress(saved, nodeMap) {
    const validRouteIds = routes.map(r => r.id);
    const visitedNodes = Array.isArray(saved.visitedNodes)
      ? saved.visitedNodes.filter(id => nodeMap[id])
      : [];
    const completedRoutes = Array.isArray(saved.completedRoutes)
      ? saved.completedRoutes.filter(id => validRouteIds.includes(id))
      : [];

    return {
      visitedNodes: visitedNodes.length ? visitedNodes : [START_NODE_ID],
      routeHistory: [START_NODE_ID],
      completedRoutes
    };
  },

  /* ======== 事件处理 ======== */

  onNodeTap(e) {
    const { nodeId } = e.detail;
    const { currentNodeId, visitedNodes, nodeMap, currentRoute } = this.data;

    const reachable = this._getReachableNodes(currentNodeId);
    if (!reachable.includes(nodeId)) return;

    const newVisited = visitedNodes.includes(nodeId)
      ? visitedNodes
      : [...visitedNodes, nodeId];
    const newHistory = [...this.data.routeHistory, nodeId];
    const node = nodeMap[nodeId];
    const typeInfo = this._getNodeType(node);
    const newReachable = this._getReachableNodes(nodeId);
    const isEnd = node.type === 'end';

    let routeComplete = false;
    if (currentRoute && isEnd) routeComplete = true;

    this.setData({
      currentNodeId: nodeId, currentNode: node,
      visitedNodes: newVisited, reachableNodes: newReachable,
      routeHistory: newHistory, isEnd,
      nodeTypeIcon: typeInfo.icon, nodeTypeLabel: typeInfo.label, nodeTypeColor: typeInfo.color,
      contentBtnText: this._updateContentBtnText(node),
      progressPercent: Math.round(newVisited.length / nodes.length * 100)
    });

    this._saveProgress();

    if (routeComplete) {
      const completedRoutes = this.data.completedRoutes.includes(currentRoute.id)
        ? this.data.completedRoutes
        : [...this.data.completedRoutes, currentRoute.id];
      this.setData({
        completedRoutes,
        totalProgressPercent: Math.round(newVisited.length / nodes.length * 100)
      });
      this._updateAvailableRoutes();
      this._saveProgress();
    }
  },

  // 查看内容 → 内嵌弹窗（不走 switchTab）
  onViewContent() {
    const { currentNode } = this.data;
    if (!currentNode || !currentNode.contentId) return;

    const mapping = contentMap[currentNode.contentId];
    if (!mapping) return;

    switch (mapping.type) {
      case 'reader':
        this._showReaderModal(mapping.chapterId);
        break;
      case 'timeline':
        this._showTimelineModal(mapping.year);
        break;
      case 'physics':
        wx.hideTabBar({ animation: false });
        if (mapping.experiment === 'parity') {
          wx.navigateTo({ url: '/pages/physics/exp-parity/exp-parity' });
        } else if (mapping.experiment === 'diffusion') {
          wx.navigateTo({ url: '/pages/physics/exp-diffusion/exp-diffusion' });
        } else if (mapping.experiment === 'entanglement') {
          wx.navigateTo({ url: '/pages/physics/exp-entanglement/exp-entanglement' });
        } else {
          wx.showToast({ title: '实验内容开发中', icon: 'none' });
        }
        break;
      default:
        wx.showToast({ title: '内容开发中', icon: 'none' });
    }
  },

  // 关闭内容弹窗
  onCloseContentModal() {
    this.setData({ showContentModal: false });
  },

  // 内嵌阅读弹窗
  _showReaderModal(chapterId) {
    const chNum = String(chapterId);
    // chapterId 是数字 1,2,3..., 对应 ch01, ch02...
    const chId = 'ch' + (chNum.length === 1 ? '0' : '') + chNum;
    const meta = chapterIndex.find(c => c.id === chId);
    const chModule = chapterModules[chId];

    const title = meta ? meta.title : '阅读';
    const body = [];

    if (chModule && chModule.sections) {
      chModule.sections.forEach(sec => {
        body.push({ type: 'heading', text: sec.title });
        if (sec.paragraphs) {
          sec.paragraphs.forEach(p => { body.push({ type: 'text', text: p }); });
        }
      });
    } else {
      body.push({ type: 'text', text: '该章节内容尚未加载，请通过阅读模块查看。' });
    }

    this.setData({
      showContentModal: true,
      contentModalTitle: title,
      contentModalBody: body.slice(0, 60) // 限制条目数
    });
  },

  // 内嵌年表弹窗
  _showTimelineModal(year) {
    const entries = timelineData.filter(t => t.year >= year && t.year < year + 10);
    const body = entries.length > 0
      ? entries.map(e => ({ type: 'timeline', year: e.year, title: e.title, detail: e.detail, icon: e.icon }))
      : [{ type: 'text', text: '该年份附近暂无年表数据。' }];

    this.setData({
      showContentModal: true,
      contentModalTitle: year + '年前后 · 年表',
      contentModalBody: body
    });
  },

  // 摘要
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

  onCloseSummary() {
    this.setData({ showSummary: false });
  },

  onRestart() {
    this.setData({ showSummary: false });
    if (this.data.allRoutesCompleted) {
      wx.showToast({ title: '恭喜完成所有探索！', icon: 'success' });
      setTimeout(() => { wx.switchTab({ url: '/pages/home/home' }); }, 1500);
      return;
    }
    this._updateAvailableRoutes();
    this.setData({ showRouteSelect: true });
  },

  // 选择路线 — 已完成路线也能重新体验
  onSelectRoute(e) {
    const routeId = e.currentTarget.dataset.routeId;
    const route = routes.find(r => r.id === routeId);
    if (!route) return;

    const reachable = this._getReachableNodes(START_NODE_ID);
    const startNode = this.data.nodeMap[START_NODE_ID] || nodes[0];
    this.setData({
      currentNodeId: START_NODE_ID, currentNode: startNode,
      visitedNodes: [START_NODE_ID], reachableNodes: reachable,
      routeHistory: [START_NODE_ID], currentRoute: route, isEnd: false,
      showRouteSelect: false,
      nodeTypeIcon: NODE_TYPES.start.icon,
      nodeTypeLabel: NODE_TYPES.start.label,
      nodeTypeColor: NODE_TYPES.start.color,
      contentBtnText: '',
      progressPercent: Math.round(1 / nodes.length * 100)
    });
    this._updateAvailableRoutes();
  },

  onCloseRouteSelect() {
    if (!this.data.currentRoute) {
      wx.showToast({ title: '请先选择一条路线', icon: 'none' });
      return;
    }
    this.setData({ showRouteSelect: false });
  },

  onShareAppMessage() {
    return {
      title: '我在「钴光拾遗」探索吴健雄的足迹，快来试试吧！',
      path: '/pages/grid-walking/grid-walking'
    };
  }
});
