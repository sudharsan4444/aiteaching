import React, { useState } from 'react';
import api from '../services/api';

const SubmissionReview = ({ assessment, submissions, onBack }) => {
    const [editingId, setEditingId] = useState(null);
    const [tempScore, setTempScore] = useState(0);
    const [tempFeedback, setTempFeedback] = useState('');

    const relevantSubmissions = submissions.filter(s => s.assessmentId === assessment._id);

    const handleEdit = (sub) => {
        setEditingId(sub._id);
        setTempScore(sub.score);
        setTempFeedback(sub.feedback || '');
    };

    const handleSave = async () => {
        try {
            await api.put(`/submissions/${editingId}`, {
                score: parseFloat(tempScore),
                feedback: tempFeedback
            });
            // In a real app we'd trigger a refresh or update parent state.
            // For now, let's just alert and reload or optimistic update (complex without callback).
            // We'll just close edit mode and alert.
            alert('Grade updated! Please refresh to see changes.');
            setEditingId(null);
        } catch (error) {
            console.error(error);
            alert('Failed to update grade');
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Review: {assessment.title}</h2>
                    <p className="text-slate-500">{relevantSubmissions.length} Submissions</p>
                </div>
                <button onClick={onBack} className="text-slate-500 hover:text-slate-800 font-bold">
                    <i className="fas fa-arrow-left mr-2"></i> Back
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                        <tr>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Score</th>
                            <th className="px-6 py-4">Feedback</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {relevantSubmissions.map(sub => (
                            <tr key={sub._id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    {sub.studentId?.name || sub.studentName || 'Student'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${sub.status === 'GRADED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {sub.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {editingId === sub._id ? (
                                        <input
                                            type="number"
                                            value={tempScore}
                                            onChange={(e) => setTempScore(e.target.value)}
                                            className="w-20 p-1 border rounded"
                                        />
                                    ) : (
                                        <span className="font-bold text-slate-800">{sub.score} / {sub.maxScore}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 max-w-xs truncate">
                                    {editingId === sub._id ? (
                                        <textarea
                                            value={tempFeedback}
                                            onChange={(e) => setTempFeedback(e.target.value)}
                                            className="w-full p-1 border rounded text-xs"
                                        />
                                    ) : (
                                        <span className="text-slate-500 text-sm" title={sub.feedback}>{sub.feedback}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {editingId === sub._id ? (
                                        <div className="flex space-x-2">
                                            <button onClick={handleSave} className="text-emerald-600 hover:text-emerald-800"><i className="fas fa-check"></i></button>
                                            <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-600"><i className="fas fa-times"></i></button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleEdit(sub)} className="text-indigo-600 hover:text-indigo-800">
                                            <i className="fas fa-edit"></i>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {relevantSubmissions.length === 0 && (
                    <p className="text-center py-8 text-slate-400 italic">No submissions for this assessment yet.</p>
                )}
            </div>
        </div>
    );
};

export default SubmissionReview;
