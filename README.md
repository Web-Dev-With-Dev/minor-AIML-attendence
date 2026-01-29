# AI/ML Attendance Management System

A full-stack web application designed for tracking student attendance for AI/ML department lectures (Tuesday to Friday schedule).

## 🎯 Features

### **For Users (Attendance Markers)**
- Mark attendance for 66 students with a single-tap interface
- Mobile-first responsive design
- Support for lecture cancellation
- Today-first logic (starts from current valid lecture day)
- Auto-advances to next valid day (Tue-Fri only)
- Immutable records (cannot be edited after submission)

### **For Admins**
- View comprehensive attendance statistics
- Master attendance matrix (students × dates)
- Horizontal scrollable table with sticky columns
- Export attendance data to CSV
- Track conducted vs cancelled lectures
- Monitor submission metadata

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- TailwindCSS for styling
- Axios for API calls
- React Router for navigation
- date-fns for date handling

**Backend:**
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing

---

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/attendance-system.git
cd attendance-system
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `.env` file in `server/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key_here
```

Seed the database with default users and students:
```bash
node seeder.js
```

Start the backend:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```

The app will run on:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`


**⚠️ Change these credentials in production!**

---

## 🚀 Deployment

### Backend (Render/Railway/Heroku)

1. Set environment variables in your hosting platform
2. Deploy from GitHub
3. Run seeder as post-deploy script (if needed)

### Frontend (Vercel/Netlify)

1. Set build command: `npm run build`
2. Set output directory: `dist`
3. Add environment variable: `VITE_API_URL=your_backend_url`
4. Deploy from GitHub

---

## 📊 Database Schema

### Students
```javascript
{
  name: String,
  enrollmentNo: String (unique),
  department: String
}
```

### Attendance
```javascript
{
  date: String (YYYY-MM-DD),
  day: String (e.g., "Tuesday"),
  lectureStatus: String (Conducted/Cancelled),
  records: [{ studentId, status: Present/Absent }],
  submittedBy: User ID
}
```

### Users
```javascript
{
  username: String (unique),
  password: String (hashed),
  role: String (admin/user)
}
```

---

## 🔐 API Routes

### Authentication
- `POST /api/auth/login` - User login

### Students
- `GET /api/students` - Get all students (Protected)

### Attendance
- `GET /api/attendance/active-date` - Get current active date (Protected)
- `POST /api/attendance` - Submit attendance (Protected, User only)

### Admin
- `GET /api/admin/stats` - Dashboard statistics (Protected, Admin only)
- `GET /api/admin/matrix` - Attendance matrix (Protected, Admin only)

---

## 📝 Usage

### Marking Attendance (User)
1. Login with user credentials
2. System automatically shows the next valid lecture date
3. Toggle students as Present/Absent
4. Choose "Conducted" or "Cancelled"
5. Submit (cannot be modified after)

### Viewing Reports (Admin)
1. Login with admin credentials
2. View dashboard statistics
3. Scroll through attendance matrix
4. Export data to CSV for further analysis

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

Built for AI/ML Department attendance tracking.

For issues or suggestions, please open an issue on GitHub.