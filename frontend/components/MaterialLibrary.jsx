import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

export const MaterialViewer = ({ material, onClose }) => {
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11)
            ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
            : null;
    };

    const isYouTube = material.type === 'VIDEO' && (material.url.includes('youtube.com') || material.url.includes('youtu.be'));
    const embedUrl = isYouTube ? getYouTubeEmbedUrl(material.url) : null;
    const fileUrl = material.url.startsWith('http') ? material.url : `http://localhost:8110${material.url}`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-300">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-all z-[110] bg-white/10 p-3 rounded-full hover:bg-white/20"
            >
                <i className="fas fa-times text-2xl"></i>
            </button>

            <div className="w-full h-full max-w-6xl max-h-[90vh] flex flex-col p-4 md:p-6">
                <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative border border-white/10">
                    {material.type === 'VIDEO' ? (
                        isYouTube && embedUrl ? (
                            <iframe
                                src={embedUrl}
                                title={material.title}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <video
                                src={fileUrl}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                            ></video>
                        )
                    ) : (
                        <iframe
                            src={fileUrl}
                            title={material.title}
                            className="w-full h-full bg-white"
                        ></iframe>
                    )}
                </div>

                <div className="mt-6 text-white space-y-2">
                    <div className="flex items-center space-x-3">
                        <span className="bg-indigo-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">
                            {material.subject}
                        </span>
                        <span className="text-white/40 text-xs">•</span>
                        <span className="text-white/40 text-xs text-indigo-300">
                            {material.uploadedBy?.name || 'Instructor'}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold">{material.title}</h2>
                    <p className="text-white/60 text-xs max-w-3xl line-clamp-2 italic">
                        {material.description}
                    </p>
                </div>
            </div>
        </div>
    );
};

