// pages/video/video.js
const db = wx.cloud.database() // 获取云数据库实例

Page({
  data: {
    // 初始设为空数组，等待云端数据加载
    videoList: [],
    currVideoId: '' // 记录当前正在播放的视频 ID
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 延迟 500ms 执行，确保云环境初始化完全完成
    setTimeout(() => {
      this.fetchVideoData();
    }, 500);
  },

  // 从云数据库获取视频数据
  fetchVideoData() {
    wx.showLoading({ title: '加载影像中...' });

    // 这里的 'videos' 需对应你在后台创建的集合名称
    db.collection('video').orderBy('order', 'asc').get().then(res => {
      console.log('【视频原始数据】:', res.data);

      // 将数据库字段映射为 WXML 需要的字段名
      const formattedList = res.data.map(item => {
        return {
          id: item._id,
          title: item.title,
          desc: item.description, // 映射数据库的 description 到 WXML 的 desc
          tag: item.category,     // 映射数据库的 category 到 WXML 的 tag
          url: item.video,        // 映射数据库的 video (cloud://) 到 WXML 的 url
          poster: item.poster || '', // 如果数据库里没填封面，默认为空
          author: item.author     // 预留作者字段
        }
      });

      this.setData({
        videoList: formattedList
      }, () => {
        console.log('【页面渲染完成】');
        wx.hideLoading();
      });
    }).catch(err => {
      console.error('数据库请求失败:', err);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    });
  },
  // 当视频开始播放时触发
  onVideoPlay(e) {
    const newVideoId = e.currentTarget.dataset.id;
    const lastVideoId = this.data.currVideoId;

    // 如果当前有其他视频在播放，且不是现在点击的这个
    if (lastVideoId && lastVideoId !== newVideoId) {
      // 停止上一个视频
      const lastVideoContext = wx.createVideoContext(lastVideoId, this);
      lastVideoContext.pause(); // 也可以用 stop()
    }

    // 更新当前正在播放的 ID
    this.setData({
      currVideoId: newVideoId
    });
  }
})