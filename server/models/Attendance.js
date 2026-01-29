const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
    date: { type: String, required: true, unique: true }, // Format YYYY-MM-DD
    day: { type: String, required: true }, // Tue, Wed, Thu, Fri
    lectureStatus: { type: String, enum: ['Conducted', 'Cancelled'], default: 'Conducted' },
    records: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        status: { type: String, enum: ['Present', 'Absent'], required: true }
    }],
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
