const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Material = require('../models/Material');
const { protect, authorize } = require('../middleware/authMiddleware');
const { indexDocument } = require('../services/ragService');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|mp4/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDFs and MP4s are allowed!'));
        }
    }
});

// @route   POST /api/upload
// @desc    Upload material (PDF/Video) and index it
// @access  Private (Teacher/Admin)
router.post('/', protect, authorize('TEACHER', 'ADMIN'), upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, unit, type } = req.body;

    try {
        const material = await Material.create({
            title,
            description,
            type: type || 'PDF', // Default to PDF if not specified, though frontend should send it
            url: `/uploads/${req.file.filename}`,
            unit,
            uploadedBy: req.user.id
        });

        // If PDF, index it for RAG
        if (path.extname(req.file.originalname).toLowerCase() === '.pdf') {
            // Run indexing in background to avoid timeout? 
            // For MVP, await it to ensure success feedback.
            await indexDocument(req.file.path, material._id);
        }

        res.status(201).json(material);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during upload/indexing' });
    }
});

// @route   GET /api/upload
// @desc    Get all materials
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const materials = await Material.find().sort({ createdAt: -1 });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
