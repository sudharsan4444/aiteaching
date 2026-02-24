
import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import Landing from './components/Landing';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import Navigation from './components/Navigation';


import authService from './services/authService';
import api from './services/api';
import { mockAssessments, mockSubmissions, mockMaterials, mockStudents, mockGrades } from './mockData';

// Set to true for frontend-only testing
const USE_MOCK_DATA = false;

const App = () => {
  const [user, setUser] = useState(null);
  const [isTestActive, setIsTestActive] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    // Check for existing user session
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  useEffect(() => {
    // Load data when user is logged in
    if (user) {
      const fetchData = async () => {
        try {
          if (USE_MOCK_DATA) {
            // Use mock data for frontend-only testing
            setAssessments(mockAssessments);
            setSubmissions(mockSubmissions);
            return;
          }

          // Real API calls (when backend is running)
          if (user.role === 'TEACHER' || user.role === 'ADMIN') {
            const [assRes, subRes] = await Promise.all([
              api.get('/assessments'),
              api.get('/submissions')
            ]);
            setAssessments(assRes.data);
            setSubmissions(subRes.data);
          } else if (user.role === 'STUDENT') {
            const [assRes, subRes] = await Promise.all([
              api.get('/assessments'),
              api.get('/submissions/my')
            ]);
            setAssessments(assRes.data);
            setSubmissions(subRes.data);
          }
        } catch (error) {
          console.error("Failed to fetch data:", error);
          if (error.response?.status === 401) {
            handleLogout(); // Token expired
          }
        }
      };
      fetchData();
    }
  }, [user]);

  const handleLogin = (u) => setUser(u);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setAssessments([]);
    setSubmissions([]);
  };

  const addAssessment = async (a) => {
    // Need to persist to backend
    // Actually, TeacherDashboard calls generate, then calls this.
    // We should move the API call to create assessment to TeacherDashboard?
    // Or do it here.
    try {
      const res = await api.post('/assessments', a);
      setAssessments([res.data, ...assessments]);
    } catch (err) {
      console.error("Failed to create assessment", err);
      alert("Failed to save assessment");
    }
  };

  const updateAssessment = (updated) => {
    setAssessments(prev => prev.map(a => a._id === updated._id ? updated : a));
  };

  const addSubmission = async (s) => {
    // StudentDashboard handles the API call to submit, 
    // but we need to update local state if we want immediate UI reflection.
    // OR re-fetch. Re-fetching is safer.
    // For now, let's append.
    setSubmissions([s, ...submissions]);
  };

  if (!user) {
    return <Landing onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation user={user} onLogout={handleLogout} isTestActive={isTestActive} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {user.role === UserRole.TEACHER && (
          <TeacherDashboard
            user={user}
            assessments={assessments}
            submissions={submissions}
            onAddAssessment={addAssessment}
            onUpdateAssessment={updateAssessment}
          />
        )}
        {user.role === UserRole.STUDENT && (
          <StudentDashboard
            user={user}
            assessments={assessments}
            submissions={submissions}
            onSubmitQuiz={addSubmission}
            onTestStateChange={setIsTestActive}
          />
        )}
        {user.role === UserRole.ADMIN && (
          <AdminDashboard user={user} />
        )}
      </main>
    </div>
  );
};

export default App;
