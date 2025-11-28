import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { generateAISuggestions, generateProfileSummary, generateSmartReplies } from '@/lib/gemini'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { type, data } = body

        let result

        switch (type) {
            case 'suggestions':
                // Get user's connection count
                const { count } = await supabase
                    .from('connections')
                    .select('*', { count: 'exact', head: true })
                    .or(`user_id.eq.${user.id},admin_id.eq.${user.id}`)
                    .eq('status', 'accepted')

                result = await generateAISuggestions({
                    name: user.user_metadata?.name,
                    email: user.email!,
                    connections: count || 0
                })
                break

            case 'summary':
                result = await generateProfileSummary({
                    name: data.name || user.user_metadata?.name,
                    email: user.email!,
                    role: data.role
                })
                break

            case 'replies':
                result = await generateSmartReplies(data.lastMessage)
                break

            default:
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
        }

        return NextResponse.json({ result })
    } catch (error) {
        console.error('AI API error:', error)
        return NextResponse.json(
            { error: 'Failed to generate AI response' },
            { status: 500 }
        )
    }
}
