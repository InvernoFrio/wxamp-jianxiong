// data/map-data.js - 走格子地图数据
// 点位坐标镜像自根目录 map_points.json，底图来自根目录 map.jpg。

const mapPoints = require('../map_points.js');

const MAP_IMAGE = '/map.jpg';
const MAP_WIDTH = mapPoints.image_size[0];
const MAP_HEIGHT = mapPoints.image_size[1];
const START_NODE_ID = 'zhengmen';

// 节点类型配置
const NODE_TYPES = {
  start:    { icon: '🚩', color: '#4CAF50', label: '起点' },
  story:    { icon: '📜', color: '#D4A574', label: '故事' },
  read:     { icon: '📘', color: '#5B8DEF', label: '阅读' },
  interact: { icon: '🔬', color: '#9C27B0', label: '互动' },
  book:     { icon: '📖', color: '#E67E22', label: '翻书' },
  branch:   { icon: '⭐', color: '#FFD700', label: '分支' },
  end:      { icon: '🏁', color: '#C41E3A', label: '终点' }
};

const pointConfig = {
  '正门': {
    id: START_NODE_ID,
    type: 'start',
    desc: '从正门进入地图，沿真实标点开始探索。',
    contentId: null
  },
  '图书馆': {
    id: 'library',
    type: 'read',
    desc: '在图书馆停留，阅读吴健雄求学时期的相关章节。',
    contentId: 'ch02-education'
  },
  '物理楼': {
    id: 'physics_building',
    type: 'interact',
    desc: '在物理楼体验与吴健雄研究相关的物理实验。',
    contentId: 'exp-parity'
  },
  '大礼堂': {
    id: 'auditorium',
    type: 'book',
    desc: '在大礼堂翻阅传记片段，继续了解她的学术人生。',
    contentId: 'reader'
  },
  '校史博物馆': {
    id: 'history_museum',
    type: 'story',
    desc: '在校史博物馆查看吴健雄求学年代附近的年表信息。',
    contentId: 'timeline-1930'
  },
  '科技馆': {
    id: 'science_museum',
    type: 'interact',
    desc: '在科技馆体验另一项物理互动内容。',
    contentId: 'exp-diffusion'
  },
  '北大楼': {
    id: 'north_building',
    type: 'end',
    desc: '到达北大楼，本轮路线探索完成。',
    contentId: null
  },
  '逸夫楼': {
    id: 'yifu_building',
    type: 'story',
    desc: '沿真实地图标点继续探索校园空间。',
    contentId: null
  },
  '知行楼': {
    id: 'zhixing_building',
    type: 'branch',
    desc: '这里连接多条探索路线，请选择下一处真实标点。',
    contentId: null
  },
  '树华楼': {
    id: 'shuhua_building',
    type: 'story',
    desc: '沿真实地图标点继续探索校园空间。',
    contentId: null
  }
};

function getPointConfig(name) {
  return pointConfig[name] || {
    id: name,
    type: 'story',
    desc: '沿真实地图标点继续探索校园空间。',
    contentId: null
  };
}

const nodes = mapPoints.points.map(point => {
  const config = getPointConfig(point.name);
  return {
    id: config.id,
    type: config.type,
    x: point.x,
    y: point.y,
    title: point.name,
    desc: config.desc,
    contentId: config.contentId
  };
});

// 边（路径连接）
const edges = [
  { from: START_NODE_ID, to: 'library' },
  { from: START_NODE_ID, to: 'zhixing_building' },
  { from: START_NODE_ID, to: 'history_museum' },
  { from: 'library', to: 'history_museum' },
  { from: 'history_museum', to: 'science_museum' },
  { from: 'science_museum', to: 'north_building' },
  { from: 'zhixing_building', to: 'physics_building' },
  { from: 'physics_building', to: 'shuhua_building' },
  { from: 'shuhua_building', to: 'yifu_building' },
  { from: 'yifu_building', to: 'north_building' },
  { from: 'library', to: 'auditorium' },
  { from: 'auditorium', to: 'north_building' }
];

// 路线定义（从起点到终点的完整路径）
const routes = [
  {
    id: 'route-left',
    name: '文献之路',
    desc: '从正门经图书馆、校史博物馆到北大楼',
    nodes: [START_NODE_ID, 'library', 'history_museum', 'science_museum', 'north_building'],
    color: '#5B8DEF'
  },
  {
    id: 'route-center',
    name: '物理之路',
    desc: '从正门经知行楼、物理楼、树华楼、逸夫楼到北大楼',
    nodes: [START_NODE_ID, 'zhixing_building', 'physics_building', 'shuhua_building', 'yifu_building', 'north_building'],
    color: '#E67E22'
  },
  {
    id: 'route-right',
    name: '讲堂之路',
    desc: '从正门经图书馆、大礼堂到北大楼',
    nodes: [START_NODE_ID, 'library', 'auditorium', 'north_building'],
    color: '#9C27B0'
  }
];

// 节点内容映射 - 关联到现有模块
const contentMap = {
  'ch02-education': { type: 'reader', chapterId: 2 },
  'ch03-research': { type: 'reader', chapterId: 3 },
  'timeline-1930': { type: 'timeline', year: 1930 },
  'timeline-1936': { type: 'timeline', year: 1936 },
  'timeline-1950': { type: 'timeline', year: 1950 },
  'exp-parity': { type: 'physics', experiment: 'parity' },
  'exp-diffusion': { type: 'physics', experiment: 'diffusion' },
  'reader': { type: 'reader', chapterId: 1 }
};

module.exports = {
  MAP_IMAGE,
  MAP_WIDTH,
  MAP_HEIGHT,
  START_NODE_ID,
  NODE_TYPES,
  nodes,
  edges,
  routes,
  contentMap
};
