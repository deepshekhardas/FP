'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

type UserProfile = {
    id: string
    name: string
    email: string
    avatar_url: string
}

type Connection = {
    id: string
    user_id: string
    admin_id: string
    user: UserProfile
    admin: UserProfile
}

export default function CreateGroupModal({
    currentUser,
    onClose,
    onGroupCreated
}: {
    currentUser: any
    onClose: () => void
    onGroupCreated: () => void
}) {
    const supabase = createClient()
    const [groupName, setGroupName] = useState('')
    const [connections, setConnections] = useState<UserProfile[]>([])
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchConnections()
    }, [])

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
            .or(`user_id.eq.${currentUser.id},admin_id.eq.${currentUser.id}`)

        if (!error && data) {
            const profiles = data.map((conn: any) =>
                conn.user_id === currentUser.id ? conn.admin : conn.user
            )
            setConnections(profiles)
        }
    }

    async function handleCreateGroup(e: React.FormEvent) {
        e.preventDefault()
        if (!groupName.trim()) return

        setLoading(true)
        try {
            // 1. Create Group
            const { data: group, error: groupError } = await supabase
                .from('groups')
                .insert({
                    name: groupName,
                    admin_id: currentUser.id
                })
                .select()
                .single()

            if (groupError) throw groupError

            // 2. Add Members (Admin + Selected)
            const members = [
                { group_id: group.id, user_id: currentUser.id }, // Add Admin
                ...selectedMembers.map(uid => ({ group_id: group.id, user_id: uid }))
            ]

            const { error: memberError } = await supabase
                .from('group_members')
                .insert(members)

            if (memberError) throw memberError

            onGroupCreated()
            onClose()
        } catch (error) {
            console.error('Error creating group:', error)
            alert('Failed to create group')
        } finally {
            setLoading(false)
        }
    }

    const toggleMember = (userId: string) => {
        setSelectedMembers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Group</h3>

                <form onSubmit={handleCreateGroup}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Group Name</label>
                        <input
                            type="text"
                            required
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., Project Team"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Add Members</label>
                        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                            {connections.length === 0 ? (
                                <div className="p-2 text-sm text-gray-500">No connections available.</div>
                            ) : (
                                connections.map(user => (
                                    <div
                                        key={user.id}
                                        className={`flex items-center p-2 hover:bg-gray-50 cursor-pointer ${selectedMembers.includes(user.id) ? 'bg-indigo-50' : ''}`}
                                        onClick={() => toggleMember(user.id)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.includes(user.id)}
                                            readOnly
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <img className="h-8 w-8 rounded-full ml-3" src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}`} alt="" />
                                        <span className="ml-3 text-sm text-gray-900">{user.name || user.email}</span>
                                    </div>
                                ))
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{selectedMembers.length} members selected</p>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !groupName.trim()}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
