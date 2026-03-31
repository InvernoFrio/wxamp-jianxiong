Component({
  properties: {
    year: { type: null, value: '' },  // 支持数字或字符串
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
      const map = { 
        birth: '出生', 
        education: '求学', 
        research: '研究', 
        award: '荣誉', 
        other: '其他' 
      };
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
