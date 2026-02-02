const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
    const students = await Student.find({}).sort({ enrollmentNo: 1 });
    res.json(students);
});

router.get('/my-attendance', protect, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can access this endpoint' });
        }

        const student = await Student.findOne({ enrollmentNo: req.user.enrollmentNo });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const attendanceRecords = await Attendance.find({}).sort({ date: 1 });

        let presentCount = 0;
        let absentCount = 0;
        let cancelledCount = 0;
        let totalLectures = 0;

        const attendanceData = attendanceRecords.map(record => {
            if (record.lectureStatus === 'Cancelled') {
                cancelledCount++;
                return {
                    date: record.date,
                    day: record.day,
                    status: 'Cancelled',
                    lectureStatus: 'Cancelled'
                };
            }

            totalLectures++;
            const studentRecord = record.records.find(
                r => r.studentId.toString() === student._id.toString()
            );

            const status = studentRecord ? studentRecord.status : 'Absent';
            if (status === 'Present') presentCount++;
            else absentCount++;

            return {
                date: record.date,
                day: record.day,
                status: status,
                lectureStatus: record.lectureStatus
            };
        });

        const attendancePercentage = totalLectures > 0
            ? ((presentCount / totalLectures) * 100).toFixed(2)
            : 0;

        res.json({
            student: {
                enrollmentNo: student.enrollmentNo,
                name: student.name,
                department: student.department
            },
            statistics: {
                totalLectures,
                presentCount,
                absentCount,
                cancelledCount,
                attendancePercentage: parseFloat(attendancePercentage)
            },
            attendanceData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
