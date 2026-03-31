#!/usr/bin/env node
// scripts/process-chapters.js - 将OCR文本整理为结构化章节数据

const fs = require('fs');
const path = require('path');

// 章节定义
const chaptersDef = [
  {
    id: 'ch01',
    title: '难忘的读书岁月',
    subtitle: '从幼年到出国留学',
    rawFile: '/tmp/ch01_raw.txt',
    sections: [
      { title: '来自郑和下西洋的始发地', startLine: 0 },
      { title: '少年时代', startLine: 400 },
      { title: '姑苏求学', startLine: 800 },
      { title: '师从胡适', startLine: 1200 },
      { title: '中央大学', startLine: 1600 }
    ]
  },
  {
    id: 'ch02',
    title: '鲜为人知的世界权威',
    subtitle: '原子弹之母',
    rawFile: '/tmp/ch02_raw.txt',
    sections: [
      { title: '远渡重洋', startLine: 0 },
      { title: '志在核物理', startLine: 300 },
      { title: '曼哈顿计划', startLine: 600 },
      { title: '原子弹之母', startLine: 900 }
    ]
  },
  {
    id: 'ch03',
    title: '拼搏与成名',
    subtitle: 'β衰变与宇称不守恒',
    rawFile: '/tmp/ch03_raw.txt',
    sections: [
      { title: 'β衰变研究', startLine: 0 },
      { title: '宇称不守恒', startLine: 400 },
      { title: '推翻千年定律', startLine: 800 },
      { title: '震惊世界', startLine: 1100 }
    ]
  },
  {
    id: 'ch04',
    title: '科学女杰也是女权的捍卫者',
    subtitle: '科学界的女性力量',
    rawFile: '/tmp/ch04_raw.txt',
    sections: [
      { title: '物理界女科学家', startLine: 0 },
      { title: '美国物理学会女会长', startLine: 300 },
      { title: '女权运动', startLine: 600 }
    ]
  },
  {
    id: 'ch05',
    title: '爱国·婚姻·家庭',
    subtitle: '爱情与人生',
    rawFile: '/tmp/ch05_raw.txt',
    sections: [
      { title: '爱情故事', startLine: 0 },
      { title: '与袁家骝的婚姻', startLine: 600 },
      { title: '家庭生活', startLine: 1200 },
      { title: '回国访问', startLine: 1800 }
    ]
  },
  {
    id: 'ch06',
    title: '人品学风',
    subtitle: '科学精神与人格魅力',
    rawFile: '/tmp/ch06_raw.txt',
    sections: [
      { title: '治学态度', startLine: 0 },
      { title: '为人处世', startLine: 600 },
      { title: '教育后辈', startLine: 1200 },
      { title: '学术成就', startLine: 1800 }
    ]
  },
  {
    id: 'ch07',
    title: '科星陨落后的反响',
    subtitle: '永恒的科学遗产',
    rawFile: '/tmp/ch07_raw.txt',
    sections: [
      { title: '巨星陨落', startLine: 0 },
      { title: '各界悼念', startLine: 400 },
      { title: '科学遗产', startLine: 800 },
      { title: '永恒纪念', startLine: 1200 }
    ]
  }
];

// 清理OCR文本
function cleanText(text) {
  return text
    // 移除页眉页脚
    .replace(/吴健梭传|WU JIAN XIONG ZHUAN|吴健雄伟|吴健雁使|只健雄使|只健雁命/g, '')
    // 修复常见OCR错误
    .replace(/匡健雄/g, '吴健雄')
    .replace(/县健雄/g, '吴健雄')
    .replace(/豆健雄/g, '吴健雄')
    .replace(/爱健雄/g, '吴健雄')
    .replace(/匡家/g, '袁家')
    .replace(/袁家鸡/g, '袁家骝')
    .replace(/袁家难/g, '袁家骝')
    .replace(/袁家聊/g, '袁家骝')
    .replace(/袁家骗/g, '袁家骝')
    .replace(/袁家聘/g, '袁家骝')
    .replace(/夷家/g, '袁家')
    // 修复物理术语
    .replace(/B 衰变/g, 'β衰变')
    .replace(/贝他/g, 'β')
    .replace(/误变/g, '衰变')
    .replace(/训变/g, '衰变')
    .replace(/宇称守恒/g, '宇称守恒')
    .replace(/宇称不守恒/g, '宇称不守恒')
    // 清理多余空白
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+|\s+$/gm, '')
    .trim();
}

