require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function listModels() {
    try {
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await genAI.models.list();
        console.log('Full Model Response:');
        console.log(JSON.stringify(response, null, 2));
    } catch (error) {
        console.error('Error listing models:', error.message);
    }
}

listModels();
