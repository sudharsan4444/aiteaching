require('dotenv').config();
const OpenAI = require('openai');

async function testOpenAI() {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    try {
        console.log('Fetching models...');
        const list = await openai.models.list();
        process.stdout.write('Found models: ' + list.data.length + '\n');
        process.stdout.write('First 5 models: ' + list.data.slice(0, 5).map(m => m.id).join(', ') + '\n');
    } catch (err) {
        process.stdout.write('Error: ' + err.message + '\n');
        if (err.response) {
            process.stdout.write('Response: ' + JSON.stringify(err.response.data) + '\n');
        }
    }
}

testOpenAI();
