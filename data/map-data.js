// data/map-data.js - 走格子地图数据
// 基于南京大学校园地标，以吴健雄生平为主题的藏宝图式探索地图

// 虚拟画布尺寸（用于节点定位，实际渲染时按屏幕比例缩放）
const MAP_WIDTH = 750;
const MAP_HEIGHT = 1100;

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

// 节点定义
const nodes = [
  {
    id: 'start',
    type: 'start',
    x: 375, y: 980,
    title: '南京大学校门',
    desc: '1912年，吴健雄出生于江苏太仓。让我们从南京大学出发，追寻她的足迹。',
    contentId: null
  },
  {
    id: 'library',
    type: 'read',
    x: 220, y: 820,
    title: '中央大学图书馆',
    desc: '1930年，吴健雄考入中央大学数学系，后转入物理系。图书馆里，她沉浸在物理学的世界中。',
    contentId: 'ch02-education'
  },
  {
    id: 'gym',
    type: 'story',
    x: 530, y: 820,
    title: '体育馆旧址',
    desc: '在中央大学求学期间，吴健雄不仅学业优异，还积极参加校园活动。',
    contentId: 'timeline-1930'
  },
  {
    id: 'gym_branch',
    type: 'branch',
    x: 530, y: 660,
    title: '十字路口',
    desc: '前方有两条路：一条通向科学馆（实验之路），一条通向大礼堂（学术之路）。选择你的探索方向！',
    contentId: null
  },
  {
    id: 'physics_lab',
    type: 'interact',
    x: 220, y: 520,
    title: '物理实验室',
    desc: '吴健雄在β衰变实验中展现了非凡的实验天赋。来体验她曾经做过的物理实验吧！',
    contentId: 'exp-parity'
  },
  {
    id: 'science_hall',
    type: 'interact',
    x: 620, y: 520,
    title: '科学馆',
    desc: '宇称不守恒实验震惊了物理学界。在这里，你可以亲手模拟这个改变世界的实验。',
    contentId: 'exp-diffusion'
  },
  {
    id: 'auditorium',
    type: 'book',
    x: 440, y: 520,
    title: '大礼堂',
    desc: '翻开这本关于吴健雄的传记，聆听她在学术殿堂中的声音。',
    contentId: 'reader'
  },
  {
    id: 'admin',
    type: 'story',
    x: 220, y: 350,
    title: '行政楼',
    desc: '1936年，吴健雄远赴美国加州大学伯克利分校，开启了她的物理学传奇。',
    contentId: 'timeline-1936'
  },
  {
    id: 'teaching',
    type: 'story',
    x: 440, y: 350,
    title: '教学楼',
    desc: '吴健雄在哥伦比亚大学任教多年，培养了一代又一代物理学人才。',
    contentId: 'timeline-1950'
  },
  {
    id: 'research',
    type: 'read',
    x: 620, y: 350,
    title: '研究所',
    desc: '阅读吴健雄在β衰变和宇称不守恒方面的开创性研究成果。',
    contentId: 'ch03-research'
  },
  {
    id: 'memorial',
    type: 'end',
    x: 420, y: 120,
    title: '吴健雄纪念堂',
    desc: '恭喜你完成了本轮探索！吴健雄的精神将永远激励着我们。',
    contentId: null
  }
];

// 边（路径连接）
const edges = [
  { from: 'start', to: 'library' },
  { from: 'start', to: 'gym' },
  { from: 'library', to: 'physics_lab' },
  { from: 'gym', to: 'gym_branch' },
  { from: 'gym_branch', to: 'science_hall' },
  { from: 'gym_branch', to: 'auditorium' },
  { from: 'physics_lab', to: 'admin' },
  { from: 'science_hall', to: 'research' },
  { from: 'auditorium', to: 'teaching' },
  { from: 'admin', to: 'memorial' },
  { from: 'teaching', to: 'memorial' },
  { from: 'research', to: 'memorial' }
];

// 路线定义（从起点到终点的完整路径）
const routes = [
  {
    id: 'route-left',
    name: '求学之路',
    desc: '从图书馆到实验室，追寻吴健雄的学术足迹',
    nodes: ['start', 'library', 'physics_lab', 'admin', 'memorial'],
    color: '#5B8DEF'
  },
  {
    id: 'route-center',
    name: '传承之路',
    desc: '从体育馆到大礼堂，感受吴健雄的教育精神',
    nodes: ['start', 'gym', 'gym_branch', 'auditorium', 'teaching', 'memorial'],
    color: '#E67E22'
  },
  {
    id: 'route-right',
    name: '探索之路',
    desc: '从体育馆到科学馆，体验物理学的奥秘',
    nodes: ['start', 'gym', 'gym_branch', 'science_hall', 'research', 'memorial'],
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
  MAP_WIDTH,
  MAP_HEIGHT,
  NODE_TYPES,
  nodes,
  edges,
  routes,
  contentMap
};
