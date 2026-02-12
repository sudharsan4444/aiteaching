
import React, { useState } from 'react';
import { mockStudents, mockMaterials } from '../mockData';

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Simulated staff data combining teachers and students from mock
  const allTeachers = [
    { id: 'teacher-001', name: 'Dr. Sarah Johnson', email: 'teacher@test.com', role: 'TEACHER', department: 'Computer Science', status: 'Active', subjects: ['Data Structures', 'Algorithms', 'Web Development'] },
    { id: 'teacher-002', name: 'Prof. Michael Chen', email: 'michael@test.com', role: 'TEACHER', department: 'Mathematics', status: 'Active', subjects: ['Calculus', 'Linear Algebra', 'Statistics'] },
  ];

  const allUsers = [
    ...allTeachers,
    ...mockStudents.map(s => ({ ...s, id: s._id, role: 'STUDENT', status: 'Active' }))
  ];

  const departments = ['Computer Science', 'Mathematics'];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
    { id: 'staff', label: 'Staff Management', icon: 'fas fa-user-tie' },
    { id: 'students', label: 'Students', icon: 'fas fa-user-graduate' },
    { id: 'materials', label: 'All Materials', icon: 'fas fa-book' },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">System Administration</h1>
            <p className="text-slate-500">Manage user accounts and global system configurations</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
              <p className="text-indigo-100 text-xs font-bold uppercase mb-2">Total Users</p>
              <p className="text-4xl font-black">{allUsers.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-400 text-xs font-bold uppercase mb-2">Teachers</p>
              <p className="text-3xl font-black text-indigo-600">{allTeachers.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-400 text-xs font-bold uppercase mb-2">Students</p>
              <p className="text-3xl font-black text-emerald-500">{mockStudents.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-400 text-xs font-bold uppercase mb-2">Materials</p>
              <p className="text-3xl font-black text-amber-500">{mockMaterials.length}</p>
            </div>
          </div>

          {/* Department Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            {departments.map(dept => {
              const deptTeachers = allTeachers.filter(t => t.department === dept);
              const deptStudents = mockStudents.filter(s => s.department === dept);
              return (
                <div key={dept} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <i className="fas fa-building text-indigo-500 mr-2"></i>
                    {dept}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Teachers</span>
                      <span className="font-bold text-indigo-600">{deptTeachers.length}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Students</span>
                      <span className="font-bold text-emerald-600">{deptStudents.length}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Avg GPA</span>
                      <span className="font-bold text-purple-600">
                        {deptStudents.length > 0
                          ? (deptStudents.reduce((sum, s) => sum + s.gpa, 0) / deptStudents.length).toFixed(2)
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl text-white">
            <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <button className="bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-all text-left">
                <i className="fas fa-user-plus text-indigo-400 text-xl mb-2"></i>
                <p className="font-bold">Add New User</p>
                <p className="text-sm text-slate-400">Create teacher or student accounts</p>
              </button>
              <button className="bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-all text-left">
                <i className="fas fa-cog text-emerald-400 text-xl mb-2"></i>
                <p className="font-bold">System Settings</p>
                <p className="text-sm text-slate-400">Configure API keys & database</p>
              </button>
              <button className="bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-all text-left">
                <i className="fas fa-chart-line text-amber-400 text-xl mb-2"></i>
                <p className="font-bold">View Reports</p>
                <p className="text-sm text-slate-400">Analytics and system health</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Management Tab */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Staff Management</h1>
              <p className="text-slate-500">Manage teaching staff across departments</p>
            </div>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
              <i className="fas fa-plus mr-2"></i>Add Teacher
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {allTeachers.map(teacher => (
              <div key={teacher.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                      {teacher.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{teacher.name}</h3>
                      <p className="text-indigo-100 text-sm">{teacher.email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Department</span>
                    <span className="font-semibold text-slate-800">{teacher.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Students</span>
                    <span className="font-semibold text-indigo-600">
                      {mockStudents.filter(s => s.assignedTeacher === teacher.id).length}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-2">Subjects</p>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((s, i) => (
                        <span key={i} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-semibold">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between">
                    <span className="flex items-center text-sm"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>Active</span>
                    <button className="text-indigo-600 text-sm font-semibold hover:underline">View Profile</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">All Students</h1>
            <p className="text-slate-500">View and manage all student accounts</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Year</th>
                  <th className="px-6 py-4">GPA</th>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockStudents.map(student => (
                  <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{student.department}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">Year {student.year}</td>
                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">{student.gpa}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${student.overallGrade.startsWith('A') ? 'bg-emerald-100 text-emerald-700' :
                          student.overallGrade.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                        }`}>{student.overallGrade}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-indigo-600 text-sm font-semibold hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Materials Tab */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">All Learning Materials</h1>
            <p className="text-slate-500">Overview of all uploaded materials across departments</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockMaterials.map(material => (
              <div key={material._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
                <div className="h-32 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <i className={`${material.type === 'video' ? 'fas fa-play-circle text-indigo-500' : 'fas fa-file-pdf text-red-500'} text-5xl`}></i>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded">{material.subject}</span>
                    <span className="text-xs text-slate-400"><i className="fas fa-eye mr-1"></i>{material.views}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1">{material.title}</h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{material.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <span>{material.uploadedByName}</span>
                    <span>{material.department}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
