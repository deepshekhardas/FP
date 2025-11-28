'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import ConnectRequestButton from './ConnectRequestButton'

export default function AdminProfileCard() {
    const supabase = createClient()
    const [admin, setAdmin] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAdmin()
    }, [])

    async function fetchAdmin() {
        // Fetch the user with role 'admin'
        // Note: You might need to adjust this if you have multiple admins or use email
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'admin')
            .single()

        if (error) {
            console.error('Error fetching admin:', error)
            // Fallback: try fetching by specific email if role isn't set yet
            // const { data: fallbackData } = await supabase.from('users').select('*').eq('email', 'your-email@example.com').single()
            // setAdmin(fallbackData)
        } else {
            setAdmin(data)
        }
        setLoading(false)
    }

    if (loading) return <div>Loading community leader...</div>

    if (!admin) {
        return (
            <div className="bg-white shadow sm:rounded-lg p-6">
                <p className="text-gray-500">No community leader found.</p>
            </div>
        )
    }

    return (
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Community Leader</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Connect with the admin to join the network.</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="flex items-center space-x-4">
                    <img
                        className="h-12 w-12 rounded-full"
                        src={admin.avatar_url || `https://ui-avatars.com/api/?name=${admin.name || 'Admin'}`}
                        alt=""
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {admin.name || 'Admin'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                            {admin.email}
                        </p>
                    </div>
                    <div>
                        <ConnectRequestButton targetUserId={admin.id} />
                    </div>
                </div>
            </div>
        </div>
    )
}
