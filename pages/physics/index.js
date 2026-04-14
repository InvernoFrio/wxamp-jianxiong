// pages/physics/index.js
Page({
  onExpTap(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/physics/exp-${type}/exp-${type}`
    });
  }
});

