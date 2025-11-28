'use client'

import { motion } from 'framer-motion'
import CosmicBackground from './ui/CosmicBackground'
import GlassCard from './ui/GlassCard'
import ConnectionRequestsList from './ConnectionRequestsList'
import NetworkList from './NetworkList'

export default function AdminDashboard({ user }: { user: any }) {
    return (
        <div className="relative min-h-screen text-white font-sans selection:bg-indigo-500/30">
            <CosmicBackground />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex justify-between items-end mb-12"
                >
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Dashboard
                        </h1>
                        <p className="mt-2 text-gray-400">Welcome back, {user.name || 'Commander'}</p>
                    </div>
                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href="/chat"
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 transition-all"
                    >
                        Launch Comms 🚀
                    </motion.a>
                </motion.div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Profile Card (Tall) */}
                    <GlassCard className="md:col-span-1 md:row-span-2 flex flex-col items-center text-center" delay={0.1}>
                        <div className="relative w-32 h-32 mb-6">
                            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                            <img
                                src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                                alt="Profile"
                                className="relative w-full h-full rounded-full border-2 border-white/10 shadow-2xl"
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">{user.email}</h2>
                        <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/20">
                            Super Admin
                        </span>

                        <div className="mt-8 w-full space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                <span className="text-gray-400">Status</span>
                                <span className="text-green-400 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    Online
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                <span className="text-gray-400">Plan</span>
                                <span className="text-yellow-400">Premium 🌟</span>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Stats Cards (Wide) */}
                    <GlassCard className="md:col-span-2" delay={0.2}>
                        <h3 className="text-lg font-medium text-gray-300 mb-4">Network Overview</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="text-3xl font-bold text-indigo-400">128</div>
                                <div className="text-sm text-gray-500">Total Connections</div>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="text-3xl font-bold text-purple-400">45</div>
                                <div className="text-sm text-gray-500">New Requests</div>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="text-3xl font-bold text-blue-400">12</div>
                                <div className="text-sm text-gray-500">Active Groups</div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* New Requests (Medium) */}
                    <GlassCard className="md:col-span-1" delay={0.3}>
                        <h3 className="text-lg font-medium text-gray-300 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            Incoming Signals
                        </h3>
                        <div className="overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                            <ConnectionRequestsList userId={user.id} />
                        </div>
                    </GlassCard>

                    {/* My Network (Medium) */}
                    <GlassCard className="md:col-span-1" delay={0.4}>
                        <h3 className="text-lg font-medium text-gray-300 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Active Nodes
                        </h3>
                        <div className="overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                            <NetworkList userId={user.id} />
                        </div>
                    </GlassCard>

                </div>
            </div>
        </div>
    )
}