const MaterialCard = ({ material, onClick }) => (
    <div
        onClick={() => onClick(material)}
        className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl hover:border-indigo-400 transition-all group cursor-pointer flex flex-col min-h-[16rem]"
    >
        <div className="relative h-40 bg-slate-900 flex items-center justify-center overflow-hidden">
            <div className="absolute top-2 right-2 z-20">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${material.type === 'VIDEO' ? 'bg-amber-400 text-amber-950' : 'bg-rose-500 text-white'}`}>
                    {material.type}
                </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 group-hover:bg-indigo-600/20 transition-all duration-300"></div>
            <div className="opacity-20 group-hover:opacity-40 transition-opacity">
                <i className={`fas ${material.type === 'VIDEO' ? 'fa-play-circle' : 'fa-file-pdf'} text-4xl text-white`}></i>
            </div>
        </div>
        <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {material.title}
                </h3>
                <div className="flex items-center text-[10px] text-slate-400 mb-2 italic">
                    <i className="fas fa-user-tie mr-1 text-[8px]"></i>
                    {material.uploadedBy?.name || 'Unknown'}
                </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="text-[9px] text-slate-400">Unit {material.unit}</div>
                <div className="text-indigo-600 group-hover:translate-x-1 transition-transform">
                    <i className="fas fa-chevron-right text-[10px]"></i>
                </div>
            </div>
        </div>
    </div>
);

const MaterialLibrary = ({ user }) => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [search, setSearch] = useState('');
    const [collapsedDepts, setCollapsedDepts] = useState({});

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const res = await api.get('/upload');
                setMaterials(res.data);
            } catch (err) {
                console.error('Error fetching materials:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, []);

    // Filter by search query
    const filtered = useMemo(() => {
        if (!search.trim()) return materials;
        const q = search.toLowerCase();
        return materials.filter(m =>
            m.title?.toLowerCase().includes(q) ||
            m.subject?.toLowerCase().includes(q) ||
            m.department?.toLowerCase().includes(q)
        );
    }, [materials, search]);

    // Group: department → subject → [materials]
    const grouped = useMemo(() => {
        const map = {};
        filtered.forEach(m => {
            const dept = m.department || 'General';
            const subj = m.subject || 'Uncategorized';
            if (!map[dept]) map[dept] = {};
            if (!map[dept][subj]) map[dept][subj] = [];
            map[dept][subj].push(m);
        });
        return map;
    }, [filtered]);

    const toggleDept = (dept) => {
        setCollapsedDepts(prev => ({ ...prev, [dept]: !prev[dept] }));
    };

    const deptNames = Object.keys(grouped).sort();

    if (loading) return <div className="p-8 text-center text-slate-500 text-sm">Loading materials...</div>;

    return (
        <div className="space-y-6">
            {/* Header + Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Learning Library</h1>
                    <p className="text-slate-500">Educational resources grouped by department and subject</p>
                </div>
                <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input
                        type="text"
                        placeholder="Search materials..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all w-64"
                    />
                </div>
            </div>

            {/* Department Groups */}
            {deptNames.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl text-center border-2 border-dashed border-slate-100">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-folder-open text-2xl text-slate-300"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">No materials found</h3>
                    <p className="text-slate-400 text-sm">No resources available for this search. Try a different keyword.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {deptNames.map(dept => {
                        const isCollapsed = collapsedDepts[dept];
                        const subjects = grouped[dept];
                        const totalCount = Object.values(subjects).reduce((sum, arr) => sum + arr.length, 0);
                        // Highlight the student's own department
                        const isMyDept = user?.department && dept.toLowerCase() === user.department.toLowerCase();

                        return (
                            <div key={dept} className={`rounded-2xl border-2 overflow-hidden transition-all ${isMyDept ? 'border-indigo-300 shadow-md shadow-indigo-100' : 'border-slate-200'
                                }`}>
                                {/* Department Header (clickable to collapse/expand) */}
                                <button
                                    onClick={() => toggleDept(dept)}
                                    className={`w-full flex items-center justify-between p-5 text-left transition-colors ${isMyDept ? 'bg-indigo-50 hover:bg-indigo-100' : 'bg-slate-50 hover:bg-slate-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMyDept ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                            <i className="fas fa-building text-sm"></i>
                                        </div>
                                        <div>
                                            <h2 className={`font-bold text-lg ${isMyDept ? 'text-indigo-800' : 'text-slate-800'}`}>
                                                {dept}
                                                {isMyDept && (
                                                    <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-semibold">My Dept</span>
                                                )}
                                            </h2>
                                            <p className="text-xs text-slate-500">
                                                {Object.keys(subjects).length} subject{Object.keys(subjects).length !== 1 ? 's' : ''} • {totalCount} material{totalCount !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <i className={`fas fa-chevron-${isCollapsed ? 'down' : 'up'} text-slate-400`}></i>
                                </button>

                                {/* Subjects & Cards (expandable) */}
                                {!isCollapsed && (
                                    <div className="p-5 space-y-8 bg-white">
                                        {Object.keys(subjects).sort().map(subj => (
                                            <div key={subj}>
                                                {/* Subject Sub-header */}
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="h-px flex-1 bg-slate-100"></div>
                                                    <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                        <i className="fas fa-book-open text-[10px]"></i>
                                                        {subj}
                                                        <span className="bg-indigo-200 text-indigo-800 px-1.5 rounded-full">{subjects[subj].length}</span>
                                                    </span>
                                                    <div className="h-px flex-1 bg-slate-100"></div>
                                                </div>
                                                {/* Material Cards Grid */}
                                                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                    {subjects[subj].map(material => (
                                                        <MaterialCard
                                                            key={material._id}
                                                            material={material}
                                                            onClick={setSelectedMaterial}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Material Viewer Modal */}
            {selectedMaterial && (
                <MaterialViewer
                    material={selectedMaterial}
                    onClose={() => setSelectedMaterial(null)}
                />
            )}
        </div>
    );
};

export default MaterialLibrary;
