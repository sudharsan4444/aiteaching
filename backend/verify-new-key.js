const axios = require('axios');

// Using environment variable for key
const KEY = process.env.GROQ_API_KEY;

async function testNewKey() {
    console.log('--- TESTING NEW GROQ KEY ---');
    if (!KEY) {
        console.error('❌ ERROR: GROQ_API_KEY not found in environment!');
        return;
    }
    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: 'Hi' }]
        }, {
            headers: {
                'Authorization': `Bearer ${KEY}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ SUCCESS! The key is VALID.');
        console.log('Response:', response.data.choices[0].message.content);
    } catch (err) {
        console.log('❌ FAILED.');
        if (err.response) {
            console.log('Status:', err.response.status);
            console.log('Error:', JSON.stringify(err.response.data.error, null, 2));
        } else {
            console.log('Error Message:', err.message);
        }
    }
}

testNewKey();
