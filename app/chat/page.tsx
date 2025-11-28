import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ChatLayout from '@/components/ChatLayout'

export default async function ChatPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <a href="/dashboard" className="text-xl font-bold text-indigo-600">
                                    Networking App
                                </a>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <a href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Dashboard
                                </a>
                                <a href="/chat" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Messages
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-700 text-sm mr-4">{user.email}</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6">
                <ChatLayout currentUser={user} />
            </main>
        </div>
    )
}
