// pages/reader/reader.js
const chaptersIndex = require('../../data/chapters/index.js');
const storage = require('../../utils/storage.js');

// 静态引入所有章节数据
const chapterDataMap = {};
const CHAPTER_IDS = ['ch00','ch01','ch02','ch03','ch04','ch05','ch06','ch07','ch08','ch09'];
CHAPTER_IDS.forEach(id => {
  try { chapterDataMap[id] = require('../../data/chapters/' + id + '.js'); } catch (e) {}
});

Page({
  data: {
    chapters: chaptersIndex,
    activeChapter: 0,
    mode: 'list',
    currentSection: null,
    sectionParagraphs: [],
    fontSize: 30,
    lineHeight: 2.2,
    theme: 'paper',
    readMinutes: 0,
    readingProgress: 0,
    readingScrollHeight: 0,
    showNotesPanel: false,
    showNoteEditor: false,
    noteDraft: '',
    noteSelectedText: '',
    noteSelectedParaIndex: -1,
    noteTargetSection: null,
    notesTab: 'highlights',
    highlights: [],
    notes: [],
    showSettings: false,
    showSearch: false,
    searchQuery: '',
    searchResults: [],
    bookmarks: [],
    isCurrentBookmarked: false,
    prevSection: null,
    nextSection: null,
    sectionProgress: {}
  },

  onLoad() {
    const progress = storage.getReadingProgress();
    const settings = storage.getSettings();
    this.setData({
      fontSize: settings.fontSize || 30,
      lineHeight: settings.lineHeight || 2.2,
      theme: settings.theme || 'paper',
      highlights: storage.getHighlights(),
      notes: storage.getNotes(),
      bookmarks: storage.getBookmarks()
    });
    this._computeSectionProgress();
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
      notes: storage.getNotes(),
      bookmarks: storage.getBookmarks()
    });
    this._computeSectionProgress();
    this._updateReadingScrollHeight();
  },

  // ── 章节导航 ────────────────────────────────

  onChapterTap(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeChapter: index, mode: 'list', currentSection: null });
    this._computeSectionProgress();
  },

  onSectionTap(e) {
    this._openSection(this.data.activeChapter, e.currentTarget.dataset.id);
  },

  onBackToList() {
    this.setData({ mode: 'list', currentSection: null, readingProgress: 0 });
    this._computeSectionProgress();
  },

  // ── 上下节导航 ──────────────────────────────

  onPrevSection() {
    const prev = this.data.prevSection;
    if (prev) this._openSection(prev.chapterIndex, prev.id);
  },

  onNextSection() {
    const next = this.data.nextSection;
    if (next) this._openSection(next.chapterIndex, next.id);
  },

  // ── 阅读进度 ────────────────────────────────

  onReadingScroll(e) {
    const { scrollTop, scrollHeight } = e.detail;
    if (!scrollHeight || scrollHeight <= 0) return;
    const visibleHeight = this.data.readingScrollHeight || 400;
    const totalScrollable = Math.max(1, scrollHeight - visibleHeight);
    const progress = Math.min(100, Math.round((scrollTop / totalScrollable) * 100));
    this.setData({ readingProgress: progress });
    if (this._scrollTimer) clearTimeout(this._scrollTimer);
    this._scrollTimer = setTimeout(() => {
      const section = this.data.currentSection;
      if (section) {
        storage.saveReadingProgress(this.data.activeChapter, progress, section.id, scrollTop);
      }
    }, 2000);
  },

  // ── 高亮与笔记 ──────────────────────────────

  onHighlight(e) {
    const { text, paraIndex } = e.detail;
    const section = this.data.currentSection;
    if (!section) return;
    storage.addHighlight({
      text: text.substring(0, 100),
      sectionId: section.id,
      sectionTitle: section.title,
      chapterIndex: this.data.activeChapter,
      paraIndex
    });
    this.setData({ highlights: storage.getHighlights() });
    wx.showToast({ title: '已高亮', icon: 'success' });
  },

  onNote(e) {
    const { text, paraIndex } = e.detail;
    const section = this.data.currentSection;
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
    storage.removeHighlight(e.currentTarget.dataset.id);
    this.setData({ highlights: storage.getHighlights() });
  },

  onDeleteNote(e) {
    storage.removeNote(e.currentTarget.dataset.id);
    this.setData({ notes: storage.getNotes() });
  },

  onJumpToHighlight(e) {
    const { chapter, section } = e.currentTarget.dataset;
    if (chapter === undefined || !section) return;
    this.setData({ activeChapter: chapter, showNotesPanel: false });
    setTimeout(() => this._openSection(chapter, section), 100);
  },

  onJumpToNote(e) { this.onJumpToHighlight(e); },
  onCloseNotesPanel() { this.setData({ showNotesPanel: false }); },

  // ── 笔记编辑 ────────────────────────────────

  onCloseNoteEditor() { this.setData({ showNoteEditor: false, noteDraft: '' }); },
  noop() { },
  onNoteDraftInput(e) { this.setData({ noteDraft: e.detail.value }); },

  onSaveNote() {
    const section = this.data.noteTargetSection;
    const noteContent = (this.data.noteDraft || '').trim();
    if (!section || !noteContent) {
      if (!noteContent) wx.showToast({ title: '请输入笔记内容', icon: 'none' });
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
    this.setData({ notes: storage.getNotes(), showNoteEditor: false, noteDraft: '' });
    wx.showToast({ title: '笔记已保存', icon: 'success' });
  },

  // ── 设置面板 ────────────────────────────────

  onToggleSettings() { this.setData({ showSettings: !this.data.showSettings }); },
  onCloseSettings() { this.setData({ showSettings: false }); },

  onFontSizeChange(e) {
    const fontSize = e.detail.value;
    this.setData({ fontSize });
    const settings = storage.getSettings();
    settings.fontSize = fontSize;
    storage.saveSettings(settings);
  },

  onLineHeightChange(e) {
    const lineHeight = e.detail.value;
    this.setData({ lineHeight });
    const settings = storage.getSettings();
    settings.lineHeight = lineHeight;
    storage.saveSettings(settings);
  },

  onThemeToggle() {
    const theme = this.data.theme === 'paper' ? 'dark' : 'paper';
    this.setData({ theme });
    const settings = storage.getSettings();
    settings.theme = theme;
    storage.saveSettings(settings);
  },

  // ── 搜索 ────────────────────────────────────

  onToggleSearch() {
    this.setData({ showSearch: !this.data.showSearch, searchQuery: '', searchResults: [] });
  },

  onCloseSearch() {
    this.setData({ showSearch: false, searchQuery: '', searchResults: [] });
  },

  onSearchInput(e) {
    const query = (e.detail.value || '').trim();
    this.setData({ searchQuery: query });
    if (query.length < 2) { this.setData({ searchResults: [] }); return; }
    this._doSearch(query);
  },

  onSearchResultTap(e) {
    const { chapterindex, sectionid } = e.currentTarget.dataset;
    this.setData({ showSearch: false, searchQuery: '', searchResults: [] });
    this._openSection(parseInt(chapterindex), sectionid);
  },

  // ── 书签 ────────────────────────────────────

  onToggleBookmark() {
    const section = this.data.currentSection;
    if (!section) return;
    if (this.data.isCurrentBookmarked) {
      const bm = this.data.bookmarks.find(b => b.sectionId === section.id);
      if (bm) storage.removeBookmark(bm.id);
    } else {
      storage.addBookmark({
        sectionId: section.id,
        sectionTitle: section.title,
        chapterIndex: this.data.activeChapter,
        chapterTitle: chaptersIndex[this.data.activeChapter] ? chaptersIndex[this.data.activeChapter].title : ''
      });
    }
    const bookmarks = storage.getBookmarks();
    this.setData({ bookmarks, isCurrentBookmarked: storage.isBookmarked(section.id) });
  },

  onBookmarkTap(e) {
    this._openSection(parseInt(e.currentTarget.dataset.chapterindex), e.currentTarget.dataset.sectionid);
  },

  onDeleteBookmark(e) {
    storage.removeBookmark(e.currentTarget.dataset.id);
    const bookmarks = storage.getBookmarks();
    this.setData({
      bookmarks,
      isCurrentBookmarked: this.data.currentSection ? storage.isBookmarked(this.data.currentSection.id) : false
    });
  },

  // ── 内部方法 ────────────────────────────────

  _openSection(chapterIndex, sectionId) {
    const chapter = chaptersIndex[chapterIndex];
    if (!chapter) return;
    const chapterData = chapterDataMap[chapter.id];
    if (!chapterData) {
      wx.showToast({ title: '章节数据未找到', icon: 'none' });
      return;
    }
    const section = chapterData.sections.find(function(s) { return s.id === sectionId; });
    if (!section) return;

    const paragraphs = section.paragraphs || [];
    const charCount = paragraphs.reduce(function(sum, p) { return sum + p.length; }, 0);
    const readMinutes = Math.max(1, Math.ceil(charCount / 400));
    const adj = this._getAdjacentSections(chapterIndex, sectionId);

    this.setData({
      activeChapter: chapterIndex,
      mode: 'reading',
      currentSection: section,
      sectionParagraphs: paragraphs,
      readMinutes: readMinutes,
      readingProgress: 0,
      prevSection: adj.prev,
      nextSection: adj.next,
      isCurrentBookmarked: storage.isBookmarked(sectionId)
    });
    storage.saveReadingProgress(chapterIndex, 0, sectionId);
    setTimeout(() => this._updateReadingScrollHeight(), 0);
  },

  _getAdjacentSections(chapterIndex, sectionId) {
    const allSections = [];
    for (let ci = 0; ci < chaptersIndex.length; ci++) {
      const ch = chaptersIndex[ci];
      for (let si = 0; si < ch.sections.length; si++) {
        allSections.push({ id: ch.sections[si].id, title: ch.sections[si].title, chapterIndex: ci });
      }
    }
    const idx = allSections.findIndex(function(s) { return s.id === sectionId && s.chapterIndex === chapterIndex; });
    return {
      prev: idx > 0 ? allSections[idx - 1] : null,
      next: idx >= 0 && idx < allSections.length - 1 ? allSections[idx + 1] : null
    };
  },

  _updateReadingScrollHeight() {
    const sysInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    const rpxRatio = sysInfo.windowWidth / 750;
    const reserved = Math.round(180 * rpxRatio);
    const h = Math.max(360, Math.floor(sysInfo.windowHeight - reserved));
    this.setData({ readingScrollHeight: h });
  },

  _computeSectionProgress() {
    const progress = storage.getReadingProgress();
    const sectionProgress = {};
    if (progress.sectionId && progress.percent) {
      sectionProgress[progress.sectionId] = progress.percent;
    }
    this.setData({ sectionProgress: sectionProgress });
  },

  _doSearch(query) {
    const results = [];
    const q = query.toLowerCase();
    for (let ci = 0; ci < chaptersIndex.length; ci++) {
      const ch = chaptersIndex[ci];
      const chData = chapterDataMap[ch.id];
      if (!chData) continue;
      for (let si = 0; si < chData.sections.length; si++) {
        const section = chData.sections[si];
        const paras = section.paragraphs || [];
        for (let pi = 0; pi < paras.length; pi++) {
          const para = paras[pi];
          const lower = para.toLowerCase();
          if (lower.indexOf(q) !== -1) {
            const idx = lower.indexOf(q);
            const start = Math.max(0, idx - 20);
            const end = Math.min(para.length, idx + query.length + 20);
            const snippet = (start > 0 ? '...' : '') + para.substring(start, end) + (end < para.length ? '...' : '');
            results.push({
              chapterIndex: ci,
              chapterTitle: ch.title,
              sectionId: section.id,
              sectionTitle: section.title,
              paraIndex: pi,
              snippet: snippet
            });
            if (results.length >= 30) break;
          }
        }
        if (results.length >= 30) break;
      }
      if (results.length >= 30) break;
    }
    this.setData({ searchResults: results });
  }
});
