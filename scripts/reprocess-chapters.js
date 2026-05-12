// scripts/reprocess-chapters.js
// 吴健雄传 内容处理脚本 v2
// 从 OCR 扫描的 txt 文件中提取章节内容，清理错误，生成 JS 数据文件

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', '吴健雄传.txt');
const OUT_DIR = path.join(__dirname, '..', 'data', 'chapters');

// ── OCR 清理规则 ──────────────────────────────────────────────

function applyOCRFixes(text) {
  let s = text;
  // 页码标记
  s = s.replace(/≦\s*\d+\s*≧/g, '');
  // 页眉
  s = s.replace(/WU\s*JIAN\s*XIONG\s*ZHUAN/gi, '');
  s = s.replace(/WUJIANXIONGZHUAN/gi, '');
  // 常见错别字
  s = s.replace(/昊健雄/g, '吴健雄');
  s = s.replace(/昊健英/g, '吴健英');
  s = s.replace(/昊健豪/g, '吴健豪');
  s = s.replace(/昊仲裔/g, '吴仲裔');
  s = s.replace(/昊有训/g, '吴有训');
  s = s.replace(/昊翠芬/g, '吴翠芬');
  s = s.replace(/昊教授/g, '吴教授');
  s = s.replace(/昊先生/g, '吴先生');
  s = s.replace(/灵健雄/g, '吴健雄');
  s = s.replace(/吴建雄/g, '吴健雄');
  s = s.replace(/是健雄传/g, '吴健雄传');
  s = s.replace(/吴健座/g, '吴健雄');
  s = s.replace(/误家骗/g, '袁家骝');
  s = s.replace(/衰家骝/g, '袁家骝');
  s = s.replace(/衰家骤/g, '袁家骝');
  s = s.replace(/衰家/g, '袁家');
  s = s.replace(/袁家骥/g, '袁家骝');
  s = s.replace(/吴家骝/g, '袁家骝');
  s = s.replace(/吴家文集/g, '袁家文集');
  s = s.replace(/李得曼|李得蔓/g, '莱德曼');
  s = s.replace(/已经/g, '已经');
  s = s.replace(/原于弹/g, '原子弹');
  s = s.replace(/儿百年/g, '几百年');
  s = s.replace(/惊诉/g, '惊诧');
  s = s.replace(/无动于裹/g, '无动于衷');
  s = s.replace(/人座/g, '入座');
  s = s.replace(/那单/g, '那里');
  s = s.replace(/广一派/g, '一派');
  s = s.replace(/遗乏/g, '匮乏');
  s = s.replace(/宝请/g, '宴请');
  s = s.replace(/董园/g, '墓园');
  s = s.replace(/紫葡/g, '紫藤');
  s = s.replace(/院土/g, '院士');
  s = s.replace(/酿这本/g, '撰这本');
  s = s.replace(/审阅了遍/g, '审阅了一遍');
  s = s.replace(/一一旁/g, '一旁');
  s = s.replace(/宇称守恒”是否要实验/g, '“宇称守恒”是否要实验');
  s = s.replace(/0一之谜/g, 'θ-τ之谜');
  s = s.replace(/有情人终成属/g, '有情人终成眷属');
  s = s.replace(/弱作用中宇称守蟑/g, '弱作用中宇称守恒吗');
  s = s.replace(/国家标淮启/g, '国家标准局');
  s = s.replace(/千年定津/g, '千年定律');
  s = s.replace(/应得而未诺贝尔奖/g, '应得而未得诺贝尔奖');
  s = s.replace(/弱天量流/g, '弱矢量流');
  s = s.replace(/学称不守恒/g, '宇称不守恒');
  s = s.replace(/只有一人中国/g, '只有一个中国');
  s = s.replace(/永恒的丰啤/g, '永恒的丰碑');
  s = s.replace(/造谐/g, '造诣');
  s = s.replace(/苍范/g, '苍茫');
  s = s.replace(/邀游/g, '遨游');
  s = s.replace(/遗撼/g, '遗憾');
  s = s.replace(/婉惜/g, '惋惜');
  s = s.replace(/热枕/g, '热忱');
  s = s.replace(/册庸置疑/g, '毋庸置疑');
  s = s.replace(/节衰顺变/g, '节哀顺变');
  s = s.replace(/亳电/g, '唁电');
  s = s.replace(/博土/g, '博士');
  s = s.replace(/硕服/g, '硕士服');
  s = s.replace(/学上服/g, '学士服');
  s = s.replace(/自已/g, '自己');
  s = s.replace(/自己已/g, '自己');
  s = s.replace(/自光/g, '目光');
  s = s.replace(/进人/g, '进入');
  s = s.replace(/投人/g, '投入');
  s = s.replace(/授子/g, '授予');
  s = s.replace(/赋子/g, '赋予');
  s = s.replace(/于预/g, '干预');
  s = s.replace(/基至/g, '甚至');
  s = s.replace(/由子/g, '由于');
  s = s.replace(/士地/g, '土地');
  s = s.replace(/名学/g, '名字');
  s = s.replace(/眼晴/g, '眼睛');
  s = s.replace(/摩姿/g, '摩挲');
  s = s.replace(/范然/g, '茫然');
  s = s.replace(/题畔/g, '挑衅');
  s = s.replace(/费来/g, '费米');
  s = s.replace(/施土元/g, '施士元');
  s = s.replace(/莫健雄/g, '吴健雄');
  s = s.replace(/吴昊健雄/g, '吴健雄');
  s = s.replace(/吴吴健雄/g, '吴健雄');
  s = s.replace(/责献/g, '贡献');
  s = s.replace(/脾气/g, '脾气');
  s = s.replace(/QING\s*X!?\s*ZU\s*GUO/gi, '');
  s = s.replace(/LILUN/gi, '');
  s = s.replace(/HOUJI/gi, '');
  s = s.replace(/FU\s*LU/gi, '');
  // 乱码
  s = s.replace(/★/g, '');
  s = s.replace(/\t/g, '');
  s = s.replace(/\r/g, '');
  return s;
}

