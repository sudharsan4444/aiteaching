const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['ADMIN', 'TEACHER', 'STUDENT'],
        default: 'STUDENT'
    },
    rollNumber: { type: String, unique: true, sparse: true },
    department: { type: String },
    year: { type: Number },
    subjects: { type: [String], default: [] },
    gpa: { type: Number },
    overallGrade: { type: String },
    assignedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
