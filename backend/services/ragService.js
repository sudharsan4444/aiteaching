const { Pinecone } = require('@pinecone-database/pinecone');
const fs = require('fs');
const pdf = require('pdf-parse');
const { getEmbedding } = require('./geminiService');

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});

const indexDocument = async (filePath, materialId) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        const text = data.text;

        // Chunking text
        const chunks = text.match(/[\s\S]{1,1000}/g) || [];

        const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
        const vectors = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const embedding = await getEmbedding(chunk);

            vectors.push({
                id: `${materialId}-${i}`,
                values: embedding,
                metadata: {
                    text: chunk,
                    materialId: materialId.toString()
                }
            });
        }

        // Upsert to Pinecone in batches is recommended, but for now strict:
        if (vectors.length > 0) {
            await index.upsert(vectors);
        }

        return true;
    } catch (error) {
        console.error("Error indexing document:", error);
        throw error;
    }
};

const queryContext = async (queryText, topK = 3) => {
    try {
        const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
        const embedding = await getEmbedding(queryText);

        const queryResponse = await index.query({
            vector: embedding,
            topK: topK,
            includeMetadata: true
        });

        return queryResponse.matches.map(match => match.metadata.text).join('\n\n');
    } catch (error) {
        console.error("Error querying context:", error);
        return "";
    }
};

module.exports = {
    indexDocument,
    queryContext
};
