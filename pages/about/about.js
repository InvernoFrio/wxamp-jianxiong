// pages/about/about.js
Page({
  data: {
    teams: [
      {
        name: '张俊贤',
        role: '项目负责人',
        desc: '负责项目统筹与开发',
        avatar: '/assets/avatar/zjx.jpg'
      },
      {
        name: '黄亮哲',
        role: '团队成员',
        desc: '负责内容策划与视觉设计',
        avatar: '/assets/avatar/hlz.jpg'
      },
      {
        name: '陈钟宇',
        role: '团队成员',
        desc: '负责实验设计与内容优化',
        avatar: '/assets/avatar/czy.jpg'
      },
      {
        name: '杨佳园',
        role: '团队成员',
        desc: '负责人工智能接入与视觉设计',
        avatar: '/assets/avatar/yjy.jpg'
      },
      {
        name: '贺天壮',
        role: '项目指导',
        desc: '负责项目方向指导、技术路线把关与成果质量优化',
        avatar: '/assets/avatar/htz.jpg'
      }
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
      title: '钴光拾遗 - 吴健雄数字纪念馆',
      path: '/pages/home/home'
    };
  }
});
