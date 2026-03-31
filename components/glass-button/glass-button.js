Component({
  properties: {
    type: {
      type: String,
      value: 'default' // default | primary
    },
    disabled: {
      type: Boolean,
      value: false
    },
    customClass: {
      type: String,
      value: ''
    },
    customStyle: {
      type: String,
      value: ''
    }
  },
  methods: {
    onTap() {
      if (!this.properties.disabled) {
        this.triggerEvent('tap');
      }
    }
  }
});
