// pages/reader/reader.js
const chaptersIndex = require('../../data/chapters/index.json');

// 章节数据缓存
const chaptersCache = {};

Page({
  data: {
    chapters: chaptersIndex,
    activeChapter: 0,
    currentChapter: chaptersIndex[0],
    currentSections: [],
    readProgress: 0,
    scrollTop: 0,
    showHighlightPopup: false,
    selectedText: '',
    activeSection: -1,
    isLoading: false
  },

  onLoad() {
    // 加载阅读进度
    const progress = wx.getStorageSync('readingProgress') || {};
    const chapterIdx = progress.chapterIndex || 0;
    this.setData({
      activeChapter: chapterIdx,
      currentChapter: chaptersIndex[chapterIdx]
    });
    this.loadChapterContent(chapterIdx);
  },

  // 加载章节内容
  loadChapterContent(chapterIndex) {
    const chapter = chaptersIndex[chapterIndex];
    if (!chapter) return;

    const chapterId = chapter.id;
    
    // 检查缓存
    if (chaptersCache[chapterId]) {
      this.setData({
        currentSections: chaptersCache[chapterId].sections,
        isLoading: false
      });
      return;
    }

    this.setData({ isLoading: true });

    // 动态加载章节JSON
    try {
      // 微信小程序中使用 require 动态加载
      const chapterData = require(`../../data/chapters/${chapterId}.json`);
      chaptersCache[chapterId] = chapterData;
      this.setData({
        currentSections: chapterData.sections,
        isLoading: false
      });
    } catch (err) {
      console.error('加载章节失败:', err);
      this.setData({
        currentSections: [],
        isLoading: false
      });
      wx.showToast({ title: '内容加载中', icon: 'none' });
    }
  },

  onChapterTap(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeChapter: index,
      currentChapter: chaptersIndex[index],
      scrollTop: 0,
      readProgress: 0,
      activeSection: -1
    });
    this.loadChapterContent(index);
    this.saveProgress(index, 0);
  },

  onSectionTap(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeSection: index });
    // 滚动到对应内容
    this.setData({ scrollTop: 0 });
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

  // 返回目录
  onBackToSections() {
    this.setData({ activeSection: -1, scrollTop: 0 });
  },

  // 上一节
  onPrevSection() {
    if (this.data.activeSection > 0) {
      this.setData({ 
        activeSection: this.data.activeSection - 1,
        scrollTop: 0
      });
    }
  },

  // 下一节
  onNextSection() {
    const sections = this.data.currentSections;
    if (this.data.activeSection < sections.length - 1) {
      this.setData({ 
        activeSection: this.data.activeSection + 1,
        scrollTop: 0
      });
    }
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
