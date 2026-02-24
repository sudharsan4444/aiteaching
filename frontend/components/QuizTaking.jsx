import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const QuizTaking = ({ user, assessment, submissionId, onSubmit, onCancel }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [showReadyConfirm, setShowReadyConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const timerRef = useRef(null);

  const totalQuestions = assessment.questions.length;
  const mcqCount = assessment.questions.filter(q => q.type === 'MCQ').length;
  const descCount = totalQuestions - mcqCount;
  const answeredCount = Object.keys(answers).length;

  // Timer
  useEffect(() => {
    if (isStarted) {
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isStarted]);

  // Tab-switching detection (Anti-cheat)
  useEffect(() => {
    if (!isStarted) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        alert('CHEATING DETECTED: You left the assessment tab. The test will now be submitted automatically.');
        doSubmit();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isStarted, answers]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const currentQ = assessment.questions[currentIdx];

  const handleAnswer = (val) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: val }));
  };

  const handleQuizCancel = () => {
    if (onCancel) onCancel();
  };

  const doSubmit = async () => {
    if (isSubmitting) return;
    clearInterval(timerRef.current);
    setIsSubmitting(true);
    setShowSubmitConfirm(false);
    try {
      const response = await api.post(`/submissions/${submissionId}/submit`, {
        answers,
        timeTaken: elapsed
      });
      onSubmit(response.data);
    } catch (error) {
      console.error(error);
      alert('Error submitting. Please try again.');
      setIsSubmitting(false);
    }
  };

  // --- Ready Screen ---
  if (!isStarted) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-file-signature text-3xl text-indigo-600"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">{assessment.title}</h2>
          <p className="text-slate-500 mb-2">{assessment.topic}</p>
          <div className="flex justify-center gap-4 mb-6 text-sm">
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold">{mcqCount} MCQ</span>
            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-bold">{descCount} Descriptive</span>
            <span className="bg-slate-50 text-slate-700 px-3 py-1 rounded-full font-bold">{totalQuestions} Total</span>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 text-left mb-8 rounded-r-xl">
            <p className="text-xs font-bold text-amber-800 uppercase mb-1">Rules:</p>
            <ul className="text-xs text-amber-900 space-y-1 list-disc ml-4">
              <li>Do not switch tabs – auto-submit will trigger.</li>
              <li>AI Chat is disabled during the assessment.</li>
              <li>All questions must be answered before submission.</li>
            </ul>
          </div>

          {!showReadyConfirm ? (
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => setShowReadyConfirm(true)}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                I'm Ready to Start
              </button>
              <button onClick={handleQuizCancel} className="text-slate-400 font-bold hover:text-slate-600 transition-colors py-2">
                Go Back
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6">
              <p className="font-bold text-slate-800 mb-4">Are you sure you're ready to begin?<br /><span className="text-sm font-normal text-slate-500">The timer starts immediately.</span></p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsStarted(true)}
                  className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-black hover:bg-emerald-600 transition-all"
                >
                  Yes, Start Now
                </button>
                <button
                  onClick={() => setShowReadyConfirm(false)}
                  className="px-6 py-3 border-2 border-slate-200 rounded-xl text-slate-500 font-bold hover:border-slate-300"
                >
                  Not Yet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-2xl text-amber-500"></i>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Submit Assessment?</h3>
            <p className="text-slate-500 mb-2">You have answered <strong>{answeredCount}</strong> of <strong>{totalQuestions}</strong> questions.</p>
            <p className="text-sm text-red-500 mb-6">This cannot be undone. Are you sure you want to submit?</p>
            <div className="flex gap-3">
              <button
                onClick={doSubmit}
                className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-black hover:bg-emerald-600 transition-all"
              >
                Yes, Submit Now
              </button>
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="px-6 py-3 border-2 border-slate-200 rounded-xl text-slate-500 font-bold"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 leading-tight">{assessment.title}</h2>
          <p className="text-slate-500 text-sm">{assessment.topic} • Q {currentIdx + 1}/{totalQuestions}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2 text-indigo-700 font-bold text-sm bg-indigo-50 px-3 py-1.5 rounded-full">
            <i className="fas fa-clock"></i>
            <span>{formatTime(elapsed)}</span>
          </div>
          <div className="flex items-center space-x-2 text-rose-500 font-bold text-xs bg-rose-50 px-3 py-1.5 rounded-full">
            <i className="fas fa-shield-alt"></i>
            <span>Anti-Cheat</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1.5 bg-slate-100 w-full">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>

        <div className="mb-8 mt-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{currentQ.type}</span>
            <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{currentQ.difficulty}</span>
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">{currentQ.maxPoints} pts</span>
            {currentQ.topic && <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">{currentQ.topic}</span>}
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
            {currentQ.prompt}
          </h3>
        </div>

        <div className="space-y-4 mb-10">
          {currentQ.type === 'MCQ' ? (
            (currentQ.options || []).map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center space-x-4 ${answers[currentQ.id] === idx
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md'
                  : 'border-slate-100 hover:border-slate-300 text-slate-600'
                  }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${answers[currentQ.id] === idx ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                  {answers[currentQ.id] === idx && <i className="fas fa-check text-white text-[10px]"></i>}
                </div>
                <span className="font-semibold">{String.fromCharCode(65 + idx)}. {opt}</span>
              </button>
            ))
          ) : (
            <textarea
              className="w-full h-48 p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all resize-none text-slate-800 font-medium"
              placeholder="Type your detailed answer here..."
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
            ></textarea>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
            disabled={currentIdx === 0}
            className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-indigo-600 disabled:opacity-0 transition-all"
          >
            <i className="fas fa-arrow-left mr-2"></i>Previous
          </button>

          {currentIdx === totalQuestions - 1 ? (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              disabled={isSubmitting}
              className="bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center"
            >
              {isSubmitting ? (
                <><i className="fas fa-brain fa-spin mr-3"></i>AI Grading...</>
              ) : (
                <><i className="fas fa-paper-plane mr-3"></i>Finish & Submit</>
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentIdx(Math.min(totalQuestions - 1, currentIdx + 1))}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-all"
            >
              Next <i className="fas fa-arrow-right ml-2"></i>
            </button>
          )}
        </div>
      </div>

      {/* Answer Progress */}
      <div className="mt-4 bg-white rounded-2xl border border-slate-200 p-4">
        <p className="text-xs font-bold text-slate-500 uppercase mb-3">Question Navigator</p>
        <div className="flex flex-wrap gap-2">
          {assessment.questions.map((q, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${i === currentIdx
                ? 'bg-indigo-600 text-white shadow'
                : answers[q.id] !== undefined
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">{answeredCount}/{totalQuestions} answered</p>
      </div>
    </div>
  );
};

export default QuizTaking;
