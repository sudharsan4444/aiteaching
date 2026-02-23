import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TeacherStudents = ({ user }) => {
    const [assignedStudents, setAssignedStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newStudent, setNewStudent] = useState({
        name: '',
        email: '',
        password: '',
        department: user.department || '',
        year: ''
    });

    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/users');
            // Filter students assigned to this teacher or in teacher's department? 
            // The prompt says "manage their respective students".
            // Backend already auto-assigns teacher if teacher creates student.
            setAssignedStudents(res.data.filter(u =>
                u.role === 'STUDENT' &&
                (u.assignedTeacher === user._id || u.assignedTeacher === user.id)
            ));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/create-user', {
                ...newStudent,
                role: 'STUDENT',
                year: parseInt(newStudent.year)
            });
            alert('Student added successfully');
            setShowAddForm(false);
            setNewStudent({ name: '', email: '', password: '', department: user.department || '', year: '' });
            fetchStudents();
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding student');
        }
    };

    const filteredStudents = assignedStudents.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.rollNumber && s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) return <div className="p-8 text-center text-slate-500">Loading your students...</div>;

    const StudentProfile = ({ student }) => {
        // Since we don't have mock grades anymore, we just show profile info
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedStudent(null)}>
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-2xl">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                                    {student.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{student.name}</h2>
                                    <p className="text-indigo-100">{student.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedStudent(null)} className="text-white/80 hover:text-white">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-indigo-50 rounded-xl">
                            <p className="text-xl font-bold text-indigo-600">{student.rollNumber || 'N/A'}</p>
                            <p className="text-xs text-slate-600 font-semibold uppercase">Roll No</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-xl">
                            <p className="text-xl font-bold text-purple-600">Year {student.year || 'N/A'}</p>
                            <p className="text-xs text-slate-600 font-semibold uppercase">Batch</p>
                        </div>
                        <div className="text-center p-4 bg-emerald-50 rounded-xl">
                            <p className="text-xl font-bold text-emerald-600">{student.gpa || '0.0'}</p>
                            <p className="text-xs text-slate-600 font-semibold uppercase">GPA</p>
                        </div>
                    </div>

                    <div className="px-6 pb-6 space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl">
                            <p className="text-sm font-semibold text-slate-700 mb-1 italic text-xs uppercase">Department</p>
                            <p className="font-bold text-slate-900">{student.department || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-700 mb-2">Academic Progress</p>
                            <p className="text-slate-500 text-sm">Real-time assessment data will appear here as they complete quizzes.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Student Directory</h1>
                    <p className="text-slate-500">Managing students in {user.department}</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                >
                    <i className={`fas ${showAddForm ? 'fa-times' : 'fa-user-plus'}`}></i>
                    <span>{showAddForm ? 'Close Form' : 'Add New Student'}</span>
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-sm animate-in slide-in-from-top-4 duration-300">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Direct Student Registration</h3>
                    <form onSubmit={handleAddStudent} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                            <input type="text" required className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} placeholder="John Doe" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                            <input type="email" required className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} placeholder="john@example.com" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Temp Password</label>
                            <input type="password" required className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={newStudent.password} onChange={e => setNewStudent({ ...newStudent, password: e.target.value })} placeholder="••••••••" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
                            <input type="text" disabled className="w-full p-3 bg-slate-200 border rounded-xl text-slate-500" value={newStudent.department} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Year / Batch</label>
                            <input type="number" required className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={newStudent.year} onChange={e => setNewStudent({ ...newStudent, year: e.target.value })} placeholder="e.g. 2026" />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">
                                Register Student
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search Bar */}
            <div className="relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                    type="text"
                    placeholder="Search by name or roll number (e.g. 2026CS101)..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Students Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400">
                        <i className="fas fa-users-slash text-4xl mb-4"></i>
                        <p>No students found matching your criteria.</p>
                    </div>
                ) : (
                    filteredStudents.map(student => (
                        <div
                            key={student._id}
                            onClick={() => setSelectedStudent(student)}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-300 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:scale-150"></div>

                            <div className="relative flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg rotate-3 group-hover:rotate-0 transition-all">
                                    {student.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-50 px-2 py-1 rounded">
                                    {student.rollNumber || 'NO ROLL'}
                                </span>
                            </div>

                            <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{student.name}</h3>
                            <p className="text-sm text-slate-500 mb-4">{student.email}</p>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-slate-50 p-2 rounded-lg text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Year</p>
                                    <p className="font-bold text-slate-700">{student.year || '-'}</p>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-lg text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">GPA</p>
                                    <p className="font-bold text-indigo-600 font-mono">{student.gpa || '0.0'}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedStudent && <StudentProfile student={selectedStudent} />}
        </div>
    );
};

export default TeacherStudents;
