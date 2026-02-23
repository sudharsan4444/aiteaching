const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

// Helper to generate Roll Number
async function generateRollNumber(department, year) {
    const deptCodes = {
        'Computer Science': 'CS',
        'Electronics': 'EC',
        'Mechanical': 'ME',
        'Information Technology': 'IT',
        'Civil': 'CV',
        'Electrical': 'EE'
    };

    const deptCode = deptCodes[department] || department.slice(0, 2).toUpperCase();
    const prefix = `${year}${deptCode}`;

    // Find the latest roll number with this prefix
    const lastUser = await User.findOne({ rollNumber: new RegExp(`^${prefix}`) })
        .sort({ rollNumber: -1 });

    let nextIndex = 101;
    if (lastUser && lastUser.rollNumber) {
        const lastIndex = parseInt(lastUser.rollNumber.replace(prefix, ''));
        if (!isNaN(lastIndex)) {
            nextIndex = lastIndex + 1;
        }
    }

    return `${prefix}${nextIndex}`;
}

// @route   POST /api/admin/create-user
// @desc    Admin creates a new user, or Teacher creates a Student
// @access  Private (Admin/Teacher)
router.post('/create-user', protect, authorize('ADMIN', 'TEACHER'), async (req, res) => {
    let { name, email, password, role, department, year, subjects, gpa, overallGrade, assignedTeacher, rollNumber } = req.body;

    try {
        // Teacher can ONLY create STUDENTS
        if (req.user.role === 'TEACHER' && role !== 'STUDENT') {
            return res.status(403).json({ message: 'Teachers can only create students.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Auto-generate Roll Number for Students if not provided
        if (role === 'STUDENT' && !rollNumber && department && year) {
            rollNumber = await generateRollNumber(department, year);
        }

        // If Teacher is creating student, auto-assign
        if (req.user.role === 'TEACHER' && role === 'STUDENT') {
            assignedTeacher = req.user.id;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'STUDENT',
            department,
            year,
            subjects: subjects || [],
            gpa,
            overallGrade,
            assignedTeacher,
            rollNumber
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            rollNumber: user.rollNumber,
            message: 'User created successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin Only)
router.get('/users', protect, authorize('ADMIN', 'TEACHER'), async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user profile
// @access  Private (Admin/Teacher)
router.get('/users/:id', protect, authorize('ADMIN', 'TEACHER'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin Only)
router.delete('/users/:id', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/cleanup-assessments
// @desc    Clear all assessments and submissions (Marks/Feedback)
// @access  Private (Admin Only)
router.delete('/cleanup-assessments', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const Assessment = require('../models/Assessment');
        const Submission = require('../models/Submission');

        await Assessment.deleteMany({});
        await Submission.deleteMany({});

        res.json({ message: 'All assessments and submissions have been cleared successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Cleanup failed', error: error.message });
    }
});

module.exports = router;
