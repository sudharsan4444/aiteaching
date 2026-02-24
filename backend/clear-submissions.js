const mongoose = require('mongoose');
require('dotenv').config();

const clearSubmissions = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('Error: MONGODB_URI not found in .env');
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log('--- CONNECTED TO MONGODB ---');

        // Get the Submission model
        // We'll define it locally since we don't want to rely on the relative path for a standalone script
        const submissionSchema = new mongoose.Schema({}, { strict: false });
        const Submission = mongoose.model('Submission', submissionSchema);

        const count = await Submission.countDocuments();
        console.log(`Found ${count} submission records.`);

        if (count === 0) {
            console.log('No records to delete.');
        } else {
            const result = await Submission.deleteMany({});
            console.log(`Successfully deleted ${result.deletedCount} submission records.`);
        }

        console.log('Cleanup complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing submissions:', error);
        process.exit(1);
    }
};

clearSubmissions();
