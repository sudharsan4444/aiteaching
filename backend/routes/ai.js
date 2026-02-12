const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { generateContent, generateQuiz, evaluateSubmission } = require('../services/geminiService');
const { queryContext } = require('../services/ragService');
const Submission = require('../models/Submission');

// @route   POST /api/ai/chat
// @desc    Chat with AI (RAG enabled)
// @access  Private
router.post('/chat', protect, async (req, res) => {
    const { message } = req.body;

    try {
        // INTEGRITY CHECK: Check if student has an active quiz
        if (req.user.role === 'STUDENT') {
            const activeQuiz = await Submission.findOne({
                studentId: req.user.id,
                status: 'IN_PROGRESS'
            });

            if (activeQuiz) {
                return res.status(403).json({
                    message: 'AI Chat is disabled during an active assessment.',
                    integrityBlock: true
                });
            }
        }

        // RAG Logic
        const context = await queryContext(message);

        let sysPrompt = "You are a helpful AI Teaching Assistant.";
        if (context) {
            sysPrompt += `\nUse the following context to answer the student's question:\n${context}`;
        }

        const response = await generateContent(`${sysPrompt}\n\nUser: ${message}`);
        res.json({ reply: response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'AI Chat Error' });
    }
});

// @route   POST /api/ai/generate-quiz
// @desc    Generate quiz questions
// @access  Private (Teacher Only)
router.post('/generate-quiz', protect, authorize('TEACHER', 'ADMIN'), async (req, res) => {
    const { topic, count, difficulty } = req.body;
    try {
        const questions = await generateQuiz(topic, count, difficulty);
        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Quiz Generation Error' });
    }
});

module.exports = router;
