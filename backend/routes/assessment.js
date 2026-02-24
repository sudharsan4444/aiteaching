const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   POST /api/assessments
// @desc    Create new assessment
// @access  Private (Teacher/Admin)
router.post('/', protect, authorize('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { title, topic, questions, dueDate, materialId } = req.body;
        const assessment = await Assessment.create({
            title,
            topic,
            questions,
            createdBy: req.user.id,
            dueDate,
            materialId
        });
        res.status(201).json(assessment);
    } catch (error) {
        console.error('Assessment create error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   GET /api/assessments
// @desc    Get all assessments
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const assessments = await Assessment.find().sort({ createdAt: -1 });
        res.json(assessments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/assessments/by-material/:materialId
// @desc    Get assessments linked to a specific material
// @access  Private (Teacher/Admin)
router.get('/by-material/:materialId', protect, authorize('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const assessments = await Assessment.find({ materialId: req.params.materialId }).sort({ createdAt: -1 });
        res.json(assessments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/assessments/:id
// @desc    Get single assessment
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
        res.json(assessment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Publish/Unpublish assessment results
router.put('/:id/publish', protect, async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

        // Only creator or admin can publish
        if (assessment.createdBy.toString() !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        assessment.isPublished = req.body.isPublished ?? !assessment.isPublished;
        await assessment.save();
        res.json(assessment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/assessments/:id
// @desc    Delete assessment and its submissions
// @access  Private (Teacher/Admin)
router.delete('/:id', protect, authorize('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

        // Only creator or admin can delete
        if (assessment.createdBy.toString() !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Delete all submissions for this assessment
        await Submission.deleteMany({ assessmentId: req.params.id });

        // Delete the assessment
        await assessment.deleteOne();

        res.json({ message: 'Assessment and associated submissions cleared' });
    } catch (error) {
        console.error('Assessment delete error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
