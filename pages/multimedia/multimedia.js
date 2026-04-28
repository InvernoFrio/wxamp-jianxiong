// pages/multimedia/multimedia.js
const db = wx.cloud.database();

Page({
  data: {
    isPlaying: false,
    // 以下数据将从云端动态获取
    galleryList: [],
    comicPreview: null,
    videoPreview: null,
    musicItem: null
  },

  onLoad() {
    // 延迟 500ms 确保环境初始化
    setTimeout(() => {
      this.fetchAllPreviews();
    }, 500);
  },

  // 核心：从各个集合获取预览内容
  fetchAllPreviews() {
    wx.showLoading({ title: '同步馆藏...' });

    // 1. 获取最新的一组漫画预览
    const comicTask = db.collection('comic').orderBy('order', 'asc').limit(1).get();
    
    // 2. 获取最新的 5 张光影图片
    const galleryTask = db.collection('gallery').orderBy('order', 'asc').limit(5).get();
    
    // 3. 获取最新的一段视频预览
    const videoTask = db.collection('video').orderBy('order', 'asc').limit(1).get();

    // 4. 获取音乐信息
    const musicTask = db.collection('music').limit(1).get();

    Promise.all([comicTask, galleryTask, videoTask, musicTask]).then(res => {
      this.setData({
        comicPreview: res[0].data[0] || null,
        galleryList: res[1].data || [],
        videoPreview: res[2].data[0] || null,
        musicItem: res[3].data[0] || null
      }, () => {
        wx.hideLoading();
      });
    }).catch(err => {
      console.error('获取预览失败', err);
      wx.hideLoading();
    });
  },

  togglePlay() {
    this.setData({
      isPlaying: !this.data.isPlaying
    });
    if (this.data.isPlaying) {
      wx.showToast({ title: '正在播放', icon: 'none' });
    }
  },

  goToComic() { wx.navigateTo({ url: '/pages/comic/comic' }); },
  goToGallery() { wx.navigateTo({ url: '/pages/gallery/gallery' }); },
  goToVideo() { wx.navigateTo({ url: '/pages/video/video' }); }
})