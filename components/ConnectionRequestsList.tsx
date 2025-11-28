'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

type Request = {
    id: string
    user_id: string
    created_at: string
    requester: {
        name: string
        email: string
        avatar_url: string
    }
}

export default function ConnectionRequestsList({ userId }: { userId: string }) {
    const supabase = createClient()
    const [requests, setRequests] = useState<Request[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRequests()
    }, [userId])

    async function fetchRequests() {
        const { data, error } = await supabase
            .from('connections')
            .select(`
                id,
                user_id,
                created_at,
                requester:users!connections_user_id_fkey (
                    name,
                    email,
                    avatar_url
                )
            `)
            .eq('admin_id', userId)
            .eq('status', 'pending')

        if (error) {
            console.error('Error fetching requests:', error)
        } else {
            // @ts-ignore
            setRequests(data || [])
        }
        setLoading(false)
    }

    async function handleAccept(id: string) {
        const { error } = await supabase
            .from('connections')
            .update({ status: 'accepted' })
            .eq('id', id)

        if (error) {
            console.error('Error accepting:', error)
        } else {
            setRequests(requests.filter(r => r.id !== id))
        }
    }

    async function handleReject(id: string) {
        const { error } = await supabase
            .from('connections')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error rejecting:', error)
        } else {
            setRequests(requests.filter(r => r.id !== id))
        }
    }

    if (loading) return <div className="text-gray-400 text-sm animate-pulse">Scanning frequencies...</div>

    if (requests.length === 0) {
        return <div className="text-gray-500 text-sm italic">No incoming signals.</div>
    }

    return (
        <ul className="divide-y divide-white/10">
            {requests.map((req) => (
                <li key={req.id} className="py-4 flex items-center justify-between group">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                            <div className="absolute inset-0 bg-indigo-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                            <img
                                className="h-10 w-10 rounded-full relative border border-white/10"
                                src={req.requester.avatar_url || `https://ui-avatars.com/api/?name=${req.requester.name || 'User'}&background=random`}
                                alt=""
                            />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-white">{req.requester.name || req.requester.email}</div>
                            <div className="text-xs text-gray-400">{req.requester.email}</div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleAccept(req.id)}
                            className="p-1.5 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-colors"
                            title="Accept"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </button>
                        <button
                            onClick={() => handleReject(req.id)}
                            className="p-1.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                            title="Reject"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    )
}
