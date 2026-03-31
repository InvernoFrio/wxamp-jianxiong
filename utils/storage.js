// utils/storage.js - 本地存储封装

const KEYS = {
  READING_PROGRESS: 'readingProgress',
  HIGHLIGHTS: 'highlights',
  NOTES: 'notes',
  BOOK_OPENED: 'bookOpened',
  SETTINGS: 'readerSettings'
};

/**
 * 获取阅读进度
 */
function getReadingProgress() {
  return wx.getStorageSync(KEYS.READING_PROGRESS) || {};
}

/**
 * 保存阅读进度
 */
function saveReadingProgress(chapterIndex, percent) {
  const progress = getReadingProgress();
  progress.chapterIndex = chapterIndex;
  progress.percent = percent;
  progress.lastRead = new Date().toISOString();
  wx.setStorageSync(KEYS.READING_PROGRESS, progress);
}

/**
 * 获取高亮列表
 */
function getHighlights() {
  return wx.getStorageSync(KEYS.HIGHLIGHTS) || [];
}

/**
 * 添加高亮
 */
function addHighlight(highlight) {
  const highlights = getHighlights();
  highlights.push({
    ...highlight,
    id: Date.now(),
    createdAt: new Date().toISOString()
  });
  wx.setStorageSync(KEYS.HIGHLIGHTS, highlights);
}

/**
 * 删除高亮
 */
function removeHighlight(id) {
  let highlights = getHighlights();
  highlights = highlights.filter(h => h.id !== id);
  wx.setStorageSync(KEYS.HIGHLIGHTS, highlights);
}

/**
 * 获取笔记列表
 */
function getNotes() {
  return wx.getStorageSync(KEYS.NOTES) || [];
}

/**
 * 添加笔记
 */
function addNote(note) {
  const notes = getNotes();
  notes.push({
    ...note,
    id: Date.now(),
    createdAt: new Date().toISOString()
  });
  wx.setStorageSync(KEYS.NOTES, notes);
}

/**
 * 删除笔记
 */
function removeNote(id) {
  let notes = getNotes();
  notes = notes.filter(n => n.id !== id);
  wx.setStorageSync(KEYS.NOTES, notes);
}

/**
 * 获取阅读设置
 */
function getSettings() {
  return wx.getStorageSync(KEYS.SETTINGS) || {
    fontSize: 30,
    lineHeight: 2.2,
    theme: 'paper' // paper | dark
  };
}

/**
 * 保存阅读设置
 */
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
  getSettings,
  saveSettings
};
