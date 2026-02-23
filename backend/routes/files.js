const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Submission = require('../models/Submission');
const Assessment = require('../models/Assessment');
const { protect, authorize } = require('../middleware/authMiddleware');
const { generateAnswerKeyPDF, generateSubmissionReportPDF } = require('../services/pdfService');

// @route   GET /api/files/assessment/:id/answer-key
// @desc    Download Answer Key PDF
// @access  Private/Teacher
// @route   GET /api/files/assessment/:id/answer-key
// ... rest existing code
router.get('/assessment/:id/answer-key', protect, async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

        const pdfBytes = await generateAnswerKeyPDF(assessment);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="answer-key-${assessment.topic}.pdf"`);
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/files/material/:id/answer-key
// @desc    Generate and download Answer Key PDF for a specific material
// @access  Private (Teacher/Admin)
router.get('/material/:id/answer-key', protect, authorize('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const Material = require('../models/Material');
        const { queryContext } = require('../services/ragService');
        const { generateQuiz } = require('../services/aiService');

        const material = await Material.findById(req.params.id);
        if (!material) return res.status(404).json({ message: 'Material not found' });

        // Generate a 5-question comprehensive quiz for this material to use as answer key
        const context = await queryContext(`Full detailed content of material: ${material.title}`, { materialId: material._id.toString() });
        const questions = await generateQuiz(material.title, 5, 'Intermediate', context);

        const pseudoAssessment = {
            title: `Answer Key Preview: ${material.title}`,
            topic: material.subject,
            questions: questions
        };

        const pdfBytes = await generateAnswerKeyPDF(pseudoAssessment);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="key-${material.title}.pdf"`);
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/files/submission/:id/report
// @desc    Download Submission Report PDF
// @access  Private
router.get('/submission/:id/report', protect, async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        const assessment = await Assessment.findById(submission.assessmentId);
        const student = await User.findById(submission.studentId);

        // Authorization: Teacher/Admin, or the student themselves
        if (req.user.role === 'STUDENT' && submission.studentId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this report.' });
        }

        const pdfBytes = await generateSubmissionReportPDF(assessment, submission, student);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="report-${student.name}-${assessment.title}.pdf"`);
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
