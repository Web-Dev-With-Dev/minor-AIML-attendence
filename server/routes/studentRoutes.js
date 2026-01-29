const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
    const students = await Student.find({}).sort({ enrollmentNo: 1 });
    res.json(students);
});

module.exports = router;
