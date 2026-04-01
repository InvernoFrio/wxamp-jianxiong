// pages/about/about.js
Page({
  data: {
    teams: [
      { name: '张俊贤', role: '项目负责人', desc: '负责项目统筹与开发' },
      { name: '黄亮哲', role: '团队成员', desc: '负责内容策划与编辑' },
      { name: '陈钟宇', role: '团队成员', desc: '负责技术开发与实现' },
      { name: '杨佳园', role: '团队成员', desc: '负责视觉设计与制作' }
    ],
    principles: [
      {
        icon: '📖',
        title: '书香传承',
        desc: '以翻书动画为核心交互，致敬吴健雄先生的学术精神'
      },
      {
        icon: '⚛️',
        title: '实验可视化',
        desc: '用粒子动画再现宇称不守恒实验，让物理之美触手可及'
      }
    ]
  },

  onLoad() {},

  onShareAppMessage() {
    return {
      title: '健雄书韵 - 吴健雄数字纪念馆',
      path: '/pages/home/home'
    };
  }
});
