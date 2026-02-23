const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: { type: Map, of: mongoose.Schema.Types.Mixed },
    score: { type: Number, default: 0 },
    maxScore: { type: Number, required: true },
    grade: { type: String, default: 'N/A' }, // Letter grade: A+, A, B, C, D, F
    feedback: { type: String },
    aiFeedbackBreakdown: { type: mongoose.Schema.Types.Mixed }, // Per-question AI feedback array
    teacherOverrideScore: { type: Number },   // Teacher can override AI score
    teacherFeedback: { type: String },         // Teacher's own written feedback
    timeTaken: { type: Number, default: 0 },  // In seconds
    topicAnalysis: { type: mongoose.Schema.Types.Mixed }, // { topic: score } breakdown
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['IN_PROGRESS', 'SUBMITTED', 'GRADED'], default: 'IN_PROGRESS' }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
