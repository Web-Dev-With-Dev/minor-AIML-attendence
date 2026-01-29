import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [matrix, setMatrix] = useState({ dates: [], students: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, matrixRes] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/admin/matrix')
                ]);
                setStats(statsRes.data);
                setMatrix(matrixRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const exportToCSV = () => {
        const headers = ['Enrollment No', 'Student Name', ...matrix.dates.map(d => d.date)];
        const rows = matrix.students.map(s => [
            s.enrollmentNo,
            s.name,
            ...matrix.dates.map(d => s.attendance[d.date] || 'Absent')
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(r => r.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-10 text-center font-bold text-indigo-600">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-slate-900 text-white p-4 sticky top-0 z-30 shadow-2xl">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-xl font-black italic tracking-tighter text-indigo-400">ADMIN CONTROL</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">AI/ML Attendance Management</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={exportToCSV} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-500 shadow-lg">EXPORT CSV</button>
                        <button onClick={logout} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold ring-1 ring-slate-700">LOGOUT</button>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Total Students</span>
                        <div className="text-4xl font-black text-slate-900">{stats?.totalStudents}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Enrolled in AI/ML</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 ring-4 ring-indigo-50">
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest block mb-2">Lectures Conducted</span>
                        <div className="text-4xl font-black text-slate-900">{stats?.conductedDays}</div>
                        <div className="text-[10px] font-bold text-indigo-400 mt-1 uppercase">Excluding cancelled</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <span className="text-xs font-black text-red-400 uppercase tracking-widest block mb-2">Lectures Cancelled</span>
                        <div className="text-4xl font-black text-slate-900">{stats?.cancelledDays}</div>
                        <div className="text-[10px] font-bold text-red-400 mt-1 uppercase">Valid Tue-Fri slots</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <h2 className="font-black text-slate-900 tracking-tight">ATTENDANCE MASTER MATRIX</h2>
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 font-black px-2 py-1 rounded">HORIZONTALLY SCROLLABLE</span>
                    </div>

                    <div className="overflow-x-auto relative max-h-[600px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-20">
                                <tr className="bg-slate-900 text-white">
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-800 sticky left-0 bg-slate-900 z-30 min-w-[200px]">Student Info</th>
                                    {matrix.dates.map(d => (
                                        <th key={d.date} className="p-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-800 text-center min-w-[120px]">
                                            {d.date}
                                            {d.status === 'Cancelled' && <span className="block text-red-400 text-[8px] mt-1">CANCELLED</span>}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {matrix.students.map((s) => (
                                    <tr key={s._id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="p-4 border-r border-slate-100 sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)] group-hover:bg-indigo-50/30">
                                            <div className="font-black text-slate-900 text-xs truncate max-w-[180px]">{s.name}</div>
                                            <div className="text-[10px] font-bold text-slate-400">{s.enrollmentNo}</div>
                                        </td>
                                        {matrix.dates.map(d => {
                                            const status = s.attendance[d.date];
                                            return (
                                                <td key={d.date} className="p-4 border-r border-slate-100 text-center">
                                                    {d.status === 'Cancelled' ? (
                                                        <span className="text-[10px] font-black text-slate-300">N/A</span>
                                                    ) : (
                                                        <span className={`text-xs font-black ${status === 'Present' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            {status === 'Present' ? '✔' : '❌'}
                                                        </span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
