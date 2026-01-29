import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const AttendanceMarking = () => {
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeInfo, setActiveInfo] = useState({ date: '', day: '' });
    const [lectureStatus, setLectureStatus] = useState('Conducted');
    const { logout } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dateRes, studentRes] = await Promise.all([
                    api.get('/attendance/active-date'),
                    api.get('/students')
                ]);
                setActiveInfo(dateRes.data);
                setStudents(studentRes.data);

                const initial = {};
                studentRes.data.forEach(s => initial[s._id] = false);
                setAttendance(initial);
            } catch (error) {
                console.error("Error fetching data", error);
                alert("Failed to load students. Check if server is running and database is seeded.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleAttendance = (id) => {
        if (lectureStatus === 'Cancelled') return;
        setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSubmit = async () => {
        const confirmMsg = lectureStatus === 'Cancelled'
            ? `Mark ${activeInfo.date} as CANCELLED?`
            : `Submit attendance for ${activeInfo.date}? (${Object.values(attendance).filter(Boolean).length} Present)`;

        if (!confirm(confirmMsg)) return;

        setSubmitting(true);
        try {
            const records = Object.keys(attendance).map(studentId => ({
                studentId,
                status: attendance[studentId] ? 'Present' : 'Absent'
            }));
            await api.post('/attendance', {
                date: activeInfo.date,
                day: activeInfo.day,
                lectureStatus,
                records
            });
            window.location.reload();
        } catch (error) {
            alert('Submission failed: ' + (error.response?.data?.message || 'Error'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-indigo-600">Initializing Session...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <header className="bg-indigo-700 text-white p-4 sticky top-0 z-20 shadow-lg">
                <div className="flex justify-between items-center max-w-2xl mx-auto">
                    <div>
                        <h1 className="text-xl font-black tracking-tighter uppercase">AI/ML Attendance</h1>
                        <p className="text-xs font-bold opacity-80 uppercase">{activeInfo.day}, {activeInfo.date}</p>
                    </div>
                    <button onClick={logout} className="bg-indigo-900/50 p-2 rounded-lg text-xs font-black border border-indigo-400/30">LOGOUT</button>
                </div>
            </header>

            <main className="p-4 max-w-2xl mx-auto">
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 border border-gray-100 flex gap-4">
                    <button
                        onClick={() => setLectureStatus('Conducted')}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${lectureStatus === 'Conducted' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
                    >
                        Conducted
                    </button>
                    <button
                        onClick={() => setLectureStatus('Cancelled')}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${lectureStatus === 'Cancelled' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
                    >
                        Cancelled
                    </button>
                </div>

                {lectureStatus === 'Cancelled' ? (
                    <div className="text-center py-20 bg-red-50 rounded-3xl border-2 border-dashed border-red-200">
                        <span className="text-6xl mb-4 block">🚫</span>
                        <h2 className="text-2xl font-black text-red-700">LECTURE CANCELLED</h2>
                        <p className="text-red-600/70 font-medium px-4">No attendance records will be recorded for this date.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex justify-between px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span>Student Identity</span>
                            <span>Status</span>
                        </div>
                        {students.length === 0 ? (
                            <div className="text-center py-20 text-gray-400 font-bold">
                                NO STUDENTS FOUND IN DATABASE
                            </div>
                        ) : students.map(student => (
                            <div
                                key={student._id}
                                onClick={() => toggleAttendance(student._id)}
                                className={`p-4 rounded-2xl border-2 flex justify-between items-center transition-all active:scale-[0.98] ${attendance[student._id]
                                    ? 'bg-indigo-50 border-indigo-500 shadow-indigo-100 shadow-lg'
                                    : 'bg-white border-gray-100'
                                    }`}
                            >
                                <div className="flex-1">
                                    <div className="font-black text-gray-900 leading-tight">{student.name}</div>
                                    <div className="text-[10px] font-bold text-gray-400 tracking-tight">{student.enrollmentNo}</div>
                                </div>
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${attendance[student._id] ? 'bg-indigo-600 border-indigo-600' : 'border-gray-200'
                                    }`}>
                                    {attendance[student._id] && <span className="text-white text-xs">✓</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 z-30">
                <button
                    disabled={submitting}
                    onClick={handleSubmit}
                    className={`w-full max-w-xl mx-auto block py-5 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center ${lectureStatus === 'Cancelled' ? 'bg-red-600' : 'bg-indigo-700'
                        } text-white`}
                >
                    {submitting ? 'SYNCING...' : (lectureStatus === 'Cancelled' ? 'CONFIRM CANCELLATION' : 'SUBMIT ATTENDANCE')}
                </button>
            </div>
        </div>
    );
};

export default AttendanceMarking;
