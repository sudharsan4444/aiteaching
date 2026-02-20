require('dotenv').config();
const OpenAI = require('openai');
const { GoogleGenAI } = require('@google/genai');

async function debug() {
    console.log('--- Debugging Connections ---');

    console.log('\nTesting OpenAI...');
    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: "Hello" }],
        });
        console.log('OpenAI Success:', response.choices[0].message.content);
    } catch (err) {
        console.log('OpenAI Error Details:');
        console.log('Status:', err.status);
        console.log('Message:', err.message);
        if (err.response) {
            console.log('Response Body:', err.response.data);
        }
    }

    console.log('\nTesting Gemini (using geminiService logic)...');
    try {
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const result = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: "Hello"
        });
        console.log('Gemini Success:', result.text());
    } catch (err) {
        console.log('Gemini Error:', err.message);
    }
}

debug();
