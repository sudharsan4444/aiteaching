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

    const { title, description, unit, subject, type } = req.body;

    try {
        // Admin uploads are GLOBAL (seen by all). Teacher uploads are SCOPED (their dept only + admin).
        const visibility = req.user.role === 'ADMIN' ? 'global' : 'scoped';

        const material = await Material.create({
            title,
            description,
            type: type || 'PDF',
            url: `/uploads/${req.file.filename}`,
            unit,
            subject,
            department: req.user.department,
            uploadedBy: req.user.id,
            visibility
        });

        // Respond immediately — don't block on Pinecone indexing
        res.status(201).json({ ...material.toObject(), indexing: true });

        // Index in background (non-blocking)
        if (path.extname(req.file.originalname).toLowerCase() === '.pdf') {
            indexDocument(req.file.path, material._id).catch(err => {
                console.error(`[Indexing] Background indexing failed for material ${material._id}:`, err.message);
            });
        }
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({
            message: 'Error saving material',
            error: error.message
        });
    }
});

// @route   GET /api/upload
// @desc    Get filtered materials based on role
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'ADMIN') {
            // Admins see everything
            query = {};
        } else if (req.user.role === 'TEACHER') {
            // Teachers see their own uploads + all global (admin) materials
            query = {
                $or: [
                    { uploadedBy: req.user.id },
                    { visibility: 'global' }
                ]
            };
        } else if (req.user.role === 'STUDENT') {
            // Students see global materials + scoped materials matching their department
            query = {
                $or: [
                    { visibility: 'global' },
                    { visibility: 'scoped', department: req.user.department }
                ]
            };
        }

        const materials = await Material.find(query)
            .populate('uploadedBy', 'name department')
            .sort({ createdAt: -1 });
        res.json(materials);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/upload/:id
// @desc    Delete a material (Admin can delete any, Teacher only their own)
// @access  Private (Teacher/Admin)
router.delete('/:id', protect, authorize('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (!material) return res.status(404).json({ message: 'Material not found' });

        // Teachers can only delete their own materials
        if (req.user.role === 'TEACHER' && material.uploadedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this material' });
        }

        // Delete file from disk
        if (material.url) {
            const filePath = path.join(__dirname, '../uploads', path.basename(material.url));
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await material.deleteOne();
        res.json({ message: 'Material deleted successfully' });
    } catch (error) {
        console.error('Delete material error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
