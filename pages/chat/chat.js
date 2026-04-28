Page({
  data: {
    messages: [],
    inputText: '',
    loading: false,
    scrollTo: '',
    suggestions: [
      '您为什么被称为"核物理女王"？',
      '什么是宇称不守恒？',
      '您的实验为什么那么难？',
      '您对今天学物理的学生有什么期望？'
    ]
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  useSuggestion(e) {
    const text = e.currentTarget.dataset.text;
    this.setData({ inputText: text }, () => {
      this.sendMessage();
    });
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
      scrollTo: `msg-${newMessages.length - 1}`
    });

    try {
      const res = await wx.cloud.callFunction({
        name: 'chatWithWu',
        data: { messages: newMessages }
      });

      if (res.result && res.result.success) {
        const finalMessages = [
          ...newMessages,
          { role: 'assistant', content: res.result.reply }
        ];
        this.setData({
          messages: finalMessages,
          loading: false,
          scrollTo: `msg-${finalMessages.length - 1}`
        });
      } else {
        this.showError((res.result && res.result.error) || '请求失败');
      }
    } catch (err) {
      console.error(err);
      this.showError('网络异常，请稍后重试');
    }
  },

  showError(msg) {
    this.setData({ loading: false });
    wx.showToast({ title: msg, icon: 'none', duration: 2000 });
  }
});