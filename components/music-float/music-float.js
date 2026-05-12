// components/music-float/music-float.js
const musicPlayer = require('../../utils/music-player.js');

Component({
  properties: {
    track: {
      type: Object,
      value: null
    },
    autoplay: {
      type: Boolean,
      value: false
    },
    stopOnDetach: {
      type: Boolean,
      value: false
    },
    compact: {
      type: Boolean,
      value: false
    }
  },

  data: {
    visible: false,
    isPlaying: false,
    floatX: 0,
    floatY: 0,
    isDragging: false
  },

  observers: {
    track(track) {
      this._applyTrack(track);
    }
  },

  lifetimes: {
    attached() {
      this._initFloatPosition();
      this._unsubscribe = musicPlayer.subscribe(state => {
        const track = this.properties.track;
        this.setData({
          isPlaying: !!(state.isPlaying && state.track && track && state.track.id === track.id)
        });
      });
      this._applyTrack(this.properties.track);
    },

    detached() {
      if (this._unsubscribe) this._unsubscribe();
      if (this._ignoreNextTapTimer) clearTimeout(this._ignoreNextTapTimer);
      if (this.properties.stopOnDetach && this.properties.track) {
        const state = musicPlayer.getState();
        if (state.track && state.track.id === this.properties.track.id) {
          musicPlayer.stop();
        }
      }
    }
  },

  methods: {
    _getWindowInfo() {
      return wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    },

    _getBallSize(info) {
      const width = info ? info.windowWidth : 375;
      const rpxRatio = width / 750;
      return Math.round((this.properties.compact ? 68 : 76) * rpxRatio);
    },

    _getBounds(info) {
      const windowInfo = info || this._getWindowInfo();
      const size = this._getBallSize(windowInfo);
      const margin = 10;
      return {
        size,
        minX: margin,
        maxX: windowInfo.windowWidth - size - margin,
        minY: margin + (windowInfo.safeArea ? windowInfo.safeArea.top - windowInfo.statusBarHeight : 0),
        maxY: windowInfo.windowHeight - size - margin,
        windowWidth: windowInfo.windowWidth
      };
    },

    _clampPosition(x, y) {
      const bounds = this._getBounds();
      return {
        x: Math.min(bounds.maxX, Math.max(bounds.minX, x)),
        y: Math.min(bounds.maxY, Math.max(bounds.minY, y))
      };
    },

    _initFloatPosition() {
      const info = this._getWindowInfo();
      const bounds = this._getBounds(info);
      this.setData({
        floatX: bounds.maxX,
        floatY: bounds.minY + 12
      });
    },

    _applyTrack(track) {
      const visible = !!(track && track.url);
      this.setData({ visible });
      if (visible) {
        musicPlayer.setTrack(track, { autoplay: this.properties.autoplay });
      }
    },

    onDragStart(e) {
      const touch = e.touches && e.touches[0];
      if (!touch) return;
      this._dragStart = {
        x: touch.clientX,
        y: touch.clientY,
        moved: false
      };
      this.setData({ isDragging: true });
    },

    onDragMove(e) {
      const touch = e.touches && e.touches[0];
      if (!touch) return;
      const bounds = this._getBounds();
      const x = touch.clientX - bounds.size / 2;
      const y = touch.clientY - bounds.size / 2;
      const next = this._clampPosition(x, y);
      if (this._dragStart) {
        const dx = Math.abs(touch.clientX - this._dragStart.x);
        const dy = Math.abs(touch.clientY - this._dragStart.y);
        this._dragStart.moved = this._dragStart.moved || dx > 6 || dy > 6;
      }
      this.setData({
        floatX: next.x,
        floatY: next.y
      });
    },

    onDragEnd() {
      const bounds = this._getBounds();
      const snapX = this.data.floatX < bounds.windowWidth / 2 - bounds.size / 2 ? bounds.minX : bounds.maxX;
      this._ignoreNextTap = !!(this._dragStart && this._dragStart.moved);
      this._dragStart = null;
      this.setData({
        isDragging: false,
        floatX: snapX
      });
      if (this._ignoreNextTapTimer) clearTimeout(this._ignoreNextTapTimer);
      this._ignoreNextTapTimer = setTimeout(() => {
        this._ignoreNextTap = false;
      }, 220);
    },

    onToggle() {
      if (this._ignoreNextTap) return;
      if (!this.properties.track || !this.properties.track.url) return;
      musicPlayer.setTrack(this.properties.track);
      musicPlayer.toggle();
    }
  }
});
