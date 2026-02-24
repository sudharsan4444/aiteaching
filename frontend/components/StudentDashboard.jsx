import React, { useState } from 'react';
import QuizTaking from './QuizTaking';
import AIChat from './AIChat';
import MaterialLibrary from './MaterialLibrary';
import StudentResults from './StudentResults';
import api from '../services/api';

const StudentDashboard = ({ user, assessments, submissions, onSubmitQuiz, onTestStateChange }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [visibleAnswerKey, setVisibleAnswerKey] = useState(null); // submission._id whose answer key is shown

  const availableQuizzes = assessments.filter(a =>
    !submissions.find(s => (s.assessmentId?._id || s.assessmentId) === a._id) && a.status === 'PUBLISHED'
  );
  const completedQuizzes = submissions.filter(s => s.studentId === user._id);

  const handleStartQuiz = async (assessment) => {
    setLoadingQuiz(true);
    try {
      const response = await api.post('/submissions/start', { assessmentId: assessment._id });
      setActiveSubmission(response.data);
      setActiveQuiz(assessment);
      onTestStateChange(true); // Signal test active
    } catch (error) {
      console.error("Failed to start quiz", error);
      alert(error.response?.data?.message || "Failed to start quiz (mock mode)");
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleQuizSubmit = (submission) => {
    onSubmitQuiz(submission);
    setActiveQuiz(null);
    setActiveSubmission(null);
    onTestStateChange(false); // Signal test finished
  };

  const handleQuizCancel = () => {
    setActiveQuiz(null);
    setActiveSubmission(null);
    onTestStateChange(false); // Signal test cancelled
  };

  if (activeQuiz && activeSubmission) {
    return (
      <div className="relative">
        <QuizTaking
          user={user}
          assessment={activeQuiz}
          submissionId={activeSubmission._id}
          onCancel={handleQuizCancel}
          onSubmit={handleQuizSubmit}
        />
        {/* AIChat is hidden when hasActiveQuiz=true */}
        <AIChat user={user} hasActiveQuiz={true} />
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
    { id: 'materials', label: 'Materials', icon: 'fas fa-book-open' },
    { id: 'results', label: 'Results', icon: 'fas fa-chart-bar' },
    { id: 'profile', label: 'My Profile', icon: 'fas fa-user' },
  ];

  return (
    <div className="space-y-6 relative">
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

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome, {user.name}</h1>
            <p className="text-slate-500">Track your progress and complete pending assessments</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <i className="fas fa-clock text-amber-500 mr-2"></i>
                Available Assessments
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {availableQuizzes.length === 0 ? (
                  <div className="col-span-2 bg-white p-12 rounded-2xl text-center border border-dashed border-slate-300 text-slate-400">
                    <i className="fas fa-check-circle text-4xl mb-4 text-emerald-500"></i>
                    <p>All caught up! No pending assessments.</p>
                  </div>
                ) : (
                  availableQuizzes.map(a => (
                    <div key={a._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-400 transition-all flex flex-col h-full">
                      <div className="flex-1">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">{a.topic}</span>
                        <h3 className="text-xl font-bold text-slate-800 mt-3 mb-2">{a.title}</h3>
                        <p className="text-slate-500 text-sm mb-4">
                          {a.questions.length} items • Due by {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleStartQuiz(a)}
                        disabled={loadingQuiz}
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-indigo-600 transition-all disabled:opacity-50"
                      >
                        {loadingQuiz ? <i className="fas fa-spinner fa-spin"></i> : 'Start Assessment'}
                      </button>
                    </div>
                  ))
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center pt-4">
                <i className="fas fa-history text-indigo-500 mr-2"></i>
                Past Submissions
              </h2>
              <div className="space-y-4">
                {completedQuizzes.length === 0 ? (
                  <p className="text-slate-400 italic">No submissions yet.</p>
                ) : (
                  completedQuizzes.map(s => {
                    const assessment = assessments.find(a => a._id === s.assessmentId);
                    const isKeyVisible = visibleAnswerKey === s._id;
                    return (
                      <div key={s._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-slate-800 text-lg">{assessment?.title || 'Unknown Quiz'}</h4>
                            <p className="text-xs text-slate-500">Submitted on {new Date(s.submittedAt).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-indigo-600">{s.score}<span className="text-slate-400 text-sm">/{s.maxScore}</span></div>
                            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">Grade Point</p>
                          </div>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-xl border-l-4 border-indigo-400 mb-4">
                          <p className="text-sm font-semibold text-indigo-800 mb-1">AI Teacher Feedback:</p>
                          <p className="text-sm text-slate-700 italic">"{s.feedback}"</p>
                        </div>
                        {/* Answer Key Toggle */}
                        {assessment && (
                          <div>
                            <button
                              onClick={() => setVisibleAnswerKey(isKeyVisible ? null : s._id)}
                              className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-all ${isKeyVisible
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                                }`}
                            >
                              <i className={`fas fa-${isKeyVisible ? 'eye-slash' : 'key'}`}></i>
                              {isKeyVisible ? 'Hide Answer Key' : 'View Answer Key'}
                            </button>

                            {isKeyVisible && (
                              <div className="mt-4 space-y-3">
                                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                  <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-[10px]">KEY</span>
                                  Correct Answers
                                </h5>
                                {assessment.questions.map((q, idx) => (
                                  <div key={q.id || idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs font-bold text-slate-400">Q{idx + 1}</span>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${q.type === 'MCQ' ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'
                                        }`}>{q.type}</span>
                                      {q.topic && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">{q.topic}</span>}
                                    </div>
                                    <p className="text-sm font-semibold text-slate-800 mb-3">{q.prompt}</p>
                                    {q.type === 'MCQ' ? (
                                      <div className="space-y-1.5">
                                        {q.options.map((opt, optIdx) => (
                                          <div key={optIdx} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${optIdx === q.correctOptionIndex
                                            ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                                            : 'text-slate-500'
                                            }`}>
                                            {optIdx === q.correctOptionIndex && (
                                              <i className="fas fa-check-circle text-emerald-600 text-xs"></i>
                                            )}
                                            <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                            {optIdx === q.correctOptionIndex && (
                                              <span className="ml-auto text-[10px] font-black text-emerald-600 uppercase">Correct</span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                        <p className="text-xs font-bold text-emerald-700 mb-1 flex items-center gap-1">
                                          <i className="fas fa-lightbulb"></i> Expected Key Points:
                                        </p>
                                        <p className="text-sm text-slate-700">{q.expectedAnswer || 'See teacher for expected answer.'}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl overflow-hidden relative">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4">Overall Performance</h3>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-2xl font-bold">
                      {completedQuizzes.length > 0
                        ? Math.round((completedQuizzes.reduce((sum, s) => sum + (s.score / s.maxScore), 0) / completedQuizzes.length) * 100)
                        : 0}%
                    </div>
                    <div>
                      <p className="text-indigo-200 text-sm">Learning Score</p>
                      <p className="text-white font-bold">Consistently Improving</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-slate-800/50 p-3 rounded-lg flex justify-between">
                      <span className="text-slate-400 text-sm">Tests Taken</span>
                      <span className="font-bold">{completedQuizzes.length}</span>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg flex justify-between">
                      <span className="text-slate-400 text-sm">Department</span>
                      <span className="font-bold text-emerald-400">{user.department || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4">Study Tips for You</h3>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <div className="bg-amber-100 p-2 rounded text-amber-600 text-xs"><i className="fas fa-lightbulb"></i></div>
                    <p className="text-sm text-slate-600">Try reviewing descriptive topics before starting Hard difficulty quizzes.</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="bg-indigo-100 p-2 rounded text-indigo-600 text-xs"><i className="fas fa-brain"></i></div>
                    <p className="text-sm text-slate-600">Flashcards can help with MCQ heavy topics like {assessments[0]?.topic || 'History'}.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'materials' && <MaterialLibrary user={user} />}
      {activeTab === 'results' && (
        <StudentResults
          user={user}
          assessments={assessments}
          submissions={submissions}
        />
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
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Year</p>
                  <p className="font-bold text-slate-800 text-lg">Year {user.year || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Role</p>
                  <p className="font-bold text-indigo-600 text-lg">{user.role}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Enrolled Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {(user.subjects || []).map((subject, idx) => (
                    <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-sm font-semibold">{subject}</span>
                  ))}
                  {(!user.subjects || user.subjects.length === 0) && (
                    <p className="text-slate-400 italic">No subjects assigned yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AIChat user={user} />
    </div>
  );
};

export default StudentDashboard;
