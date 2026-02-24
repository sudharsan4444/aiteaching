import React, { useState } from 'react';
import api from '../services/api';

const GradeBadge = ({ grade }) => {
    const colors = {
        'A+': 'bg-emerald-100 text-emerald-800',
        'A': 'bg-emerald-100 text-emerald-700',
        'B': 'bg-blue-100 text-blue-700',
        'C': 'bg-amber-100 text-amber-700',
        'D': 'bg-orange-100 text-orange-700',
        'F': 'bg-red-100 text-red-700',
        'N/A': 'bg-slate-100 text-slate-500'
    };
    return (
        <span className={`px-2 py-0.5 rounded font-bold text-xs ${colors[grade] || colors['N/A']}`}>{grade || 'N/A'}</span>
    );
};

const SubmissionReview = ({ assessment, submissions, onBack, onUpdateAssessment }) => {
    const [isPublished, setIsPublished] = useState(assessment.isPublished);
    const [editingId, setEditingId] = useState(null);
    const [tempScore, setTempScore] = useState(0);
    const [tempFeedback, setTempFeedback] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [localSubs, setLocalSubs] = useState(
        submissions.filter(s => s.assessmentId === assessment._id)
    );
    const [downloadingKey, setDownloadingKey] = useState(false);

    const handleDownloadAnswerKey = async () => {
        setDownloadingKey(true);
        try {
            const res = await api.get(`/files/assessment/${assessment._id}/answer-key`, { responseType: 'blob' });
            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `answer-key-${assessment.title}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Answer key download failed:', err);
            alert('Failed to download answer key.');
        } finally {
            setDownloadingKey(false);
        }
    };

    const formatTime = (secs) => {
        if (!secs) return '—';
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}m ${s}s`;
    };

    const handleEdit = (sub) => {
        setEditingId(sub._id);
        setTempScore(sub.teacherOverrideScore ?? sub.score);
        setTempFeedback(sub.teacherFeedback || sub.feedback || '');
    };

    const handleSave = async (sub) => {
        try {
            const res = await api.put(`/submissions/${editingId}`, {
                teacherOverrideScore: parseFloat(tempScore),
                teacherFeedback: tempFeedback
            });
            setLocalSubs(prev => prev.map(s => s._id === editingId ? { ...s, ...res.data } : s));
            setEditingId(null);
        } catch (error) {
            console.error(error);
            alert('Failed to update grade');
        }
    };

    const handleDownloadPDF = (sub) => {
        const student = sub.studentId;
        const studentName = student?.name || 'Student';
        const effectiveScore = parseFloat(sub.teacherOverrideScore ?? sub.score) || 0;
        const maxScore = parseFloat(sub.maxScore) || 1;
        const pct = Math.round((effectiveScore / maxScore) * 100);

        const breakdown = Array.isArray(sub.aiFeedbackBreakdown?.breakdown)
            ? sub.aiFeedbackBreakdown.breakdown
            : [];

        const questionsHTML = assessment.questions.map((q, i) => {
            const fb = breakdown.find(b => b.questionIndex === i + 1) || {};
            const studentAns = sub.answers?.[q.id];
            const displayAns = q.type === 'MCQ'
                ? (studentAns !== undefined && q.options ? q.options[studentAns] : '—')
                : (studentAns || '—');

            const referenceInfo = q.type === 'MCQ'
                ? `<b>Correct:</b> ${q.options ? q.options[q.correctOptionIndex] : '—'}`
                : `<b>Ref:</b> ${fb.referenceAnswer || '—'}${fb.keyConcepts ? `<br/><b>Keys:</b> ${fb.keyConcepts.join(', ')}` : ''}`;

            return `
            <tr style="border-bottom:1px solid #e2e8f0">
                <td style="padding:8px;font-size:12px;vertical-align:top"><b>Q${i + 1}</b> (${q.type})<br/>${q.prompt}</td>
                <td style="padding:8px;font-size:12px;vertical-align:top">${displayAns}</td>
                <td style="padding:8px;font-size:12px;vertical-align:top">${referenceInfo}</td>
                <td style="padding:8px;font-size:12px;text-align:center"><b>${fb.pointsAwarded ?? '—'}</b>/${q.maxPoints || (q.type === 'MCQ' ? 1 : 10)}</td>
                <td style="padding:8px;font-size:12px;vertical-align:top">${fb.feedback || '—'}</td>
            </tr>`;
        }).join('');


        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Assessment Report</title></head>
        <body style="font-family:Arial,sans-serif;margin:40px;color:#1e293b">
        <div style="text-align:center;margin-bottom:24px">
            <h1 style="color:#4f46e5;margin-bottom:4px">Assessment Report</h1>
            <p style="color:#64748b">${assessment.title} — ${assessment.topic}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:6px 0"><b>Student:</b> ${studentName}</td><td style="padding:6px 0"><b>Email:</b> ${student?.email || '—'}</td></tr>
            <tr><td style="padding:6px 0"><b>Roll No:</b> ${student?.rollNumber || '—'}</td><td style="padding:6px 0"><b>Department:</b> ${student?.department || '—'}</td></tr>
            <tr><td style="padding:6px 0"><b>Date:</b> ${new Date(sub.submittedAt).toLocaleDateString()}</td><td style="padding:6px 0"><b>Time Taken:</b> ${formatTime(sub.timeTaken)}</td></tr>
            <tr><td style="padding:6px 0"><b>Score:</b> ${effectiveScore} / ${sub.maxScore}</td><td style="padding:6px 0"><b>Grade:</b> ${sub.grade || 'N/A'} (${pct}%)</td></tr>
        </table>
        <h3 style="color:#4f46e5;margin-bottom:8px">Question-wise Analysis</h3>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0">
            <thead><tr style="background:#f8fafc;font-size:12px;font-weight:bold">
                <th style="padding:8px;text-align:left">Question</th>
                <th style="padding:8px;text-align:left">Student Answer</th>
                <th style="padding:8px;text-align:left">Reference Info</th>
                <th style="padding:8px;text-align:center">Score</th>
                <th style="padding:8px;text-align:left">AI Feedback</th>
            </tr></thead>
            <tbody>${questionsHTML}</tbody>
        </table>

        ${sub.teacherFeedback ? `<h3 style="margin-top:24px;color:#4f46e5">Teacher Remarks</h3><p style="background:#f8fafc;padding:12px;border-radius:8px">${sub.teacherFeedback}</p>` : ''}
        ${sub.feedback && !sub.teacherFeedback ? `<h3 style="margin-top:24px;color:#4f46e5">AI Overall Feedback</h3><p style="background:#f8fafc;padding:12px;border-radius:8px">${sub.feedback}</p>` : ''}
        <p style="margin-top:32px;text-align:center;color:#94a3b8;font-size:11px">Generated by AI Teaching Assistant • ${new Date().toLocaleDateString()}</p>
        </body></html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${studentName.replace(/\s+/g, '_')}_${assessment.title.replace(/\s+/g, '_')}_report.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <button onClick={onBack} className="text-slate-500 hover:text-slate-800 font-bold mb-2 inline-flex items-center">
                        <i className="fas fa-arrow-left mr-2"></i>Back
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900">Review: {assessment.title}</h2>
                    <p className="text-slate-500">{localSubs.length} Submissions</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={async () => {
                            try {
                                const res = await api.put(`/assessments/${assessment._id}/publish`, { isPublished: !isPublished });
                                setIsPublished(res.data.isPublished);
                                if (onUpdateAssessment) onUpdateAssessment(res.data);
                            } catch (err) { alert('Failed to publish'); }
                        }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm ${isPublished ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                    >
                        <i className={`fas fa-${isPublished ? 'check-circle' : 'bullhorn'}`}></i>
                        <span>{isPublished ? 'Published' : 'Publish Results'}</span>
                    </button>
                    <button
                        onClick={handleDownloadAnswerKey}
                        disabled={downloadingKey}
                        className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-amber-600 transition-all disabled:opacity-50 shadow-sm"
                        title="Download Answer Key PDF for this assessment"
                    >
                        <i className="fas fa-key"></i>
                        <span>{downloadingKey ? 'Downloading...' : 'Answer Key'}</span>
                    </button>
                </div>
            </div>

            {localSubs.length === 0 ? (
                <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center text-slate-400">
                    <i className="fas fa-inbox text-5xl mb-4"></i>
                    <p>No submissions for this assessment yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {localSubs.map(sub => {
                        const studentName = sub.studentId?.name || 'Student';
                        const effectiveScore = parseFloat(sub.teacherOverrideScore ?? sub.score) || 0;
                        const maxScore = parseFloat(sub.maxScore) || 1;
                        const pct = Math.round((effectiveScore / maxScore) * 100);
                        const breakdown = Array.isArray(sub.aiFeedbackBreakdown?.breakdown)
                            ? sub.aiFeedbackBreakdown.breakdown
                            : [];
                        const isExpanded = expandedId === sub._id;
                        const isEditing = editingId === sub._id;

                        return (
                            <div key={sub._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                {/* Summary Row */}
                                <div className="flex items-center justify-between p-5 flex-wrap gap-3">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                            {studentName.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{studentName}</h4>
                                            <p className="text-xs text-slate-400">{sub.studentId?.email} • {formatTime(sub.timeTaken)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-center">
                                            <p className="text-xs text-slate-400 mb-0.5">Score</p>
                                            {isEditing ? (
                                                <input type="number" value={tempScore} onChange={e => setTempScore(e.target.value)} className="w-20 p-1 border rounded text-center font-bold" />
                                            ) : (
                                                <p className="font-bold text-slate-800">{effectiveScore}/{sub.maxScore}</p>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-slate-400 mb-0.5">%</p>
                                            <p className="font-bold text-slate-800">{pct}%</p>
                                        </div>
                                        <GradeBadge grade={sub.grade} />
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${sub.status === 'GRADED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {sub.status}
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setExpandedId(isExpanded ? null : sub._id)} className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-lg hover:bg-indigo-50" title="View Answer Sheet">
                                                <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-expand-alt'}`}></i>
                                            </button>
                                            {isEditing ? (
                                                <>
                                                    <button onClick={() => handleSave(sub)} className="text-emerald-600 hover:text-emerald-800 p-1.5"><i className="fas fa-check"></i></button>
                                                    <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-600 p-1.5"><i className="fas fa-times"></i></button>
                                                </>
                                            ) : (
                                                <button onClick={() => handleEdit(sub)} className="text-slate-400 hover:text-indigo-600 p-1.5" title="Edit Score/Feedback">
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                            )}
                                            <button onClick={() => handleDownloadPDF(sub)} className="text-slate-400 hover:text-emerald-600 p-1.5" title="Download PDF Report">
                                                <i className="fas fa-file-download"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expandable Detail Panel */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100 p-5 bg-slate-50">
                                        {/* Overall Feedback */}
                                        <div className="mb-5 grid md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                                    <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded text-[10px] font-black">AI</span>
                                                    Overall Feedback
                                                </p>
                                                <p className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-200">{sub.feedback || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                                    <i className="fas fa-chalkboard-teacher text-emerald-600"></i>
                                                    Teacher Feedback
                                                </p>
                                                {isEditing ? (
                                                    <textarea rows="3" value={tempFeedback} onChange={e => setTempFeedback(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 text-sm" placeholder="Add your feedback..." />
                                                ) : (
                                                    <p className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-200">{sub.teacherFeedback || <span className="text-slate-300 italic">No teacher feedback yet. Click edit to add.</span>}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Per-Question Breakdown */}
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Question-wise Analysis</h4>
                                        <div className="space-y-3">
                                            {assessment.questions.map((q, i) => {
                                                const fb = breakdown.find(b => b.questionIndex === i + 1) || {};
                                                const studentAns = sub.answers?.[q.id];
                                                const displayAns = q.type === 'MCQ'
                                                    ? (studentAns !== undefined && q.options ? `${String.fromCharCode(65 + studentAns)}. ${q.options[studentAns]}` : '—')
                                                    : (studentAns || '—');
                                                const isCorrect = fb.correct;
                                                const isPartial = !isCorrect && fb.pointsAwarded > 0;

                                                return (
                                                    <div key={i} className={`bg-white border rounded-xl p-4 ${isCorrect === true ? 'border-emerald-200' : isPartial ? 'border-amber-200' : isCorrect === false ? 'border-red-200' : 'border-slate-100'}`}>
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs font-bold text-slate-400">Q{i + 1}</span>
                                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${q.type === 'MCQ' ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'}`}>{q.type}</span>
                                                                    {q.topic && <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-slate-50 text-slate-500">{q.topic}</span>}
                                                                </div>
                                                                <p className="text-sm font-semibold text-slate-800 mb-2">{q.prompt}</p>

                                                                <div className="grid md:grid-cols-2 gap-3 mt-2">
                                                                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Student Answer:</p>
                                                                        <p className="text-xs text-slate-600 italic">
                                                                            {typeof displayAns === 'string' ? displayAns : JSON.stringify(displayAns)}
                                                                        </p>
                                                                    </div>
                                                                    <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-100">
                                                                        <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">
                                                                            {q.type === 'MCQ' ? 'Correct Option:' : 'Reference Answer:'}
                                                                        </p>
                                                                        <p className="text-xs text-emerald-800 font-medium">
                                                                            {q.type === 'MCQ' ? (q.options ? q.options[q.correctOptionIndex] : '—') : (fb.referenceAnswer || '—')}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {q.type === 'DESCRIPTIVE' && fb.keyConcepts && fb.keyConcepts.length > 0 && (
                                                                    <div className="mt-2">
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Key Concepts:</p>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {fb.keyConcepts.map((c, idx) => (
                                                                                <span key={idx} className="bg-white text-indigo-600 border border-indigo-100 text-[9px] px-2 py-0.5 rounded-full font-bold">
                                                                                    {c}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {fb.feedback && (
                                                                    <div className="mt-2 bg-indigo-50/50 p-2 rounded-lg border border-indigo-50">
                                                                        <p className="text-xs text-slate-600 flex items-start gap-1">
                                                                            <span className="bg-indigo-100 text-indigo-600 px-1 rounded text-[10px] font-black mt-0.5 shrink-0">AI</span>
                                                                            {fb.feedback}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <p className="font-black text-slate-800">{fb.pointsAwarded ?? '—'}<span className="text-slate-400 font-normal">/{q.maxPoints || (q.type === 'MCQ' ? 5 : 10)}</span></p>
                                                                {isCorrect !== undefined && (
                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isCorrect ? 'bg-emerald-100 text-emerald-600' : isPartial ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-500'}`}>
                                                                        {isCorrect ? 'Correct' : isPartial ? 'Partial' : 'Incorrect'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );

                                            })}
                                        </div>
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

export default SubmissionReview;
