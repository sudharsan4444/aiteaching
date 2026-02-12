import React from 'react';
import { mockGrades } from '../mockData';

const StudentResults = ({ user }) => {
    // Get this student's grades
    const studentGrades = mockGrades.filter(g => g.studentId === user._id);

    // Calculate overall GPA
    const gpa = studentGrades.length > 0
        ? (studentGrades.reduce((sum, g) => sum + g.percentage, 0) / studentGrades.length / 100 * 4).toFixed(2)
        : '0.00';

    const getGradeColor = (grade) => {
        if (grade.startsWith('A')) return 'bg-emerald-100 text-emerald-700';
        if (grade.startsWith('B')) return 'bg-blue-100 text-blue-700';
        if (grade.startsWith('C')) return 'bg-amber-100 text-amber-700';
        return 'bg-slate-100 text-slate-700';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Academic Results</h1>
                <p className="text-slate-500">View your grades and performance across all subjects</p>
            </div>

            {/* Overall Stats */}
            <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                    <p className="text-indigo-100 text-sm font-semibold mb-2">Overall GPA</p>
                    <p className="text-4xl font-black">{gpa}</p>
                    <p className="text-indigo-200 text-xs mt-2">Out of 4.0</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-slate-400 text-xs font-bold uppercase mb-2">Total Subjects</p>
                    <p className="text-3xl font-black text-slate-800">{user.subjects?.length || 0}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-slate-400 text-xs font-bold uppercase mb-2">Year</p>
                    <p className="text-3xl font-black text-slate-800">{user.year}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-slate-400 text-xs font-bold uppercase mb-2">Department</p>
                    <p className="text-lg font-bold text-slate-800">{user.department}</p>
                </div>
            </div>

            {/* Grades Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="font-bold text-slate-800 text-xl">Subject Grades</h2>
                    <p className="text-sm text-slate-500">Fall 2024 Semester</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Subject
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Grade
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Percentage
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Semester
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Performance
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {studentGrades.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        No grades available yet
                                    </td>
                                </tr>
                            ) : (
                                studentGrades.map((grade, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800">{grade.subject}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(grade.grade)}`}>
                                                {grade.grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-full ${grade.percentage >= 90 ? 'bg-emerald-500' :
                                                                grade.percentage >= 80 ? 'bg-blue-500' :
                                                                    grade.percentage >= 70 ? 'bg-amber-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${grade.percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 min-w-[3rem]">
                                                    {grade.percentage}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {grade.semester}
                                        </td>
                                        <td className="px-6 py-4">
                                            {grade.percentage >= 90 ? (
                                                <span className="text-emerald-600 font-semibold text-sm">Excellent</span>
                                            ) : grade.percentage >= 80 ? (
                                                <span className="text-blue-600 font-semibold text-sm">Good</span>
                                            ) : grade.percentage >= 70 ? (
                                                <span className="text-amber-600 font-semibold text-sm">Average</span>
                                            ) : (
                                                <span className="text-red-600 font-semibold text-sm">Needs Improvement</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                    <i className="fas fa-lightbulb text-amber-500 mr-2"></i>
                    Performance Insights
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Strongest Subject</p>
                        <p className="text-lg font-bold text-emerald-600">
                            {studentGrades.length > 0
                                ? studentGrades.reduce((max, g) => g.percentage > max.percentage ? g : max).subject
                                : 'N/A'}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Focus Area</p>
                        <p className="text-lg font-bold text-amber-600">
                            {studentGrades.length > 0
                                ? studentGrades.reduce((min, g) => g.percentage < min.percentage ? g : min).subject
                                : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentResults;
