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
    // 延迟 100ms 执行，确保 app.js 的 wx.cloud.init 完成。
    setTimeout(() => {
      this.fetchComicData();
    }, 100);
  },

  fetchComicData() {
    wx.showLoading({ title: '正在开启画卷' });
    db.collection('comic').orderBy('order', 'asc').get().then(res => {
      const comicGroups = this.normalizeComicGroups(res.data);
      this.setData({ comicGroups }, () => {
        wx.hideLoading();
      });
    }).catch(() => {
      wx.hideLoading();
    });
  },

  normalizeComicGroups(groups = []) {
    return groups.map(group => {
      const sourceImages = Array.isArray(group.images)
        ? group.images
        : (group.image ? [group.image] : []);
      const images = sourceImages
        .filter(img => typeof img === 'string')
        .map(img => img.trim())
        .filter(Boolean);

      return Object.assign({}, group, {
        images,
        hasImages: images.length > 0
      });
    }).filter(group => group.hasImages);
  },

  previewImage(e) {
    const { current, urls } = e.currentTarget.dataset;
    if (!current || !Array.isArray(urls) || !urls.length) return;

    wx.previewImage({
      current,
      urls
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
  },

  onComicImageError(e) {
    const groupIndex = Number(e.currentTarget.dataset.groupIndex);
    const imageIndex = Number(e.currentTarget.dataset.imageIndex);
    if (!Number.isInteger(groupIndex) || !Number.isInteger(imageIndex)) return;

    const comicGroups = this.data.comicGroups.slice();
    const group = comicGroups[groupIndex];
    if (!group || !Array.isArray(group.images)) return;

    const images = group.images.slice();
    images.splice(imageIndex, 1);

    if (images.length) {
      comicGroups[groupIndex] = Object.assign({}, group, {
        images,
        hasImages: true
      });
    } else {
      comicGroups.splice(groupIndex, 1);
    }

    this.setData({ comicGroups });
  }
})