// ── 章节定义（正确的行号）──────────────────────────────────────

const CHAPTERS = [
  {
    id: 'ch00', title: '楔子', subtitle: '当代科学女皇',
    startLine: 697, endLine: 873,
    sections: [
      { id: 'ch00-01', title: '楔子', keywords: ['楔子'] }
    ]
  },
  {
    id: 'ch01', title: '难忘的读书岁月', subtitle: '从幼年到出国留学',
    startLine: 874, endLine: 2932,
    sections: [
      { id: 'ch01-01', title: '来自郑和下西洋的始发地', keywords: ['来自郑和', '始发地'] },
      { id: 'ch01-02', title: '家教', keywords: ['家教'], startLine: 1107 },
      { id: 'ch01-03', title: '姑苏求学', keywords: ['姑苏求学'], startLine: 1289 },
      { id: 'ch01-04', title: '师从胡适', keywords: ['师从胡适'], startLine: 1505 },
      { id: 'ch01-05', title: '中央大学的高才生', keywords: ['中央大学'], startLine: 1662 },
      { id: 'ch01-06', title: '浙江大学当助教', keywords: ['浙江大学'], startLine: 2003 },
      { id: 'ch01-07', title: '在中央研究院的上海分院', keywords: ['中央研究院'], startLine: 2061 },
      { id: 'ch01-08', title: '沪滨告别亲人', keywords: ['沪滨告别', '告别亲人'], startLine: 2266 },
    ]
  },
  {
    id: 'ch02', title: '鲜为人知的世界权威', subtitle: '原子弹及贝他衰变的实验',
    startLine: 2933, endLine: 4061,
    sections: [
      { id: 'ch02-01', title: '原子弹之母的由来', keywords: ['原子弹之母'] },
      { id: 'ch02-02', title: '费米与吴健雄', keywords: ['费米与吴健雄'] },
      { id: 'ch02-03', title: '娇小的中国女孩与大科学家并肩战斗', keywords: ['娇小的中国女孩', '并肩战斗'] },
      { id: 'ch02-04', title: '章鱼的触须', keywords: ['章鱼', '触须'] },
      { id: 'ch02-05', title: '她正式成为曼哈顿计划的核心成员', keywords: ['曼哈顿计划', '核心成员'] },
      { id: 'ch02-06', title: '难圆的科学梦', keywords: ['难圆的科学梦'] },
      { id: 'ch02-07', title: '贝他衰变研究的世界权威', keywords: ['贝他衰变', '衰变研究'] },
      { id: 'ch02-08', title: '没有得到相应的回报', keywords: ['没有得到相应的回报', '没有得到相应的尚报', '相应的回报'], startLine: 3917 },
    ]
  },
  {
    id: 'ch03', title: '拼搏与成名', subtitle: '宇称不守恒的发现',
    startLine: 4062, endLine: 5315,
    sections: [
      { id: 'ch03-01', title: '驴子与干草与对称', keywords: ['驴子', '干草', '对称'] },
      { id: 'ch03-02', title: '从头说起', keywords: ['从头说起'] },
      { id: 'ch03-03', title: '两个怪物', keywords: ['两个怪物', '之谜'] },
      { id: 'ch03-04', title: '什么是宇称守恒', keywords: ['什么是宇称守恒'], startLine: 4186 },
      { id: 'ch03-05', title: '弱作用中宇称守恒吗', keywords: ['弱作用中宇称', '弱作用中宇称守蟑'], startLine: 4290 },
      { id: 'ch03-06', title: '求助华盛顿国家标准局', keywords: ['华盛顿国家标准局', '国家标准局', '国家标淮启'], startLine: 4438 },
      { id: 'ch03-07', title: '艰难与梦想', keywords: ['艰难与梦想'], startLine: 4535 },
      { id: 'ch03-08', title: '千年定律被推翻', keywords: ['千年定律被推翻', '千年定律'], startLine: 4657 },
      { id: 'ch03-09', title: '美中不足的协作关系', keywords: ['美中不足的协作关系', '美中不足'], startLine: 4753 },
      { id: 'ch03-10', title: '震惊全球物理界的新闻', keywords: ['震惊全球', '震惊物理界'], startLine: 4881 },
      { id: 'ch03-11', title: '除了灯架上没挂人', keywords: ['除了灯架上没挂人'], startLine: 4978 },
      { id: 'ch03-12', title: '应得而未得诺贝尔奖', keywords: ['应得而未得', '应得而未', '未得诺贝尔'], startLine: 5023 },
      { id: 'ch03-13', title: '弱矢量流守恒', keywords: ['弱矢量流', '矢量流守恒'], startLine: 5250 },
    ]
  },
  {
    id: 'ch04', title: '科苑女杰也是女权的捍卫者', subtitle: '科学上的多种奉献',
    startLine: 5316, endLine: 6112,
    sections: [
      { id: 'ch04-01', title: '科学上的多种奉献', keywords: ['科学上的多种奉献'] },
      { id: 'ch04-02', title: '三大女科学家谁高谁低', keywords: ['三大女科学家', '谁高谁低'] },
      { id: 'ch04-03', title: '华裔女性当上美国物理学会会长', keywords: ['华裔女性', '物理学会会长'] },
      { id: 'ch04-04', title: '科学上的龙女强人', keywords: ['龙女强人'] },
      { id: 'ch04-05', title: '业余的女权运动家', keywords: ['女权运动家', '业余的女权'] },
      { id: 'ch04-06', title: '女性智力不比男性差', keywords: ['女性智力'] },
      { id: 'ch04-07', title: '对中国女科学家的关心和祝愿', keywords: ['中国女科学家'] },
    ]
  },
  {
    id: 'ch05', title: '恋爱·婚姻·家庭', subtitle: '爱情与人生',
    startLine: 6113, endLine: 7324,
    sections: [
      { id: 'ch05-01', title: '成功的背后', keywords: ['成功的背后'] },
      { id: 'ch05-02', title: '吴健雄和第二次握手', keywords: ['第二次握手'] },
      { id: 'ch05-03', title: '碰上了爱情的火花', keywords: ['爱情的火花'] },
      { id: 'ch05-04', title: '与胡适之谜', keywords: ['与胡适之谜', '胡适之谜'] },
      { id: 'ch05-05', title: '有情人终成眷属', keywords: ['有情人终成眷属', '有情人终成属', '有情人终成着属'], startLine: 6928 },
      { id: 'ch05-06', title: '小家喜添新成员', keywords: ['小家喜添', '喜添新成员'] },
      { id: 'ch05-07', title: '互敬互爱', keywords: ['互敬互爱'] },
    ]
  },
  {
    id: 'ch06', title: '立论', subtitle: '教学与科研',
    startLine: 7325, endLine: 8128,
    sections: [
      { id: 'ch06-01', title: '简议美国物理学和生物学', keywords: ['简议美国物理学', '美国物理学和生物学'] },
      { id: 'ch06-02', title: '漫谈中国大学的教育', keywords: ['漫谈中国大学'] },
      { id: 'ch06-03', title: '略论大学的科学研究', keywords: ['略论大学'] },
      { id: 'ch06-04', title: '中国科技的回顾与展望', keywords: ['中国科技的回顾'] },
      { id: 'ch06-05', title: '加强科学研究与教育', keywords: ['加强科学研究'] },
    ]
  },
  {
    id: 'ch07', title: '人品学风', subtitle: '科学精神与人格魅力',
    startLine: 8129, endLine: 9147,
    sections: [
      { id: 'ch07-01', title: '进取与治学', keywords: ['进取', '治学'] },
      { id: 'ch07-02', title: '不要怕弄脏了手', keywords: ['不要怕弄脏'], startLine: 8266 },
      { id: 'ch07-03', title: '攀登高峰无捷径', keywords: ['攀登高峰'] },
      { id: 'ch07-04', title: '实实在在做学问', keywords: ['实实在在做学问', '实实在在'] },
      { id: 'ch07-05', title: '基础要宽厚', keywords: ['基础要宽厚'] },
      { id: 'ch07-06', title: '科学家任重道远', keywords: ['科学家任重道远', '任重道远'] },
      { id: 'ch07-07', title: '安全第一质量第一', keywords: ['安全第一'] },
      { id: 'ch07-08', title: '她不信宗教', keywords: ['不信宗教'] },
      { id: 'ch07-09', title: '不爱宣扬自己', keywords: ['不爱宣扬'] },
      { id: 'ch07-10', title: '尊师爱生', keywords: ['尊师爱生'], startLine: 8780 },
      { id: 'ch07-11', title: '朋友之间', keywords: ['朋友之间'], startLine: 8838 },
      { id: 'ch07-12', title: '个性与风格', keywords: ['个性与风格'] },
      { id: 'ch07-13', title: '退休以后', keywords: ['退休以后'] },
      { id: 'ch07-14', title: '多彩的身影', keywords: ['多彩的身影'] },
    ]
  },
  {
    id: 'ch08', title: '情系祖国', subtitle: '爱国情怀',
    startLine: 9148, endLine: 10720,
    sections: [
      { id: 'ch08-01', title: '有家难回', keywords: ['有家难回'] },
      { id: 'ch08-02', title: '血浓于水', keywords: ['血浓于水'] },
      { id: 'ch08-03', title: '周恩来总理的亲切会见', keywords: ['周恩来总理', '亲切会见'] },
      { id: 'ch08-04', title: '难忘的母校', keywords: ['难忘的母校'] },
      { id: 'ch08-05', title: '为明德中学尽心竭力', keywords: ['明德中学尽心', '为明德中学'] },
      { id: 'ch08-06', title: '只有一个中国', keywords: ['只有一个中国'], startLine: 10048 },
      { id: 'ch08-07', title: '滚烫的爱国心', keywords: ['滚烫的爱国心'], startLine: 10250 },
      { id: 'ch08-08', title: '吴健雄星', keywords: ['吴健雄星'] },
      { id: 'ch08-09', title: '最后的闪光精神', keywords: ['最后的闪光'] },
    ]
  },
  {
    id: 'ch09', title: '科星陨落后的反响', subtitle: '永恒的纪念',
    startLine: 10721, endLine: 11069,
    sections: [
      { id: 'ch09-01', title: '魂兮归来', keywords: ['魂兮归来'] },
      { id: 'ch09-02', title: '吴健雄墓园落成', keywords: ['墓园落成', '墓园'] },
      { id: 'ch09-03', title: '纪念吴健雄国际学术会议', keywords: ['纪念吴健雄国际', '国际学术会议'] },
      { id: 'ch09-04', title: '吴健雄纪念馆', keywords: ['吴健雄纪念馆', '纪念馆'], startLine: 11002 },
      { id: 'ch09-05', title: '赤子梦圆', keywords: ['赤子梦圆'], startLine: 11029 },
    ]
  }
];

