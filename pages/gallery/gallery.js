// pages/gallery/gallery.js
Page({
  data: {
    photos: [
      { id: 1, title: '晨曦中的城市', url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800' },
      { id: 2, title: '冬日里的那一抹红', url: 'https://images.unsplash.com/photo-1549220917-76789e9447e1?w=800' },
      { id: 3, title: '古镇的宁静', url: 'https://images.unsplash.com/photo-1520114878144-6123749968dd?w=800' },
      { id: 4, title: '深秋的落叶', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800' },
      { id: 5, title: '繁星点点的夜空', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800' },
      { id: 6, title: '无尽的海岸线', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800' }
    ]
  },

  previewPhoto(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: this.data.photos.map(p => p.url)
    });
  }
})
