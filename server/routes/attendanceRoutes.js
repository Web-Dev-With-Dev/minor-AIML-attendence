const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/authMiddleware');
const { addDays, format, parseISO, startOfToday } = require('date-fns');

// Helper to get next valid lecture day (Tue-Fri)
const getNextValidDay = (date) => {
    let current = addDays(date, 1);
    while (true) {
        const day = current.getDay();
        if (day >= 2 && day <= 5) return current; // 2=Tue, 5=Fri
        current = addDays(current, 1);
    }
};

// Get Active Date for Mark Attendance
router.get('/active-date', protect, async (req, res) => {
    try {
        const lastRecord = await Attendance.findOne().sort({ date: -1 });
        const today = startOfToday();
        const todayStr = format(today, 'yyyy-MM-dd');
        const d = today.getDay();
        const isLectureDay = (d >= 2 && d <= 5);

        if (!lastRecord) {
            activeDate = isLectureDay ? today : getNextValidDay(today);
        } else {
            // If today is a valid lecture day AND strictly after our last record
            if (isLectureDay && todayStr > lastRecord.date) {
                activeDate = today;
            } else {
                activeDate = getNextValidDay(parseISO(lastRecord.date));
            }
        }

        res.json({
            date: format(activeDate, 'yyyy-MM-dd'),
            day: format(activeDate, 'EEEE')
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Submit Attendance
router.post('/', protect, async (req, res) => {
    const { date, day, lectureStatus, records } = req.body;

    const exists = await Attendance.findOne({ date });
    if (exists) {
        return res.status(400).json({ message: 'Attendance already exists for this date' });
    }

    const attendance = new Attendance({
        date,
        day,
        lectureStatus,
        records: lectureStatus === 'Cancelled' ? [] : records,
        submittedBy: req.user._id
    });

    try {
        await attendance.save();
        res.status(201).json({ message: 'Success' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
