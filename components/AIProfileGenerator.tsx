'use client'

import { useState } from 'react'
import { Wand2, Loader2 } from 'lucide-react'

export default function AIProfileGenerator({
    currentSummary,
    onGenerated
}: {
    currentSummary?: string
    onGenerated: (summary: string) => void
}) {
    const [loading, setLoading] = useState(false)

    async function generateSummary() {
        setLoading(true)
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'summary',
                    data: { role: 'Professional' }
                })
            })
            const data = await res.json()
            onGenerated(data.result)
        } catch (error) {
            console.error('Error generating summary:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={generateSummary}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-purple-500/30 text-sm font-medium rounded-xl text-purple-400 bg-purple-600/10 hover:bg-purple-600/20 transition-all disabled:opacity-50 space-x-2"
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                </>
            ) : (
                <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate AI Bio</span>
                </>
            )}
        </button>
    )
}
