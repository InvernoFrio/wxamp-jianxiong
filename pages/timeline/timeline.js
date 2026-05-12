// pages/timeline/timeline.js
const timelineData = require('../../data/timeline.js');
const musicConfig = require('../../data/music-config.js');

Page({
  data: {
    musicTrack: musicConfig.timeline,
    items: [],
    filteredItems: [],
    expandedIndex: -1,
    activeFilter: 'all',
    scrollTop: 0,
    filterTabs: [
      { key: 'all', label: '全部' },
      { key: 'birth', label: '出生' },
      { key: 'education', label: '教育' },
      { key: 'research', label: '研究' },
      { key: 'award', label: '荣誉' },
      { key: 'other', label: '其他' }
    ]
  },

  onLoad() {
    this.setData({
      items: timelineData,
      filteredItems: timelineData
    });
  },

  onFilterTap(e) {
    const key = e.currentTarget.dataset.key;
    let filtered;
    if (key === 'all') {
      filtered = this.data.items;
    } else {
      filtered = this.data.items.filter(item => item.type === key);
    }
    this.setData({
      activeFilter: key,
      filteredItems: filtered,
      expandedIndex: -1,
      scrollTop: 0
    });
  },

  onItemToggle(e) {
    const index = e.detail.index;
    this.setData({
      expandedIndex: this.data.expandedIndex === index ? -1 : index
    });
  }
});
