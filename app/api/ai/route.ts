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

        if (!data) {
            return NextResponse.json({ error: 'Missing data payload' }, { status: 400 })
        }

        let result
        let inputContext = ''

        switch (type) {
            case 'suggestions':
                // Get user's connection count
                const { count } = await supabase
                    .from('connections')
                    .select('*', { count: 'exact', head: true })
                    .or(`user_id.eq.${user.id},admin_id.eq.${user.id}`)
                    .eq('status', 'accepted')

                inputContext = `Connections: ${count || 0}`
                result = await generateAISuggestions({
                    name: user.user_metadata?.name,
                    email: user.email!,
                    connections: count || 0
                })
                break

            case 'summary':
                inputContext = `Role: ${data.role || 'Not specified'}`
                result = await generateProfileSummary({
                    name: data.name || user.user_metadata?.name,
                    email: user.email!,
                    role: data.role
                })
                break

            case 'replies':
                if (!data.lastMessage) {
                    return NextResponse.json({ result: [] }) // Return empty if no message
                }
                inputContext = `Message: ${data.lastMessage.substring(0, 50)}...`
                result = await generateSmartReplies(data.lastMessage)
                break

            default:
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
        }

        // Log interaction to database (Fire and forget to not block response)
        // We use JSON.stringify for array results (like replies)
        const resultText = Array.isArray(result) ? JSON.stringify(result) : result

        await supabase.from('ai_interactions').insert({
            user_id: user.id,
            feature_type: type,
            input_context: inputContext,
            output_result: resultText
        })

        return NextResponse.json({ result })
    } catch (error) {
        console.error('AI API error:', error)
        return NextResponse.json(
            { error: 'Failed to generate AI response' },
            { status: 500 }
        )
    }
}
