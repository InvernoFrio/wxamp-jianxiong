// utils/music-player.js
// 全局音乐播放器：同一时间只维护一个 InnerAudioContext，跨页面/章节共享播放进度。

let audioCtx = null;
let currentTrack = null;
let isPlaying = false;
const listeners = [];

function ensureAudio() {
  if (audioCtx) return audioCtx;
  audioCtx = wx.createInnerAudioContext();
  audioCtx.loop = true;
  audioCtx.obeyMuteSwitch = false;
  audioCtx.onPlay(() => {
    isPlaying = true;
    notify();
  });
  audioCtx.onPause(() => {
    isPlaying = false;
    notify();
  });
  audioCtx.onStop(() => {
    isPlaying = false;
    notify();
  });
  audioCtx.onEnded(() => {
    isPlaying = false;
    notify();
  });
  audioCtx.onError(() => {
    isPlaying = false;
    notify();
  });
  return audioCtx;
}

function notify() {
  const state = getState();
  listeners.slice().forEach(listener => listener(state));
}

function sameTrack(track) {
  return currentTrack && track && currentTrack.id === track.id && currentTrack.url === track.url;
}

function setTrack(track, options = {}) {
  if (!track || !track.url) return getState();
  const ctx = ensureAudio();
  const changingTrack = !sameTrack(track);
  if (changingTrack) {
    if (isPlaying) ctx.pause();
    currentTrack = {
      id: track.id || track.url,
      title: track.title || '背景音乐',
      url: track.url
    };
    ctx.src = currentTrack.url;
    isPlaying = false;
  }
  if (options.autoplay) ctx.play();
  notify();
  return getState();
}

function toggle() {
  const ctx = ensureAudio();
  if (!currentTrack || !currentTrack.url) return getState();
  if (isPlaying) {
    ctx.pause();
  } else {
    ctx.play();
  }
  return getState();
}

function pause() {
  if (audioCtx && isPlaying) audioCtx.pause();
  return getState();
}

function stop() {
  if (audioCtx) audioCtx.stop();
  return getState();
}

function subscribe(listener) {
  if (typeof listener !== 'function') return function noop() { };
  listeners.push(listener);
  listener(getState());
  return function unsubscribe() {
    const index = listeners.indexOf(listener);
    if (index >= 0) listeners.splice(index, 1);
  };
}

function getState() {
  return {
    isPlaying,
    track: currentTrack
  };
}

module.exports = {
  setTrack,
  toggle,
  pause,
  stop,
  subscribe,
  getState
};
