// utils/haptics.js - 全局触控振动反馈

const DEFAULT_INTERVAL = 90;

let lastVibrateAt = 0;

function canVibrate(interval) {
  const now = Date.now();
  if (now - lastVibrateAt < interval) return false;
  lastVibrateAt = now;
  return true;
}

function vibrate(type = 'light', interval = DEFAULT_INTERVAL) {
  if (!canVibrate(interval)) return;
  try {
    wx.vibrateShort({
      type,
      fail: () => {}
    });
  } catch (e) {
    // 部分开发环境或旧基础库不支持，静默忽略。
  }
}

function tap() {
  vibrate('light', DEFAULT_INTERVAL);
}

function confirm() {
  vibrate('medium', 120);
}

function shouldHaptic(args) {
  const event = args && args[0];
  if (!event || typeof event !== 'object') return false;
  if (event.type !== 'tap' && event.type !== 'longpress' && event.type !== 'longtap') return false;

  const dataset = (event.currentTarget && event.currentTarget.dataset) || {};
  if (dataset.noHaptic) return false;

  return true;
}

function wrapMethod(fn) {
  return function wrappedHapticMethod() {
    if (shouldHaptic(arguments)) tap();
    return fn.apply(this, arguments);
  };
}

function installGlobalHaptics() {
  const root = typeof globalThis !== 'undefined' ? globalThis : {};
  if (root.__hapticsInstalled) return;
  root.__hapticsInstalled = true;

  const originalPage = typeof Page === 'function' ? Page : null;
  const originalComponent = typeof Component === 'function' ? Component : null;

  if (originalPage) {
    Page = function hapticPage(options) {
      Object.keys(options || {}).forEach(key => {
        if (typeof options[key] === 'function') {
          options[key] = wrapMethod(options[key]);
        }
      });
      return originalPage(options);
    };
  }

  if (originalComponent) {
    Component = function hapticComponent(options) {
      const methods = options && options.methods;
      if (methods) {
        Object.keys(methods).forEach(key => {
          if (typeof methods[key] === 'function') {
            methods[key] = wrapMethod(methods[key]);
          }
        });
      }
      return originalComponent(options);
    };
  }
}

module.exports = {
  tap,
  confirm,
  vibrate,
  installGlobalHaptics
};
