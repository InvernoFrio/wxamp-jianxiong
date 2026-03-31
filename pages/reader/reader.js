// pages/reader/reader.js
const chaptersIndex = require('../../data/chapters/index.json');

// 静态导入所有章节数据（微信小程序不支持动态require）
const chaptersData = {
  ch01: require('../../data/chapters/ch01.json'),
  ch02: require('../../data/chapters/ch02.json'),
  ch03: require('../../data/chapters/ch03.json'),
  ch04: require('../../data/chapters/ch04.json'),
  ch05: require('../../data/chapters/ch05.json'),
  ch06: require('../../data/chapters/ch06.json'),
  ch07: require('../../data/chapters/ch07.json')
};

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
    isLoading: false,
    // 笔记/高亮面板
    showNotesPanel: false,
    notesPanelTab: 'highlights', // 'highlights' | 'notes'
    highlightsList: [],
    notesList: []
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
    const chapterData = chaptersData[chapterId];
    
    if (chapterData) {
      this.setData({
        currentSections: chapterData.sections,
        isLoading: false
      });
    } else {
      this.setData({
        currentSections: [],
        isLoading: false
      });
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
    this.setData({ scrollTop: 0 });
  },

  onContentScroll(e) {
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
      const rv = this.selectComponent('#readerView');
      if (rv) rv.resetScroll();
    }
  },

  // 阅读进度回调
  onReadProgress(e) {
    const progress = e.detail.progress;
    this.setData({ readProgress: progress });
    this.saveProgress(this.data.activeChapter, progress);
  },

  // 文字选中回调
  onTextSelect(e) {
    const { text } = e.detail;
    this.setData({
      showHighlightPopup: true,
      selectedText: text
    });
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
    const highlights = wx.getStorageSync('highlights') || [];
    highlights.push({
      id: Date.now(),
      text: this.data.selectedText,
      chapter: this.data.currentChapter.title,
      chapterIndex: this.data.activeChapter,
      sectionIndex: this.data.activeSection,
      time: new Date().toISOString()
    });
    wx.setStorageSync('highlights', highlights);
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
            id: Date.now(),
            text: this.data.selectedText,
            note: res.content,
            chapter: this.data.currentChapter.title,
            chapterIndex: this.data.activeChapter,
            sectionIndex: this.data.activeSection,
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
  },

  // ========== 笔记/高亮面板 ==========

  // 打开笔记面板
  onOpenNotesPanel() {
    const highlights = wx.getStorageSync('highlights') || [];
    const notes = wx.getStorageSync('notes') || [];
    // 格式化时间显示
    const formatList = (list) => list.reverse().map(item => {
      const d = new Date(item.time);
      const m = d.getMonth() + 1;
      const day = d.getDate();
      const h = d.getHours().toString().padStart(2, '0');
      const min = d.getMinutes().toString().padStart(2, '0');
      return { ...item, timeFormatted: `${m}月${day}日 ${h}:${min}` };
    });
    this.setData({
      showNotesPanel: true,
      highlightsList: formatList(highlights),
      notesList: formatList(notes)
    });
  },

  // 关闭笔记面板
  onCloseNotesPanel() {
    this.setData({ showNotesPanel: false });
  },

  // 切换面板 tab
  onNotesPanelTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ notesPanelTab: tab });
  },

  // 阻止面板内部滚动穿透
  onPanelTouchMove() {
    // 阻止冒泡
  },

  // 跳转到高亮/笔记对应章节
  onJumpToHighlight(e) {
    const idx = e.currentTarget.dataset.index;
    const tab = this.data.notesPanelTab;
    const item = tab === 'highlights' ? this.data.highlightsList[idx] : this.data.notesList[idx];
    
    if (item) {
      const chapterIdx = item.chapterIndex !== undefined ? item.chapterIndex : 0;
      const sectionIdx = item.sectionIndex !== undefined ? item.sectionIndex : -1;
      
      this.setData({
        showNotesPanel: false,
        activeChapter: chapterIdx,
        currentChapter: chaptersIndex[chapterIdx],
        activeSection: sectionIdx,
        scrollTop: 0
      });
      this.loadChapterContent(chapterIdx);
    }
  },

  // 删除高亮
  onDeleteHighlight(e) {
    const idx = e.currentTarget.dataset.index;
    const highlights = this.data.highlightsList;
    const item = highlights[idx];
    if (!item) return;

    wx.showModal({
      title: '确认删除',
      content: '确定删除这条高亮吗？',
      success: (res) => {
        if (res.confirm) {
          // 从存储中删除
          let stored = wx.getStorageSync('highlights') || [];
          stored = stored.filter(h => h.id !== item.id);
          wx.setStorageSync('highlights', stored);
          
          // 更新面板列表
          highlights.splice(idx, 1);
          this.setData({ highlightsList: highlights });
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },

  // 删除笔记
  onDeleteNote(e) {
    const idx = e.currentTarget.dataset.index;
    const notes = this.data.notesList;
    const item = notes[idx];
    if (!item) return;

    wx.showModal({
      title: '确认删除',
      content: '确定删除这条笔记吗？',
      success: (res) => {
        if (res.confirm) {
          let stored = wx.getStorageSync('notes') || [];
          stored = stored.filter(n => n.id !== item.id);
          wx.setStorageSync('notes', stored);
          
          notes.splice(idx, 1);
          this.setData({ notesList: notes });
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },


});