// ── 处理函数 ──────────────────────────────────────────────────

function isNoiseLine(line) {
  if (!line || line.length === 0) return true;
  const t = line.trim();
  // 纯页码标记
  if (/^≦.*≧$/.test(t)) return true;
  // 纯数字
  if (/^\d+$/.test(t)) return true;
  // 章节题头
  if (/^第[一二三四五六七八九十]*章/.test(t)) return true;
  // 纯页眉
  if (/^吴健雄传$/.test(t)) return true;
  if (/^(楔子|难忘的读书岁月|鲜为人知的世界权威|拼搏与成名|科苑女杰也是女权的捍卫者|恋爱·婚姻·家庭|立论|人品学风|情系祖国|科星陨落后的反响)\s*$/.test(t)) return true;
  if (/^(原子弹及贝他（β）衰变的实验|恋爱·婚姻·家庭國|有关“教学和科研”的部分讲话)\s*$/.test(t)) return true;
  // 拼音页眉
  if (/^[A-Z\s]{8,}$/.test(t)) return true;
  if (/^(XIE|ZI|XIEZI|NAN WANG|XIAN WEI|PIN BO|KE YUAN|LIAN AI|LI LUN|REN PIN|QING XI|QING XIZUGUO|KE XING|XIE ZI|FULU)/i.test(t)) return true;
  // 注释标记行（纯注释符号）
  if (/^[①②③④⑤⑥⑦⑧⑨⑩～~\?\*@\-—\s\d\.，,。：:;；]+$/.test(t)) return true;
  // 短杂乱行
  if (t.length <= 3 && !/[一-鿿]/.test(t)) return true;
  return false;
}

