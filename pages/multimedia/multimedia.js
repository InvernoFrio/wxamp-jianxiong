// pages/multimedia/multimedia.js
const db = wx.cloud.database();
let audioCtx = null; // 1. 在外面定义一个全局变量放播放器

Page({
  data: {
    isPlaying: false,
    galleryList: [],
    comicPreview: null,
    videoPreview: null,
    musicItem: null
  },

  onLoad() {
    // 2. 页面加载时初始化播放器
    audioCtx = wx.createInnerAudioContext();
    
    // 监听播放器状态，确保 UI 和声音同步
    audioCtx.onPlay(() => { this.setData({ isPlaying: true }); });
    audioCtx.onPause(() => { this.setData({ isPlaying: false }); });

    setTimeout(() => {
      this.fetchAllPreviews();
    }, 500);
  },

  fetchAllPreviews() {
    wx.showLoading({ title: '同步馆藏...' });
    const comicTask = db.collection('comic').orderBy('order', 'asc').limit(1).get();
    const galleryTask = db.collection('gallery').orderBy('order', 'asc').limit(5).get();
    const videoTask = db.collection('video').orderBy('order', 'asc').limit(1).get();
    const musicTask = db.collection('music').limit(1).get();

    Promise.all([comicTask, galleryTask, videoTask, musicTask]).then(res => {
      const mItem = res[3].data[0] || null;
      this.setData({
        comicPreview: res[0].data[0] || null,
        galleryList: res[1].data || [],
        videoPreview: res[2].data[0] || null,
        musicItem: mItem
      });

      // 3. 关键：拿到数据后，把云端音频地址给播放器
      if (mItem && mItem.url) {
        audioCtx.src = mItem.url;
      }
      
    }).finally(() => { wx.hideLoading(); });
  },

  togglePlay() {
    // 4. 真正的播放/暂停逻辑
    if (!audioCtx.src) return; 

    if (this.data.isPlaying) {
      audioCtx.pause(); // 停止声音
    } else {
      audioCtx.play();  // 发出声音
      wx.showToast({ title: '正在播放', icon: 'none' });
    }
    
    // 注意：这里不需要手动 setData isPlaying 了，
    // 因为上面的 onPlay/onPause 监听器会自动帮你处理。
  },

  onUnload() {
    // 页面关掉时销毁播放器，省电省内存
    if (audioCtx) audioCtx.destroy();
  },

  // 跳转函数
  goToComic() { wx.navigateTo({ url: '/pages/comic/comic' }); },
  goToGallery() { wx.navigateTo({ url: '/pages/gallery/gallery' }); },
  goToVideo() { wx.navigateTo({ url: '/pages/video/video' }); }
})