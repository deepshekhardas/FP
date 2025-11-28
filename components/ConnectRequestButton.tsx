'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function ConnectRequestButton({ targetUserId }: { targetUserId: string }) {
    const supabase = createClient()
    const [status, setStatus] = useState<'none' | 'pending' | 'accepted'>('none')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkStatus()
    }, [targetUserId])

    async function checkStatus() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('connections')
            .select('status')
            .or(`and(user_id.eq.${user.id},admin_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},admin_id.eq.${user.id})`)
            .single()

        if (data) {
            setStatus(data.status)
        } else {
            setStatus('none')
        }
        setLoading(false)
    }

    async function sendRequest() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('connections')
            .insert({
                user_id: user.id,
                admin_id: targetUserId,
                status: 'pending'
            })

        if (error) {
            console.error('Error sending request:', error)
            alert('Failed to send request')
        } else {
            setStatus('pending')
        }
        setLoading(false)
    }

    if (loading) return <span className="text-gray-400 text-sm">Loading...</span>

    if (status === 'accepted') {
        return <span className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600">Connected</span>
    }

    if (status === 'pending') {
        return <span className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-yellow-500">Request Sent</span>
    }

    return (
        <button
            onClick={sendRequest}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
            Request to Connect
        </button>
    )
}