// 处理文本为段落
function processToParagraphs(lines, sectionStart, sectionEnd) {
  const sectionLines = lines.slice(sectionStart, sectionEnd);
  const paragraphs = [];
  let currentPara = '';
  
  for (const line of sectionLines) {
    const cleaned = cleanText(line);
    if (!cleaned || cleaned.length < 3) continue;
    
    // 跳过图片说明
    if (cleaned.match(/^\(.*\)$/) || cleaned.match(/^图|^照片/)) continue;
    
    // 跳过页码
    if (cleaned.match(/^\d+$/)) continue;
    
    if (cleaned.length < 20 && !currentPara) {
      // 可能是标题行，跳过
      continue;
    }
    
    if (currentPara) {
      currentPara += cleaned;
      if (cleaned.match(/[。！？…]$/) || currentPara.length > 200) {
        paragraphs.push(currentPara);
        currentPara = '';
      }
    } else {
      currentPara = cleaned;
    }
  }
  
  if (currentPara) {
    paragraphs.push(currentPara);
  }
  
  return paragraphs;
}

// 生成章节JSON
function generateChapterJSON(chapterDef) {
  const rawContent = fs.readFileSync(chapterDef.rawFile, 'utf-8');
  const lines = rawContent.split('\n');
  
  const sections = chapterDef.sections.map((section, index) => {
    const startLine = section.startLine;
    const endLine = index < chapterDef.sections.length - 1 
      ? chapterDef.sections[index + 1].startLine 
      : lines.length;
    
    const paragraphs = processToParagraphs(lines, startLine, endLine);
    
    return {
      id: `${chapterDef.id}-${String(index + 1).padStart(2, '0')}`,
      title: section.title,
      paragraphs: paragraphs.slice(0, 20) // 限制段落数，避免文件过大
    };
  });
  
  return {
    id: chapterDef.id,
    title: chapterDef.title,
    subtitle: chapterDef.subtitle,
    sections: sections,
    totalParagraphs: sections.reduce((sum, s) => sum + s.paragraphs.length, 0)
  };
}

// 主函数
function main() {
  const outputDir = path.join(__dirname, '..', 'data', 'chapters');
  
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // 处理每个章节
  const chaptersIndex = [];
  
  for (const chapterDef of chaptersDef) {
    console.log(`处理: ${chapterDef.title}...`);
    
    try {
      const chapterData = generateChapterJSON(chapterDef);
      const outputPath = path.join(outputDir, `${chapterDef.id}.json`);
      
      fs.writeFileSync(outputPath, JSON.stringify(chapterData, null, 2), 'utf-8');
      console.log(`  ✓ 生成 ${outputPath} (${chapterData.totalParagraphs} 段)`);
      
      chaptersIndex.push({
        id: chapterData.id,
        title: chapterData.title,
        subtitle: chapterData.subtitle,
        sectionCount: chapterData.sections.length,
        paragraphCount: chapterData.totalParagraphs
      });
    } catch (err) {
      console.error(`  ✗ 处理失败: ${err.message}`);
    }
  }
  
  // 生成章节索引
  const indexPath = path.join(outputDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(chaptersIndex, null, 2), 'utf-8');
  console.log(`\n✓ 章节索引已生成: ${indexPath}`);
  console.log(`共 ${chaptersIndex.length} 章`);
}

main();
