// pages/multimedia/multimedia.js
const db = wx.cloud.database();
let audioCtx = null; // 1. 在外面定义一个全局变量放播放器

Page({
  data: {
    isPlaying: false,
    galleryList: [],
    comicPreview: null,
    videoPreview: null,
    musicList:[], 
    musicItem: null,
    currentIndex: 0,   // 当前播放的索引
    playMode: 'list', // list: 顺序播放, random: 随机播放, single: 单曲循环
  },

  onLoad() {
    audioCtx = wx.createInnerAudioContext();
    
    // 监听播放器状态，确保 UI 和声音同步
    audioCtx.onPlay(() => { this.setData({ isPlaying: true }); });
    audioCtx.onPause(() => { this.setData({ isPlaying: false }); });
    audioCtx.onEnded(() => this.playNext()); // 自动播放下一首

    setTimeout(() => {
      this.fetchAllPreviews();
    }, 500);
  },

  fetchAllPreviews() {
    wx.showLoading({ title: '同步馆藏...' });
    const comicTask = db.collection('comic').orderBy('order', 'asc').limit(1).get();
    const galleryTask = db.collection('gallery').orderBy('order', 'asc').limit(5).get();
    const videoTask = db.collection('video').orderBy('order', 'asc').limit(1).get();
    const musicTask = db.collection('music').limit(10).get();

    Promise.all([comicTask, galleryTask, videoTask, musicTask]).then(res => {
      const musicList = res[3].data || [];
      this.setData({
        comicPreview: res[0].data[0] || null,
        galleryList: res[1].data || [],
        videoPreview: res[2].data[0] || null,
        musicList: musicList,
        musicItem: musicList.length > 0 ? musicList[0] : null,
        currentIndex: 0
      });

      // 初始化播放源
      if (musicList.length > 0) {
        audioCtx.src = musicList[0].url;
      }
      
    }).finally(() => { wx.hideLoading(); });
  },

  // 播放/暂停控制
  togglePlay() {
    if (!audioCtx.src) return; 
    this.data.isPlaying ? audioCtx.pause() : audioCtx.play();
  },

  // 上一首
  playPrev() {
    if (this.data.musicList.length === 0) return;
    let index = (this.data.currentIndex - 1 + this.data.musicList.length) % this.data.musicList.length;
    this.switchMusic(index);
  },

  // 切换播放模式
  toggleMode() {
    const modes = ['list', 'random', 'single'];
    let currentIndex = modes.indexOf(this.data.playMode);
    let nextMode = modes[(currentIndex + 1) % modes.length];
    
    this.setData({ playMode: nextMode });
    
    const modeNames = { list: '顺序播放', random: '随机播放', single: '单曲循环' };
    wx.showToast({ title: modeNames[nextMode], icon: 'none' });
  },

  // 下一首
  playNext() {
    const { musicList, currentIndex, playMode } = this.data;
    if (musicList.length === 0) return;

    let nextIndex = currentIndex;

    if (playMode === 'single') {
      // 单曲循环：不改变索引，重播
      audioCtx.seek(0);
      audioCtx.play();
      return;
    } else if (playMode === 'random') {
      // 随机播放
      nextIndex = Math.floor(Math.random() * musicList.length);
    } else {
      // 顺序播放
      nextIndex = (currentIndex + 1) % musicList.length;
    }
    this.switchMusic(nextIndex);
  },

  // 切换音乐核心逻辑
  switchMusic(index) {
    const nextMusic = this.data.musicList[index];
    this.setData({
      currentIndex: index,
      musicItem: nextMusic
    });
    audioCtx.stop();
    audioCtx.src = nextMusic.url;
    audioCtx.play();
  },

  // 重置播放
  restartMusic() {
    if (!audioCtx.src) return;
    audioCtx.seek(0);       // 将进度跳转至 0 秒
    if (!this.data.isPlaying) {
      audioCtx.play();
    }                     // 如果当前没在播放，则触发播放
    wx.showToast({ title: '重置播放', icon: 'none' });
  },

  onHide() {
    if (audioCtx) {
      audioCtx.pause();
      console.log("页面隐藏，音乐暂停");
    }
  },

  onUnload() {
    if (audioCtx) {
      audioCtx.stop();    // 先停止播放
      audioCtx.destroy(); // 销毁实例，释放资源
      audioCtx = null;    // 清空引用
      console.log("页面销毁，播放器已移除");
    }
  },

  // 跳转函数
  goToComic() { wx.navigateTo({ url: '/pages/comic/comic' }); },
  goToGallery() { wx.navigateTo({ url: '/pages/gallery/gallery' }); },
  goToVideo() { wx.navigateTo({ url: '/pages/video/video' }); }
})