// pages/multimedia/multimedia.js
Page({
  data: {
    isPlaying: false,
    gallery: [
      { id: 1, title: '实验室沉思', desc: '哥伦比亚大学，1956年', url: 'https://picsum.photos/seed/lab/320/420' },
      { id: 2, title: '守恒定律实验', desc: '实验装置，低温物理', url: 'https://picsum.photos/seed/exp/320/420' },
      { id: 3, title: '普林斯顿岁月', desc: '普林斯顿研究所，1940s', url: 'https://picsum.photos/seed/princeton/320/420' },
      { id: 4, title: '手稿与笔札', desc: '私人珍藏档案', url: 'https://picsum.photos/seed/notes/320/420' }
    ]
  },

  togglePlay() {
    this.setData({ isPlaying: !this.data.isPlaying });
    if (this.data.isPlaying) {
      wx.showToast({ title: '雅集开启', icon: 'none' });
    }
  }
});