const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    id: String,
    type: { type: String, enum: ['MCQ', 'DESCRIPTIVE'] },
    prompt: String,
    options: [String],
    correctOptionIndex: Number,
    difficulty: String,
    maxPoints: Number
});

const assessmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    topic: { type: String, required: true },
    questions: [questionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' }, // Linked material
    createdAt: { type: Date, default: Date.now },
    dueDate: Date,
    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'CLOSED'], default: 'PUBLISHED' }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
