// pages/home/home.js
const quotes = require('../../data/quotes.js');

Page({
  data: {
    quotes: quotes,
    currentQuote: 0,
    bookOpen: false,
    bookPage: 0,
    pageReady: false,
    ballX: 300,      // 初始横坐标
    ballY: 500,      // 初始纵坐标
    windowWidth: 375,
    windowHeight: 667,
    isDragging: false, // 新增状态

    chapters: [
      { name: '生平年表', page: 'timeline', icon: '📜' },
      { name: '书韵阅读', page: 'reader', icon: '📖' },
      { name: '物理之光', page: 'physics', icon: '⚛️' },
      { name: '影音流年', page: 'multimedia', icon: '🎞️' },
      { name: '与大先生对话', page: 'chat', icon: '💬' },
      { name: '关于', page: 'about', icon: 'ℹ️' }
    ]
  },

  onLoad() {
    // 获取系统信息用于拖拽边界计算
    try {
      const windowInfo = wx.getWindowInfo();
      this.setData({
        windowWidth: windowInfo.windowWidth,
        windowHeight: windowInfo.windowHeight,
        // 初始位置设在右下角附近（减去球体尺寸及边距）
        ballX: windowInfo.windowWidth - 70,
        ballY: windowInfo.windowHeight - 180,
        pageReady: true 
      });
    } catch (e) {
      // 容错处理：如果 getWindowInfo 不支持，可以使用旧 API 或默认值
      console.error("Failed to get window info", e);
      this.setData({ pageReady: true });
    }
    this.setData({ pageReady: true });
    this._startQuoteTimer();
    // 延迟执行确保在部分机型上生效
    setTimeout(() => wx.hideTabBar({ animation: false }), 150);
    setTimeout(() => wx.hideTabBar({ animation: false }), 400);
  },

  // 悬浮球拖拽逻辑
  handleBallStart() {
    this.setData({ isDragging: true });
  },

  handleBallMove(e) {
    const touch = e.touches[0];
    const ballSize = 56; // 对应 CSS 中的宽高 112rpx / 2
    
    let x = touch.clientX - ballSize / 2;
    let y = touch.clientY - ballSize / 2;

    // 边界检查
    if (x < 10) x = 10;
    if (x > this.data.windowWidth - ballSize - 10) x = this.data.windowWidth - ballSize - 10;
    if (y < 10) y = 10;
    if (y > this.data.windowHeight - ballSize - 10) y = this.data.windowHeight - ballSize - 10;

    this.setData({
      ballX: x,
      ballY: y
    });
  },

  handleBallEnd(e) {
    const ballSize = 56;
    const { windowWidth } = this.data;
    
    // 获取抬起时的最终坐标
    let x = this.data.ballX;
    
    // 判断吸附到左边还是右边
    // 如果 x 小于屏幕宽度的一半，吸附到左侧，否则吸附到右侧
    x = (x < windowWidth / 2 - ballSize / 2) ? 10 : (windowWidth - ballSize - 10);
    
    this.setData({
      isDragging: false, // 恢复 CSS 过渡
      ballX: x
    });
  },

  // 点击跳转
  handleBallTap() {
    wx.navigateTo({ url: '/pages/chat/chat' });
  },

  onShow() {
    // 返回首页时，书未翻开则确保底栏隐藏
    if (!this.data.bookOpen) {
      this._hideTabBar();
    }
  },

  _hideTabBar() {
    wx.hideTabBar({ animation: true, fail: () => {} });
    // 部分机型需要二次确认
    setTimeout(() => wx.hideTabBar({ animation: false, fail: () => {} }), 300);
  },

  _showTabBar() {
    wx.showTabBar({ animation: true, fail: () => {} });
  },

  _startQuoteTimer() {
    this._stopQuoteTimer();
    this._quoteTimer = setInterval(() => {
      const next = (this.data.currentQuote + 1) % this.data.quotes.length;
      this.setData({ currentQuote: next });
    }, 5000);
  },

  _stopQuoteTimer() {
    if (this._quoteTimer) {
      clearInterval(this._quoteTimer);
      this._quoteTimer = null;
    }
  },

  _book() {
    return this.selectComponent('#bookCover');
  },

  onPageChange(e) {
    const page = e.detail.page;
    const isOpen = page > 0;
    this.setData({ bookPage: page, bookOpen: isOpen });
    if (isOpen) {
      this._showTabBar();
    } else {
      this.setData({ directAccess: false });
      this._hideTabBar();
    }
  },

  onBarMap() {
    this._book().goToMap();
  },

  onBarReader() {
    this._book().goToReader();
  },

  onBarClose() {
    this._book().closeBook();
  },

  onBarExplore() {
    wx.navigateTo({ url: '/pages/grid-walking/grid-walking' });
  },

  onGridWalking() {
    wx.navigateTo({ url: '/pages/grid-walking/grid-walking' });
  },

  onBookChapterTap(e) {
    const page = e.detail.page;
    const tabPages = ['timeline', 'physics', 'reader', 'multimedia'];
    if (tabPages.includes(page)) {
      wx.switchTab({ url: `/pages/${page}/${page === 'physics' ? 'index' : page}` });
    } else {
      wx.navigateTo({ url: `/pages/${page}/${page}` });
    }
  },

  onModuleTap(e) {
    const page = e.currentTarget.dataset.page;
    const tabPages = ['home', 'timeline', 'physics', 'reader', 'multimedia'];
    if (tabPages.includes(page)) {
      wx.switchTab({ url: `/pages/${page}/${page === 'physics' ? 'index' : page}` });
    } else {
      wx.navigateTo({ url: `/pages/${page}/${page}` });
    }
  },
  goToChat() {
    wx.navigateTo({ url: '/pages/chat/chat' })
  }
});
