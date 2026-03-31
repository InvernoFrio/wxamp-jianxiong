#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const chaptersDir = path.join(__dirname, '..', 'data', 'chapters');

function buildJsModule(jsonContent) {
    return 'module.exports = ' + JSON.stringify(jsonContent, null, 2) + ';\n';
}

function main() {
    const files = fs.readdirSync(chaptersDir).filter((name) => /^ch\d+\.json$/i.test(name));

    if (files.length === 0) {
        console.log('No chapter JSON files found.');
        return;
    }

    files.forEach((file) => {
        const jsonPath = path.join(chaptersDir, file);
        const jsPath = path.join(chaptersDir, file.replace(/\.json$/i, '.js'));

        const raw = fs.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(raw);

        fs.writeFileSync(jsPath, buildJsModule(data), 'utf8');
        console.log('Generated', path.basename(jsPath));
    });
}

main();
