const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   POST /api/admin/create-user
// @desc    Admin creates a new user, or Teacher creates a Student
// @access  Private (Admin/Teacher)
router.post('/create-user', protect, authorize('ADMIN', 'TEACHER'), async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Teacher can ONLY create STUDENTS
        if (req.user.role === 'TEACHER' && role !== 'STUDENT') {
            return res.status(403).json({ message: 'Teachers can only create students.' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'STUDENT'
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
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

module.exports = router;
