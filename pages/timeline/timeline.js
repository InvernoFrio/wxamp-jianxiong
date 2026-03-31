// pages/timeline/timeline.js
const timeline = require('../../data/timeline.js');

Page({
  data: {
    timeline: timeline,
    filteredTimeline: timeline,
    activeFilter: 'all',
    expandedIndex: -1,
    filters: [
      { key: 'all', label: '全部' },
      { key: 'birth', label: '出生' },
      { key: 'education', label: '教育' },
      { key: 'research', label: '研究' },
      { key: 'award', label: '荣誉' },
      { key: 'other', label: '其他' }
    ]
  },

  onLoad() {
    // 页面加载动画
  },

  onFilterTap(e) {
    const key = e.currentTarget.dataset.key;
    let filtered = this.data.timeline;
    
    if (key !== 'all') {
      filtered = this.data.timeline.filter(item => item.type === key);
    }
    
    this.setData({
      activeFilter: key,
      filteredTimeline: filtered,
      expandedIndex: -1
    });
  },

  onCardTap(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      expandedIndex: this.data.expandedIndex === index ? -1 : index
    });
  },

  onItemToggle(e) {
    // timeline-item 组件的展开/收起事件
    // 可用于统计或其他交互
  },

  getNodeColor(type) {
    const colors = {
      birth: '#C41E3A',
      education: '#8B9DAF',
      research: '#D4A574',
      award: '#C41E3A',
      other: '#8B9DAF'
    };
    return colors[type] || '#8B9DAF';
  },

  getTypeLabel(type) {
    const labels = {
      birth: '出生',
      education: '教育',
      research: '研究',
      award: '荣誉',
      other: '其他'
    };
    return labels[type] || '';
  }
});
