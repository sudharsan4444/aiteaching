import React, { useState } from 'react';
import { mockMaterials } from '../mockData';

const MaterialLibrary = ({ user }) => {
    const [selectedSubject, setSelectedSubject] = useState('All');

    // Filter materials by student's subjects/department
    const relevantMaterials = mockMaterials.filter(m => {
        if (selectedSubject === 'All') {
            return m.department === user.department || user.subjects?.includes(m.subject);
        }
        return m.subject === selectedSubject;
    });

    const subjects = ['All', ...new Set(mockMaterials.filter(m =>
        m.department === user.department
    ).map(m => m.subject))];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Learning Materials</h1>
                <p className="text-slate-500">Video lectures, documents, and resources for your courses</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
                {subjects.map(subject => (
                    <button
                        key={subject}
                        onClick={() => setSelectedSubject(subject)}
                        className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${selectedSubject === subject
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                            }`}
                    >
                        {subject}
                    </button>
                ))}
            </div>

            {/* Materials Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relevantMaterials.length === 0 ? (
                    <div className="col-span-full bg-white p-12 rounded-2xl text-center border-2 border-dashed border-slate-200">
                        <i className="fas fa-inbox text-4xl text-slate-300 mb-3"></i>
                        <p className="text-slate-400">No materials available for this subject yet.</p>
                    </div>
                ) : (
                    relevantMaterials.map(material => (
                        <div
                            key={material._id}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all group"
                        >
                            {/* Thumbnail */}
                            <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
                                {material.type === 'video' ? (
                                    <>
                                        <img
                                            src={material.thumbnailUrl}
                                            alt={material.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="bg-white text-indigo-600 rounded-full p-4 shadow-lg hover:scale-110 transition-transform">
                                                <i className="fas fa-play text-2xl ml-1"></i>
                                            </button>
                                        </div>
                                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                            {material.duration}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <i className="fas fa-file-pdf text-6xl text-red-400"></i>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded">
                                        {material.subject}
                                    </span>
                                    <div className="flex items-center text-xs text-slate-400">
                                        <i className="fas fa-eye mr-1"></i>
                                        {material.views}
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2">
                                    {material.title}
                                </h3>

                                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                                    {material.description}
                                </p>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                            {material.uploadedByName.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-700">{material.uploadedByName}</p>
                                            <p className="text-xs text-slate-400">
                                                {new Date(material.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">
                                        {material.type === 'video' ? 'Watch' : 'Download'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MaterialLibrary;