function cleanLine(line) {
  let s = applyOCRFixes(line);
  s = s.trim();
  // 移除行首的注释标记（保留正文中的）
  s = s.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, '');
  return s;
}

function extractChapterLines(lines, startIdx, endIdx) {
  const result = [];
  for (let i = startIdx; i < endIdx && i < lines.length; i++) {
    const cleaned = cleanLine(lines[i]);
    if (!isNoiseLine(cleaned)) {
      result.push({
        text: cleaned,
        lineNo: i + 1
      });
    }
  }
  return result;
}

function findSectionBoundaries(chapterLines, sectionDefs, chapterStartLine) {
  // 在已清理的章节文本中按目录顺序查找各小节标题的位置，避免后文误匹配打乱小节顺序。
  const boundaries = [];
  let searchFrom = 0;

  for (const section of sectionDefs) {
    let bestIdx = -1;
    let bestScore = 0;

    if (section.startLine) {
      bestIdx = chapterLines.findIndex(line => line.lineNo >= section.startLine);
      if (bestIdx >= 0) {
        const line = chapterLines[bestIdx].text;
        const skipTitle = line.length <= 40 && (
          line.includes(section.title) ||
          section.keywords.some(kw => line.includes(kw))
        );
        boundaries.push({ section, idx: bestIdx, skipTitle });
        searchFrom = bestIdx + 1;
        continue;
      }
    }

    for (let i = searchFrom; i < chapterLines.length; i++) {
      const line = chapterLines[i].text;
      // 标题行通常是短行（< 30字），包含关键词
      if (line.length > 30) continue;

      let score = 0;
      for (const kw of section.keywords) {
        if (line.includes(kw)) score += kw.length;
      }
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    if (bestIdx >= 0 && bestScore >= 2) {
      boundaries.push({ section, idx: bestIdx, skipTitle: true });
      searchFrom = bestIdx + 1;
    }
  }

  return boundaries;
}

function splitParagraphs(textLines, maxChars = 300) {
  // 合并连续行
  const merged = [];
  let current = '';

  for (const item of textLines) {
    const line = typeof item === 'string' ? item : item.text;
    if (!line) {
      if (current) { merged.push(current); current = ''; }
      continue;
    }
    // 如果当前积累的段落以句末标点结尾，且新行不是括号开头，视为新段落
    if (current && /[。！？…]$/.test(current) && line.length > 10) {
      merged.push(current);
      current = line;
    } else {
      current = current ? current + line : line;
    }
  }
  if (current) merged.push(current);

  // 拆分过长段落
  const paragraphs = [];
  for (const para of merged) {
    if (para.length <= maxChars) {
      if (para.length > 0) paragraphs.push(applyOCRFixes(para));
      continue;
    }
    // 按句号拆分
    const parts = para.split(/(?<=[。！？…])\s*/);
    let chunk = '';
    for (const part of parts) {
      if (chunk.length + part.length > maxChars && chunk.length > 0) {
        paragraphs.push(applyOCRFixes(chunk));
        chunk = part;
      } else {
        chunk += part;
      }
    }
    if (chunk.length > 0) paragraphs.push(applyOCRFixes(chunk));
  }

  return paragraphs.map(p => applyOCRFixes(p).trim()).filter(Boolean);
}

function processChapter(lines, chapterDef) {
  const startIdx = chapterDef.startLine - 1; // 0-indexed
  const endIdx = chapterDef.endLine;
  const chapterLines = extractChapterLines(lines, startIdx, endIdx);

  // 查找小节边界
  const boundaries = findSectionBoundaries(chapterLines, chapterDef.sections, chapterDef.startLine);

  const sections = [];

  if (boundaries.length === 0) {
    // 没找到任何小节标题，整个章节作为一个小节
    const paragraphs = splitParagraphs(chapterLines);
    sections.push({
      id: chapterDef.sections[0].id,
      title: chapterDef.sections[0].title,
      paragraphs
    });
  } else {
    // 按边界分割
    for (let i = 0; i < boundaries.length; i++) {
      const start = boundaries[i].idx + (boundaries[i].skipTitle ? 1 : 0);
      const end = i + 1 < boundaries.length ? boundaries[i + 1].idx : chapterLines.length;
      const sectionLines = chapterLines.slice(start, end);
      const paragraphs = splitParagraphs(sectionLines);
      sections.push({
        id: boundaries[i].section.id,
        title: boundaries[i].section.title,
        paragraphs
      });
    }

    // 如果第一个 boundary 不是从第 0 行开始，前面的内容归入第一个 section
    if (boundaries[0].idx > 0) {
      const preamble = chapterLines.slice(0, boundaries[0].idx);
      const preambleParas = splitParagraphs(preamble);
      if (preambleParas.length > 0) {
        // 插入到第一个 section 前面
        sections[0].paragraphs = [...preambleParas, ...sections[0].paragraphs];
      }
    }
  }

  // 添加未找到的小节（空内容）
  const foundIds = new Set(sections.map(s => s.id));
  for (const sectionDef of chapterDef.sections) {
    if (!foundIds.has(sectionDef.id)) {
      sections.push({
        id: sectionDef.id,
        title: sectionDef.title,
        paragraphs: []
      });
    }
  }

  return sections;
}

function generateChapterJS(chapterDef, sections) {
  const totalParagraphs = sections.reduce((sum, s) => sum + s.paragraphs.length, 0);
  const data = {
    id: chapterDef.id,
    title: chapterDef.title,
    subtitle: chapterDef.subtitle,
    sections,
    totalParagraphs
  };

  return `// data/chapters/${chapterDef.id}.js - 自动生成，请勿手动编辑

const chapter = ${JSON.stringify(data, null, 2)};

module.exports = chapter;
`;
}

function generateIndexJS(chapters) {
  const index = chapters.map(ch => ({
    id: ch.id,
    title: ch.title,
    subtitle: ch.subtitle,
    sections: ch.sections.map(s => ({ id: s.id, title: s.title }))
  }));

  return `// data/chapters/index.js - 自动生成，请勿手动编辑

const chapters = ${JSON.stringify(index, null, 2)};

module.exports = chapters;
`;
}

// ── 主流程 ──────────────────────────────────────────────────

function main() {
  console.log('读取源文件...');
  const raw = fs.readFileSync(SRC, 'utf-8');
  const lines = raw.split('\n');
  console.log(`共 ${lines.length} 行`);

  const processedChapters = [];

  for (const chapterDef of CHAPTERS) {
    console.log(`处理 ${chapterDef.id}: ${chapterDef.title} (行 ${chapterDef.startLine}-${chapterDef.endLine})...`);

    const sections = processChapter(lines, chapterDef);
    const totalParagraphs = sections.reduce((sum, s) => sum + s.paragraphs.length, 0);

    for (const s of sections) {
      console.log(`  ${s.id}: ${s.title} (${s.paragraphs.length} 段)`);
    }

    processedChapters.push({ ...chapterDef, sections, totalParagraphs });

    const jsContent = generateChapterJS(chapterDef, sections);
    const filePath = path.join(OUT_DIR, `${chapterDef.id}.js`);
    fs.writeFileSync(filePath, jsContent, 'utf-8');
    fs.writeFileSync(
      path.join(OUT_DIR, `${chapterDef.id}.json`),
      JSON.stringify({
        id: chapterDef.id,
        title: chapterDef.title,
        subtitle: chapterDef.subtitle,
        sections,
        totalParagraphs
      }, null, 2),
      'utf-8'
    );
  }

  // 写入 index.js
  const indexContent = generateIndexJS(processedChapters);
  fs.writeFileSync(path.join(OUT_DIR, 'index.js'), indexContent, 'utf-8');
  fs.writeFileSync(
    path.join(OUT_DIR, 'index.json'),
    JSON.stringify(processedChapters.map(ch => ({
      id: ch.id,
      title: ch.title,
      subtitle: ch.subtitle,
      sections: ch.sections.map(s => ({ id: s.id, title: s.title }))
    })), null, 2),
    'utf-8'
  );

  const totalSections = processedChapters.reduce((sum, ch) => sum + ch.sections.length, 0);
  const totalParagraphs = processedChapters.reduce((sum, ch) => sum + ch.totalParagraphs, 0);
  console.log(`\n完成！共 ${processedChapters.length} 章, ${totalSections} 节, ${totalParagraphs} 段`);
}

main();
