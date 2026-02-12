const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: { type: Map, of: mongoose.Schema.Types.Mixed }, // Key: questionId, Value: answer
    score: { type: Number, default: 0 },
    maxScore: { type: Number, required: true },
    feedback: { type: String },
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['IN_PROGRESS', 'SUBMITTED', 'GRADED'], default: 'IN_PROGRESS' }
});

module.exports = mongoose.model('Submission', submissionSchema);
