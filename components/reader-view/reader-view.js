// components/reader-view/reader-view.js
Component({
  properties: {
    paragraphs: {
      type: Array,
      value: []
    },
    fontSize: {
      type: Number,
      value: 30
    },
    lineHeight: {
      type: Number,
      value: 2.2
    },
    highlights: {
      type: Array,
      value: []
    }
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
      const dataset = e.currentTarget.dataset;
      const paraIndex = dataset.index;
      const text = this.properties.paragraphs[paraIndex] || '';
      let x = e.touches[0].clientX;
      let y = e.touches[0].clientY;
      // 边界检测：菜单宽约180rpx(≈屏幕一半)，高约140rpx
      const sysInfo = wx.getSystemInfoSync();
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
      wx.setClipboardData({
        data: this.data.selectedText,
        success: () => {
          wx.showToast({ title: '已复制', icon: 'success' });
        }
      });
      this.setData({ menuVisible: false });
    },
    onCloseMenu() {
      this.setData({ menuVisible: false });
    }
  }
});
