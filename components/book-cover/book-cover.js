// components/book-cover/book-cover.js
const haptics = require('../../utils/haptics.js');

Component({
  properties: {
    isOpen: { type: Boolean, value: false },
    chapters: { type: Array, value: [] }
  },

  data: {
    animating: false,
    shrunk: false,
    bookPage: 0,
    riffling: false,
    riffleMode: 'forward',
    riffleClass: ''
  },

  lifetimes: {
    detached() {
      if (this._riffleTimer) clearTimeout(this._riffleTimer);
    }
  },

  methods: {
    _startRiffle(mode, duration) {
      if (this._riffleTimer) clearTimeout(this._riffleTimer);
      const nextMode = mode || 'forward';
      this.setData({
        riffling: true,
        riffleMode: nextMode,
        riffleClass: 'book-riffling riffle-' + nextMode
      });
      this._riffleTimer = setTimeout(() => {
        this.setData({ riffling: false, riffleClass: '' });
        this._riffleTimer = null;
      }, duration || 760);
      haptics.tap();
    },

    onTap() {
      if (this.data.animating || this.data.isOpen) return;
      this.setData({ animating: true, isOpen: true, bookPage: 1, shrunk: false });
      this._startRiffle('open', 920);
      this.triggerEvent('pagechange', { page: 1 });
      setTimeout(() => { this.setData({ animating: false }); }, 920);
    },

    goToMap() {
      if (this.data.animating || this.data.bookPage === 1) return;
      this.setData({ animating: true, bookPage: 1, shrunk: false });
      this._startRiffle('back', 680);
      this.triggerEvent('pagechange', { page: 1 });
      setTimeout(() => { this.setData({ animating: false }); }, 680);
    },

    goToReader() {
      if (this.data.animating || this.data.bookPage === 2) return;
      this.setData({ animating: true, bookPage: 2, shrunk: true });
      this._startRiffle('forward', 720);
      this.triggerEvent('pagechange', { page: 2 });
      setTimeout(() => { this.setData({ animating: false }); }, 720);
    },

    closeBook() {
      if (this.data.animating) return;
      this.setData({ animating: true, isOpen: false, bookPage: 0, shrunk: false });
      this._startRiffle('close', 780);
      this.triggerEvent('pagechange', { page: 0 });
      setTimeout(() => { this.setData({ animating: false }); }, 780);
    },

    onGridWalkingTap() {
      this.triggerEvent('gridwalking');
    },

    onChapterTap(e) {
      this.triggerEvent('chaptertap', { page: e.currentTarget.dataset.page });
    }
  }
});
