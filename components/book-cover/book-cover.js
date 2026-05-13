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
      if (this._closeFadeTimer) clearTimeout(this._closeFadeTimer);
      if (this._closeCoverTimer) clearTimeout(this._closeCoverTimer);
      if (this._closeDoneTimer) clearTimeout(this._closeDoneTimer);
      if (this._pageAudio) {
        this._pageAudio.destroy();
        this._pageAudio = null;
      }
    }
  },

  methods: {
    _ensurePageAudio() {
      if (this._pageAudio) return this._pageAudio;
      const audio = wx.createInnerAudioContext();
      audio.src = '/assets/page_turning.mp3';
      audio.obeyMuteSwitch = false;
      this._pageAudio = audio;
      return audio;
    },

    _playPageSound() {
      const audio = this._ensurePageAudio();
      try {
        audio.stop();
        audio.seek(0);
        audio.play();
      } catch (e) {
        audio.play();
      }
    },

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
      this._playPageSound();
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
      this.setData({
        animating: true,
        isOpen: true,
        shrunk: false
      });
      this.triggerEvent('pagechange', { page: 1, closing: true });
      this._startRiffle('close', 820);

      if (this._closeFadeTimer) clearTimeout(this._closeFadeTimer);
      if (this._closeCoverTimer) clearTimeout(this._closeCoverTimer);
      if (this._closeDoneTimer) clearTimeout(this._closeDoneTimer);

      this._closeFadeTimer = setTimeout(() => {
        this.setData({ bookPage: 0 });
      }, 260);

      this._closeCoverTimer = setTimeout(() => {
        this.setData({ isOpen: false });
      }, 420);

      this._closeDoneTimer = setTimeout(() => {
        this.triggerEvent('pagechange', { page: 0 });
        this.setData({ animating: false });
        this._closeFadeTimer = null;
        this._closeCoverTimer = null;
        this._closeDoneTimer = null;
      }, 880);
    },

    onGridWalkingTap() {
      if (this.data.animating || this.data.bookPage !== 1) return;
      haptics.tap();
      this.triggerEvent('gridwalking');
    },

    onChapterTap(e) {
      this.triggerEvent('chaptertap', { page: e.currentTarget.dataset.page });
    }
  }
});
