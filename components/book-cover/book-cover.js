// components/book-cover/book-cover.js
Component({
  properties: {
    isOpen: { type: Boolean, value: false },
    chapters: { type: Array, value: [] }
  },

  data: {
    animating: false,
    shrunk: false,
    bookPage: 0
  },

  methods: {
    onTap() {
      if (this.data.animating || this.data.isOpen) return;
      this.setData({ animating: true, isOpen: true, bookPage: 1 });
      this.triggerEvent('pagechange', { page: 1 });
      setTimeout(() => { this.setData({ animating: false }); }, 600);
    },

    goToMap() {
      if (this.data.animating || this.data.bookPage === 1) return;
      this.setData({ animating: true, bookPage: 1, shrunk: false });
      this.triggerEvent('pagechange', { page: 1 });
      setTimeout(() => { this.setData({ animating: false }); }, 400);
    },

    goToReader() {
      if (this.data.animating || this.data.bookPage === 2) return;
      this.setData({ animating: true, bookPage: 2, shrunk: true });
      this.triggerEvent('pagechange', { page: 2 });
      setTimeout(() => { this.setData({ animating: false }); }, 400);
    },

    closeBook() {
      if (this.data.animating) return;
      this.setData({ animating: true, isOpen: false, bookPage: 0, shrunk: false });
      this.triggerEvent('pagechange', { page: 0 });
      setTimeout(() => { this.setData({ animating: false }); }, 600);
    },

    onGridWalkingTap() {
      this.triggerEvent('gridwalking');
    },

    onChapterTap(e) {
      this.triggerEvent('chaptertap', { page: e.currentTarget.dataset.page });
    }
  }
});
