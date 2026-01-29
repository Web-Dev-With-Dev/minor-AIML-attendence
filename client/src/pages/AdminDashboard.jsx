import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [matrix, setMatrix] = useState({ dates: [], students: [] });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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
        const headers = ['Enrollment No', 'Student Name', 'Attendance %', ...matrix.dates.map(d => d.date)];
        const rows = filteredStudents.map(s => [
            s.enrollmentNo,
            s.name,
            getAttendancePercent(s) + '%',
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

    const exportToXLSX = () => {
        const headers = ['Enrollment No', 'Student Name', 'Attendance %', ...matrix.dates.map(d => d.date)];
        const rows = filteredStudents.map(s => [
            s.enrollmentNo,
            s.name,
            getAttendancePercent(s) + '%',
            ...matrix.dates.map(d => s.attendance[d.date] || 'Absent')
        ]);

        const data = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
        XLSX.writeFile(wb, `attendance_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const filteredStudents = matrix.students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.enrollmentNo.toLowerCase().includes(search.toLowerCase())
    );

    // Calculate attendance percentage for each student
    const getAttendancePercent = (student) => {
        const conductedDates = matrix.dates.filter(d => d.status !== 'Cancelled');
        if (conductedDates.length === 0) return 0;
        const present = conductedDates.filter(d => student.attendance[d.date] === 'Present').length;
        return Math.round((present / conductedDates.length) * 100);
    };

    if (loading) return <div className="p-10 text-center font-bold text-indigo-600">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <header className="bg-slate-900 text-white p-4 sticky top-0 z-30 shadow-xl">
                <div className="flex flex-wrap justify-between items-center max-w-7xl mx-auto gap-4">
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-indigo-400">ADMIN DASHBOARD</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">AI/ML Attendance Management</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={exportToCSV}
                            className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-emerald-500 transition-colors"
                        >
                            CSV
                        </button>
                        <button
                            onClick={exportToXLSX}
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-500 transition-colors"
                        >
                            XLSX
                        </button>
                        <button
                            onClick={logout}
                            className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-bold ring-1 ring-slate-700 hover:bg-slate-700 transition-colors"
                        >
                            LOGOUT
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4 md:p-6 max-w-[1600px] mx-auto">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Students</span>
                        <div className="text-3xl font-black text-slate-900">{stats?.totalStudents || 0}</div>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-indigo-500">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Conducted</span>
                        <div className="text-3xl font-black text-slate-900">{stats?.conductedDays || 0}</div>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-red-500">
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-1">Cancelled</span>
                        <div className="text-3xl font-black text-slate-900">{stats?.cancelledDays || 0}</div>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">Total Days</span>
                        <div className="text-3xl font-black text-slate-900">{matrix.dates.length}</div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
                    <input
                        type="text"
                        placeholder="Search student by name or enrollment..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 outline-none font-medium"
                    />
                    {search && (
                        <div className="mt-2 text-xs text-slate-500 font-bold">
                            Showing {filteredStudents.length} of {matrix.students.length} students
                        </div>
                    )}
                </div>

                {/* Matrix Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-2">
                        <h2 className="font-black text-slate-900 tracking-tight">ATTENDANCE MATRIX</h2>
                        <div className="flex gap-2 text-[10px] font-bold">
                            <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded">{filteredStudents.length} Students</span>
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded">← Scroll →</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-20">
                                <tr className="bg-slate-800 text-white">
                                    <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-slate-700 sticky left-0 bg-slate-800 z-30 min-w-[200px]">
                                        Student
                                    </th>
                                    <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-slate-700 text-center min-w-[60px]">
                                        %
                                    </th>
                                    {matrix.dates.map(d => (
                                        <th key={d.date} className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-slate-700 text-center min-w-[100px]">
                                            {d.date}
                                            {d.status === 'Cancelled' && <span className="block text-red-400 text-[8px]">CANCELLED</span>}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={matrix.dates.length + 2} className="p-10 text-center text-slate-400 font-bold">
                                            {search ? 'No students match your search' : 'No data available'}
                                        </td>
                                    </tr>
                                ) : filteredStudents.map((s) => {
                                    const percent = getAttendancePercent(s);
                                    return (
                                        <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-3 border-r border-slate-100 sticky left-0 bg-white z-10">
                                                <div className="font-bold text-slate-900 text-xs truncate max-w-[180px] uppercase">{s.name}</div>
                                                <div className="text-[10px] font-medium text-slate-400">{s.enrollmentNo}</div>
                                            </td>
                                            <td className="p-3 border-r border-slate-100 text-center">
                                                <span className={`text-xs font-black px-2 py-1 rounded ${percent >= 75 ? 'bg-emerald-100 text-emerald-700' :
                                                    percent >= 50 ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {percent}%
                                                </span>
                                            </td>
                                            {matrix.dates.map(d => {
                                                const status = s.attendance[d.date];
                                                return (
                                                    <td key={d.date} className="p-3 border-r border-slate-100 text-center">
                                                        {d.status === 'Cancelled' ? (
                                                            <span className="text-[10px] font-bold text-slate-300">—</span>
                                                        ) : (
                                                            <span className={`text-sm font-black ${status === 'Present' ? 'text-emerald-600' : 'text-red-500'}`}>
                                                                {status === 'Present' ? '✓' : '✕'}
                                                            </span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Summary */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap gap-4 text-xs font-bold text-slate-600">
                        <span>📅 Total: {matrix.dates.length} days</span>
                        <span>✓ Conducted: {matrix.dates.filter(d => d.status !== 'Cancelled').length}</span>
                        <span>✕ Cancelled: {matrix.dates.filter(d => d.status === 'Cancelled').length}</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
