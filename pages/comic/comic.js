// pages/comic/comic.js
const db = wx.cloud.database()

Page({
  data: {
    comicGroups: [],
    windowWidth: 375
  },

  onLoad() {
    const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    this.setData({ windowWidth: info.windowWidth || 375 });
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
  },

  onComicImageLoad(e) {
    const groupIndex = e.currentTarget.dataset.groupIndex;
    const width = e.detail.width;
    const height = e.detail.height;
    if (groupIndex === undefined || !width || !height) return;

    const contentWidthRpx = 670;
    const frameWidthRpx = contentWidthRpx * 0.7;
    const imageHeightRpx = Math.round(frameWidthRpx * height / width);
    const nextHeight = Math.max(420, Math.min(860, imageHeightRpx + 140));
    const current = this.data.comicGroups[groupIndex] && this.data.comicGroups[groupIndex].filmHeight;

    if (!current || nextHeight > current) {
      this.setData({
        [`comicGroups[${groupIndex}].filmHeight`]: nextHeight
      });
    }
  }
})
