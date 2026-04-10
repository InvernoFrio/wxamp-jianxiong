// pages/reader/reader.js
const chaptersIndex = require('../../data/chapters/index.js');
const storage = require('../../utils/storage.js');

// Pre-import all chapter data (static require paths required by mini program)
const ch01Data = require('../../data/chapters/ch01.js');
const ch02Data = require('../../data/chapters/ch02.js');
const ch03Data = require('../../data/chapters/ch03.js');
const ch04Data = require('../../data/chapters/ch04.js');
const ch05Data = require('../../data/chapters/ch05.js');
const ch06Data = require('../../data/chapters/ch06.js');
const ch07Data = require('../../data/chapters/ch07.js');

const chapterDataMap = {
  ch01: ch01Data,
  ch02: ch02Data,
  ch03: ch03Data,
  ch04: ch04Data,
  ch05: ch05Data,
  ch06: ch06Data,
  ch07: ch07Data
};

Page({
  data: {
    chapters: chaptersIndex,
    activeChapter: 0,
    mode: 'list', // list | reading
    currentSection: null,
    sectionParagraphs: [],
    fontSize: 30,
    lineHeight: 2.2,
    readMinutes: 0,
    progress: {},
    showNotesPanel: false,
    showNoteEditor: false,
    noteDraft: '',
    noteSelectedText: '',
    noteSelectedParaIndex: -1,
    noteTargetSection: null,
    notesTab: 'highlights', // highlights | notes
    highlights: [],
    notes: [],
    readingProgress: 0,
    readingScrollHeight: 0
  },

  onLoad() {
    const progress = storage.getReadingProgress();
    const settings = storage.getSettings();
    this.setData({
      progress: progress,
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      highlights: storage.getHighlights(),
      notes: storage.getNotes()
    });
    if (progress.chapterIndex !== undefined && progress.chapterIndex < chaptersIndex.length) {
      this.setData({ activeChapter: progress.chapterIndex });
      if (progress.sectionId) {
        this._openSection(progress.chapterIndex, progress.sectionId);
      }
    }
    this._updateReadingScrollHeight();
  },

  onShow() {
    this.setData({
      highlights: storage.getHighlights(),
      notes: storage.getNotes()
    });
    this._updateReadingScrollHeight();
  },

  onChapterTap(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeChapter: index,
      mode: 'list',
      currentSection: null
    });
    this._updateReadingScrollHeight();
  },

  onSectionTap(e) {
    const sectionId = e.currentTarget.dataset.id;
    this._openSection(this.data.activeChapter, sectionId);
  },

  onBackToList() {
    this.setData({ mode: 'list', currentSection: null, readingProgress: 0 });
    this._updateReadingScrollHeight();
  },

  onReadingScroll(e) {
    const { scrollTop, scrollHeight } = e.detail;
    if (!scrollHeight || scrollHeight <= 0) return;
    // 简单进度估算（scrollTop / (scrollHeight - 可见高度)）
    // 用 0.65 近似可见区域占比
    const viewRatio = 0.65;
    const totalScrollable = scrollHeight * (1 - viewRatio);
    if (totalScrollable <= 0) return;
    const progress = Math.min(100, Math.round((scrollTop / totalScrollable) * 100));
    this.setData({ readingProgress: progress });
  },

  onHighlight(e) {
    var detail = e.detail;
    var text = detail.text;
    var paraIndex = detail.paraIndex;
    var section = this.data.currentSection;
    if (!section) return;
    storage.addHighlight({
      text: text.substring(0, 100),
      sectionId: section.id,
      sectionTitle: section.title,
      chapterIndex: this.data.activeChapter,
      paraIndex: paraIndex
    });
    this.setData({ highlights: storage.getHighlights() });
    wx.showToast({ title: '已高亮', icon: 'success' });
  },

  onNote(e) {
    var detail = e.detail;
    var text = detail.text;
    var paraIndex = detail.paraIndex;
    var section = this.data.currentSection;
    if (!section) return;

    this.setData({
      showNoteEditor: true,
      noteDraft: '',
      noteSelectedText: text.substring(0, 80),
      noteSelectedParaIndex: paraIndex,
      noteTargetSection: section
    });
  },

  onToggleNotesPanel() {
    this.setData({
      showNotesPanel: !this.data.showNotesPanel,
      highlights: storage.getHighlights(),
      notes: storage.getNotes()
    });
  },

  onNotesTabChange(e) {
    this.setData({ notesTab: e.currentTarget.dataset.tab });
  },

  onDeleteHighlight(e) {
    var id = e.currentTarget.dataset.id;
    storage.removeHighlight(id);
    this.setData({ highlights: storage.getHighlights() });
  },

  onDeleteNote(e) {
    var id = e.currentTarget.dataset.id;
    storage.removeNote(id);
    this.setData({ notes: storage.getNotes() });
  },

  onJumpToHighlight(e) {
    var dataset = e.currentTarget.dataset;
    var chapterIndex = dataset.chapter;
    var sectionId = dataset.section;
    if (chapterIndex === undefined || !sectionId) return;

    this.setData({
      activeChapter: chapterIndex,
      showNotesPanel: false
    });

    setTimeout(() => {
      var chapter = this.data.chapters[chapterIndex];
      if (!chapter) return;
      var chapterData = chapterDataMap[chapter.id];
      if (!chapterData) return;
      var section = chapterData.sections.find(function (s) { return s.id === sectionId; });
      if (section) {
        this.setData({
          mode: 'reading',
          currentSection: section,
          sectionParagraphs: section.paragraphs || []
        });
        storage.saveReadingProgress(chapterIndex, 0, sectionId);
      }
    }, 100);
  },

  onJumpToNote(e) {
    this.onJumpToHighlight(e);
  },

  onCloseNotesPanel() {
    this.setData({ showNotesPanel: false });
  },

  onCloseNoteEditor() {
    this.setData({ showNoteEditor: false, noteDraft: '' });
  },

  noop() { },

  onNoteDraftInput(e) {
    this.setData({ noteDraft: e.detail.value });
  },

  onSaveNote() {
    const section = this.data.noteTargetSection;
    const noteContent = (this.data.noteDraft || '').trim();
    if (!section) return;
    if (!noteContent) {
      wx.showToast({ title: '请输入笔记内容', icon: 'none' });
      return;
    }

    storage.addNote({
      text: this.data.noteSelectedText,
      note: noteContent,
      sectionId: section.id,
      sectionTitle: section.title,
      chapterIndex: this.data.activeChapter,
      paraIndex: this.data.noteSelectedParaIndex
    });
    this.setData({
      notes: storage.getNotes(),
      showNoteEditor: false,
      noteDraft: '',
      noteSelectedText: '',
      noteSelectedParaIndex: -1,
      noteTargetSection: null
    });
    wx.showToast({ title: '笔记已保存', icon: 'success' });
  },

  _updateReadingScrollHeight() {
    const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    // Reserve less vertical space so正文区域更高，提升可读面积
    const fallbackHeight = Math.max(360, Math.floor(windowInfo.windowHeight - 180));
    this.setData({ readingScrollHeight: fallbackHeight });
  },

  _openSection(chapterIndex, sectionId) {
    const chapter = this.data.chapters[chapterIndex];
    if (!chapter) return;

    const chapterId = chapter.id;
    const chapterData = chapterDataMap[chapterId];
    if (!chapterData) {
      wx.showToast({ title: '章节数据未找到', icon: 'none' });
      return;
    }

    const section = chapterData.sections.find(function (s) { return s.id === sectionId; });
    if (!section) return;

    // 计算阅读时长（按中文400字/分钟）
    const paragraphs = section.paragraphs || [];
    const charCount = paragraphs.reduce((sum, p) => sum + p.length, 0);
    const readMinutes = Math.max(1, Math.ceil(charCount / 400));

    this.setData({
      activeChapter: chapterIndex,
      mode: 'reading',
      currentSection: section,
      sectionParagraphs: paragraphs,
      readMinutes: readMinutes
    });
    storage.saveReadingProgress(chapterIndex, 0, sectionId);
    setTimeout(() => this._updateReadingScrollHeight(), 0);
  }
});
