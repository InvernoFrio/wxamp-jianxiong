// 初始提示问题库：进入页面时随机抽 4 个展示
const INITIAL_QUESTION_POOL = [
  '您为什么被称为“核物理女王”？',
  '什么是宇称不守恒？',
  '您的实验为什么那么难？',
  '您对今天学物理的学生有什么期望？',
  '钴-60实验到底证明了什么？',
  '李政道、杨振宁的理论和您的实验是什么关系？',
  'β衰变是什么？',
  '弱相互作用和普通的力有什么区别？',
  '您当年为什么选择研究物理？',
  '您在哥伦比亚大学做了哪些重要研究？',
  '曼哈顿计划中您参与了什么工作？',
  '您如何看待科学研究中的失败？',
  '您如何设计一个可靠的物理实验？',
  '在那个年代，女性做科研遇到了哪些困难？',
  '您如何看待诺贝尔奖的遗憾？',
  '您最看重科学家的哪种品质？',
  '什么是镜像世界中的物理规律？',
  '为什么说您的实验改变了人类对宇宙的理解？',
  '如果我物理基础不好，还能学懂您的实验吗？',
  '您会给今天的大学生什么建议？',
  '科学研究中耐心重要吗？',
  '实验物理和理论物理有什么区别？',
  '您认为物理学最迷人的地方是什么？',
  '普通人应该怎样理解宇称不守恒？'
]

// 后续话题规则：根据用户问题 + AI回答里的关键词生成 3 个继续聊的话题
const FOLLOW_UP_RULES = [
  {
    keys: ['宇称', '镜像', '左右', '对称', '弱相互作用', 'β衰变', '钴-60'],
    questions: [
      '为什么弱相互作用会打破左右对称？',
      '钴-60实验的关键步骤是什么？',
      '如果宇称守恒，实验结果应该是什么样？',
      '这个发现为什么震动了整个物理学界？'
    ]
  },
  {
    keys: ['诺贝尔', '李政道', '杨振宁', '遗憾', '奖'],
    questions: [
      '您如何看待理论和实验之间的关系？',
      '为什么实验贡献有时容易被忽视？',
      '您觉得科学荣誉和科学真相哪个更重要？',
      '这件事对后来的女性科学家有什么影响？'
    ]
  },
  {
    keys: ['女性', '困难', '歧视', '时代', '大学', '学生'],
    questions: [
      '您当时如何面对性别偏见？',
      '今天的女生学物理还会遇到哪些挑战？',
      '您会怎样鼓励想做科研的年轻人？',
      '科学家需要怎样的心理韧性？'
    ]
  },
  {
    keys: ['实验', '设计', '数据', '误差', '验证', '低温', '磁场'],
    questions: [
      '一个好实验最重要的标准是什么？',
      '怎样判断实验结果是否可靠？',
      '实验物理为什么需要极强的细节控制？',
      '您的实验中最难控制的因素是什么？'
    ]
  },
  {
    keys: ['曼哈顿', '哥伦比亚', '核物理', '铀', '研究'],
    questions: [
      '您在核物理研究中最重要的贡献是什么？',
      '哥伦比亚大学时期对您有什么影响？',
      '核物理为什么在20世纪如此重要？',
      '您如何看待科学发现被用于战争？'
    ]
  }
]

// 没有明显关键词时使用的兜底后续问题
const DEFAULT_FOLLOW_UPS = [
  '能不能用更简单的比喻解释这个问题？',
  '这个问题和现代物理有什么关系？',
  '这个发现对普通人有什么意义？',
  '如果我要继续学习，应该先学哪些基础知识？',
  '您能讲一个相关的科研故事吗？',
  '这个问题最容易被误解的地方是什么？'
]

function pickRandomQuestions(pool, count) {
  const arr = [...pool]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }
  return arr.slice(0, count)
}

function detectMainTopic(question, answer) {
  const q = question || ''
  const a = answer || ''

  // 重点：优先看用户刚刚问的问题，其次看 AI 的回答。
  // 因为用户刚刚问的问题最能代表当前对话方向。
  const text = `${q}\n${a}`

  if (
    text.includes('宇称') ||
    text.includes('镜像') ||
    text.includes('左右对称') ||
    text.includes('弱相互作用') ||
    text.includes('β衰变') ||
    text.includes('钴-60')
  ) {
    return 'parity'
  }

  if (
    text.includes('实验') ||
    text.includes('测量') ||
    text.includes('数据') ||
    text.includes('误差') ||
    text.includes('低温') ||
    text.includes('磁场') ||
    text.includes('控制')
  ) {
    return 'experiment'
  }

  if (
    text.includes('理论') ||
    text.includes('李政道') ||
    text.includes('杨振宁') ||
    text.includes('验证') ||
    text.includes('预言')
  ) {
    return 'theoryExperiment'
  }

  if (
    text.includes('诺贝尔') ||
    text.includes('奖') ||
    text.includes('荣誉') ||
    text.includes('遗憾')
  ) {
    return 'nobel'
  }

  if (
    text.includes('女性') ||
    text.includes('女生') ||
    text.includes('性别') ||
    text.includes('歧视') ||
    text.includes('困难')
  ) {
    return 'womenScience'
  }

  if (
    text.includes('核物理') ||
    text.includes('曼哈顿') ||
    text.includes('铀') ||
    text.includes('哥伦比亚大学')
  ) {
    return 'nuclear'
  }

  if (
    text.includes('学生') ||
    text.includes('学习') ||
    text.includes('基础') ||
    text.includes('建议') ||
    text.includes('大学生')
  ) {
    return 'studyAdvice'
  }

  return 'default'
}

