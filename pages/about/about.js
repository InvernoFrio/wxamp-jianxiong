// pages/about/about.js
const musicConfig = require('../../data/music-config.js');
const musicPlayer = require('../../utils/music-player.js');

Page({
  data: {
    teams: [
      {
        name: '张俊贤',
        role: '项目负责人',
        desc: '负责项目统筹与开发',
        avatar: '/assets/avatar/zjx.jpg',
        musicKey: 'zhangjunxian',
        detail: '咕咕嘎嘎！联系我：1580757598@qq.com'
      },
      {
        name: '黄亮哲',
        role: '团队成员',
        desc: '负责后端服务管理，数据库搭建，影音模块页面开发，以及小程序页面结构维护',
        avatar: '/assets/avatar/hlz.jpg',
        musicKey: 'huangliangzhe',
        detail: '“真相永远只有一个！” ——江户川柯南\n「真実はいつも一つ！」 ——江戸川コナン'
      },
      {
        name: '陈钟宇',
        role: '团队成员',
        desc: '负责实验设计与内容优化',
        avatar: '/assets/avatar/czy.jpg',
        musicKey: 'chenzhongyu',
        detail: 'Good morning, good afternoon, good evening, and good night!联系我：QQ：847837795'
      },
      {
        name: '杨佳园',
        role: '团队成员',
        desc: '负责人工智能接入与视觉设计',
        avatar: '/assets/avatar/yjy.jpg',
        musicKey: 'yangjiayuan',
        detail: '大家好，我是杨佳园。没什么特别的才华，喜欢干饭，请多指教。'
      },
      {
        name: '贺天壮',
        role: '项目指导',
        desc: '负责项目方向指导、技术路线把关与成果质量优化',
        avatar: '/assets/avatar/htz.jpg',
        musicKey: 'hetianzhuang',
        detail: '负责项目主题立意、技术路线、内容准确性与最终呈现质量的指导，帮助团队在纪念性、教育性和交互体验之间取得平衡。'
      }
    ],
    principles: [
      {
        icon: '📖',
        title: '书香传承',
        desc: '以翻书动画为核心交互，致敬吴健雄先生的学术精神',
        detail: '“书香传承”强调以阅读作为进入纪念馆的第一入口。项目把传记章节、人物年表和实验故事组织成可持续阅读的数字书卷，让用户不是被动浏览资料，而是在翻页、摘录、笔记和章节切换中逐步接近吴健雄先生的成长、选择与科学精神。视觉上采用纸张、朱砂、金色和书页层次，保持沉静、克制而有纪念感的气质。'
      },
      {
        icon: '⚛️',
        title: '实验可视化',
        desc: '用粒子动画再现宇称不守恒实验，让物理之美触手可及',
        detail: '“实验可视化”希望把抽象的物理概念转化为可以观察、操作和比较的动态过程。项目围绕宇称不守恒、粒子扩散等内容设计交互实验，让用户通过拖动、播放、对比和观察结果理解科学问题从假设到证据的过程。它不是把实验简化成装饰动画，而是尽量保留现象、变量和结论之间的关系。'
      },
      {
        icon: '💬',
        title: 'AI 对话',
        desc: '通过 AI 模拟与吴健雄先生的对话，提供沉浸式学习体验',
        detail: '“AI 对话”用于补充传统阅读无法即时回应的问题。用户可以围绕人物经历、科学成就、实验背景与时代环境继续追问，系统以温和、克制的方式提供延展解释。这个设计理念的重点不是替代史料，而是帮助用户把零散信息串联成更完整的理解路径。'
      }
    ],
    showModal: false,
    modalTitle: '',
    modalContent: '',
    modalTrack: null,
    modalBgUrl: '',
    modalMusicEnabled: false
  },

  showModal(e) {
    const { section, name, title, index } = e.currentTarget.dataset;
    const itemIndex = Number(index);
    let modalTitle = section || '';
    let modalContent = '';
    let modalTrack = null;
    let modalBgUrl = '';
    let modalMusicEnabled = false;

    if (section === '团队成员') {
      const member = this.data.teams[itemIndex];
      if (member) {
        modalTitle = name || member.name;
        modalContent = `${member.role}\n${member.desc}\n\n${member.detail}`;
        modalTrack = musicConfig.team[member.musicKey] || null;
        modalBgUrl = modalTrack ? (modalTrack.backgroundUrl || '') : '';
        modalMusicEnabled = !!(modalTrack && modalTrack.url);
      }
    } else if (section === '设计理念') {
      const principle = this.data.principles[itemIndex];
      if (principle) {
        modalTitle = title || principle.title;
        modalContent = principle.detail;
      }
    } else {
      modalTitle = `${section} - 按钮 ${itemIndex + 1}`;
    }

    this.setData({
      showModal: true,
      modalTitle,
      modalContent,
      modalTrack,
      modalBgUrl,
      modalMusicEnabled
    });

    if (modalMusicEnabled) {
      musicPlayer.setTrack(modalTrack, { autoplay: true });
    }
  },

  closeModal() {
    if (this.data.modalMusicEnabled) {
      musicPlayer.stop();
    }
    this.setData({
      showModal: false,
      modalTrack: null,
      modalBgUrl: '',
      modalMusicEnabled: false
    });
  },

  onHide() {
    if (this.data.modalMusicEnabled) {
      musicPlayer.stop();
    }
  },

  onShareAppMessage() {
    return {
      title: '钴光拾遗 - 吴健雄数字纪念馆',
      path: '/pages/home/home'
    };
  }
});
