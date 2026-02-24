import React, { useState } from 'react';

const GradeBadge = ({ grade }) => {
    const colors = {
        'A+': 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'A': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'B': 'bg-blue-100 text-blue-700 border-blue-200',
        'C': 'bg-amber-100 text-amber-700 border-amber-200',
        'D': 'bg-orange-100 text-orange-700 border-orange-200',
        'F': 'bg-red-100 text-red-700 border-red-200',
        'N/A': 'bg-slate-100 text-slate-500 border-slate-200'
    };
    return (
        <span className={`border font-black px-3 py-1 rounded-full text-sm ${colors[grade] || colors['N/A']}`}>{grade || 'N/A'}</span>
    );
};

const StudentResults = ({ user, assessments = [], submissions = [] }) => {
    const [expandedId, setExpandedId] = useState(null);

    const mySubmissions = submissions.filter(s =>
        s.studentId === user._id &&
        (s.status === 'SUBMITTED' || s.status === 'GRADED')
    );

    const averagePct = mySubmissions.length > 0
        ? (mySubmissions.reduce((sum, s) => {
            const score = parseFloat(s.score) || 0;
            const maxScore = parseFloat(s.maxScore) || 1;
            return sum + (score / maxScore);
        }, 0) / mySubmissions.length * 100).toFixed(1)
        : '0.0';

    const bestSub = mySubmissions.reduce((best, cur) => {
        const bestScore = parseFloat(best?.score) || 0;
        const bestMax = parseFloat(best?.maxScore) || 1;
        const curScore = parseFloat(cur?.score) || 0;
        const curMax = parseFloat(cur?.maxScore) || 1;
        return (curScore / curMax) > (bestScore / bestMax) ? cur : best;
    }, null);
    const bestPct = bestSub ? Math.round((parseFloat(bestSub.score) / (parseFloat(bestSub.maxScore) || 1)) * 100) : 0;

    const totalCorrect = mySubmissions.reduce((sum, s) => {
        if (!s.aiFeedbackBreakdown?.breakdown) return sum;
        return sum + s.aiFeedbackBreakdown.breakdown.filter(b => b.correct).length;
    }, 0);
    const totalMCQ = mySubmissions.reduce((sum, s) => {
        const a = s.assessmentId;
        return sum + (a?.questions?.filter(q => q.type === 'MCQ').length || 0);
    }, 0);

    const formatTime = (secs) => {
        if (!secs) return '—';
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}m ${s}s`;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Academic Analytics</h1>
                    <p className="text-slate-500">Your formative assessment performance</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg Score</p>
                    <p className="text-4xl font-black text-indigo-600">{averagePct}%</p>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-3">
                        <i className="fas fa-tasks"></i>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{mySubmissions.length}</p>
                    <p className="text-slate-400 text-xs mt-1">Assessments Done</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-3">
                        <i className="fas fa-award"></i>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{bestPct}%</p>
                    <p className="text-slate-400 text-xs mt-1">Best Score</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-3">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{totalCorrect}</p>
                    <p className="text-slate-400 text-xs mt-1">MCQs Correct</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-3">
                        <i className="fas fa-clock"></i>
                    </div>
                    <p className="text-2xl font-black text-slate-900">
                        {mySubmissions.length > 0 ? formatTime(Math.round(mySubmissions.reduce((s, sub) => s + (sub.timeTaken || 0), 0) / mySubmissions.length)) : '—'}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">Avg Time Taken</p>
                </div>
            </div>

            {/* Results List */}
            {mySubmissions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
                    <i className="fas fa-clipboard-list text-5xl text-slate-300 mb-4"></i>
                    <h3 className="text-slate-500 font-semibold">No assessments completed yet</h3>
                    <p className="text-slate-400 text-sm">Take a quiz from the Dashboard tab to see your results here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {mySubmissions.map(sub => {
                        const a = sub.assessmentId;
                        const effectiveScore = parseFloat(sub.teacherOverrideScore ?? sub.score) || 0;
                        const maxScore = parseFloat(sub.maxScore) || 1;
                        const pct = Math.round((effectiveScore / maxScore) * 100);
                        const breakdown = sub.aiFeedbackBreakdown?.breakdown || [];
                        const correctCount = breakdown.filter(b => b.correct).length;
                        const mcqQs = a?.questions?.filter(q => q.type === 'MCQ') || [];
                        const isExpanded = expandedId === sub._id;
                        const isPublished = a?.isPublished;

                        return (
                            <div key={sub._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                {/* Summary Row */}
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 text-lg">{a?.title || 'Assessment'}</h3>
                                            <p className="text-sm text-slate-500">{a?.topic}</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Submitted: {new Date(sub.submittedAt).toLocaleDateString()} • Time: {formatTime(sub.timeTaken)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-slate-900">{effectiveScore}<span className="text-slate-400 font-normal text-base">/{sub.maxScore}</span></p>
                                                    <p className="text-sm font-semibold text-slate-500">{pct}%</p>
                                                </div>
                                                <GradeBadge grade={sub.grade} />
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span className="text-emerald-600 font-bold">{correctCount} correct</span>
                                                <span>•</span>
                                                <span className="text-red-500 font-bold">{mcqQs.length - correctCount} wrong</span>
                                                {sub.teacherOverrideScore !== undefined && (
                                                    <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">Teacher Reviewed</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => isPublished ? setExpandedId(isExpanded ? null : sub._id) : null}
                                                disabled={!isPublished}
                                                className={`text-xs font-semibold flex items-center gap-1 ${isPublished ? 'text-indigo-600 hover:text-indigo-800' : 'text-slate-400 cursor-not-allowed'}`}
                                            >
                                                {!isPublished ? 'Results Pending' : isExpanded ? 'Hide Mistakes' : 'View Wrong Answers'}
                                                {isPublished && <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px]`}></i>}
                                            </button>
                                        </div>
                                    </div>
                                    {!isPublished && (
                                        <div className="mt-3 bg-amber-50 text-amber-700 text-[11px] px-3 py-1.5 rounded-lg border border-amber-100 flex items-center gap-2">
                                            <i className="fas fa-info-circle"></i>
                                            Your results are being finalized by the teacher. Please check back later.
                                        </div>
                                    )}
                                </div>

                                {/* Expanded Analysis */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100 bg-slate-50 p-5 space-y-4">
                                        {/* Feedback */}
                                        {(sub.teacherFeedback || sub.feedback) && (
                                            <div className="space-y-2">
                                                {sub.teacherFeedback && (
                                                    <div className="bg-white border border-emerald-200 rounded-xl p-4">
                                                        <p className="text-xs font-bold text-emerald-600 uppercase mb-1 flex items-center gap-1">
                                                            <i className="fas fa-chalkboard-teacher"></i> Teacher Feedback
                                                        </p>
                                                        <p className="text-sm text-slate-700">{sub.teacherFeedback}</p>
                                                    </div>
                                                )}
                                                {sub.feedback && (
                                                    <div className="bg-white border border-indigo-200 rounded-xl p-4">
                                                        <p className="text-xs font-bold text-indigo-600 uppercase mb-1 flex items-center gap-1">
                                                            <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded text-[10px] font-black">AI</span> AI Feedback
                                                        </p>
                                                        <p className="text-sm text-slate-700">{sub.feedback}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Topic-wise Analysis */}
                                        {sub.topicAnalysis && Object.keys(sub.topicAnalysis).length > 0 && (
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Topic Analysis</p>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                    {Object.entries(sub.topicAnalysis).map(([topic, data]) => (
                                                        <div key={topic} className="bg-white border border-slate-200 rounded-xl p-3">
                                                            <p className="text-xs font-semibold text-slate-600 line-clamp-1">{topic}</p>
                                                            <p className="text-sm font-black text-slate-800">{data.scored || 0}/{data.total}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Per-Question Wrong-Items-Only Breakdown */}
                                        {breakdown.length > 0 && (
                                            <div>
                                                <p className="text-xs font-bold text-red-500 uppercase mb-2">Review Your Mistakes</p>
                                                <div className="space-y-3">
                                                    {breakdown.filter(b => b.pointsAwarded < b.maxPoints).map((b, i) => {
                                                        const q = a.questions.find(origQ => origQ.id === b.questionId) || a.questions[b.questionIndex - 1];
                                                        const isPartial = b.pointsAwarded > 0;
                                                        return (
                                                            <div key={i} className={`bg-white border rounded-xl p-4 shadow-sm ${isPartial ? 'border-amber-200' : 'border-red-200'}`}>
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="text-xs font-bold text-slate-400">Q{b.questionIndex}</span>
                                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${isPartial ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                                                                                {isPartial ? 'Partially Correct' : 'Incorrect'}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-sm font-bold text-slate-800 leading-tight">{q?.prompt}</p>
                                                                    </div>
                                                                    <div className="text-right shrink-0 ml-3">
                                                                        <p className={`font-black text-sm ${isPartial ? 'text-amber-600' : 'text-rose-600'}`}>
                                                                            {b.pointsAwarded}/{b.maxPoints}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="grid md:grid-cols-2 gap-3">
                                                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                                                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Your Answer:</p>
                                                                        <p className="text-sm text-slate-600 italic">
                                                                            {q?.type === 'MCQ' ? q.options[sub.answers?.[q.id]] : sub.answers?.[q.id] || '(No Answer)'}
                                                                        </p>
                                                                    </div>
                                                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                                                        <p className="text-[10px] font-bold text-emerald-700 uppercase mb-1">
                                                                            {q?.type === 'MCQ' ? 'Correct Answer & Explanation:' : 'Reference Answer:'}
                                                                        </p>
                                                                        <p className="text-sm font-bold text-emerald-800 mb-2">
                                                                            {q?.type === 'MCQ' ? q.options[q.correctOptionIndex] : (b.referenceAnswer || 'Refer to key concepts below')}
                                                                        </p>

                                                                        {/* Key Concepts for Descriptive */}
                                                                        {q?.type === 'DESCRIPTIVE' && b.keyConcepts && b.keyConcepts.length > 0 && (
                                                                            <div className="mt-2 pt-2 border-t border-emerald-200">
                                                                                <p className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Key Concepts Missing/Expected:</p>
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    {b.keyConcepts.map((concept, idx) => (
                                                                                        <span key={idx} className="bg-emerald-200 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                                                            {concept}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        <div className="mt-2 flex items-start gap-1">
                                                                            <i className="fas fa-info-circle text-[10px] text-emerald-600 mt-0.5"></i>
                                                                            <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                                                                {b.feedback}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    {breakdown.filter(b => b.pointsAwarded < b.maxPoints).length === 0 && (
                                                        <div className="bg-emerald-50 text-emerald-700 p-8 rounded-2xl text-center border border-emerald-100">
                                                            <i className="fas fa-star text-2xl mb-2"></i>
                                                            <p className="font-bold">Perfect Score!</p>
                                                            <p className="text-sm">You didn't miss any questions in this assessment.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudentResults;
