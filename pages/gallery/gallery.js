// pages/gallery/gallery.js
const db = wx.cloud.database()

Page({
  data: {
    photos: [],
    loading: false, // 是否正在加载中
    isFinished: false, // 是否全部加载完毕
    pageSize: 20 // 每页请求数量
  },

  onLoad() {
    this.fetchPhotos(true); // 首次加载
  },

  /**
   * 核心数据请求函数
   * @param {boolean} isRefresh 是否为刷新/首次加载
   */
  async fetchPhotos(isRefresh = false) {
    if (this.data.loading || (this.data.isFinished && !isRefresh)) return;

    this.setData({ loading: true });
    
    if (isRefresh) {
      wx.showNavigationBarLoading();
    }

    try {
      // 计算偏移量
      const skipCount = isRefresh ? 0 : this.data.photos.length;

      const res = await db.collection('gallery')
        .orderBy('order', 'asc')
        .skip(skipCount)
        .limit(this.data.pageSize)
        .get();

      const newPhotos = res.data;
      
      this.setData({
        photos: isRefresh ? newPhotos : [...this.data.photos, ...newPhotos],
        isFinished: newPhotos.length < this.data.pageSize,
        loading: false
      });

    } catch (err) {
      console.error('数据库请求失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    } finally {
      if (isRefresh) {
        wx.stopPullDownRefresh();
        wx.hideNavigationBarLoading();
      }
    }
  },

  // 预览图片
  previewPhoto(e) {
    const current = e.currentTarget.dataset.url;
    const urls = this.data.photos.map(p => p.image);
    wx.previewImage({
      current: current,
      urls: urls
    });
  },

  // 监听用户下拉刷新
  onPullDownRefresh() {
    this.fetchPhotos(true);
  },

  // 监听用户触底加载更多
  onReachBottom() {
    this.fetchPhotos(false);
  }
})