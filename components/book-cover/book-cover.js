Component({
  properties: {
    title: {
      type: String,
      value: '吴健雄传'
    },
    subtitle: {
      type: String,
      value: '物理学第一夫人'
    },
    author: {
      type: String,
      value: '张怀亮 编著'
    },
    innerTitle: {
      type: String,
      value: '健 雄 书 韵'
    },
    innerSubtitle: {
      type: String,
      value: '点击探索'
    }
  },

  data: {
    opening: false
  },

  methods: {
    onTap() {
      this.setData({ opening: !this.data.opening });
      this.triggerEvent('toggle', { opening: this.data.opening });
    },

    // 外部调用：打开
    open() {
      this.setData({ opening: true });
    },

    // 外部调用：关闭
    close() {
      this.setData({ opening: false });
    }
  }
});
