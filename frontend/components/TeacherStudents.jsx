import React from 'react';
import { mockStudents, mockGrades } from '../mockData';

const TeacherStudents = ({ user }) => {
    //  Get students assigned to this teacher
    const assignedStudents = mockStudents.filter(s =>
        user.assignedStudents?.includes(s._id)
    );

    const [selectedStudent, setSelectedStudent] = React.useState(null);

    const StudentProfile = ({ student }) => {
        const studentGrades = mockGrades.filter(g => g.studentId === student._id);
        const avgPercentage = studentGrades.length > 0
            ? (studentGrades.reduce((sum, g) => sum + g.percentage, 0) / studentGrades.length).toFixed(1)
            : 0;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedStudent(null)}>
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    {/* Header */}
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
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="text-white/80 hover:text-white"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="p-6 grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-indigo-50 rounded-xl">
                            <p className="text-2xl font-black text-indigo-600">{student.gpa}</p>
                            <p className="text-xs text-slate-600 font-semibold">GPA</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-xl">
                            <p className="text-2xl font-black text-purple-600">Year {student.year}</p>
                            <p className="text-xs text-slate-600 font-semibold">Current</p>
                        </div>
                        <div className="text-center p-4 bg-emerald-50 rounded-xl">
                            <p className="text-2xl font-black text-emerald-600">{avgPercentage}%</p>
                            <p className="text-xs text-slate-600 font-semibold">Avg Score</p>
                        </div>
                    </div>

                    {/* Department & Subjects */}
                    <div className="px-6 pb-4">
                        <div className="bg-slate-50 p-4 rounded-xl">
                            <p className="text-sm font-semibold text-slate-700 mb-2">Department</p>
                            <p className="font-bold text-slate-900">{student.department}</p>
                        </div>
                    </div>

                    <div className="px-6 pb-4">
                        <p className="text-sm font-semibold text-slate-700 mb-3">Enrolled Subjects</p>
                        <div className="flex flex-wrap gap-2">
                            {student.subjects.map((subject, idx) => (
                                <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                                    {subject}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Grades */}
                    <div className="px-6 pb-6">
                        <p className="text-sm font-semibold text-slate-700 mb-3">Subject Grades</p>
                        <div className="space-y-2">
                            {studentGrades.length === 0 ? (
                                <p className="text-slate-400 text-sm italic">No grades recorded yet</p>
                            ) : (
                                studentGrades.map((grade, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <span className="font-medium text-slate-700">{grade.subject}</span>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-24 bg-slate-200 rounded-full h-2">
                                                <div
                                                    className="bg-indigo-600 h-2 rounded-full"
                                                    style={{ width: `${grade.percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="font-bold text-indigo-600 min-w-[3rem]">{grade.grade}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">My Students</h1>
                <p className="text-slate-500">View and manage students assigned to you</p>
            </div>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                    <p className="text-indigo-100 text-sm font-semibold mb-2">Total Students</p>
                    <p className="text-4xl font-black">{assignedStudents.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-slate-400 text-xs font-bold uppercase mb-2">Avg GPA</p>
                    <p className="text-3xl font-black text-slate-800">
                        {assignedStudents.length > 0
                            ? (assignedStudents.reduce((sum, s) => sum + s.gpa, 0) / assignedStudents.length).toFixed(2)
                            : '0.00'}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-slate-400 text-xs font-bold uppercase mb-2">Excellence</p>
                    <p className="text-3xl font-black text-emerald-600">
                        {assignedStudents.filter(s => s.gpa >= 3.5).length}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-slate-400 text-xs font-bold uppercase mb-2">Department</p>
                    <p className="text-lg font-bold text-slate-800">{user.department}</p>
                </div>
            </div>

            {/* Students Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedStudents.map(student => {
                    const studentGrades = mockGrades.filter(g => g.studentId === student._id);
                    const avgPercentage = studentGrades.length > 0
                        ? (studentGrades.reduce((sum, g) => sum + g.percentage, 0) / studentGrades.length).toFixed(1)
                        : 0;

                    return (
                        <div
                            key={student._id}
                            onClick={() => setSelectedStudent(student)}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-300 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {student.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${student.overallGrade.startsWith('A') ? 'bg-emerald-100 text-emerald-700' :
                                        student.overallGrade.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                                            'bg-amber-100 text-amber-700'
                                    }`}>
                                    {student.overallGrade}
                                </span>
                            </div>

                            <h3 className="font-bold text-lg text-slate-800 mb-1">{student.name}</h3>
                            <p className="text-sm text-slate-500 mb-3">{student.email}</p>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Year:</span>
                                    <span className="font-semibold text-slate-800">{student.year}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">GPA:</span>
                                    <span className="font-semibold text-indigo-600">{student.gpa}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Avg Score:</span>
                                    <span className="font-semibold text-purple-600">{avgPercentage}%</span>
                                </div>
                            </div>

                            <button className="w-full bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-semibold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                View Full Profile
                            </button>
                        </div>
                    );
                })}
            </div>

            {selectedStudent && <StudentProfile student={selectedStudent} />}
        </div>
    );
};

export default TeacherStudents;
