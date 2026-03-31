// pages/reader/reader.js
const chapters = require('../../data/chapters/index.js');

Page({
  data: {
    chapters: chapters,
    activeChapter: 0,
    currentChapter: chapters[0],
    readProgress: 0,
    scrollTop: 0,
    chapterContent: '',
    showHighlightPopup: false,
    selectedText: ''
  },

  onLoad() {
    // 加载阅读进度
    const progress = wx.getStorageSync('readingProgress') || {};
    if (progress.chapterIndex !== undefined) {
      this.setData({
        activeChapter: progress.chapterIndex,
        currentChapter: chapters[progress.chapterIndex]
      });
    }
  },

  onChapterTap(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeChapter: index,
      currentChapter: chapters[index],
      scrollTop: 0,
      readProgress: 0,
      chapterContent: ''
    });
    
    // 保存阅读进度
    this.saveProgress(index, 0);
  },

  onSectionTap(e) {
    const section = e.currentTarget.dataset.section;
    // TODO: 加载对应章节内容
    wx.showToast({
      title: `加载: ${section.title}`,
      icon: 'none'
    });
  },

  onContentScroll(e) {
    // 计算阅读进度
    const { scrollTop, scrollHeight, detail } = e.detail;
    const query = wx.createSelectorQuery();
    query.select('.content-scroll').boundingClientRect(rect => {
      if (rect) {
        const viewHeight = rect.height;
        const progress = Math.min(100, Math.round((scrollTop / (scrollHeight - viewHeight)) * 100));
        this.setData({ readProgress: progress });
        this.saveProgress(this.data.activeChapter, progress);
      }
    }).exec();
  },

  saveProgress(chapterIndex, percent) {
    const progress = wx.getStorageSync('readingProgress') || {};
    progress.chapterIndex = chapterIndex;
    progress.percent = percent;
    wx.setStorageSync('readingProgress', progress);
  },

  onTextLongPress(e) {
    const text = e.currentTarget.dataset.text;
    this.setData({
      showHighlightPopup: true,
      selectedText: text
    });
  },

  onPopupClose() {
    this.setData({ showHighlightPopup: false });
  },

  onHighlight() {
    // TODO: 实现高亮功能
    wx.showToast({ title: '已高亮', icon: 'success' });
    this.onPopupClose();
  },

  onAddNote() {
    wx.showModal({
      title: '写笔记',
      editable: true,
      placeholderText: '写下你的想法...',
      success: (res) => {
        if (res.confirm && res.content) {
          const notes = wx.getStorageSync('notes') || [];
          notes.push({
            text: this.data.selectedText,
            note: res.content,
            chapter: this.data.currentChapter.title,
            time: new Date().toISOString()
          });
          wx.setStorageSync('notes', notes);
          wx.showToast({ title: '笔记已保存', icon: 'success' });
        }
      }
    });
    this.onPopupClose();
  },

  onCopyText() {
    wx.setClipboardData({
      data: this.data.selectedText,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' });
      }
    });
    this.onPopupClose();
  }
});
