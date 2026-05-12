// scripts/generate-chapters-from-txt.js
// 从 data/chapters/ch*.txt 生成阅读器使用的 JS/JSON 章节数据。

const fs = require('fs');
const path = require('path');

const CHAPTER_DIR = path.join(__dirname, '..', 'data', 'chapters');
const SECTION_RE = /^\s*=+\s*(.+?)\s*=+\s*$/;

function normalizeLine(line) {
  return line
    .replace(/\r/g, '')
    .replace(/\uFEFF/g, '')
    .trim();
}

function cleanText(text) {
  return text
    .replace(/贝他\(B\)/g, '贝他(β)')
    .replace(/贝他（B）/g, '贝他（β）')
    .replace(/千年定津/g, '千年定律')
    .replace(/为明惠中学/g, '为明德中学')
    .replace(/一篇议美国物理学和生物学/g, '简议美国物理学和生物学')
    .trim();
}

function cleanTitle(title) {
  return cleanText(title)
    .replace(/^=+/, '')
    .replace(/[=。.\s]+$/g, '')
    .trim();
}

function parseHeading(line) {
  const text = normalizeLine(line);
  const match = text.match(/^第\s*([0-9一二三四五六七八九十]+)\s*章[，、\s]*(.+)?$/);
  const heading = cleanTitle(match ? (match[2] || text) : text);
  if (heading.includes('——')) {
    const parts = heading.split('——');
    return {
      title: cleanTitle(parts.shift()),
      subtitle: cleanTitle(parts.join('——'))
    };
  }
  return { title: heading, subtitle: '' };
}

function makeSectionId(chapterId, index) {
  return `${chapterId}-${String(index + 1).padStart(2, '0')}`;
}

function splitParagraphs(lines) {
  const paragraphs = [];
  let current = [];

  for (const rawLine of lines) {
    const line = normalizeLine(rawLine);
    if (!line) {
      if (current.length) {
        paragraphs.push(cleanText(current.join('\n')));
        current = [];
      }
      continue;
    }
    current.push(line);
  }

  if (current.length) paragraphs.push(cleanText(current.join('\n')));
  return paragraphs.filter(Boolean);
}

function parseChapter(filePath) {
  const id = path.basename(filePath, '.txt');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n');

  const firstContentIndex = lines.findIndex(line => normalizeLine(line));
  const heading = firstContentIndex >= 0 ? parseHeading(lines[firstContentIndex]) : { title: id, subtitle: '' };
  const title = heading.title;

  let cursor = firstContentIndex + 1;
  let subtitle = heading.subtitle;
  while (cursor < lines.length) {
    const line = normalizeLine(lines[cursor]);
    if (!line) {
      cursor += 1;
      continue;
    }
    if (SECTION_RE.test(line)) break;
    if (line.startsWith('——') || line.startsWith('--')) {
      subtitle = cleanText(line.replace(/^[—-]+/, ''));
      cursor += 1;
    }
    break;
  }

  const sections = [];
  let currentTitle = null;
  let currentLines = [];

  function flushSection() {
    if (!currentTitle && !currentLines.some(line => normalizeLine(line))) return;
    const index = sections.length;
    sections.push({
      id: makeSectionId(id, index),
      title: cleanTitle(currentTitle || title),
      paragraphs: splitParagraphs(currentLines)
    });
    currentLines = [];
  }

  for (let i = cursor; i < lines.length; i++) {
    const line = normalizeLine(lines[i]);
    const sectionMatch = line.match(SECTION_RE);
    if (sectionMatch) {
      flushSection();
      currentTitle = cleanTitle(sectionMatch[1]);
      continue;
    }
    currentLines.push(lines[i]);
  }
  flushSection();

  const totalParagraphs = sections.reduce((sum, section) => sum + section.paragraphs.length, 0);
  return { id, title, subtitle, sections, totalParagraphs };
}

function chapterToJS(chapter) {
  return `// data/chapters/${chapter.id}.js - 自动生成，请勿手动编辑

const chapter = ${JSON.stringify(chapter, null, 2)};

module.exports = chapter;
`;
}

function indexToJS(index) {
  return `// data/chapters/index.js - 自动生成，请勿手动编辑

const chapters = ${JSON.stringify(index, null, 2)};

module.exports = chapters;
`;
}

function main() {
  const txtFiles = fs.readdirSync(CHAPTER_DIR)
    .filter(name => /^ch\d+\.txt$/.test(name))
    .sort()
    .map(name => path.join(CHAPTER_DIR, name));

  const chapters = txtFiles.map(parseChapter);

  for (const chapter of chapters) {
    fs.writeFileSync(path.join(CHAPTER_DIR, `${chapter.id}.js`), chapterToJS(chapter), 'utf-8');
    fs.writeFileSync(path.join(CHAPTER_DIR, `${chapter.id}.json`), JSON.stringify(chapter, null, 2), 'utf-8');
    console.log(`${chapter.id}: ${chapter.title} (${chapter.sections.length} 节, ${chapter.totalParagraphs} 段)`);
  }

  const index = chapters.map(chapter => ({
    id: chapter.id,
    title: chapter.title,
    subtitle: chapter.subtitle,
    sections: chapter.sections.map(section => ({
      id: section.id,
      title: section.title
    }))
  }));

  fs.writeFileSync(path.join(CHAPTER_DIR, 'index.js'), indexToJS(index), 'utf-8');
  fs.writeFileSync(path.join(CHAPTER_DIR, 'index.json'), JSON.stringify(index, null, 2), 'utf-8');
  console.log(`完成：${chapters.length} 章，${index.reduce((sum, chapter) => sum + chapter.sections.length, 0)} 节`);
}

main();
