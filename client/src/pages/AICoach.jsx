import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Send, Dumbbell, MessageSquare, Loader, Sparkles, Crown } from 'lucide-react';

const AICoach = () => {
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'generate'

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 h-[calc(100vh-100px)]">
            <div className="glass-card rounded-3xl shadow-2xl overflow-hidden h-full flex flex-col border border-white/10">
                {/* Header Tabs */}
                <div className="flex border-b border-white/10 bg-black/20">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 py-4 text-center font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'chat'
                            ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                    >
                        <MessageSquare size={18} />
                        AI Chat Coach
                    </button>
                    <button
                        onClick={() => setActiveTab('generate')}
                        className={`flex-1 py-4 text-center font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'generate'
                            ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/5'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                    >
                        <Dumbbell size={18} />
                        Workout Generator
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
                    {activeTab === 'chat' ? <ChatInterface /> : <WorkoutGenerator />}
                </div>
            </div>
        </div>
    );
};

const ChatInterface = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I\'m your AI fitness coach. I can help with workouts, diet plans, or recovery advice. What\'s on your mind?' }
    ]);
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/ai/advice',
                { question: input },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const aiMsg = { role: 'assistant', content: res.data.advice || res.data.answer || "I couldn't generate a response." };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 relative z-10">
            <div className="flex-1 overflow-y-auto space-y-6 mb-4 pr-2 custom-scrollbar">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'glass bg-slate-800/80 text-slate-100 rounded-bl-none border border-slate-700'
                            }`}>
                            {msg.role === 'assistant' && (
                                <div className="flex items-center gap-2 mb-2 text-xs text-blue-300 font-semibold uppercase tracking-wider">
                                    <Sparkles size={12} /> AI Coach
                                </div>
                            )}
                            <div className="leading-relaxed whitespace-pre-line text-sm md:text-base">{msg.content}</div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800/50 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-3 border border-slate-700">
                            <Loader className="animate-spin text-blue-400" size={16} />
                            <span className="text-slate-400 text-sm">Thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="relative mt-auto">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    className="w-full pl-6 pr-14 py-4 rounded-full bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-lg placeholder-slate-500 transition-all"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-lg"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

const WorkoutGenerator = () => {
    const [formData, setFormData] = useState({
        goal: 'Muscle Gain',
        experience: 'Intermediate',
        duration: '45 mins',
        equipment: 'Gym'
    });
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPlan(null);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/ai/generate',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPlan(res.data.workout || res.data.plan);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-6 md:p-8 custom-scrollbar">
            {!plan ? (
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-10">
                        <h3 className="text-2xl font-bold text-white mb-2">Build Your Perfect Routine</h3>
                        <p className="text-slate-400">Tell us your preferences and let AI design the optimal plan.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Fitness Goal</label>
                                <select
                                    value={formData.goal}
                                    onChange={e => setFormData({ ...formData, goal: e.target.value })}
                                    className="input-dark w-full px-4 py-3 rounded-xl focus:outline-none"
                                >
                                    <option>Muscle Gain</option>
                                    <option>Weight Loss</option>
                                    <option>Endurance</option>
                                    <option>Flexibility</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Experience Level</label>
                                <select
                                    value={formData.experience}
                                    onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                    className="input-dark w-full px-4 py-3 rounded-xl focus:outline-none"
                                >
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Duration</label>
                                <select
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                    className="input-dark w-full px-4 py-3 rounded-xl focus:outline-none"
                                >
                                    <option>15 mins</option>
                                    <option>30 mins</option>
                                    <option>45 mins</option>
                                    <option>60+ mins</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Equipment</label>
                                <input
                                    type="text"
                                    value={formData.equipment}
                                    onChange={e => setFormData({ ...formData, equipment: e.target.value })}
                                    className="input-dark w-full px-4 py-3 rounded-xl focus:outline-none"
                                    placeholder="e.g. Dumbbells, Bodyweight"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-gradient w-full py-4 rounded-xl font-bold text-lg mt-8 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader className="animate-spin" size={20} /> Generating Plan...</>
                            ) : (
                                <><Sparkles size={20} /> Generate Plan</>
                            )}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Crown className="text-yellow-400" /> Your Pro Plan
                        </h3>
                        <button
                            onClick={() => setPlan(null)}
                            className="text-sm px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                        >
                            Start Over
                        </button>
                    </div>

                    <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 bg-black/40">
                        <div className="mb-8 border-b border-white/10 pb-6">
                            <h4 className="text-xl font-bold text-white mb-2">{plan.title}</h4>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">{plan.duration}</span>
                                <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20">{plan.level}</span>
                                <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">via {plan.generatedBy || 'AI'}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {plan.exercises && plan.exercises.map((item, idx) => (
                                <div key={idx} className="bg-white/5 p-4 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 hover:bg-white/10 transition-colors">
                                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                                        <Dumbbell className="text-blue-400" size={20} />
                                    </div>
                                    <div className="flex-grow">
                                        <h5 className="font-bold text-white text-lg">{item.exercise?.name || item.name}</h5>
                                        <p className="text-slate-400 text-sm">{item.exercise?.muscleGroup} • {item.exercise?.difficulty || 'General'}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm font-mono text-slate-300 bg-black/20 px-4 py-2 rounded-xl">
                                        <div className="text-center">
                                            <span className="block font-bold text-white">{item.sets}</span>
                                            <span className="text-xs text-slate-500">SETS</span>
                                        </div>
                                        <div className="w-px h-8 bg-white/10"></div>
                                        <div className="text-center">
                                            <span className="block font-bold text-white">{item.reps}</span>
                                            <span className="text-xs text-slate-500">REPS</span>
                                        </div>
                                        <div className="w-px h-8 bg-white/10"></div>
                                        <div className="text-center">
                                            <span className="block font-bold text-yellow-400">{item.rest}</span>
                                            <span className="text-xs text-slate-500">REST</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AICoach;
