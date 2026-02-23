const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const { protect, authorize } = require('../middleware/authMiddleware');
const { generateContent, generateQuiz, evaluateSubmission } = require('../services/aiService');
const { queryContext } = require('../services/ragService');
const Submission = require('../models/Submission');
const Assessment = require('../models/Assessment');
const Material = require('../models/Material');

// @route   POST /api/ai/chat
// @desc    Chat with AI (RAG enabled - reads materials, can use external examples)
// @access  Private
router.post('/chat', protect, async (req, res) => {
    const { message } = req.body;

    try {
        // Block AI chat during active assessments
        if (req.user.role === 'STUDENT') {
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
            const activeQuiz = await Submission.findOne({
                studentId: req.user.id,
                status: 'IN_PROGRESS',
                updatedAt: { $gt: twoHoursAgo }
            });
            if (activeQuiz) {
                return res.status(403).json({
                    message: 'AI Chat is disabled during an active assessment.',
                    integrityBlock: true
                });
            }
        }

        // Material detection in message
        const queryLower = message.toLowerCase();
        const allMaterials = await Material.find({});
        const mentionedMaterial = allMaterials.find(m => {
            const titleLower = m.title.toLowerCase();
            return queryLower.includes(titleLower) ||
                (titleLower.length > 3 && queryLower.split(/\W+/).includes(titleLower));
        });

        let filter = null;
        let ragQuery = message;

        if (mentionedMaterial) {
            filter = { materialId: mentionedMaterial._id.toString() };
            ragQuery = `Key concepts, definitions, important points, and explanations in ${mentionedMaterial.title}. ${message}`;
            console.log(`Detected Material: "${mentionedMaterial.title}"`);
        } else {
            // Filter by student's profile
            const relevantMaterials = await Material.find({
                $or: [
                    { visibility: 'global' },
                    { department: req.user.department },
                    { subject: { $in: req.user.subjects || [] } }
                ]
            });
            const materialIds = relevantMaterials.map(m => m._id.toString());
            if (materialIds.length > 0) {
                filter = { materialId: { $in: materialIds } };
            }
        }

        const context = await queryContext(ragQuery, filter, 10);
        console.log(`Context length: ${context ? context.length : 0} chars`);

        const sysPrompt = `You are a dedicated AI Teaching Assistant for students.

YOUR APPROACH:
1. ALWAYS ground your answers in the provided "COURSE CONTENT CONTEXT" - this is your primary source.
2. You MAY supplement explanations with real-world examples or analogies from your general knowledge to make concepts clearer - but always link back to the course material.
3. If the course context does NOT cover the topic at all, say: "I couldn't find this in your course materials. Here's a general explanation: [answer]"
4. Be encouraging, clear, and break down complex concepts step by step.
5. ${mentionedMaterial ? `The student is specifically asking about material: "${mentionedMaterial.title}". Focus on that content.` : 'Help the student understand their course content.'}

${context ? `COURSE CONTENT CONTEXT:\n${context}` : 'Note: No specific course material context found. Answer from general knowledge but note this.'}`;

        const response = await generateContent(`${sysPrompt}\n\nStudent's Question: ${message}`);
        res.json({ reply: response });

    } catch (error) {
        console.error("AI Chat Error:", error.message);
        res.status(500).json({
            message: error.message.includes("API Key") ? error.message : "AI Chat Error",
            error: error.message
        });
    }
});

// @route   POST /api/ai/generate-quiz
// @desc    Generate quiz from a specific material (by materialId)
// @access  Private (Teacher/Admin)
router.post('/generate-quiz', protect, authorize('TEACHER', 'ADMIN'), async (req, res) => {
    const { materialId, count, difficulty } = req.body;

    if (!materialId) {
        return res.status(400).json({ message: 'materialId is required. Please select a material first.' });
    }

    try {
        const material = await Material.findById(materialId);
        if (!material) {
            return res.status(404).json({ message: 'Material not found.' });
        }

        // Get existing assessment questions for this material to avoid repeating them
        const existingAssessments = await Assessment.find({ materialId });
        const usedQuestions = existingAssessments.flatMap(a => a.questions.map(q => q.prompt));

        // Query Pinecone strictly by this material's content (larger topK for better context)
        let context = await queryContext(
            `Key concepts, applications, principles, processes, and technical details from this material`,
            { materialId: material._id.toString() },
            20
        );

        // --- FALLBACK: If Pinecone returned no context yet, read the PDF directly from disk ---
        if (!context || context.trim().length < 100) {
            console.log(`[Quiz Gen] Pinecone context empty or too short (${context?.length || 0} chars) for material ${materialId}. Falling back to direct PDF read.`);
            if (material.url && (material.url.toLowerCase().endsWith('.pdf') || material.type === 'PDF')) {
                try {
                    const fileName = path.basename(material.url);
                    const filePath = path.join(__dirname, '../uploads', fileName);
                    console.log(`[Quiz Gen] Checking file at: ${filePath}`);

                    if (fs.existsSync(filePath)) {
                        console.log(`[Quiz Gen] File exists. Starting pdf-parse...`);
                        const dataBuffer = fs.readFileSync(filePath);
                        const parser = new PDFParse({ data: dataBuffer });
                        const data = await parser.getText();

                        if (data && data.text) {
                            context = data.text.trim().substring(0, 15000);
                            console.log(`[Quiz Gen] PDF fallback SUCCESS: extracted ${context.length} chars.`);
                        } else {
                            console.warn(`[Quiz Gen] PDF fallback parsed but returned no text.`);
                        }
                    } else {
                        console.error(`[Quiz Gen] PDF file NOT FOUND on disk at: ${filePath}`);
                        const absPath = path.resolve(filePath);
                        if (fs.existsSync(absPath)) {
                            console.log(`[Quiz Gen] Found via resolve: ${absPath}`);
                            const buffer = fs.readFileSync(absPath);
                            const parser = new PDFParse({ data: buffer });
                            const data = await parser.getText();
                            context = (data.text || '').trim().substring(0, 15000);
                            console.log(`[Quiz Gen] PDF fallback SUCCESS (resolved path): extracted ${context.length} chars.`);
                        }
                    }
                } catch (pdfErr) {
                    console.error('[Quiz Gen] PDF fallback read failed ERROR STACK:');
                    console.error(pdfErr);
                }
            } else {
                console.log(`[Quiz Gen] Material is not a PDF (type: ${material.type}, url: ${material.url}). Cannot use PDF fallback.`);
            }
        }

        if (!context || context.trim().length < 50) {
            return res.status(422).json({
                message: `Cannot generate questions: the material "${material.title}" has no readable content yet. Please ensure the PDF is uploaded correctly and try again in a moment.`
            });
        }

        console.log(`[Quiz Gen] Using context of ${context.length} chars for material: ${material.title}`);

        const questions = await generateQuiz(
            material.title,
            parseInt(count) || 10,
            difficulty || 'Medium',
            context,
            usedQuestions
        );

        res.json({ questions, materialTitle: material.title, materialSubject: material.subject });
    } catch (error) {
        console.error("Quiz Generation Error:", error);
        res.status(500).json({
            message: 'Quiz Generation Error',
            error: error.message
        });
    }
});


// @route   GET /api/ai/verify-ai
// @desc    Verify AI connection
// @access  Public
router.get('/verify-ai', async (req, res) => {
    try {
        await generateContent("Hi");
        res.json({ status: "success", message: "AI Connection is working perfectly!" });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message.includes("API Key") ? error.message : "AI Error",
            detail: error.message
        });
    }
});

module.exports = router;
