// app.js - 健雄书韵 全局逻辑

App({
  onLaunch() {
    console.log('健雄书韵启动');
    
    // 初始化存储
    if (!wx.getStorageSync('readingProgress')) {
      wx.setStorageSync('readingProgress', {});
    }
    if (!wx.getStorageSync('highlights')) {
      wx.setStorageSync('highlights', []);
    }
    if (!wx.getStorageSync('notes')) {
      wx.setStorageSync('notes', []);
    }
  },

  globalData: {
    appName: '健雄书韵',
    subtitle: '吴健雄数字纪念馆',
    version: '1.0.0'
  }
});
