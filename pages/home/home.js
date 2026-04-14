// pages/home/home.js
const quotes = require('../../data/quotes.js');

Page({
  data: {
    // 保留原有数据
    quotes: quotes,
    currentQuote: 0,
    bookOpen: false,
    pageReady: false,
    // 新增状态管理
    uiState: 'CHAT' // CHAT: AI对话, MENU: 功能入口
  },

  onLoad() {
    this.setData({ pageReady: true });
    this._startQuoteTimer();
  },

  onShow() {
    if (!this._quoteTimer) {
      this._startQuoteTimer();
    }
  },

  onHide() { this._stopQuoteTimer(); },
  onUnload() { this._stopQuoteTimer(); },

  _startQuoteTimer() {
    this._stopQuoteTimer();
    this._quoteTimer = setInterval(() => {
      let next = this.data.currentQuote + 1;
      if (next >= this.data.quotes.length) next = 0;
      this.setData({ currentQuote: next });
    }, 5000);
  },

  _stopQuoteTimer() {
    if (this._quoteTimer) {
      clearInterval(this._quoteTimer);
      this._quoteTimer = null;
    }
  },

  // 核心联动：翻书动作切换 UI 状态
  onBookToggle(e) {
    const isOpen = e.detail.isOpen;
    this.setData({ 
      bookOpen: isOpen,
      uiState: isOpen ? 'MENU' : 'CHAT'
    });
  },

  onQuoteChange(e) {
    this.setData({ currentQuote: e.detail.current });
  },

  onModuleTap(e) {
    const page = e.currentTarget.dataset.page;
    // 兼容 TabBar 页面和普通页面
    const tabPages = ['home', 'timeline', 'reader', 'about'];
    if (tabPages.includes(page)) {
      wx.switchTab({ url: '/pages/' + page + '/' + page });
    } else {
      wx.navigateTo({ url: '/pages/' + page + '/' + (page === 'physics' ? 'index' : page) });
    }
  }
});