// pages/home/home.js
const quotes = require('../../data/quotes.js');

Page({
  data: {
    quotes: quotes,
    bookOpening: false,
    showModules: false,
    modules: [
      {
        id: 'timeline',
        title: '生平年表',
        desc: '交互式时间轴，探索一生轨迹',
        icon: '📖',
        path: '/pages/timeline/timeline'
      },
      {
        id: 'reader',
        title: '书韵阅读',
        desc: '章节式传记，划线批注',
        icon: '📚',
        path: '/pages/reader/reader'
      },
      {
        id: 'physics',
        title: '物理之光',
        desc: 'β衰变实验可视化',
        icon: '🧪',
        path: '/pages/physics/physics'
      },
      {
        id: 'about',
        title: '关于',
        desc: '团队介绍与项目说明',
        icon: '👤',
        path: '/pages/about/about'
      }
    ]
  },

  onLoad() {
    // 检查是否已经翻开过书
    const hasOpened = wx.getStorageSync('bookOpened');
    if (hasOpened) {
      this.setData({
        bookOpening: true,
        showModules: true
      });
    }
  },

  onBookToggle(e) {
    const opening = e.detail.opening;
    if (opening && !this.data.bookOpening) {
      this.setData({ bookOpening: true });
      wx.setStorageSync('bookOpened', true);
      // 等翻书动画完成后显示模块
      setTimeout(() => {
        this.setData({ showModules: true });
      }, 600);
    }
  },

  onModuleTap(e) {
    // 事件可能来自组件内部或直接绑定
    const path = e.currentTarget.dataset.path || e.currentTarget._dataset.path;
    if (path) {
      wx.switchTab({ url: path });
    }
  }
});
