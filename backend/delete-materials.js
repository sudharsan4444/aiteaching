/**
 * delete-materials.js
 * Run with: node backend/delete-materials.js
 * Deletes ALL materials from MongoDB and their local upload files.
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Material = require('./models/Material');

async function run() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.\n');

    const materials = await Material.find({});
    console.log(`Found ${materials.length} material(s) to delete.\n`);

    let deleted = 0;
    for (const m of materials) {
        // Remove uploaded file from disk
        if (m.url) {
            const filePath = path.join(__dirname, 'uploads', path.basename(m.url));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`  [File] Deleted file: ${path.basename(m.url)}`);
            }
        }
        await m.deleteOne();
        console.log(`  [DB]   Deleted material: "${m.title}" (${m._id})`);
        deleted++;
    }

    console.log(`\n✅ Done. Deleted ${deleted} material(s) from MongoDB.`);
    console.log('Note: Pinecone vectors are NOT deleted by this script. Re-upload materials to re-index them.');
    await mongoose.disconnect();
}

run().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
