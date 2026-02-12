import React, { useState } from 'react';
import { mockMaterials } from '../mockData';

const MaterialUpload = ({ user }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        type: 'video',
        url: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Material uploaded successfully! (Mock mode - not saved to database)');
        setFormData({ title: '', description: '', subject: '', type: 'video', url: '' });
    };

    // Filter materials uploaded by this teacher
    const teacherMaterials = mockMaterials.filter(m => m.uploadedBy === user._id);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Upload Learning Material</h2>
                <p className="text-slate-500">Share resources with your students</p>
            </div>

            {/* Upload Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                placeholder="e.g., Introduction to React Hooks"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Subject
                            </label>
                            <select
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                required
                            >
                                <option value="">Select subject...</option>
                                {user.subjects?.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            rows="3"
                            placeholder="Describe what students will learn..."
                            required
                        ></textarea>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Type
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            >
                                <option value="video">Video</option>
                                <option value="pdf">PDF Document</option>
                                <option value="link">External Link</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                URL
                            </label>
                            <input
                                type="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                placeholder="https://..."
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        <i className="fas fa-upload mr-2"></i>
                        Upload Material
                    </button>
                </form>
            </div>

            {/* My Materials */}
            <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">My Uploaded Materials</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {teacherMaterials.length === 0 ? (
                        <div className="col-span-2 bg-white p-8 rounded-2xl text-center border-2 border-dashed border-slate-200">
                            <i className="fas fa-folder-open text-4xl text-slate-300 mb-2"></i>
                            <p className="text-slate-400">No materials uploaded yet</p>
                        </div>
                    ) : (
                        teacherMaterials.map(material => (
                            <div key={material._id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-bold text-slate-800">{material.title}</h4>
                                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-semibold">
                                        {material.subject}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 mb-3">{material.description}</p>
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span><i className="fas fa-eye mr-1"></i> {material.views} views</span>
                                    <span>{new Date(material.uploadedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MaterialUpload;
