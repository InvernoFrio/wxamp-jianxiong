#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const chaptersDir = path.join(__dirname, '..', 'data', 'chapters');

function cleanParagraph(text) {
    if (typeof text !== 'string') return '';

    let out = text;

    // Normalize spaces and quotes.
    out = out
        .replace(/[\u00A0\u2000-\u200B\u3000]/g, ' ')
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'");

    // Remove obvious OCR page headers / pinyin blocks.
    out = out
        .replace(/\b(?:NAN|WANG|DE|DU|SHU|SUI|YUE|XIAN|WEI|REN|ZHI|SHI|JIE|QUAN|WU|JIAN|XIONG)(?:\s+[A-Z]{2,}){2,}\b/g, '')
        .replace(/\b[A-Z]{2,}(?:[\s_.-]+[A-Z]{2,}){2,}\b/g, '');

    // Remove noisy separators and OCR symbols.
    out = out
        .replace(/[|`\\]/g, '')
        .replace(/\s*[@]+\s*/g, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/%%/g, '%')
        .replace(/\?{2,}/g, '?')
        .replace(/!{2,}/g, '!')
        .replace(/\.{3,}/g, '...')
        .replace(/,{2,}/g, ',')
        .replace(/，{2,}/g, '，')
        .replace(/。{2,}/g, '。')
        .replace(/"{2,}/g, '"')
        .replace(/\(\s*\)/g, '');

    // Fix common OCR confusion in this dataset.
    out = out
        .replace(/匡健雄|县健雄|豆健雄|爱健雄/g, '吴健雄')
        .replace(/袁家鸡|袁家难|袁家聊|袁家骗|袁家聘/g, '袁家骝')
        .replace(/B\s*衰变/g, 'β衰变')
        .replace(/误变|训变/g, '衰变');

    // Remove strange short tails with mostly punctuation.
    out = out.replace(/[\s,，。.!！?？;；:："']+$/g, '').trim();

    return out;
}

function isNoisyParagraph(text) {
    if (!text) return true;
    if (text.length < 6) return true;

    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const letters = (text.match(/[A-Za-z]/g) || []).length;

    // Drop lines that are mostly latin uppercase blocks with no Chinese content.
    if (chineseChars === 0 && letters > 8) return true;

    // Drop very low-information lines.
    if (chineseChars < 2 && text.length < 12) return true;

    return false;
}

function cleanChapterFile(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(raw);

    if (!Array.isArray(json.sections)) {
        return { changed: false, removed: 0, cleaned: 0 };
    }

    let removed = 0;
    let cleaned = 0;

    json.sections.forEach((section) => {
        if (!Array.isArray(section.paragraphs)) return;

        const nextParagraphs = [];
        section.paragraphs.forEach((p) => {
            const cp = cleanParagraph(p);
            if (isNoisyParagraph(cp)) {
                removed += 1;
                return;
            }
            if (cp !== p) {
                cleaned += 1;
            }
            nextParagraphs.push(cp);
        });

        section.paragraphs = nextParagraphs;
    });

    json.totalParagraphs = json.sections.reduce((sum, s) => sum + (Array.isArray(s.paragraphs) ? s.paragraphs.length : 0), 0);

    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');

    return { changed: true, removed, cleaned };
}

function main() {
    const files = fs.readdirSync(chaptersDir)
        .filter((name) => /^ch\d+\.json$/i.test(name))
        .map((name) => path.join(chaptersDir, name));

    if (files.length === 0) {
        console.log('No chapter files found.');
        return;
    }

    let totalRemoved = 0;
    let totalCleaned = 0;

    files.forEach((filePath) => {
        const result = cleanChapterFile(filePath);
        totalRemoved += result.removed;
        totalCleaned += result.cleaned;
        console.log(`${path.basename(filePath)}: cleaned=${result.cleaned}, removed=${result.removed}`);
    });

    console.log(`Done. cleaned=${totalCleaned}, removed=${totalRemoved}`);
}

main();
