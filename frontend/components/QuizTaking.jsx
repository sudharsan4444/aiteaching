import React, { useState } from 'react';
import { QuestionType } from '../types';
import api from '../services/api';

const QuizTaking = ({ user, assessment, submissionId, onSubmit, onCancel }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQ = assessment.questions[currentIdx];

  const handleAnswer = (val) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: val }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Logic for auto-grading MCQs + AI grading for descriptive
      // Done by backend at POST /submissions/:id/submit
      const response = await api.post(`/submissions/${submissionId}/submit`, { answers });
      onSubmit(response.data);
    } catch (error) {
      console.error(error);
      alert('Error evaluating test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">{assessment.title}</h2>
          <p className="text-slate-500">{assessment.topic} • Question {currentIdx + 1} of {assessment.questions.length}</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-red-500 transition-colors">
          <i className="fas fa-times-circle text-2xl"></i>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1.5 bg-slate-100 w-full">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / assessment.questions.length) * 100}%` }}
          ></div>
        </div>

        <div className="mb-10">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold mb-4">
            <span>{currentQ.difficulty}</span>
            <span className="w-1 h-1 bg-indigo-300 rounded-full"></span>
            <span>{currentQ.maxPoints} Points</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
            {currentQ.prompt}
          </h3>
        </div>

        <div className="space-y-4 mb-12">
          {currentQ.type === QuestionType.MCQ ? (
            currentQ.options?.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center space-x-4 ${answers[currentQ.id] === idx
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md'
                  : 'border-slate-100 hover:border-slate-300 text-slate-600'
                  }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${answers[currentQ.id] === idx ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                  }`}>
                  {answers[currentQ.id] === idx && <i className="fas fa-check text-white text-[10px]"></i>}
                </div>
                <span className="font-semibold">{opt}</span>
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

        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
            disabled={currentIdx === 0}
            className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-indigo-600 disabled:opacity-0 transition-all"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Previous
          </button>

          {currentIdx === assessment.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center"
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-brain fa-spin mr-3"></i>
                  AI Grading...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-3"></i>
                  Finish & Submit
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentIdx(Math.min(assessment.questions.length - 1, currentIdx + 1))}
              disabled={answers[currentQ.id] === undefined}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 disabled:opacity-50 transition-all"
            >
              Next Question
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;
