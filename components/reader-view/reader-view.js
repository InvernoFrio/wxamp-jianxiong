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
      this.setData({
        menuVisible: true,
        menuX: e.touches[0].clientX,
        menuY: e.touches[0].clientY,
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
