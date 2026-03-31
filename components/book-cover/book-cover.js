// components/book-cover/book-cover.js
Component({
  properties: {
    isOpen: {
      type: Boolean,
      value: false
    }
  },
  data: {
    animating: false
  },
  methods: {
    onTap() {
      if (this.data.animating) return;
      this.setData({ animating: true });
      const newOpen = !this.data.isOpen;
      this.setData({ isOpen: newOpen });
      this.triggerEvent('toggle', { isOpen: newOpen });
      setTimeout(() => {
        this.setData({ animating: false });
      }, 600);
    }
  }
});