function buildFollowUpQuestions(question, answer) {
  const q = question || ''
  const a = answer || ''
  const text = `${q}\n${a}`

  // 1. 优先根据“刚刚这次回答”的核心内容判断主题
  // 不再把所有命中的题库混在一起随机抽，避免跳题。
  const topic = detectMainTopic(q, a)

  // 2. 根据主题生成递进式问题：
  // 第一个问“原理/概念”
  // 第二个问“实验/细节”
  // 第三个问“意义/影响/延伸”
  const topicMap = {
    parity: [
      '为什么说宇称不守恒打破了人们对“镜像世界”的直觉？',
      '钴-60实验中，最关键的观察结果是什么？',
      '宇称不守恒这个发现后来怎样影响了粒子物理的发展？'
    ],

    experiment: [
      '您刚才提到实验条件很严格，具体哪些条件最难控制？',
      '为什么实验物理必须反复验证数据，而不能只看一次结果？',
      '这个实验方法对后来的物理研究有什么启发？'
    ],

    theoryExperiment: [
      '理论物理学家的想法为什么需要实验来检验？',
      '在这项研究中，理论预言和实验验证分别起了什么作用？',
      '您觉得理论与实验之间最理想的关系是什么？'
    ],

    nobel: [
      '您如何看待科学贡献和科学荣誉之间的不完全一致？',
      '为什么实验工作有时比理论工作更不容易被公众看见？',
      '这段经历对后来女性科学家的处境有什么影响？'
    ],

    womenScience: [
      '您当时作为女性科学家，遇到的最大阻力是什么？',
      '面对不公平的环境，您靠什么坚持做研究？',
      '您会给今天想走科研道路的女生什么建议？'
    ],

    nuclear: [
      '核物理研究为什么在20世纪变得如此重要？',
      '您在核物理实验中最核心的贡献是什么？',
      '科学家应该怎样看待科学成果可能带来的社会影响？'
    ],

    studyAdvice: [
      '如果学生物理基础薄弱，应该先补哪些基础？',
      '学习抽象物理概念时，怎样避免只背结论？',
      '您认为真正的科学训练最重要的是什么？'
    ],

    default: [
      '您刚才回答中最核心的一点是什么？',
      '能不能用一个更生活化的比喻解释这个问题？',
      '如果继续深入学习这个话题，下一步应该了解什么？'
    ]
  }

  const result = topicMap[topic] || topicMap.default

  // 3. 避免和用户刚刚问过的问题完全重复
  return result.filter(item => item !== q).slice(0, 3)
}


function normalizeReply(result) {
  if (!result) return '抱歉，我暂时没有得到有效回复，请你再问一次。'

  if (typeof result === 'string') return result

  return (
    result.reply ||
    result.answer ||
    result.content ||
    result.message ||
    result.data?.reply ||
    result.data?.answer ||
    result.data?.content ||
    '抱歉，我暂时没有得到有效回复，请你再问一次。'
  )
}
Page({
  data: {
    messages: [],
    inputText: '',
    loading: false,
    scrollTo: '',
    suggestions: [],
    followUpQuestions: []
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  useSuggestion(e) {
    const text = e.currentTarget.dataset.text;
    if (!text || this.data.loading) return;
  
    this.setData({
      inputText: text
    }, () => {
      this.sendMessage();
    });
  },
  
  useFollowUp(e) {
    const text = e.currentTarget.dataset.text;
    if (!text || this.data.loading) return;
  
    this.setData({
      inputText: text
    }, () => {
      this.sendMessage();
    });
  },

  refreshSuggestions() {
    this.setData({
      suggestions: pickRandomQuestions(INITIAL_QUESTION_POOL, 4)
    })
  },

  async sendMessage() {
    const userText = this.data.inputText.trim();
    if (!userText || this.data.loading) return;
  
    const newMessages = [
      ...this.data.messages,
      { role: 'user', content: userText }
    ];
  
    this.setData({
      messages: newMessages,
      inputText: '',
      loading: true,
  
      // 新增：发送新问题时，先隐藏上一轮的后续问题
      followUpQuestions: [],
  
      scrollTo: `msg-${newMessages.length - 1}`
    });
  
    try {
      const res = await wx.cloud.callFunction({
        name: 'chatWithWu',
        data: { messages: newMessages }
      });
  
      if (res.result && res.result.success) {
        const reply = res.result.reply || '抱歉，我暂时没有得到有效回复，请你再问一次。';
  
        const finalMessages = [
          ...newMessages,
          { role: 'assistant', content: reply }
        ];
  
        this.setData({
          messages: finalMessages,
          loading: false,
  
          // 新增：根据这次用户问题和 AI 回答，生成 3 个后续话题
          followUpQuestions: buildFollowUpQuestions(userText, reply),
  
          scrollTo: `msg-${finalMessages.length - 1}`
        });
      } else {
        this.setData({
          loading: false,
          followUpQuestions: []
        });
  
        this.showError((res.result && res.result.error) || '请求失败');
      }
    } catch (err) {
      console.error(err);
  
      this.setData({
        loading: false,
        followUpQuestions: []
      });
  
      this.showError('网络异常，请稍后重试');
    }
  },

  showError(msg) {
    this.setData({ loading: false });
    wx.showToast({ title: msg, icon: 'none', duration: 2000 });
  },

  onLoad() {
    this.refreshSuggestions()
  },
});