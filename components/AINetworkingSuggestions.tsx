'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'

export default function AINetworkingSuggestions({ userId }: { userId: string }) {
    const [suggestions, setSuggestions] = useState<string>('')
    const [loading, setLoading] = useState(false)

    async function getSuggestions() {
        setLoading(true)
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'suggestions' })
            })
            const data = await res.json()
            setSuggestions(data.result)
        } catch (error) {
            console.error('Error fetching suggestions:', error)
            setSuggestions('Unable to load suggestions. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">AI Networking Suggestions</h3>
                </div>
                <button
                    onClick={getSuggestions}
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{loading ? 'Generating...' : 'Get Suggestions'}</span>
                </button>
            </div>

            {suggestions ? (
                <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                    {suggestions}
                </div>
            ) : (
                <p className="text-gray-500 text-sm">Click "Get Suggestions" to discover connections powered by AI!</p>
            )}
        </motion.div>
    )
}
