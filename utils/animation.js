// utils/animation.js - 动画工具

/**
 * 翻书动画
 * @param {Object} ctx - Canvas 2D context
 * @param {Number} progress - 动画进度 0-1
 * @param {Number} width - 画布宽度
 * @param {Number} height - 画布高度
 */
function bookFlipAnimation(ctx, progress, width, height) {
  const centerX = width * 0.3;
  const centerY = height / 2;
  
  // 计算书页旋转角度
  const angle = -progress * Math.PI * 0.8;
  
  ctx.save();
  ctx.translate(centerX, centerY);
  
  // 绘制书脊
  ctx.fillStyle = '#2C2C2C';
  ctx.fillRect(-10, -height * 0.35, 20, height * 0.7);
  
  // 绘制左页（固定）
  ctx.fillStyle = '#F5F0E8';
  ctx.fillRect(-width * 0.35, -height * 0.35, width * 0.35, height * 0.7);
  
  // 绘制右页（翻转）
  ctx.save();
  ctx.rotate(angle);
  
  // 页面阴影
  const shadowGradient = ctx.createLinearGradient(0, 0, width * 0.35, 0);
  shadowGradient.addColorStop(0, 'rgba(0,0,0,0.2)');
  shadowGradient.addColorStop(1, 'rgba(0,0,0,0)');
  
  ctx.fillStyle = '#F5F0E8';
  ctx.fillRect(0, -height * 0.35, width * 0.35, height * 0.7);
  
  ctx.fillStyle = shadowGradient;
  ctx.fillRect(0, -height * 0.35, width * 0.35, height * 0.7);
  
  ctx.restore();
  ctx.restore();
}

/**
 * 淡入上滑动画
 * @param {Object} element - 目标元素
 * @param {Number} delay - 延迟(ms)
 * @param {Number} duration - 持续时间(ms)
 */
function fadeInSlideUp(element, delay = 0, duration = 400) {
  setTimeout(() => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(40rpx)';
    element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    });
  }, delay);
}

/**
 * 缩放淡入动画
 * @param {Object} element - 目标元素
 * @param {Number} delay - 延迟(ms)
 * @param {Number} duration - 持续时间(ms)
 */
function scaleFadeIn(element, delay = 0, duration = 350) {
  setTimeout(() => {
    element.style.opacity = '0';
    element.style.transform = 'scale(0.92)';
    element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'scale(1)';
    });
  }, delay);
}

module.exports = {
  bookFlipAnimation,
  fadeInSlideUp,
  scaleFadeIn
};
