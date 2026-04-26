// pages/multimedia/multimedia.js
Page({
  data: {
    isPlaying: false,
    galleryList: [
      { id: 1, title: '晨曦', desc: 'Shanghai, 2024', url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400' },
      { id: 2, title: '街角', desc: 'Tokyo, 2023', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
      { id: 3, title: '雨后', desc: 'London, 2024', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400' }
    ]
  },

  togglePlay() {
    this.setData({
      isPlaying: !this.data.isPlaying
    });
    if (this.data.isPlaying) {
      wx.showToast({ title: '正在播放', icon: 'none' });
    }
  },

  goToComic() {
    wx.navigateTo({ url: '/pages/comic/comic' });
  },

  goToGallery() {
    wx.navigateTo({ url: '/pages/gallery/gallery' });
  },

  goToVideo() {
    wx.navigateTo({ url: '/pages/video/video' });
  }
})
