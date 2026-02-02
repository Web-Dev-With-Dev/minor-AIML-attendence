import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [attendanceData, setAttendanceData] = useState(null);
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchAttendanceData();
    }, []);

    useEffect(() => {
        if (attendanceData?.attendanceData) {
            filterRecords();
        }
    }, [dateRange, attendanceData]);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/students/my-attendance');
            setAttendanceData(response.data);
            setFilteredRecords(response.data.attendanceData);
            setError('');
        } catch (err) {
            setError('Failed to load attendance data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterRecords = () => {
        if (!attendanceData?.attendanceData) return;

        let filtered = attendanceData.attendanceData;

        if (dateRange.start && dateRange.end) {
            filtered = filtered.filter(record => {
                const recordDate = new Date(record.date);
                const startDate = new Date(dateRange.start);
                const endDate = new Date(dateRange.end);
                return recordDate >= startDate && recordDate <= endDate;
            });
        }

        setFilteredRecords(filtered);
    };

    const resetFilter = () => {
        setDateRange({ start: '', end: '' });
        setFilteredRecords(attendanceData?.attendanceData || []);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const downloadCSV = () => {
        const { student, statistics, attendanceData: records } = attendanceData;

        let csv = 'Student Attendance Report\n\n';
        csv += `Name,${student.name}\n`;
        csv += `Enrollment No,${student.enrollmentNo}\n`;
        csv += `Department,${student.department}\n`;
        csv += `Attendance Percentage,${statistics.attendancePercentage}%\n`;
        csv += `Total Lectures,${statistics.totalLectures}\n`;
        csv += `Present,${statistics.presentCount}\n`;
        csv += `Absent,${statistics.absentCount}\n`;
        csv += `Cancelled,${statistics.cancelledCount}\n\n`;
        csv += 'Date,Day,Status\n';

        records.forEach(record => {
            csv += `${record.date},${record.day},${record.status}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${student.enrollmentNo}.csv`;
        a.click();
    };

    const downloadPDF = () => {
        const { student, statistics, attendanceData: records } = attendanceData;

        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
            <html>
            <head>
                <title>Attendance Report - ${student.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    h1 { color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
                    .info { margin: 20px 0; }
                    .info div { margin: 8px 0; }
                    .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 20px 0; }
                    .stat-box { border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #3b82f6; color: white; }
                    .present { color: green; font-weight: bold; }
                    .absent { color: red; font-weight: bold; }
                    .cancelled { color: orange; font-weight: bold; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <h1>Student Attendance Report</h1>
                <div class="info">
                    <div><strong>Name:</strong> ${student.name}</div>
                    <div><strong>Enrollment Number:</strong> ${student.enrollmentNo}</div>
                    <div><strong>Department:</strong> ${student.department}</div>
                    <div><strong>Report Generated:</strong> ${new Date().toLocaleDateString()}</div>
                </div>
                <div class="stats">
                    <div class="stat-box"><strong>Attendance:</strong> ${statistics.attendancePercentage}%</div>
                    <div class="stat-box"><strong>Total Lectures:</strong> ${statistics.totalLectures}</div>
                    <div class="stat-box"><strong>Present:</strong> ${statistics.presentCount}</div>
                    <div class="stat-box"><strong>Absent:</strong> ${statistics.absentCount}</div>
                </div>
                <table>
                    <thead>
                        <tr><th>Date</th><th>Day</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        ${records.map(r => `
                            <tr>
                                <td>${r.date}</td>
                                <td>${r.day}</td>
                                <td class="${r.status.toLowerCase()}">${r.status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading your attendance data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                    <div className="text-center">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
                        <p className="text-red-600 mb-6">{error}</p>
                        <button
                            onClick={fetchAttendanceData}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold w-full"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { student, statistics, attendanceData: records } = attendanceData || {};
    const attendanceStatus = getAttendanceStatus(statistics?.attendancePercentage || 0);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Portal</h1>
                            <p className="text-sm text-gray-600 mt-1">Attendance Management System</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold text-sm w-full sm:w-auto"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Name</p>
                            <p className="text-base sm:text-lg font-semibold text-gray-900 mt-1">{student?.name}</p>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Enrollment No.</p>
                            <p className="text-base sm:text-lg font-semibold text-gray-900 mt-1">{student?.enrollmentNo}</p>
                        </div>
                        <div className="border-l-4 border-indigo-500 pl-4 sm:col-span-2 lg:col-span-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Minor/Hons. in</p>
                            <p className="text-base sm:text-lg font-semibold text-gray-900 mt-1">{student?.department}</p>
                        </div>
                    </div>
                </div>

                <SmartAlerts statistics={statistics} />

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
                    <div className={`col-span-2 lg:col-span-1 ${attendanceStatus.bg} rounded-lg shadow-sm border-2 border-gray-200 p-4 sm:p-6`}>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wide">Attendance</p>
                        </div>
                        <p className={`text-3xl sm:text-4xl font-bold ${attendanceStatus.color} mb-1`}>
                            {statistics?.attendancePercentage}%
                        </p>
                        <p className={`text-xs font-semibold ${attendanceStatus.color}`}>{attendanceStatus.label}</p>
                    </div>
                    <StatCard label="Total Lectures" value={statistics?.totalLectures} color="blue" />
                    <StatCard label="Present" value={statistics?.presentCount} color="green" />
                    <StatCard label="Absent" value={statistics?.absentCount} color="red" />
                    <StatCard label="Cancelled" value={statistics?.cancelledCount} color="yellow" />
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Report</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={downloadCSV}
                            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
                        >Download as CSV</button>
                        <button
                            onClick={downloadPDF}
                            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2"
                        >Download as PDF</button>
                    </div>
                </div>

                <RecentAttendance records={records} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Attendance Distribution</h3>
                        <AttendanceDonutChart
                            present={statistics?.presentCount || 0}
                            absent={statistics?.absentCount || 0}
                            cancelled={statistics?.cancelledCount || 0}
                        />
                    </div>

                    <MonthlyTrendChart records={records} />
                </div>

                <AttendanceCalendar
                    records={records}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    setSelectedMonth={setSelectedMonth}
                    setSelectedYear={setSelectedYear}
                />

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Date Range</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={resetFilter}
                                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition font-semibold w-full sm:w-auto"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                    {(dateRange.start || dateRange.end) && (
                        <p className="mt-3 text-sm text-gray-600">
                            Showing {filteredRecords.length} of {records?.length} records
                        </p>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance History</h3>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="inline-block min-w-full align-middle">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Day
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredRecords?.slice().reverse().map((record, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                                {new Date(record.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                                                {record.day}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <StatusBadge status={record.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {filteredRecords?.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No attendance records found</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const getAttendanceStatus = (percentage) => {
    if (percentage >= 75) return { color: 'text-green-600', bg: 'bg-green-50', label: 'Good Standing' };
    if (percentage >= 60) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Warning' };
    return { color: 'text-red-600', bg: 'bg-red-50', label: 'Critical' };
};

const SmartAlerts = ({ statistics }) => {
    const percentage = statistics?.attendancePercentage || 0;

    if (percentage >= 75) {
        return (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
                <div className="flex items-start gap-3">
                    <span className="text-2xl"></span>
                    <div>
                        <h3 className="text-sm font-semibold text-green-900">Excellent Attendance!</h3>
                        <p className="text-sm text-green-700 mt-1">
                            You're doing great! Your attendance is at {percentage}%, which is above the required 75%. Keep it up!
                        </p>
                    </div>
                </div>
            </div>
        );
    } else if (percentage >= 60) {
        return (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-r-lg">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <h3 className="text-sm font-semibold text-yellow-900">Attendance Warning</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                            Your attendance is at {percentage}%. You need to attend more classes to meet the requirement.
                        </p>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">🚨</span>
                    <div>
                        <h3 className="text-sm font-semibold text-red-900">Critical: Low Attendance</h3>
                        <p className="text-sm text-red-700 mt-1">
                            Your attendance is critically low at {percentage}%. Please attend all upcoming classes!
                        </p>
                    </div>
                </div>
            </div>
        );
    }
};

const AttendanceCalculator = ({ statistics }) => {
    const currentPercentage = statistics?.attendancePercentage || 0;
    const totalLectures = statistics?.totalLectures || 0;
    const presentCount = statistics?.presentCount || 0;

    const classesNeeded = Math.max(0, Math.ceil((0.75 * totalLectures - presentCount) / 0.25));

    const classesCanMiss = currentPercentage >= 75
        ? Math.floor((presentCount - 0.75 * totalLectures) / 0.75)
        : 0;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <span className="text-3xl">🎯</span>
                        <div>
                            <p className="text-sm font-semibold text-blue-900">To Reach 75%</p>
                            <p className="text-2xl font-bold text-blue-600 mt-2">
                                {currentPercentage >= 75 ? '✓ Already There!' : `${classesNeeded} classes`}
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                                {currentPercentage >= 75
                                    ? 'You meet the requirement!'
                                    : 'Need to attend consecutively'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <span className="text-3xl">💡</span>
                        <div>
                            <p className="text-sm font-semibold text-green-900">Classes You Can Miss</p>
                            <p className="text-2xl font-bold text-green-600 mt-2">
                                {classesCanMiss > 0 ? `${classesCanMiss} classes` : 'None'}
                            </p>
                            <p className="text-xs text-green-700 mt-1">
                                {classesCanMiss > 0
                                    ? 'While staying above 75%'
                                    : 'Attend all classes'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RecentAttendance = ({ records }) => {
    const recentRecords = records?.slice(-7).reverse() || [];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance (Last 7 Days)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
                {recentRecords.map((record, index) => (
                    <div
                        key={index}
                        className={`p-3 rounded-lg border-2 text-center ${record.status === 'Present'
                            ? 'bg-green-50 border-green-300'
                            : record.status === 'Cancelled'
                                ? 'bg-yellow-50 border-yellow-300'
                                : 'bg-red-50 border-red-300'
                            }`}
                    >
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                            {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-2xl mb-1">
                            {record.status === 'Present' ? '✓' : record.status === 'Cancelled' ? '🚫' : '✗'}
                        </p>
                        <p className={`text-xs font-bold ${record.status === 'Present'
                            ? 'text-green-700'
                            : record.status === 'Cancelled'
                                ? 'text-yellow-700'
                                : 'text-red-700'
                            }`}>
                            {record.status}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MonthlyTrendChart = ({ records }) => {
    const monthlyData = {};
    records?.forEach(record => {
        if (record.lectureStatus === 'Cancelled') return;

        const month = record.date.substring(0, 7);
        if (!monthlyData[month]) {
            monthlyData[month] = { present: 0, total: 0 };
        }
        monthlyData[month].total++;
        if (record.status === 'Present') monthlyData[month].present++;
    });

    const months = Object.keys(monthlyData).sort();
    const percentages = months.map(m => ((monthlyData[m].present / monthlyData[m].total) * 100).toFixed(1));
    const maxPercentage = Math.max(...percentages, 100);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Attendance Trend</h3>
            {months.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No data available</div>
            ) : (
                <div className="space-y-4">
                    {months.map((month, index) => {
                        const percentage = percentages[index];
                        const monthLabel = new Date(month + '-01').toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                        });

                        return (
                            <div key={month}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">{monthLabel}</span>
                                    <span className={`text-sm font-bold ${percentage >= 75 ? 'text-green-600' :
                                        percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                        {percentage}%
                                    </span>
                                </div>
                                <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-500 ${percentage >= 75 ? 'bg-green-500' :
                                            percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                    <div className="absolute top-0 left-3/4 w-0.5 h-3 bg-blue-600" title="75% requirement" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {monthlyData[month].present} / {monthlyData[month].total} classes
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const AttendanceCalendar = ({ records, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear }) => {
    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
        return new Date(year, month, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    const getDateStatus = (day) => {
        if (!day) return null;
        const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const record = records?.find(r => r.date === dateStr);
        return record?.status;
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold text-gray-900">Attendance Calendar</h3>
                <div className="flex gap-2">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        {monthNames.map((name, index) => (
                            <option key={index} value={index}>{name}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        {[2024, 2025, 2026].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                        {day}
                    </div>
                ))}
                {calendarDays.map((day, index) => {
                    const status = getDateStatus(day);
                    return (
                        <div
                            key={index}
                            className={`aspect-square flex items-center justify-center text-xs sm:text-sm font-medium rounded-lg border ${!day
                                ? 'bg-gray-50 border-gray-100'
                                : status === 'Present'
                                    ? 'bg-green-100 border-green-300 text-green-800'
                                    : status === 'Absent'
                                        ? 'bg-red-100 border-red-300 text-red-800'
                                        : status === 'Cancelled'
                                            ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                                            : 'bg-white border-gray-200 text-gray-700'
                                }`}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span className="text-xs text-gray-600">Present</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                    <span className="text-xs text-gray-600">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                    <span className="text-xs text-gray-600">Cancelled</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                    <span className="text-xs text-gray-600">No Class</span>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, color }) => {
    const colors = {
        blue: 'border-blue-200 bg-blue-50',
        green: 'border-green-200 bg-green-50',
        red: 'border-red-200 bg-red-50',
        yellow: 'border-yellow-200 bg-yellow-50'
    };

    return (
        <div className={`${colors[color]} rounded-lg shadow-sm border-2 p-4 sm:p-6`}>
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wide truncate pr-2">
                    {label}
                </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value || 0}</p>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        Present: 'bg-green-100 text-green-800 border-green-200',
        Absent: 'bg-red-100 text-red-800 border-red-200',
        Cancelled: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };

    return (
        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

const AttendanceDonutChart = ({ present, absent, cancelled }) => {
    const total = present + absent + cancelled;

    if (total === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-400">No data available</p>
            </div>
        );
    }

    const presentPercent = ((present / total) * 100).toFixed(1);
    const absentPercent = ((absent / total) * 100).toFixed(1);
    const cancelledPercent = ((cancelled / total) * 100).toFixed(1);

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mb-8">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#f3f4f6" strokeWidth="28" />
                    {present > 0 && (
                        <circle
                            cx="100" cy="100" r="70" fill="none" stroke="#10b981" strokeWidth="28"
                            strokeDasharray={`${(present / total) * 440} 440`}
                            strokeDashoffset="0" strokeLinecap="round"
                        />
                    )}
                    {absent > 0 && (
                        <circle
                            cx="100" cy="100" r="70" fill="none" stroke="#ef4444" strokeWidth="28"
                            strokeDasharray={`${(absent / total) * 440} 440`}
                            strokeDashoffset={`-${(present / total) * 440}`}
                            strokeLinecap="round"
                        />
                    )}
                    {cancelled > 0 && (
                        <circle
                            cx="100" cy="100" r="70" fill="none" stroke="#f59e0b" strokeWidth="28"
                            strokeDasharray={`${(cancelled / total) * 440} 440`}
                            strokeDashoffset={`-${((present + absent) / total) * 440}`}
                            strokeLinecap="round"
                        />
                    )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-4xl font-bold text-gray-900">{total}</p>
                    <p className="text-sm text-gray-500">Total</p>
                </div>
            </div>

            <div className="w-full space-y-3">
                <LegendItem color="bg-green-500" label="Present" value={present} percent={presentPercent} />
                <LegendItem color="bg-red-500" label="Absent" value={absent} percent={absentPercent} />
                <LegendItem color="bg-yellow-500" label="Cancelled" value={cancelled} percent={cancelledPercent} />
            </div>
        </div>
    );
};

const LegendItem = ({ color, label, value, percent }) => (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
        <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded ${color}`}></div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="text-right">
            <span className="text-sm font-bold text-gray-900">{value}</span>
            <span className="text-xs text-gray-500 ml-2">({percent}%)</span>
        </div>
    </div>
);

export default StudentDashboard;
