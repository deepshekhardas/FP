'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

import AdminProfileCard from './AdminProfileCard'
import UpgradeButton from './UpgradeButton'
import AIProfileGenerator from './AIProfileGenerator'

export default function UserProfile({ user, profile }: { user: any; profile: any }) {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(profile?.name || '')
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
    const [message, setMessage] = useState<string | null>(null)

    async function updateProfile() {
        try {
            setLoading(true)
            setMessage(null)

            const { error } = await supabase
                .from('users')
                .update({
                    name,
                    avatar_url: avatarUrl,
                })
                .eq('id', user.id)

            if (error) throw error
            setMessage('Profile updated successfully!')
            router.refresh()
        } catch (error: any) {
            setMessage('Error updating profile: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden sm:rounded-2xl border border-white/10">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-white flex items-center">
                            User Profile
                            {profile?.is_premium && (
                                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
                                    Premium 🌟
                                </span>
                            )}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-400">Manage your personal information.</p>
                    </div>
                    <div className="flex space-x-3 items-center">
                        <AIProfileGenerator
                            currentSummary={profile?.bio}
                            onGenerated={(summary) => {
                                // We'll assume there's a bio field or append to name for now as demo
                                // Ideally we'd add a 'bio' column to users table
                                alert(`AI Generated Bio:\n\n${summary}\n\n(Copy this to your profile!)`)
                            }}
                        />
                        {!profile?.is_premium && <UpgradeButton currentUser={user} />}
                        <a href="/chat" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-all hover:scale-105">
                            Go to Messages
                        </a>
                    </div>
                </div>
                <div className="border-t border-white/10 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-white/10">
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-400">Email</dt>
                            <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{user.email}</dd>
                        </div>

                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-400">Full Name</dt>
                            <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 px-3 py-2"
                                    placeholder="Your Name"
                                />
                            </dd>
                        </div>

                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-400">Avatar URL</dt>
                            <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                                <input
                                    type="text"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 px-3 py-2"
                                    placeholder="https://example.com/avatar.jpg"
                                />
                            </dd>
                        </div>
                    </dl>
                </div>
                <div className="px-4 py-3 bg-white/5 text-right sm:px-6 border-t border-white/10">
                    {message && <span className="mr-4 text-sm text-green-400">{message}</span>}
                    <button
                        onClick={updateProfile}
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all hover:scale-105"
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            <AdminProfileCard />
        </div>
    )
}
