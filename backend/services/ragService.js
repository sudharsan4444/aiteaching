const { Pinecone } = require('@pinecone-database/pinecone');
const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const { getEmbedding } = require('./aiService');

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});

const indexDocument = async (filePath, materialId) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        const text = data.text || "";

        console.log(`- Extracted ${text.length} characters from ${filePath}`);

        // Chunking text (approx 1000 chars per chunk)
        const chunks = text.match(/[\s\S]{1,1000}/g) || [];

        const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
        const vectors = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const rawEmbedding = await getEmbedding(chunk);
            const embedding = Array.from(rawEmbedding);

            vectors.push({
                id: `${materialId}-${i}`,
                values: embedding,
                metadata: {
                    text: chunk,
                    materialId: materialId.toString()
                }
            });
        }

        // Upsert to Pinecone
        if (vectors.length > 0) {
            await index.upsert(vectors);
        }

        return true;
    } catch (error) {
        console.error("Error indexing document:", error);
        throw error;
    }
};

const queryContext = async (queryText, filter = null, topK = 3) => {
    try {
        console.log(`- Querying context for: "${queryText}"`);
        const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
        const rawEmbedding = await getEmbedding(queryText);
        const embedding = Array.from(rawEmbedding);

        const queryOptions = {
            vector: embedding,
            topK: topK,
            includeMetadata: true
        };

        if (filter) {
            console.log(`- Applying filter: ${JSON.stringify(filter)}`);
            queryOptions.filter = filter;
        }

        const queryResponse = await index.query(queryOptions);
        console.log(`- Found ${queryResponse.matches.length} matches in Pinecone`);

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
