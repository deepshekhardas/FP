import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Loader, Dumbbell, X, PlayCircle, Target, Trophy } from 'lucide-react';

const Exercises = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [selectedExercise, setSelectedExercise] = useState(null);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const res = await axios.get('/api/exercises');
                // Controller returns { exercises: [], page: X, pages: Y }
                setExercises(res.data.exercises || []);
            } catch (error) {
                console.error("Failed to fetch exercises", error);
                setExercises([]); // Fallback to empty array on error
            } finally {
                setLoading(false);
            }
        };
        fetchExercises();
    }, []);

    const safeExercises = Array.isArray(exercises) ? exercises : [];

    const filteredExercises = safeExercises.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || ex.muscleGroup === filter;
        return matchesSearch && matchesFilter;
    });

    const muscleGroups = ['All', ...new Set(safeExercises.map(ex => ex.muscleGroup).filter(Boolean))];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Exercise Library</h2>
                    <p className="text-slate-400">Master your form with our professional guide.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="input-dark w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border-slate-700 bg-slate-900/50 focus:bg-slate-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter */}
                    <div className="relative">
                        <select
                            className="appearance-none input-dark w-full sm:w-48 pl-4 pr-10 py-2.5 rounded-xl border-slate-700 bg-slate-900/50 cursor-pointer focus:bg-slate-900"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            {muscleGroups.map(group => (
                                <option key={group} value={group}>{group}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader className="animate-spin text-blue-500" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredExercises.length > 0 ? (
                        filteredExercises.map((exercise) => (
                            <div
                                key={exercise._id}
                                onClick={() => setSelectedExercise(exercise)}
                                className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 group cursor-pointer"
                            >
                                <div className="h-48 bg-slate-800 flex items-center justify-center relative overflow-hidden">
                                    {exercise.imageUrl ? (
                                        <img src={exercise.imageUrl} alt={exercise.name} className="h-full w-full object-cover group-hover:opacity-80 transition-opacity" />
                                    ) : (
                                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 w-full h-full flex items-center justify-center">
                                            <Dumbbell size={48} className="text-slate-700 group-hover:text-slate-600 transition-colors" />
                                        </div>
                                    )}
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <span className="bg-white/10 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md border border-white/20">View Details</span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-bold text-white line-clamp-1">{exercise.name}</h3>
                                        <span className="px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            {exercise.difficulty || 'Gen'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-6 line-clamp-2 h-10">{exercise.description}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                            Target
                                        </span>
                                        <span className="text-sm font-medium text-slate-300">
                                            {exercise.muscleGroup || 'Full Body'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 rounded-3xl border border-dashed border-slate-800">
                            <Dumbbell className="mx-auto h-12 w-12 text-slate-700 mb-4" />
                            <p className="text-slate-500 text-lg">No exercises match filters.</p>
                            <button
                                onClick={() => { setSearchTerm(''); setFilter('All'); }}
                                className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Exercise Detail Modal */}
            {selectedExercise && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedExercise(null)}>
                    <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedExercise(null)}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="h-64 sm:h-80 bg-slate-800 relative w-full">
                            {selectedExercise.imageUrl ? (
                                <img src={selectedExercise.imageUrl} alt={selectedExercise.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                    <Dumbbell size={64} className="text-slate-700" />
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 to-transparent h-32"></div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="flex gap-2 mb-2">
                                    <span className="px-2 py-1 rounded-md text-xs font-bold uppercase bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                                        {selectedExercise.muscleGroup}
                                    </span>
                                    <span className="px-2 py-1 rounded-md text-xs font-bold uppercase bg-purple-500 text-white shadow-lg shadow-purple-500/20">
                                        {selectedExercise.difficulty}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-bold text-white">{selectedExercise.name}</h2>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold text-blue-400 mb-2 flex items-center gap-2">
                                    <Target size={18} /> Description
                                </h3>
                                <p className="text-slate-300 leading-relaxed">{selectedExercise.description}</p>
                            </div>

                            {selectedExercise.instructions && (
                                <div>
                                    <h3 className="text-lg font-semibold text-purple-400 mb-2 flex items-center gap-2">
                                        <PlayCircle size={18} /> Instructions
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed whitespace-pre-line bg-white/5 p-4 rounded-xl border border-white/5">
                                        {selectedExercise.instructions}
                                    </p>
                                </div>
                            )}

                            {selectedExercise.equipment && (
                                <div>
                                    <h3 className="text-lg font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                                        <Trophy size={18} /> Equipment Needed
                                    </h3>
                                    <p className="text-slate-300">{selectedExercise.equipment}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Exercises;
