Component({
  properties: {
    year: { type: String, value: '' },
    title: { type: String, value: '' },
    detail: { type: String, value: '' },
    category: { type: String, value: 'research' },
    hasDetail: { type: Boolean, value: false }
  },

  data: {
    expanded: false,
    categoryText: ''
  },

  observers: {
    'category': function(cat) {
      const map = { education: '求学', research: '研究', honor: '荣誉' };
      this.setData({ categoryText: map[cat] || '事件' });
    }
  },

  methods: {
    onTap() {
      if (this.properties.hasDetail) {
        this.setData({ expanded: !this.data.expanded });
        this.triggerEvent('toggle', { expanded: this.data.expanded });
      }
    }
  }
});
