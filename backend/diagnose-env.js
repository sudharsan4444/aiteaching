const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found in the backend directory!');
    process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');

console.log('--- .env Diagnostics ---\n');

lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) return;

    const parts = line.split('=');
    if (parts.length < 2) return;

    const key = parts[0];
    const value = parts.slice(1).join('=');

    const keyClean = key.trim();
    const valueClean = value.trim();

    console.log(`Line ${index + 1}: [${keyClean}]`);

    if (key !== keyClean) {
        console.log(`  ⚠️ Warning: Key has leading/trailing spaces: "${key}"`);
    }

    if (value !== valueClean) {
        console.log(`  ⚠️ Warning: Value has leading/trailing spaces: "${value}"`);
    }

    if (valueClean.includes('your_') || valueClean.includes('username:password') || valueClean.includes('PLACEHOLDER')) {
        console.log(`  ❌ ERROR: Value is still a PLACEHOLDER: "${valueClean}"`);
    } else if (valueClean.length > 0) {
        console.log(`  ✅ Value looks like a real key (Length: ${valueClean.length})`);
    } else {
        console.log(`  ❌ ERROR: Value is EMPTY`);
    }
    console.log('');
});

console.log('--- End of Diagnostics ---');
