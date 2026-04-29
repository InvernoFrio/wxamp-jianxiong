// pages/gallery/gallery.js
const db = wx.cloud.database() // 获取云数据库实例

Page({
  data: {
    // 初始设为空数组，等待云端数据加载
    photos: [] 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 延迟 100ms 执行，确保 app.js 的 wx.cloud.init 彻底完成
    setTimeout(() => {
      this.fetchPhotos();
    }, 100);
  },

  // 获取云端图片数据
  fetchPhotos() {
    wx.showLoading({ title: '加载数据中' });
    
    // 注意：这里集合名称需改为你实际创建的名字，例如 'gallery'
    db.collection('gallery').orderBy('order', 'asc').get().then(res => {
      console.log('【数据库原始数据】:', res.data);
      
      // 直接把数据库里的数据塞给页面
      this.setData({
        photos: res.data
      }, () => {
        console.log('【页面渲染完成】');
        wx.hideLoading();
      });
    }).catch(err => {
      console.error('数据库请求失败:', err);
      wx.hideLoading();
    });
  },

  // 预览图片
  previewPhoto(e) {
    const url = e.currentTarget.dataset.url;
    // 从当前 photos 数组中提取所有的 image 字段组成预览列表
    const urls = this.data.photos.map(p => p.image);
    
    wx.previewImage({
      current: url, // 当前显示图片的链接
      urls: urls    // 需要预览的图片链接列表
    });
  }
})