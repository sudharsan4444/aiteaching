
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import MaterialUpload from './MaterialUpload';

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    department: '',
    year: '',
    subjects: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...newUser,
        year: newUser.role === 'STUDENT' ? parseInt(newUser.year) : undefined,
        subjects: newUser.subjects.split(',').map(s => s.trim()).filter(s => s)
      };
      await api.post('/admin/create-user', data);
      alert('User created successfully');
      setShowAddUser(false);
      setNewUser({ name: '', email: '', password: '', role: 'STUDENT', department: '', year: '', subjects: '' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating user');
    }
  };

  const allTeachers = users.filter(u => u.role === 'TEACHER');
  const allStudents = users.filter(u => u.role === 'STUDENT');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
    { id: 'staff', label: 'Staff Management', icon: 'fas fa-user-tie' },
    { id: 'students', label: 'Students', icon: 'fas fa-user-graduate' },
    { id: 'materials', label: 'Upload Materials', icon: 'fas fa-upload' },
  ];

  if (loading) return <div className="p-8 text-center">Loading administrative data...</div>;

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

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
              <p className="text-indigo-100 text-xs font-bold uppercase mb-2">Total Users</p>
              <p className="text-4xl font-black">{users.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-400 text-xs font-bold uppercase mb-2">Teachers</p>
              <p className="text-3xl font-black text-indigo-600">{allTeachers.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-400 text-xs font-bold uppercase mb-2">Students</p>
              <p className="text-3xl font-black text-emerald-500">{allStudents.length}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl text-white">
            <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => { setShowAddUser(true); setActiveTab('staff'); }}
                className="bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-all text-left"
              >
                <i className="fas fa-user-plus text-indigo-400 text-xl mb-2"></i>
                <p className="font-bold">Add New User</p>
                <p className="text-sm text-slate-400">Create teacher or student accounts</p>
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className="bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-all text-left"
              >
                <i className="fas fa-file-upload text-emerald-400 text-xl mb-2"></i>
                <p className="font-bold">Upload Material</p>
                <p className="text-sm text-slate-400">Add learning resources globally</p>
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
            <button
              onClick={() => { setShowAddUser(true); setNewUser({ ...newUser, role: 'TEACHER' }); }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              <i className="fas fa-plus mr-2"></i>Add Teacher
            </button>
          </div>

          {showAddUser && (
            <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-800">Create New {newUser.role}</h3>
              <form onSubmit={handleAddUser} className="grid md:grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name" required className="p-3 border rounded-xl" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                <input type="email" placeholder="Email Address" required className="p-3 border rounded-xl" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                <input type="password" placeholder="Password" required className="p-3 border rounded-xl" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                <select className="p-3 border rounded-xl" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <input type="text" placeholder="Department (e.g. Computer Science)" className="p-3 border rounded-xl" value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })} />
                {newUser.role === 'STUDENT' && (
                  <input type="number" placeholder="Year (e.g. 2026)" className="p-3 border rounded-xl" value={newUser.year} onChange={(e) => setNewUser({ ...newUser, year: e.target.value })} />
                )}
                <input type="text" placeholder="Subjects (comma separated)" className="p-3 border rounded-xl" value={newUser.subjects} onChange={(e) => setNewUser({ ...newUser, subjects: e.target.value })} />
                <div className="md:col-span-2 flex space-x-2">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold">Create User</button>
                  <button type="button" onClick={() => setShowAddUser(false)} className="px-6 py-3 border rounded-xl text-slate-500">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {allTeachers.map(teacher => (
              <div key={teacher._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                        {teacher.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{teacher.name}</h3>
                        <p className="text-indigo-100 text-sm">{teacher.email}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteUser(teacher._id)} className="text-white/70 hover:text-white"><i className="fas fa-trash"></i></button>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Department</span>
                    <span className="font-semibold text-slate-800">{teacher.department || 'N/A'}</span>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-2">Subjects</p>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects?.map((s, i) => (
                        <span key={i} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-semibold">{s}</span>
                      ))}
                    </div>
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">All Students</h1>
              <p className="text-slate-500">View and manage all student accounts</p>
            </div>
            <button
              onClick={() => { setShowAddUser(true); setNewUser({ ...newUser, role: 'STUDENT' }); }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              <i className="fas fa-plus mr-2"></i>Add Student
            </button>
          </div>

          {showAddUser && (
            <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-800">Create New Student</h3>
              <form onSubmit={handleAddUser} className="grid md:grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name" required className="p-3 border rounded-xl" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                <input type="email" placeholder="Email Address" required className="p-3 border rounded-xl" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                <input type="password" placeholder="Password" required className="p-3 border rounded-xl" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                <input type="text" placeholder="Department" className="p-3 border rounded-xl" value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })} />
                <input type="number" placeholder="Year (e.g. 2026)" className="p-3 border rounded-xl" value={newUser.year} onChange={(e) => setNewUser({ ...newUser, year: e.target.value })} />
                <input type="text" placeholder="Subjects (comma separated)" className="p-3 border rounded-xl" value={newUser.subjects} onChange={(e) => setNewUser({ ...newUser, subjects: e.target.value })} />
                <div className="md:col-span-2 flex space-x-2">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold">Create Student</button>
                  <button type="button" onClick={() => setShowAddUser(false)} className="px-6 py-3 border rounded-xl text-slate-500">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allStudents.map(student => (
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
                    <td className="px-6 py-4 font-mono text-indigo-600 font-bold">{student.rollNumber || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{student.department || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDeleteUser(student._id)} className="text-red-600 text-sm font-semibold hover:underline">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Materials Tab */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <MaterialUpload user={user} />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
