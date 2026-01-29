const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// Connect Database
if (process.env.MONGO_URI && process.env.MONGO_URI.startsWith('mongodb')) {
    connectDB();
} else {
    console.log("No valid MONGO_URI found. Database connection skipped.");
}

app.get('/', (req, res) => {
    res.send('Attendance System API is running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
