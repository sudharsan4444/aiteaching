require('dotenv').config();
const mongoose = require('mongoose');
const { Pinecone } = require('@pinecone-database/pinecone');
const Groq = require('groq-sdk');
const { getEmbedding } = require('./services/embeddingService');

async function testConnections() {
    console.log('--- Starting API Connection Tests ---');
    console.log('Provider: Groq (logic) & Transformers.js (embeddings)\n');

    // 1. Test MongoDB
    console.log('1. Testing MongoDB Connection...');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected Successfully!\n');
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message, '\n');
    }

    // 2. Test Groq
    console.log('2. Testing Groq Connection...');
    try {
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('your_')) {
            throw new Error('Groq API Key is missing or is a placeholder.');
        }
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: "Hello" }],
        });
        console.log('  ✅ Groq: Connected Successfully! Response:', response.choices[0].message.content.substring(0, 30), '...\n');
    } catch (error) {
        console.error('  ❌ Groq: Failed -', error.message, '\n');
    }

    // 3. Test Local Embeddings
    console.log('3. Testing Local Embeddings (Transformers.js)...');
    try {
        const start = Date.now();
        const embedding = await getEmbedding("Test embedding generation");
        const duration = Date.now() - start;
        console.log(`  ✅ Embeddings: Generated successfully (${embedding.length} dimensions) in ${duration}ms\n`);
    } catch (error) {
        console.error('  ❌ Embeddings: Failed -', error.message, '\n');
    }

    // 4. Test Pinecone
    console.log('4. Testing Pinecone Connection...');
    try {
        if (!process.env.PINECONE_API_KEY || process.env.PINECONE_API_KEY === 'your_pinecone_api_key_here') {
            throw new Error('Pinecone API Key is missing or is a placeholder.');
        }
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const indexes = await pc.listIndexes();
        console.log('✅ Pinecone Connected Successfully! Indexes found:', indexes.indexes.length, '\n');
    } catch (error) {
        console.error('❌ Pinecone Connection Failed:', error.message, '\n');
    }

    console.log('--- Connection Tests Finished ---');
}

testConnections();
