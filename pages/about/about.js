// pages/about/about.js
Page({
  data: {
    teams: [
      {
        name: '俊贤',
        role: '项目发起人 & 开发',
        desc: '负责小程序设计与开发'
      },
      {
        name: '成员B',
        role: '内容编辑',
        desc: '负责传记内容整理'
      },
      {
        name: '成员C',
        role: '视觉设计',
        desc: '负责UI设计与资源制作'
      }
    ],
    principles: [
      {
        icon: '🎨',
        title: '液态玻璃',
        desc: '灵感来自现代设计语言，采用毛玻璃效果营造通透感与层次感'
      },
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
