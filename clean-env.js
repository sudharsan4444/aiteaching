const fs = require('fs');
const path = require('path');

function cleanEnv(filePath) {
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    const cleanedLines = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return trimmed;

        const [key, ...valueParts] = trimmed.split('=');
        if (valueParts.length === 0) return trimmed;

        return `${key.trim()}=${valueParts.join('=').trim()}`;
    });

    fs.writeFileSync(filePath, cleanedLines.join('\n') + '\n');
    console.log(`✅ Cleaned ${path.basename(filePath)}`);
}

cleanEnv(path.join(__dirname, 'backend', '.env'));
cleanEnv(path.join(__dirname, 'frontend', '.env.local'));
