// pages/home/home.js
const quotes = require('../../data/quotes.js');

Page({
  data: {
    quotes: quotes,
    currentQuote: 0,
    bookOpen: false,
    pageReady: false,
    // 首页菜单的5个板块
    chapters: [
      { name: '生平年表', page: 'timeline', icon: '📜' },
      { name: '书韵阅读', page: 'reader', icon: '📖' },
      { name: '物理之光', page: 'physics', icon: '⚛️' },
      { name: '影音流年', page: 'multimedia', icon: '🎞️' },
      { name: '关于', page: 'about', icon: 'ℹ️' }
    ]
  },

  onLoad() {
    this.setData({ pageReady: true });
    this._startQuoteTimer();
  },

  _startQuoteTimer() {
    this._stopQuoteTimer();
    this._quoteTimer = setInterval(() => {
      let next = (this.data.currentQuote + 1) % this.data.quotes.length;
      this.setData({ currentQuote: next });
    }, 5000);
  },

  _stopQuoteTimer() {
    if (this._quoteTimer) {
      clearInterval(this._quoteTimer);
      this._quoteTimer = null;
    }
  },

  onBookToggle(e) {
    const isOpen = e.detail.isOpen;
    this.setData({ bookOpen: isOpen });
  },

  onModuleTap(e) {
    const page = e.currentTarget.dataset.page;
    // 定义哪些是 TabBar 页面
    const tabPages = ['home', 'timeline', 'physics', 'reader', 'multimedia'];
    
    if (tabPages.includes(page)) {
      wx.switchTab({
        url: `/pages/${page}/${page === 'physics' ? 'index' : page}`
      });
    } else {
      // 非 TabBar 页面（如 about）使用 navigateTo
      wx.navigateTo({
        url: `/pages/${page}/${page}`
      });
    }
  }
});