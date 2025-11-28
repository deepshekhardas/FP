'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import CreateGroupModal from './CreateGroupModal'

type UserProfile = {
    id: string
    name: string
    email: string
    avatar_url: string
}

type Group = {
    id: string
    name: string
    admin_id: string
}

type Connection = {
    id: string
    user_id: string
    admin_id: string
    user: UserProfile
    admin: UserProfile
}

export default function ChatSidebar({
    currentUserId,
    onSelectUser,
    onSelectGroup,
    selectedId
}: {
    currentUserId: string
    onSelectUser: (user: UserProfile) => void
    onSelectGroup: (group: Group) => void
    selectedId: string | null
}) {
    const supabase = createClient()
    const [activeTab, setActiveTab] = useState<'dm' | 'groups'>('dm')
    const [connections, setConnections] = useState<Connection[]>([])
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateGroup, setShowCreateGroup] = useState(false)

    useEffect(() => {
        if (currentUserId) {
            fetchData()
        }
    }, [currentUserId, activeTab])

    async function fetchData() {
        setLoading(true)
        if (activeTab === 'dm') {
            await fetchConnections()
        } else {
            await fetchGroups()
        }
        setLoading(false)
    }

    async function fetchConnections() {
        const { data, error } = await supabase
            .from('connections')
            .select(`
                id,
                user_id,
                admin_id,
                user:users!connections_user_id_fkey (id, name, email, avatar_url),
                admin:users!connections_admin_id_fkey (id, name, email, avatar_url)
            `)
            .eq('status', 'accepted')
            .or(`user_id.eq.${currentUserId},admin_id.eq.${currentUserId}`)

        if (!error) {
            // @ts-ignore
            setConnections(data || [])
        }
    }

    async function fetchGroups() {
        const { data, error } = await supabase
            .from('group_members')
            .select(`
                group:groups (
                    id,
                    name,
                    admin_id
                )
            `)
            .eq('user_id', currentUserId)

        if (!error && data) {
            // @ts-ignore
            const groupList = data.map((item: any) => Array.isArray(item.group) ? item.group[0] : item.group) as Group[]
            setGroups(groupList)
        }
    }

    return (
        <div className="flex flex-col h-full bg-[#030712] border-r border-white/10">
            {/* Header & Tabs */}
            <div className="p-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
                <div className="flex space-x-2 bg-white/5 p-1 rounded-xl backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('dm')}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'dm' ? 'bg-indigo-600 shadow-lg text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Direct
                    </button>
                    <button
                        onClick={() => setActiveTab('groups')}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'groups' ? 'bg-indigo-600 shadow-lg text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Groups
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-gray-400 text-center text-sm">Loading...</div>
                ) : activeTab === 'dm' ? (
                    <ul className="py-2">
                        {connections.length === 0 ? (
                            <div className="p-6 text-gray-500 text-sm text-center">No connections yet.</div>
                        ) : (
                            connections.map((conn) => {
                                const otherUser = conn.user_id === currentUserId ? conn.admin : conn.user
                                const isSelected = selectedId === otherUser.id
                                return (
                                    <motion.li
                                        key={conn.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={() => onSelectUser(otherUser)}
                                        className={`mx-2 mb-1 p-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3 rounded-xl transition-all ${isSelected ? 'bg-indigo-600/20 border border-indigo-500/30' : ''}`}
                                    >
                                        <div className="relative">
                                            <img
                                                className="h-12 w-12 rounded-full border-2 border-white/10"
                                                src={otherUser.avatar_url || `https://ui-avatars.com/api/?name=${otherUser.name}&background=random`}
                                                alt=""
                                            />
                                            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-[#030712]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">{otherUser.name || otherUser.email}</p>
                                            <p className="text-xs text-gray-400 truncate">Online</p>
                                        </div>
                                    </motion.li>
                                )
                            })
                        )}
                    </ul>
                ) : (
                    <div className="flex flex-col h-full">
                        <ul className="flex-1 py-2">
                            {groups.length === 0 ? (
                                <div className="p-6 text-gray-500 text-sm text-center">No groups yet.</div>
                            ) : (
                                groups.map((group) => {
                                    const isSelected = selectedId === group.id
                                    return (
                                        <motion.li
                                            key={group.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            onClick={() => onSelectGroup(group)}
                                            className={`mx-2 mb-1 p-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3 rounded-xl transition-all ${isSelected ? 'bg-indigo-600/20 border border-indigo-500/30' : ''}`}
                                        >
                                            <div className="h-12 w-12 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xl">
                                                {group.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{group.name}</p>
                                                <p className="text-xs text-gray-400">Group Chat</p>
                                            </div>
                                        </motion.li>
                                    )
                                })
                            )}
                        </ul>
                        <div className="p-4 border-t border-white/10">
                            <button
                                onClick={() => setShowCreateGroup(true)}
                                className="w-full flex justify-center items-center px-4 py-3 border border-indigo-500/30 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 transition-all hover:scale-105"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Group
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showCreateGroup && (
                <CreateGroupModal
                    currentUser={{ id: currentUserId }}
                    onClose={() => setShowCreateGroup(false)}
                    onGroupCreated={() => {
                        fetchGroups()
                        setActiveTab('groups')
                    }}
                />
            )}
        </div>
    )
}
