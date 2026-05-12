// utils/storage.js - 本地存储封装

const KEYS = {
  READING_PROGRESS: 'readingProgress',
  HIGHLIGHTS: 'highlights',
  NOTES: 'notes',
  BOOKMARKS: 'bookmarks',
  BOOK_OPENED: 'bookOpened',
  SETTINGS: 'readerSettings'
};

function _genId() {
  return Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

// ── 阅读进度 ──────────────────────────────────

function getReadingProgress() {
  return wx.getStorageSync(KEYS.READING_PROGRESS) || {};
}

function saveReadingProgress(chapterIndex, percent, sectionId, scrollOffset) {
  const progress = getReadingProgress();
  progress.chapterIndex = chapterIndex;
  progress.percent = percent;
  if (sectionId) progress.sectionId = sectionId;
  if (scrollOffset !== undefined) progress.scrollOffset = scrollOffset;
  progress.lastRead = new Date().toISOString();
  wx.setStorageSync(KEYS.READING_PROGRESS, progress);
}

// ── 高亮 ──────────────────────────────────────

function getHighlights() {
  return wx.getStorageSync(KEYS.HIGHLIGHTS) || [];
}

function addHighlight(highlight) {
  const highlights = getHighlights();
  highlights.push({
    ...highlight,
    id: _genId(),
    createdAt: new Date().toISOString()
  });
  wx.setStorageSync(KEYS.HIGHLIGHTS, highlights);
}

function removeHighlight(id) {
  const highlights = getHighlights().filter(h => h.id !== id);
  wx.setStorageSync(KEYS.HIGHLIGHTS, highlights);
}

// ── 笔记 ──────────────────────────────────────

function getNotes() {
  return wx.getStorageSync(KEYS.NOTES) || [];
}

function addNote(note) {
  const notes = getNotes();
  notes.push({
    ...note,
    id: _genId(),
    createdAt: new Date().toISOString()
  });
  wx.setStorageSync(KEYS.NOTES, notes);
}

function removeNote(id) {
  const notes = getNotes().filter(n => n.id !== id);
  wx.setStorageSync(KEYS.NOTES, notes);
}

// ── 书签 ──────────────────────────────────────

function getBookmarks() {
  return wx.getStorageSync(KEYS.BOOKMARKS) || [];
}

function addBookmark(bookmark) {
  const bookmarks = getBookmarks();
  // 避免重复书签同一小节
  const exists = bookmarks.find(b => b.sectionId === bookmark.sectionId);
  if (exists) return false;
  bookmarks.push({
    ...bookmark,
    id: _genId(),
    createdAt: new Date().toISOString()
  });
  wx.setStorageSync(KEYS.BOOKMARKS, bookmarks);
  return true;
}

function removeBookmark(id) {
  const bookmarks = getBookmarks().filter(b => b.id !== id);
  wx.setStorageSync(KEYS.BOOKMARKS, bookmarks);
}

function isBookmarked(sectionId) {
  const bookmarks = getBookmarks();
  return bookmarks.some(b => b.sectionId === sectionId);
}

// ── 设置 ──────────────────────────────────────

function getSettings() {
  return wx.getStorageSync(KEYS.SETTINGS) || {
    fontSize: 30,
    lineHeight: 2.2,
    paragraphSpacing: 28,
    theme: 'paper'
  };
}

function saveSettings(settings) {
  wx.setStorageSync(KEYS.SETTINGS, settings);
}

module.exports = {
  KEYS,
  getReadingProgress,
  saveReadingProgress,
  getHighlights,
  addHighlight,
  removeHighlight,
  getNotes,
  addNote,
  removeNote,
  getBookmarks,
  addBookmark,
  removeBookmark,
  isBookmarked,
  getSettings,
  saveSettings
};
