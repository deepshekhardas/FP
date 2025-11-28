'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

type Connection = {
    id: string
    user_id: string
    created_at: string
    connected_user: {
        name: string
        email: string
        avatar_url: string
    }
}

export default function NetworkList({ userId }: { userId: string }) {
    const supabase = createClient()
    const [connections, setConnections] = useState<Connection[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchConnections()
    }, [userId])

    async function fetchConnections() {
        const { data, error } = await supabase
            .from('connections')
            .select(`
                id,
                user_id,
                created_at,
                connected_user:users!connections_user_id_fkey (
                    name,
                    email,
                    avatar_url
                )
            `)
            .eq('admin_id', userId)
            .eq('status', 'accepted')

        if (error) {
            console.error('Error fetching network:', error)
        } else {
            // @ts-ignore
            setConnections(data || [])
        }
        setLoading(false)
    }

    if (loading) return <div className="text-gray-400 text-sm animate-pulse">Loading nodes...</div>

    if (connections.length === 0) {
        return <div className="text-gray-500 text-sm italic">Network empty. Initialize connections.</div>
    }

    return (
        <ul className="space-y-3">
            {connections.map((conn) => (
                <li key={conn.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <img
                            className="w-8 h-8 rounded-full border border-white/10"
                            src={conn.connected_user.avatar_url || `https://ui-avatars.com/api/?name=${conn.connected_user.name || 'User'}&background=random`}
                            alt=""
                        />
                        <div className="truncate">
                            <h3 className="text-white text-sm font-medium truncate">{conn.connected_user.name || 'User'}</h3>
                            <p className="text-gray-500 text-xs truncate">{conn.connected_user.email}</p>
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        <span className="w-2 h-2 rounded-full bg-green-500 block shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    </div>
                </li>
            ))}
        </ul>
    )
}
