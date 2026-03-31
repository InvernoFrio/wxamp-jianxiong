// components/glass-button/glass-button.js
Component({
  properties: {
    type: {
      type: String,
      value: 'default' // default | primary | ghost
    },
    size: {
      type: String,
      value: 'medium' // small | medium | large
    },
    disabled: {
      type: Boolean,
      value: false
    }
  },
  data: {},
  methods: {
    onTap(e) {
      if (!this.properties.disabled) {
        this.triggerEvent('tap', e.detail);
      }
    }
  }
});
