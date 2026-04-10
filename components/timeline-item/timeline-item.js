// components/timeline-item/timeline-item.js
Component({
  properties: {
    item: {
      type: Object,
      value: {}
    },
    index: {
      type: Number,
      value: 0
    },
    expanded: {
      type: Boolean,
      value: false
    },
    last: {
      type: Boolean,
      value: false
    }
  },
  data: {
    typeColor: {
      birth: '#C41E3A',
      education: '#8B9DAF',
      research: '#D4A574',
      award: '#C41E3A',
      other: '#8B9DAF'
    },
    typeText: {
      birth: '出生',
      education: '教育',
      research: '研究',
      award: '荣誉',
      other: '其他'
    }
  },
  methods: {
    onTap() {
      this.triggerEvent('toggle', { index: this.properties.index });
    }
  }
});
