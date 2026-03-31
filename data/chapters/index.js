// data/chapters/index.js - 传记章节索引

const chapters = [
  {
    id: "ch01",
    title: "少年时代",
    subtitle: "浏河之畔，书香门第",
    pages: [1, 10],
    sections: [
      { id: "ch01-01", title: "家教", startPage: 1 },
      { id: "ch01-02", title: "姑苏求学", startPage: 4 },
      { id: "ch01-03", title: "师从胡适", startPage: 7 },
      { id: "ch01-04", title: "中央大学", startPage: 10 }
    ],
    coverColor: "#C41E3A"
  },
  {
    id: "ch02",
    title: "留美岁月",
    subtitle: "柏克利的东方之光",
    pages: [11, 25],
    sections: [
      { id: "ch02-01", title: "远渡重洋", startPage: 11 },
      { id: "ch02-02", title: "志在核物理", startPage: 15 },
      { id: "ch02-03", title: "名师出高徒", startPage: 20 }
    ],
    coverColor: "#8B9DAF"
  },
  {
    id: "ch03",
    title: "原子弹之母",
    subtitle: "曼哈顿计划的核心成员",
    pages: [26, 45],
    sections: [
      { id: "ch03-01", title: "二战与核物理", startPage: 26 },
      { id: "ch03-02", title: "加入曼哈顿计划", startPage: 30 },
      { id: "ch03-03", title: "娇小的中国女孩", startPage: 35 },
      { id: "ch03-04", title: "原子弹研制", startPage: 40 }
    ],
    coverColor: "#D4A574"
  },
  {
    id: "ch04",
    title: "β衰变权威",
    subtitle: "精准著称于世",
    pages: [46, 55],
    sections: [
      { id: "ch04-01", title: "β衰变研究", startPage: 46 },
      { id: "ch04-02", title: "世界权威地位", startPage: 50 },
      { id: "ch04-03", title: "未得到的回报", startPage: 53 }
    ],
    coverColor: "#C41E3A"
  },
  {
    id: "ch05",
    title: "宇称不守恒",
    subtitle: "推翻千年定律",
    pages: [56, 80],
    sections: [
      { id: "ch05-01", title: "从头说起", startPage: 56 },
      { id: "ch05-02", title: "两个怪物与θ-τ之谜", startPage: 58 },
      { id: "ch05-03", title: "什么是宇称守恒", startPage: 60 },
      { id: "ch05-04", title: "弱作用中宇称守恒吗", startPage: 63 },
      { id: "ch05-05", title: "艰难的实验", startPage: 66 },
      { id: "ch05-06", title: "千年定律被推翻", startPage: 70 },
      { id: "ch05-07", title: "震惊全球物理学界", startPage: 73 },
      { id: "ch05-08", title: "应得而未得的诺贝尔奖", startPage: 76 }
    ],
    coverColor: "#8B9DAF"
  },
  {
    id: "ch06",
    title: "弱矢量流守恒",
    subtitle: "确立新的守恒定律",
    pages: [81, 90],
    sections: [
      { id: "ch06-01", title: "新的守恒定律", startPage: 81 },
      { id: "ch06-02", title: "科学上的多种奉献", startPage: 85 }
    ],
    coverColor: "#D4A574"
  },
  {
    id: "ch07",
    title: "女权捍卫者",
    subtitle: "科学界的女性力量",
    pages: [91, 105],
    sections: [
      { id: "ch07-01", title: "物理界三大女科学家", startPage: 91 },
      { id: "ch07-02", title: "美国物理学会女会长", startPage: 95 },
      { id: "ch07-03", title: "科学上的龙女强人", startPage: 98 },
      { id: "ch07-04", title: "业余女权运动家", startPage: 101 }
    ],
    coverColor: "#C41E3A"
  },
  {
    id: "ch08",
    title: "成功的背后",
    subtitle: "爱情、家庭与人生",
    pages: [106, 125],
    sections: [
      { id: "ch08-01", title: "吴健雄与《第二次握手》", startPage: 106 },
      { id: "ch08-02", title: "爱情的空白与火花", startPage: 110 },
      { id: "ch08-03", title: "与袁家骝的婚姻", startPage: 115 },
      { id: "ch08-04", title: "家庭与事业", startPage: 120 }
    ],
    coverColor: "#8B9DAF"
  },
  {
    id: "ch09",
    title: "晚年与传承",
    subtitle: "科学遗产永存",
    pages: [126, 140],
    sections: [
      { id: "ch09-01", title: "多次回国访问", startPage: 126 },
      { id: "ch09-02", title: "吴健雄星", startPage: 130 },
      { id: "ch09-03", title: "荣誉与评价", startPage: 135 },
      { id: "ch09-04", title: "科学遗产", startPage: 138 }
    ],
    coverColor: "#D4A574"
  }
];

module.exports = chapters;
