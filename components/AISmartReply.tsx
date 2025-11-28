'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export default function AISmartReply({
    lastMessage,
    onSelectReply
}: {
    lastMessage?: string
    onSelectReply: (reply: string) => void
}) {
    const [replies, setReplies] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (lastMessage && lastMessage.length > 5) {
            loadReplies()
        }
    }, [lastMessage])

    async function loadReplies() {
        setLoading(true)
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'replies',
                    data: { lastMessage }
                })
            })
            const data = await res.json()
            setReplies(data.result)
        } catch (error) {
            console.error('Error loading replies:', error)
            setReplies([])
        } finally {
            setLoading(false)
        }
    }

    if (!replies.length || loading) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 p-3 bg-white/5 border-t border-white/10"
        >
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Quick replies:</span>
            <div className="flex flex-wrap gap-2">
                {replies.map((reply, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelectReply(reply)}
                        className="px-3 py-1 text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-full border border-indigo-500/30 transition-all hover:scale-105"
                    >
                        {reply}
                    </button>
                ))}
            </div>
        </motion.div>
    )
}
