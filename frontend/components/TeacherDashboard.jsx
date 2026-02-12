
import React, { useState } from 'react';
import { generateQuestions } from '../geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import SubmissionReview from './SubmissionReview';
import TeacherStudents from './TeacherStudents';
import MaterialUpload from './MaterialUpload';

const TeacherDashboard = ({ user, assessments, submissions, onAddAssessment }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [qCount, setQCount] = useState(5);
  const [showForm, setShowForm] = useState(false);
  const [reviewingAssessment, setReviewingAssessment] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const qs = await generateQuestions(topic, qCount, difficulty);
      const newAssessment = {
        title: `${topic} - ${difficulty} Quiz`,
        topic: topic,
        questions: qs,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      onAddAssessment(newAssessment);
      setShowForm(false);
      setTopic('');
    } catch (error) {
      console.error(error);
      alert('Failed to generate assessment. Please check your API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const averageScoresByAssessment = assessments.map(a => {
    const assessmentSubmissions = submissions.filter(s => s.assessmentId === a._id);
    const avg = assessmentSubmissions.length > 0
      ? assessmentSubmissions.reduce((sum, s) => sum + s.score, 0) / assessmentSubmissions.length
      : 0;
    return { name: a.title.slice(0, 15) + '...', score: Math.round(avg * 10) / 10 };
  });

  if (reviewingAssessment) {
    return (
      <SubmissionReview
        assessment={reviewingAssessment}
        submissions={submissions}
        onBack={() => setReviewingAssessment(null)}
      />
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
    { id: 'students', label: 'My Students', icon: 'fas fa-users' },
    { id: 'materials', label: 'Materials', icon: 'fas fa-upload' },
    { id: 'profile', label: 'My Profile', icon: 'fas fa-user' },
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

      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Teacher Dashboard</h1>
              <p className="text-slate-500">Create assessments and monitor student progress</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
            >
              <i className="fas fa-plus"></i>
              <span>Create AI Assessment</span>
            </button>
          </div>

          {showForm && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">AI Assessment Generator</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleGenerate} className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Topic / Subject</label>
                  <input
                    type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Photosynthesis, Ancient Rome, Calculus" required
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Difficulty Level</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Number of Questions</label>
                  <input type="number" min="1" max="15" value={qCount} onChange={(e) => setQCount(parseInt(e.target.value))}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="flex items-end">
                  <button type="submit" disabled={isGenerating}
                    className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 transition-all">
                    {isGenerating ? (<><i className="fas fa-spinner fa-spin mr-2"></i>AI is crafting questions...</>) : 'Generate Now'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-slate-500 text-sm font-semibold mb-4 uppercase tracking-wider">Total Assessments</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-slate-800">{assessments.length}</span>
                <span className="text-emerald-500 text-sm font-medium"><i className="fas fa-arrow-up mr-1"></i>12%</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-slate-500 text-sm font-semibold mb-4 uppercase tracking-wider">Total Submissions</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-slate-800">{submissions.length}</span>
                <span className="text-indigo-500 text-sm font-medium">Waitlist active</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-slate-500 text-sm font-semibold mb-4 uppercase tracking-wider">Class Average</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-slate-800">
                  {submissions.length > 0 ? (submissions.reduce((s, b) => s + b.score, 0) / submissions.length).toFixed(1) : 'N/A'}
                </span>
                <span className="text-slate-400 text-sm font-medium">pts</span>
              </div>
            </div>
          </div>

          {/* Charts & List */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Performance Tracking</h3>
              <div className="h-64 w-full">
                {averageScoresByAssessment.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={averageScoresByAssessment}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                        {averageScoresByAssessment.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#10b981'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <i className="fas fa-chart-bar text-4xl mb-4"></i>
                    <p>No data to visualize yet</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Recent Assessments</h3>
              <div className="space-y-4">
                {assessments.length === 0 ? (
                  <p className="text-center py-12 text-slate-400">No assessments created yet</p>
                ) : (
                  assessments.map(a => (
                    <div key={a._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-800">{a.title}</h4>
                        <p className="text-xs text-slate-500">{a.questions.length} Questions • Created {new Date(a.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-white text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                          {submissions.filter(s => s.assessmentId === a._id).length} Subs
                        </span>
                        <button onClick={() => setReviewingAssessment(a)} className="text-slate-400 hover:text-emerald-600 p-2" title="Review Submissions">
                          <i className="fas fa-eye"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'students' && <TeacherStudents user={user} />}
      {activeTab === 'materials' && <MaterialUpload user={user} />}

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white">
              <div className="flex items-center space-x-5">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                  {user.name?.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-indigo-100">{user.email}</p>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm mt-2 inline-block">{user.role}</span>
                </div>
              </div>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Department</p>
                  <p className="font-bold text-slate-800 text-lg">{user.department || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Students Assigned</p>
                  <p className="font-bold text-slate-800 text-lg">{user.assignedStudents?.length || 0}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Subjects Teaching</p>
                <div className="flex flex-wrap gap-2">
                  {(user.subjects || []).map((subject, idx) => (
                    <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-sm font-semibold">{subject}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
