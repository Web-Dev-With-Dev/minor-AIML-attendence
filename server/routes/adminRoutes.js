const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const history = await Attendance.find({});
        const conductedDays = history.filter(h => h.lectureStatus === 'Conducted').length;
        const cancelledDays = history.filter(h => h.lectureStatus === 'Cancelled').length;
        res.json({ totalStudents, conductedDays, cancelledDays });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/history', protect, admin, async (req, res) => {
    try {
        const history = await Attendance.find({})
            .populate('submittedBy', 'username')
            .sort({ date: -1 });

        const data = history.map(h => ({
            _id: h._id,
            date: h.date,
            day: h.day,
            status: h.lectureStatus,
            submittedBy: h.submittedBy,
            presentCount: h.records.filter(r => r.status === 'Present').length,
            absentCount: h.records.filter(r => r.status === 'Absent').length,
        }));

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/matrix', protect, admin, async (req, res) => {
    try {
        const students = await Student.find({}).sort({ enrollmentNo: 1 });
        const attendance = await Attendance.find({}).sort({ date: 1 });

        const dates = attendance.map(a => ({
            id: a._id,
            date: a.date,
            status: a.lectureStatus
        }));

        const matrix = students.map(s => {
            const studentAtd = {};
            attendance.forEach(a => {
                if (a.lectureStatus === 'Cancelled') {
                    studentAtd[a.date] = 'N/A';
                } else {
                    const record = a.records.find(r => r.studentId.toString() === s._id.toString());
                    studentAtd[a.date] = record ? record.status : 'Absent';
                }
            });
            return {
                _id: s._id,
                name: s.name,
                enrollmentNo: s.enrollmentNo,
                attendance: studentAtd
            };
        });

        res.json({ dates, students: matrix });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
