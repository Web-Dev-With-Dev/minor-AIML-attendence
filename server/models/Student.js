const mongoose = require('mongoose');

const studentSchema = mongoose.Schema({
    enrollmentNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, default: 'AI & Machine Learning' }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
