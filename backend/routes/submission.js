const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Assessment = require('../models/Assessment');
const { protect, authorize } = require('../middleware/authMiddleware');
const { evaluateSubmission } = require('../services/aiService');

// Helper to compute letter grade from percentage
const computeGrade = (score, maxScore) => {
    const s = parseFloat(score) || 0;
    const ms = parseFloat(maxScore) || 0;
    if (ms <= 0) return 'N/A';
    const pct = (s / ms) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
};

// @route   POST /api/submissions/start
// @desc    Start an assessment (Create IN_PROGRESS submission)
// @access  Private (Student)
router.post('/start', protect, authorize('STUDENT'), async (req, res) => {
    try {
        const { assessmentId } = req.body;

        // Check if already started/submitted
        const existing = await Submission.findOne({ assessmentId, studentId: req.user.id });
        if (existing) {
            return res.status(400).json({ message: 'Assessment already started or submitted' });
        }

        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

        const submission = await Submission.create({
            assessmentId,
            studentId: req.user.id,
            maxScore: assessment.questions.reduce((sum, q) => sum + (q.maxPoints || 5), 0),
            status: 'IN_PROGRESS'
        });

        res.status(201).json(submission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   POST /api/submissions/:id/submit
// @desc    Submit answers and get AI grading
// @access  Private (Student)
router.post('/:id/submit', protect, authorize('STUDENT'), async (req, res) => {
    try {
        const submission = await Submission.findOne({ _id: req.params.id, studentId: req.user.id });
        if (!submission) return res.status(404).json({ message: 'Submission not found' });
        if (submission.status !== 'IN_PROGRESS') return res.status(400).json({ message: 'Already submitted' });

        const { answers, timeTaken } = req.body;
        submission.answers = answers;
        submission.submittedAt = Date.now();
        submission.status = 'SUBMITTED';
        if (timeTaken) submission.timeTaken = timeTaken;

        // AI Grading
        const assessment = await Assessment.findById(submission.assessmentId);
        if (assessment) {
            const evaluation = await evaluateSubmission(assessment.title, assessment.questions, answers);
            submission.score = parseFloat(evaluation.score) || 0;
            submission.feedback = evaluation.feedback || '';
            submission.aiFeedbackBreakdown = evaluation.breakdown || evaluation;
            submission.grade = computeGrade(submission.score, submission.maxScore);

            // Compute topic-wise analysis from assessment questions
            const topicMap = {};
            assessment.questions.forEach(q => {
                const t = q.topic || assessment.topic;
                if (!topicMap[t]) topicMap[t] = { total: 0, scored: 0 };
                topicMap[t].total += (q.maxPoints || 5);
            });
            submission.topicAnalysis = topicMap;
            submission.status = 'GRADED';
        }

        await submission.save();
        res.json(submission);
    } catch (error) {
        console.error("Submission Error:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   GET /api/submissions/my
// @desc    Get current user's submissions
// @access  Private (Student)
router.get('/my', protect, async (req, res) => {
    try {
        const submissions = await Submission.find({ studentId: req.user.id })
            .populate('assessmentId', 'title topic questions materialId isPublished')
            .sort({ submittedAt: -1 });

        // Filter sensitive data if results are not published
        const filteredSubmissions = submissions.map(sub => {
            const subObj = sub.toObject();
            if (subObj.assessmentId && !subObj.assessmentId.isPublished) {
                // If not published, hide the specific scores and feedback from the list
                delete subObj.score;
                delete subObj.grade;
                delete subObj.feedback;
                delete subObj.aiFeedbackBreakdown;
                delete subObj.topicAnalysis;
            }
            return subObj;
        });
        res.json(filteredSubmissions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/submissions
// @desc    Get all submissions (Teacher/Admin)
// @access  Private (Teacher/Admin)
router.get('/', protect, authorize('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const submissions = await Submission.find()
            .populate('studentId', 'name email department rollNumber')
            .populate('assessmentId', 'title topic materialId')
            .sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/submissions/by-assessment/:assessmentId
// @desc    Get submissions for a specific assessment (Teacher view)
// @access  Private (Teacher/Admin)
router.get('/by-assessment/:assessmentId', protect, authorize('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const submissions = await Submission.find({ assessmentId: req.params.assessmentId })
            .populate('studentId', 'name email department rollNumber')
            .sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/submissions/:id
// @desc    Teacher corrects submission score/feedback
// @access  Private (Teacher/Admin)
router.put('/:id', protect, authorize('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { score, feedback, teacherOverrideScore, teacherFeedback } = req.body;
        const submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        // Legacy direct score update
        if (score !== undefined) {
            submission.score = score;
            submission.grade = computeGrade(score, submission.maxScore);
        }
        if (feedback !== undefined) submission.feedback = feedback;

        // New teacher override fields
        if (teacherOverrideScore !== undefined) {
            submission.teacherOverrideScore = parseFloat(teacherOverrideScore);
            submission.grade = computeGrade(submission.teacherOverrideScore, submission.maxScore);
        }
        if (teacherFeedback !== undefined) submission.teacherFeedback = teacherFeedback;

        submission.status = 'GRADED';
        await submission.save();
        res.json(submission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
