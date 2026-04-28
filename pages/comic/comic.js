// pages/comic/comic.js
const db = wx.cloud.database()

Page({
  data: {
    comicGroups: []
  },

  onLoad() {
    // 延迟 500ms 执行，确保 app.js 的 wx.cloud.init 彻底完成
    setTimeout(() => {
      this.fetchComicData();
    }, 500);
  },

  fetchComicData() {
    wx.showLoading({ title: '加载数据中' });
    
    db.collection('comic').orderBy('order', 'asc').get().then(res => {
      console.log('【数据库原始数据】:', res.data);
      
      // 直接把数据库里的 cloud:// 链接塞给页面，不进行 getTempFileURL 转换
      this.setData({
        comicGroups: res.data
      }, () => {
        console.log('【页面渲染完成】请检查图片是否显示');
        wx.hideLoading();
      });
    }).catch(err => {
      console.error('数据库请求失败:', err);
      wx.hideLoading();
    });
  },

  previewImage(e) {
    const { current, urls } = e.currentTarget.dataset;
    wx.previewImage({
      current: current,
      urls: urls
    });
  }
})