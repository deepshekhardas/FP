import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/AdminDashboard'
import UserProfile from '@/components/UserProfile'

export default async function Dashboard() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user profile to get role
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    // Hardcoded Super Admin check (as requested)
    const isSuperAdmin = user.email === 'deepshekhardas1234@gmail.com'

    // Or use the role from the database if you prefer
    const isAdmin = isSuperAdmin || profile?.role === 'admin'

    return (
        <div className="min-h-screen bg-[#030712]">
            <nav className="bg-black/30 shadow-sm border-b border-white/10 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Networking App</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <form action="/auth/signout" method="post">
                                <button type="submit" className="text-gray-300 hover:text-white transition-colors">Sign out</button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {isAdmin ? (
                        <AdminDashboard user={user} />
                    ) : (
                        <UserProfile user={user} profile={profile} />
                    )}
                </div>
            </main>
        </div>
    )
}
