// pages/home/home.js
const quotes = require('../../data/quotes.js');

Page({
  data: {
    quotes: quotes,
    currentQuote: 0,
    bookOpen: false,
    bookPage: 0,
    pageReady: false,
  
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
    this.setData({ pageReady: true });
    this._startQuoteTimer();
    // 延迟执行确保在部分机型上生效
    setTimeout(() => wx.hideTabBar({ animation: false }), 150);
    setTimeout(() => wx.hideTabBar({ animation: false }), 400);
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
