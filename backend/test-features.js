const axios = require('axios');

const API_URL = 'http://localhost:8110/api';

async function testFeatures() {
    console.log('--- Testing System Features ---');

    try {
        // 1. Register a test admin
        console.log('\n1. Registering/Login Test...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@test.com',
            password: 'password123'
        }).catch(async (e) => {
            // If login fails, try register
            console.log('   Login failed, trying register...');
            return await axios.post(`${API_URL}/auth/register`, {
                name: 'Admin Test',
                email: 'admin@test.com',
                password: 'password123',
                role: 'ADMIN'
            });
        });
        const token = loginRes.data.token;
        console.log('   ✅ Auth Successful');

        // 2. Test Admin - List Users
        console.log('\n2. Testing Admin - List Users...');
        const usersRes = await axios.get(`${API_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   ✅ Admin: Found ${usersRes.data.length} users`);

        // 3. Test AI - Chat (RAG)
        console.log('\n3. Testing AI Chat (RAG)...');
        const chatRes = await axios.post(`${API_URL}/ai/chat`,
            { message: 'Hello AI assistant, can you help me?' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('   ✅ Chat Response:', chatRes.data.reply.substring(0, 50), '...');

        // 4. Test AI - Quiz Gen
        console.log('\n4. Testing Quiz Generation...');
        const quizRes = await axios.post(`${API_URL}/ai/generate-quiz`,
            { topic: 'JavaScript', count: 2, difficulty: 'Easy' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`   ✅ Quiz Gen: Received ${quizRes.data.length} questions`);

    } catch (error) {
        console.error('\n❌ FEATURE TEST FAILED:');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', JSON.stringify(error.response.data));
        } else {
            console.error('   Error:', error.message);
        }
    }
}

testFeatures();
