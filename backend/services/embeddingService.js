const { pipeline } = require('@xenova/transformers');

let embeddingPipeline = null;

// Pre-load the model
(async () => {
    try {
        console.log('Loading local embedding model (Transformers.js)...');
        embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('✅ Local embedding model loaded successfully.');
    } catch (error) {
        console.error('❌ Failed to load local embedding model:', error.message);
    }
})();

const getEmbedding = async (text) => {
    if (!embeddingPipeline) {
        embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }

    const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
    // Convert tensor to array
    return Array.from(output.data);
};

module.exports = {
    getEmbedding
};
