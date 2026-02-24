import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import SubmissionReview from './SubmissionReview';
import TeacherStudents from './TeacherStudents';
import MaterialUpload from './MaterialUpload';

const TeacherDashboard = ({ user, assessments, submissions, onAddAssessment, onUpdateAssessment }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [qCount, setQCount] = useState('10');
  const [showForm, setShowForm] = useState(false);
  const [reviewingAssessment, setReviewingAssessment] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [resultsMaterial, setResultsMaterial] = useState(null);
  const [materialAssessments, setMaterialAssessments] = useState([]);

  const fetchMaterials = async () => {
    setLoadingMaterials(true);
    try {
      const res = await api.get('/upload');
      setMaterials(res.data);
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  useEffect(() => { fetchMaterials(); }, []);

  const handleViewMaterialResults = async (material) => {
    setResultsMaterial(material);
    try {
      const res = await api.get(`/assessments/by-material/${material._id}`);
      setMaterialAssessments(res.data);
    } catch (err) {
      console.error('Error fetching assessments for material:', err);
      setMaterialAssessments([]);
    }
    setActiveTab('results');
  };

  const handleDownloadAnswerKey = async (assessmentId, assessmentTitle) => {
    try {
      const res = await api.get(`/files/assessment/${assessmentId}/answer-key`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `answer-key-${assessmentTitle}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Answer key download failed:', err);
      alert('Failed to download answer key. Please try again.');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedMaterialId) return alert('Please select a material first.');
    const parsedCount = parseInt(qCount) || 10;
    setIsGenerating(true);
    try {
      const res = await api.post('/ai/generate-quiz', {
        materialId: selectedMaterialId,
        count: parsedCount,
        difficulty
      });

      const selectedMaterial = materials.find(m => m._id === selectedMaterialId);
      const newAssessment = {
        title: `${res.data.materialTitle} - ${difficulty} Quiz`,
        topic: res.data.materialSubject || selectedMaterial?.subject || 'General',
        questions: res.data.questions,
        materialId: selectedMaterialId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      onAddAssessment(newAssessment);
      setShowForm(false);
      setSelectedMaterialId('');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to generate assessment.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePublish = async (assessmentId, currentStatus) => {
    try {
      const res = await api.put(`/assessments/${assessmentId}/publish`, { isPublished: !currentStatus });
      // Update local assessments state
      if (onUpdateAssessment) {
        onUpdateAssessment(res.data);
      } else {
        // Fallback if prop not provided (though it should be)
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to update publication status', err);
      alert('Failed to update publication status');
    }
  };

  const handleDeleteAssessment = async (assessmentId) => {
    if (!window.confirm('Are you sure you want to delete this assessment? This will also clear all student submissions and results for this assessment. This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/assessments/${assessmentId}`);

      // Update local assessments state (Dashboard list)
      // Note: assessments prop comes from parent, so we should call a parent update if possible
      // or just reload if we don't have a direct setter. 
      // Based on handleTogglePublish calling onUpdateAssessment, we might need a way to remove.
      // Since onAddAssessment exists, maybe onRemoveAssessment?
      // Let's check available props or just reload for simplicity if state management is prop-heavy.

      // Better way: if onAddAssessment exists, maybe we can trigger a refresh via parent.
      // But for now, let's look at how onUpdateAssessment is used.

      if (onUpdateAssessment) {
        // We'll pass null or a special flag to tell parent to remove it, 
        // OR better: the parent should just re-fetch.
        // If we don't have a direct way, we can filter materialAssessments for the Results tab
        setMaterialAssessments(prev => prev.filter(a => a._id !== assessmentId));

        // For the main assessments list, we'll try to trigger a refresh
        window.location.reload();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to delete assessment', err);
      alert('Failed to delete assessment: ' + (err.response?.data?.message || err.message));
    }
  };

  const averageScoresByAssessment = assessments.map(a => {
    const subs = submissions.filter(s => s.assessmentId === a._id);
    const avg = subs.length > 0 ? subs.reduce((sum, s) => sum + s.score, 0) / subs.length : 0;
    return { name: a.title.slice(0, 15) + '...', score: Math.round(avg * 10) / 10 };
  });

  if (reviewingAssessment) {
    return (
      <SubmissionReview
        assessment={reviewingAssessment}
        submissions={submissions}
        onBack={() => setReviewingAssessment(null)}
        onUpdateAssessment={(updated) => {
          if (onUpdateAssessment) onUpdateAssessment(updated);
        }}
      />
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
    { id: 'students', label: 'My Students', icon: 'fas fa-users' },
    { id: 'materials', label: 'Materials', icon: 'fas fa-upload' },
    { id: 'results', label: 'Results', icon: 'fas fa-chart-bar' },
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

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Teacher Dashboard</h1>
              <p className="text-slate-500">Create assessments from your materials and monitor student progress</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center space-x-2"
            >
              <i className="fas fa-plus"></i>
              <span>Create AI Assessment</span>
            </button>
          </div>

          {/* Assessment Generator */}
          {showForm && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">AI Assessment Generator</h2>
                  <p className="text-slate-500 text-sm">Questions will be generated strictly from the selected material's content.</p>
                </div>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleGenerate} className="grid md:grid-cols-2 gap-6">
                {/* Material Selector */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Select Material</label>
                  {loadingMaterials ? (
                    <p className="text-slate-400 text-sm">Loading materials...</p>
                  ) : (
                    <select
                      value={selectedMaterialId}
                      onChange={(e) => setSelectedMaterialId(e.target.value)}
                      required
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="">-- Choose a material to generate questions from --</option>
                      {materials.map(m => (
                        <option key={m._id} value={m._id}>
                          {m.title} ({m.subject} • Unit {m.unit})
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-xs text-slate-400">60% MCQ + 40% Descriptive questions, strictly from the material's content.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Difficulty Level</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Number of Questions (min 5)</label>
                  <input
                    type="number"
                    min="5"
                    max="30"
                    value={qCount}
                    onChange={(e) => setQCount(e.target.value)}
                    onBlur={(e) => { if (!e.target.value || isNaN(parseInt(e.target.value))) setQCount('10'); }}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <button type="submit" disabled={isGenerating}
                    className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 transition-all">
                    {isGenerating ? (<><i className="fas fa-spinner fa-spin mr-2"></i>AI is generating questions from material content...</>) : 'Generate Assessment'}
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
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-slate-500 text-sm font-semibold mb-4 uppercase tracking-wider">Total Submissions</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-slate-800">{submissions.length}</span>
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

          {/* Chart & Assessment List */}
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
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                        {averageScoresByAssessment.map((_, index) => (
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
                        <button
                          onClick={() => handleDownloadAnswerKey(a._id, a.title)}
                          className="text-slate-400 hover:text-amber-600 p-2"
                          title="Download Answer Key PDF"
                        >
                          <i className="fas fa-key"></i>
                        </button>
                        <button
                          onClick={() => handleTogglePublish(a._id, a.isPublished)}
                          className={`p-2 transition-colors ${a.isPublished ? 'text-emerald-500 hover:text-emerald-700' : 'text-slate-300 hover:text-indigo-500'}`}
                          title={a.isPublished ? "Results Published (Click to Hide)" : "Publish Results to Students"}
                        >
                          <i className={`fas fa-${a.isPublished ? 'check-circle' : 'bullhorn'}`}></i>
                        </button>
                        <button onClick={() => setReviewingAssessment(a)} className="text-slate-400 hover:text-emerald-600 p-2" title="Review Submissions">
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteAssessment(a._id)}
                          className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                          title="Delete Assessment and All Results"
                        >
                          <i className="fas fa-trash-alt"></i>
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
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">Materials</h1>
          <p className="text-slate-500">Upload study materials. Teacher uploads are visible to your department students. Admin uploads are global.</p>
          <MaterialUpload user={user} onViewResults={handleViewMaterialResults} />
        </div>
      )}

      {/* RESULTS TAB */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => { setActiveTab('materials'); setResultsMaterial(null); }} className="text-slate-500 hover:text-slate-800">
              <i className="fas fa-arrow-left mr-2"></i>Back to Materials
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Results: {resultsMaterial?.title || 'All'}
              </h1>
              <p className="text-slate-500 text-sm">{materialAssessments.length} assessments linked to this material</p>
            </div>
          </div>

          {materialAssessments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400">
              <i className="fas fa-clipboard-list text-5xl mb-4"></i>
              <p className="font-semibold">No assessments have been generated from this material yet.</p>
              <p className="text-sm mt-1">Go to Dashboard and create an AI Assessment selecting this material.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {materialAssessments.map(a => (
                <div key={a._id} className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex justify-between items-center flex-wrap gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{a.title}</h3>
                      <p className="text-sm text-slate-500">{a.questions.length} questions • {a.topic}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">
                        {submissions.filter(s => s.assessmentId === a._id).length} submissions
                      </span>
                      <button
                        onClick={() => handleDownloadAnswerKey(a._id, a.title)}
                        className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-600 transition-all flex items-center gap-1"
                        title="Download Answer Key PDF"
                      >
                        <i className="fas fa-key"></i>
                        <span>Answer Key</span>
                      </button>
                      <button
                        onClick={() => handleTogglePublish(a._id, a.isPublished)}
                        className={`p-2 transition-colors ${a.isPublished ? 'text-emerald-500 hover:text-emerald-700' : 'text-slate-300 hover:text-indigo-500'}`}
                        title={a.isPublished ? "Results Published (Click to Hide)" : "Publish Results to Students"}
                      >
                        <i className={`fas fa-${a.isPublished ? 'check-circle' : 'bullhorn'}`}></i>
                      </button>
                      <button
                        onClick={() => setReviewingAssessment(a)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all"
                      >
                        <i className="fas fa-eye mr-2"></i>View Submissions
                      </button>
                      <button
                        onClick={() => handleDeleteAssessment(a._id)}
                        className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-all"
                        title="Delete Assessment and All Results"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
