Component({
  properties: {
    chapterTitle: { type: String, value: '' },
    sectionTitle: { type: String, value: '' },
    paragraphs: { type: Array, value: [] },
    showNav: { type: Boolean, value: true },
    hasPrev: { type: Boolean, value: false },
    hasNext: { type: Boolean, value: true }
  },

  data: {
    scrollTop: 0,
    progress: 0
  },

  methods: {
    onScroll(e) {
      const { scrollTop, scrollHeight } = e.detail;
      wx.createSelectorQuery().in(this).select('.reader-body').boundingClientRect(rect => {
        if (rect) {
          const viewH = rect.height;
          const maxScroll = scrollHeight - viewH;
          if (maxScroll > 0) {
            const p = Math.min(100, Math.round((scrollTop / maxScroll) * 100));
            this.setData({ progress: p });
            this.triggerEvent('progress', { progress: p });
          }
        }
      }).exec();
    },

    onLongPress(e) {
      const { text, index } = e.currentTarget.dataset;
      this.triggerEvent('select', { text, index });
    },

    onPrev() {
      this.setData({ scrollTop: 0, progress: 0 });
      this.triggerEvent('prev');
    },

    onNext() {
      this.setData({ scrollTop: 0, progress: 0 });
      this.triggerEvent('next');
    },

    // 外部调用：重置滚动位置
    resetScroll() {
      this.setData({ scrollTop: 0, progress: 0 });
    }
  }
});
