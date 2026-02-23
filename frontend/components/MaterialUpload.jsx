import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MaterialViewer } from './MaterialLibrary';

const MaterialUpload = ({ user, onViewResults }) => {
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        type: 'PDF',
        unit: '1'
    });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [materials, setMaterials] = useState([]);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const res = await api.get('/upload');
            // Deduplicate by _id in case of any DB duplicates
            const seen = new Set();
            const unique = res.data.filter(m => {
                if (seen.has(m._id)) return false;
                seen.add(m._id);
                return true;
            });
            setMaterials(unique);
        } catch (err) {
            console.error('Error fetching materials:', err);
        }
    };

    const handleDeleteMaterial = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this material?')) return;
        try {
            await api.delete(`/upload/${id}`);
            setMaterials(prev => prev.filter(m => m._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete material');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert('Please select a file');

        const data = new FormData();
        data.append('file', file);
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('subject', formData.subject);
        data.append('unit', formData.unit);
        data.append('type', formData.type);

        try {
            setUploading(true);
            await api.post('/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Material uploaded! Indexing in background...');
            setFormData({ title: '', description: '', subject: '', type: 'PDF', unit: '1' });
            setFile(null);
            fetchMaterials();
        } catch (err) {
            alert(err.response?.data?.message || 'Error uploading material');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Upload Learning Material</h2>
                <p className="text-slate-500">Share resources with your students (Admin/Teacher)</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all"
                                placeholder="e.g., Introduction to React"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all"
                                placeholder="e.g., Computer Science"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all"
                            >
                                <option value="PDF">PDF Document</option>
                                <option value="VIDEO">Video (MP4)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Unit</label>
                            <input
                                type="text"
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all"
                                placeholder="e.g., Unit 1"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">File</label>
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all"
                            rows="2"
                            placeholder="Brief description..."
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                        {uploading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-upload mr-2"></i>}
                        {uploading ? 'Processing & Indexing...' : 'Upload & Start AI Training'}
                    </button>
                </form>
            </div>

            <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Existing Materials</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materials.map(m => (
                        <div
                            key={m._id}
                            onClick={() => setSelectedMaterial(m)}
                            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-400 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600">{m.title}</h4>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${m.type === 'VIDEO' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                    }`}>
                                    {m.type}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1">{m.description}</p>
                            <div className="mt-2 text-[9px] text-slate-400 flex items-center gap-1">
                                <span>{m.subject} • Unit {m.unit}</span>
                                {m.visibility === 'global' && <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold">Global</span>}
                                {m.visibility === 'scoped' && <span className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">Dept Only</span>}
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`http://localhost:8110/api/files/material/${m._id}/answer-key?token=${localStorage.getItem('token')}`, '_blank');
                                        }}
                                        className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-600 hover:text-white transition-all"
                                        title="Download Sample Answer Key"
                                    >
                                        <i className="fas fa-key text-[10px]"></i>
                                    </button>
                                    {onViewResults && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onViewResults(m); }}
                                            className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-600 hover:text-white transition-all"
                                            title="View Results for this Material"
                                        >
                                            <i className="fas fa-chart-bar text-[10px]"></i>
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => handleDeleteMaterial(m._id, e)}
                                        className="p-1.5 bg-red-50 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-all"
                                        title="Delete Material"
                                    >
                                        <i className="fas fa-trash text-[10px]"></i>
                                    </button>
                                </div>
                                <i className="fas fa-eye text-indigo-400 opacity-0 group-hover:opacity-100 text-[10px]"></i>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedMaterial && (
                <MaterialViewer
                    material={selectedMaterial}
                    onClose={() => setSelectedMaterial(null)}
                />
            )}
        </div>
    );
};

export default MaterialUpload;
