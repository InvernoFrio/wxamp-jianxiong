// pages/home/home.js
const quotes = require('../../data/quotes.js');

Page({
  data: {
    quotes: quotes,
    currentQuote: 0,
    bookOpen: false,
    pageReady: false
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

  onHide() {
    this._stopQuoteTimer();
  },

  onUnload() {
    this._stopQuoteTimer();
  },

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

  onBookToggle(e) {
    this.setData({ bookOpen: e.detail.isOpen });
  },

  onQuoteChange(e) {
    this.setData({ currentQuote: e.detail.current });
  },

  onModuleTap(e) {
    const page = e.currentTarget.dataset.page;
    wx.switchTab({ url: '/pages/' + page + '/' + page });
  }
});
