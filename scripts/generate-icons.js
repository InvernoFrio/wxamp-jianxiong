const { createCanvas } = require('/tmp/canvas-pkg/node_modules/canvas');
const fs = require('fs');
const path = require('path');

const ICON_DIR = path.join(__dirname, '..', 'assets', 'icons');
fs.mkdirSync(ICON_DIR, { recursive: true });

// 图标定义：简单的线性图标
function drawIcon(ctx, type, color, size = 48) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  const s = size;
  const c = s / 2;
  
  switch (type) {
    case 'home':
      // 书本/卷轴图标
      ctx.beginPath();
      ctx.moveTo(c, s * 0.2);
      ctx.lineTo(s * 0.2, s * 0.4);
      ctx.lineTo(s * 0.2, s * 0.8);
      ctx.lineTo(c, s * 0.65);
      ctx.lineTo(s * 0.8, s * 0.8);
      ctx.lineTo(s * 0.8, s * 0.4);
      ctx.closePath();
      ctx.stroke();
      // 书脊
      ctx.beginPath();
      ctx.moveTo(c, s * 0.2);
      ctx.lineTo(c, s * 0.65);
      ctx.stroke();
      break;
      
    case 'timeline':
      // 时间轴图标
      ctx.beginPath();
      ctx.moveTo(s * 0.35, s * 0.15);
      ctx.lineTo(s * 0.35, s * 0.85);
      ctx.stroke();
      // 节点
      [0.25, 0.45, 0.65].forEach(y => {
        ctx.beginPath();
        ctx.arc(s * 0.35, s * y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(s * 0.45, s * y);
        ctx.lineTo(s * 0.75, s * y);
        ctx.stroke();
      });
      break;
      
    case 'reader':
      // 阅读/文字图标
      ctx.beginPath();
      ctx.moveTo(s * 0.25, s * 0.25);
      ctx.lineTo(s * 0.75, s * 0.25);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s * 0.25, s * 0.4);
      ctx.lineTo(s * 0.65, s * 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s * 0.25, s * 0.55);
      ctx.lineTo(s * 0.75, s * 0.55);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s * 0.25, s * 0.7);
      ctx.lineTo(s * 0.55, s * 0.7);
      ctx.stroke();
      break;
      
    case 'physics':
      // 原子/物理图标
      ctx.beginPath();
      ctx.arc(c, c, s * 0.15, 0, Math.PI * 2);
      ctx.fill();
      // 轨道
      ctx.beginPath();
      ctx.ellipse(c, c, s * 0.35, s * 0.15, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(c, c, s * 0.35, s * 0.15, Math.PI / 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(c, c, s * 0.35, s * 0.15, -Math.PI / 3, 0, Math.PI * 2);
      ctx.stroke();
      break;
      
    case 'about':
      // 人物图标
      ctx.beginPath();
      ctx.arc(c, s * 0.3, s * 0.15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s * 0.25, s * 0.85);
      ctx.quadraticCurveTo(s * 0.25, s * 0.55, c, s * 0.55);
      ctx.quadraticCurveTo(s * 0.75, s * 0.55, s * 0.75, s * 0.85);
      ctx.stroke();
      break;
  }
}

const icons = [
  { name: 'home', label: '首页' },
  { name: 'timeline', label: '年表' },
  { name: 'reader', label: '阅读' },
  { name: 'physics', label: '物理' },
  { name: 'about', label: '关于' }
];

const INACTIVE_COLOR = '#8B9DAF';
const ACTIVE_COLOR = '#C41E3A';

icons.forEach(icon => {
  // 普通状态
  const canvas1 = createCanvas(48, 48);
  const ctx1 = canvas1.getContext('2d');
  drawIcon(ctx1, icon.name, INACTIVE_COLOR);
  const buf1 = canvas1.toBuffer('image/png');
  fs.writeFileSync(path.join(ICON_DIR, `${icon.name}.png`), buf1);
  console.log(`✓ ${icon.name}.png`);
  
  // 选中状态
  const canvas2 = createCanvas(48, 48);
  const ctx2 = canvas2.getContext('2d');
  drawIcon(ctx2, icon.name, ACTIVE_COLOR);
  const buf2 = canvas2.toBuffer('image/png');
  fs.writeFileSync(path.join(ICON_DIR, `${icon.name}-active.png`), buf2);
  console.log(`✓ ${icon.name}-active.png`);
});

// 生成宣纸纹理背景
const TEX_DIR = path.join(__dirname, '..', 'assets', 'textures');
fs.mkdirSync(TEX_DIR, { recursive: true });

const texCanvas = createCanvas(200, 200);
const texCtx = texCanvas.getContext('2d');

// 宣纸底色
texCtx.fillStyle = '#F5F0E8';
texCtx.fillRect(0, 0, 200, 200);

// 添加噪点纹理
for (let i = 0; i < 3000; i++) {
  const x = Math.random() * 200;
  const y = Math.random() * 200;
  const alpha = Math.random() * 0.06;
  texCtx.fillStyle = `rgba(44, 44, 44, ${alpha})`;
  texCtx.fillRect(x, y, 1, 1);
}

// 添加纤维纹理
texCtx.strokeStyle = 'rgba(212, 165, 116, 0.08)';
texCtx.lineWidth = 0.5;
for (let i = 0; i < 20; i++) {
  texCtx.beginPath();
  texCtx.moveTo(Math.random() * 200, Math.random() * 200);
  texCtx.lineTo(Math.random() * 200, Math.random() * 200);
  texCtx.stroke();
}

const texBuf = texCanvas.toBuffer('image/png');
fs.writeFileSync(path.join(TEX_DIR, 'paper.png'), texBuf);
console.log('✓ textures/paper.png');

console.log('\n所有图标和纹理已生成！');
