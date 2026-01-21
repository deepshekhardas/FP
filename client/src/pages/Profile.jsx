import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Activity, Dumbbell, Calendar, Crown, ChevronRight } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');

    // Update local state when user data loads
    if (user?.name && editName === '') setEditName(user.name);

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        // Here you would typically call an API to update the user
        // For now, we'll just close the modal as a visual confirmation
        setIsEditing(false);
        alert("Profile updated! (This is a simplified demo)");
    };

    const stats = [
        { name: 'Total Workouts', value: '0', icon: Activity, color: 'text-green-400', bg: 'bg-green-500/10' },
        { name: 'Active Streak', value: '3 Days', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        { name: 'Plan Status', value: 'Active', icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-slate-400">Welcome back, <span className="text-white font-semibold">{user?.name}</span>. Let's crush some goals today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {stats.map((stat, idx) => (
                    <div key={idx} className="glass-card p-6 rounded-2xl flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">{stat.name}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Activity Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-white">Recent Activity</h2>

                    {/* Placeholder Empty State */}
                    <div className="glass-card p-8 rounded-3xl text-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Dumbbell className="text-slate-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No workouts logged yet</h3>
                        <p className="text-slate-400 mb-6 max-w-sm mx-auto">Start your journey by generating a plan or logging your first session.</p>
                        <button className="btn-gradient px-6 py-2 rounded-full text-sm">
                            Start Workout
                        </button>
                    </div>
                </div>

                {/* Right Column: Profile Card */}
                <div className="glass-card p-6 rounded-3xl h-fit">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">{user?.name}</h3>
                            <p className="text-slate-400 text-sm">{user?.email}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div
                            onClick={() => setIsEditing(true)}
                            className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group"
                        >
                            <span className="text-slate-300">Edit Profile</span>
                            <ChevronRight size={16} className="text-slate-500 group-hover:text-white" />
                        </div>
                        <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group">
                            <span className="text-slate-300">Subscription</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Free</span>
                                <ChevronRight size={16} className="text-slate-500 group-hover:text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass-card w-full max-w-md p-6 rounded-3xl relative">
                        <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Full Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="input-dark w-full px-4 py-2 rounded-xl focus:outline-none"
                                />
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-gradient flex-1 py-2 rounded-xl font-bold"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Quick Fix since Zap is used but not imported in top definition
import { Zap } from 'lucide-react';

export default Profile;
