// pages/comic/comic.js
const db = wx.cloud.database()

Page({
  data: {
    comicGroups: []
  },

  onLoad() {
    // 延迟 100ms 执行，确保 app.js 的 wx.cloud.init 彻底完成
    setTimeout(() => {
      this.fetchComicData();
    }, 100);
  },

  fetchComicData() {
    wx.showLoading({ title: '正在开启画卷' });
    db.collection('comic').orderBy('order', 'asc').get().then(res => {
      // 直接把数据库里的 cloud:// 链接塞给页面，不进行 getTempFileURL 转换
      this.setData({
        comicGroups: res.data
      }, () => {
        wx.hideLoading();
      });
    }).catch(err => {
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