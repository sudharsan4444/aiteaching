require('dotenv').config();
console.log('API Provider:', process.env.AI_PROVIDER);
console.log('OpenAI Key Prefix:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) : 'MISSING');
console.log('OpenAI Key Length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
