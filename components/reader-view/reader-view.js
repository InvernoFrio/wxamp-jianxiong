// components/reader-view/reader-view.js
Component({
  properties: {
    paragraphs: { type: Array, value: [] },
    fontSize: { type: Number, value: 30 },
    lineHeight: { type: Number, value: 2.2 },
    paragraphSpacing: { type: Number, value: 28 },
    theme: { type: String, value: 'paper' }
  },

  data: {
    menuVisible: false,
    menuX: 0,
    menuY: 0,
    selectedText: '',
    selectedParaIndex: -1
  },

  methods: {
    onLongPress(e) {
      const paraIndex = e.currentTarget.dataset.index;
      const text = this.properties.paragraphs[paraIndex] || '';
      this._openMenu(e, paraIndex, text);
    },

    _openMenu(e, paraIndex, text) {
      const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || {};
      let x = touch.clientX || e.detail.x || 180;
      let y = touch.clientY || e.detail.y || 220;

      const sysInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
      const menuW = sysInfo.windowWidth * 0.45;
      const menuH = 140;
      if (x - menuW / 2 < 10) x = menuW / 2 + 10;
      if (x + menuW / 2 > sysInfo.windowWidth - 10) x = sysInfo.windowWidth - menuW / 2 - 10;
      if (y - menuH < 10) y = menuH + 10;

      this.setData({
        menuVisible: true,
        menuX: x,
        menuY: y,
        selectedText: text,
        selectedParaIndex: paraIndex
      });
    },

    onHighlight() {
      this.triggerEvent('highlight', {
        text: this.data.selectedText,
        paraIndex: this.data.selectedParaIndex
      });
      this.setData({ menuVisible: false });
    },

    onNote() {
      this.triggerEvent('note', {
        text: this.data.selectedText,
        paraIndex: this.data.selectedParaIndex
      });
      this.setData({ menuVisible: false });
    },

    onCopy() {
      const text = this.data.selectedText || '';
      this.setData({ menuVisible: false });
      if (!text) return;
      wx.setClipboardData({
        data: text,
        success: () => wx.showToast({ title: '已复制', icon: 'success' }),
        fail: () => wx.showToast({ title: '复制失败', icon: 'none' })
      });
    },

    onCloseMenu() {
      this.setData({ menuVisible: false });
    }
  }
});
