const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Assessment = require('../models/Assessment');
const { protect, authorize } = require('../middleware/authMiddleware');
const { evaluateSubmission } = require('../services/geminiService');

// @route   POST /api/submissions/start
// @desc    Start an assessment (Create IN_PROGRESS submission)
// @access  Private (Student)
router.post('/start', protect, authorize('STUDENT'), async (req, res) => {
    try {
        const { assessmentId } = req.body;

        // Check if already started/submitted
        const existing = await Submission.findOne({
            assessmentId,
            studentId: req.user.id
        });

        if (existing) {
            return res.status(400).json({ message: 'Assessment already started or submitted' });
        }

        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

        const submission = await Submission.create({
            assessmentId,
            studentId: req.user.id,
            maxScore: assessment.questions.reduce((sum, q) => sum + q.maxPoints, 0),
            status: 'IN_PROGRESS'
        });

        res.status(201).json(submission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/submissions/:id/submit
// @desc    Submit answers and get AI grading
// @access  Private (Student)
router.post('/:id/submit', protect, authorize('STUDENT'), async (req, res) => {
    try {
        const submission = await Submission.findOne({
            _id: req.params.id,
            studentId: req.user.id
        });

        if (!submission) return res.status(404).json({ message: 'Submission not found' });
        if (submission.status !== 'IN_PROGRESS') return res.status(400).json({ message: 'Already submitted' });

        const { answers } = req.body;
        submission.answers = answers;
        submission.submittedAt = Date.now();
        submission.status = 'SUBMITTED';

        // AI Grading
        const assessment = await Assessment.findById(submission.assessmentId);
        if (assessment) {
            const evaluation = await evaluateSubmission(assessment.title, assessment.questions, answers);
            submission.score = evaluation.score; // AI calculated score
            submission.feedback = evaluation.feedback;
            submission.status = 'GRADED';
        }

        await submission.save();
        res.json(submission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/submissions/my
// @desc    Get current user's submissions
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const submissions = await Submission.find({ studentId: req.user.id }).sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/submissions
// @desc    Get all submissions (Teacher)
// @access  Private (Teacher)
router.get('/', protect, authorize('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const submissions = await Submission.find().populate('studentId', 'name email');
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/submissions/:id
// @desc    Update submission score/feedback
// @access  Private (Teacher Only)
router.put('/:id', protect, authorize('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { score, feedback } = req.body;
        const submission = await Submission.findById(req.params.id);

        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        if (score !== undefined) submission.score = score;
        if (feedback !== undefined) submission.feedback = feedback;

        await submission.save();
        res.json(submission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
