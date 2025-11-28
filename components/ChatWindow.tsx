'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { AnimatePresence, motion } from 'framer-motion'
import VideoCall from './VideoCall'
import AISmartReply from './AISmartReply'

type UserProfile = {
    id: string
    name: string
    email: string
    avatar_url: string
}

type Group = {
    id: string
    name: string
    admin_id: string
}

type Message = {
    id: string
    sender_id: string
    receiver_id: string | null
    group_id: string | null
    content: string
    message_type: 'text' | 'image' | 'file'
    is_public: boolean
    created_at: string
    sender?: UserProfile
}

export default function ChatWindow({
    currentUser,
    selectedUser,
    selectedGroup
}: {
    currentUser: any
    selectedUser: UserProfile | null
    selectedGroup: Group | null
}) {
    const supabase = createClient()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isPublic, setIsPublic] = useState(false)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Video Call State
    const [isCallActive, setIsCallActive] = useState(false)
    const [incomingCall, setIncomingCall] = useState(false)
    const [isInitiator, setIsInitiator] = useState(false)
    const [callRoomId, setCallRoomId] = useState<string | null>(null)

    useEffect(() => {
        if (currentUser && (selectedUser || selectedGroup)) {
            fetchMessages()
            const channel = subscribeToMessages()

            let callChannel: any = null
            if (selectedUser && !selectedGroup) {
                const roomId = `room:${[currentUser.id, selectedUser.id].sort().join('_')}`
                setCallRoomId(roomId)

                callChannel = supabase.channel(roomId)
                callChannel
                    .on('broadcast', { event: 'call-started' }, (payload: any) => {
                        if (payload.payload.senderId !== currentUser.id) {
                            setIncomingCall(true)
                        }
                    })
                    .subscribe()
            }

            return () => {
                supabase.removeChannel(channel)
                if (callChannel) supabase.removeChannel(callChannel)
            }
        }
    }, [currentUser, selectedUser, selectedGroup])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    async function fetchMessages() {
        setLoading(true)
        let query = supabase
            .from('messages')
            .select('*, sender:users!messages_sender_id_fkey(name, avatar_url)')
            .order('created_at', { ascending: true })

        if (selectedGroup) {
            query = query.eq('group_id', selectedGroup.id)
        } else if (selectedUser) {
            query = query.or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching messages:', error)
        } else {
            // @ts-ignore
            setMessages(data || [])
        }
        setLoading(false)
    }

    function subscribeToMessages() {
        const channelId = selectedGroup ? `group:${selectedGroup.id}` : `dm:${currentUser.id}:${selectedUser?.id}`

        const channel = supabase
            .channel(channelId)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: selectedGroup ? `group_id=eq.${selectedGroup.id}` : undefined
                },
                async (payload) => {
                    const newMsg = payload.new as Message

                    if (!selectedGroup && selectedUser) {
                        const isRelevant =
                            (newMsg.sender_id === selectedUser.id && newMsg.receiver_id === currentUser.id) ||
                            (newMsg.sender_id === currentUser.id && newMsg.receiver_id === selectedUser.id)

                        if (!isRelevant) return
                    }

                    if (selectedGroup && newMsg.sender_id !== currentUser.id) {
                        const { data } = await supabase.from('users').select('name, avatar_url').eq('id', newMsg.sender_id).single()
                        if (data) newMsg.sender = data as any
                    }

                    setMessages((prev) => {
                        if (prev.find(m => m.id === newMsg.id)) return prev
                        return [...prev, newMsg]
                    })
                }
            )
            .subscribe()

        return channel
    }

    async function sendMessage(e?: React.FormEvent, fileUrl?: string, type: 'text' | 'image' = 'text') {
        if (e) e.preventDefault()

        const content = fileUrl || newMessage.trim()
        if (!content) return

        if (!fileUrl) setNewMessage('')

        const payload: any = {
            sender_id: currentUser.id,
            content: content,
            message_type: type,
            is_public: isPublic
        }

        if (selectedGroup) {
            payload.group_id = selectedGroup.id
        } else if (selectedUser) {
            payload.receiver_id = selectedUser.id
        }

        const { error } = await supabase
            .from('messages')
            .insert(payload)

        if (error) {
            console.error('Error sending message:', error)
        }
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        setUploading(true)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${currentUser.id}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('chat-files')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('chat-files')
                .getPublicUrl(filePath)

            await sendMessage(undefined, publicUrl, 'image')
        } catch (error) {
            console.error('Error uploading file:', error)
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const startCall = async () => {
        if (!callRoomId) return
        setIsInitiator(true)
        setIsCallActive(true)

        const channel = supabase.channel(callRoomId)
        channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                channel.send({
                    type: 'broadcast',
                    event: 'call-started',
                    payload: { senderId: currentUser.id }
                })
            }
        })
    }

    const acceptCall = () => {
        setIncomingCall(false)
        setIsInitiator(false)
        setIsCallActive(true)
    }

    const endCall = () => {
        setIsCallActive(false)
        setIncomingCall(false)
        setIsInitiator(false)
    }

    const targetName = selectedGroup ? selectedGroup.name : selectedUser?.name || selectedUser?.email
    const targetAvatar = selectedGroup
        ? `https://ui-avatars.com/api/?name=${selectedGroup.name}&background=random`
        : selectedUser?.avatar_url || `https://ui-avatars.com/api/?name=${selectedUser?.name || 'User'}`

    return (
        <div className="flex flex-col h-full bg-[#030712] relative text-white">
            {/* Header */}
            <div className="p-4 bg-white/5 backdrop-blur-xl border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <img
                            className="h-12 w-12 rounded-full border-2 border-white/10"
                            src={targetAvatar}
                            alt=""
                        />
                        {selectedUser && (
                            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-[#030712]" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{targetName}</h3>
                        {selectedGroup && <p className="text-xs text-gray-400">Group Chat · 8 members</p>}
                        {selectedUser && <p className="text-xs text-green-400">Online</p>}
                    </div>
                </div>

                {selectedUser && !selectedGroup && (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={startCall}
                            className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-all hover:scale-105"
                            title="Start Video Call"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <button
                            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all"
                            title="Voice Call"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Incoming Call Modal */}
            <AnimatePresence>
                {incomingCall && !isCallActive && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-white/20 z-40 flex items-center space-x-4"
                    >
                        <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                        <div>
                            <p className="font-semibold text-white">Incoming Call...</p>
                            <p className="text-xs text-gray-300">{targetName} is calling you</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={acceptCall}
                                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => setIncomingCall(false)}
                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-500"
                            >
                                Decline
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Video Call Overlay */}
            {isCallActive && callRoomId && selectedUser && (
                <VideoCall
                    roomId={callRoomId}
                    currentUser={currentUser}
                    targetUser={selectedUser}
                    isInitiator={isInitiator}
                    onEndCall={endCall}
                />
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loading ? (
                    <div className="text-center text-gray-400 mt-10">Loading conversation...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        <p className="text-lg">No messages yet.</p>
                        <p className="text-sm mt-2">Start the conversation! 👋</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {messages.map((msg, index) => {
                            const isMe = msg.sender_id === currentUser.id
                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[70%]`}>
                                        {!isMe && (
                                            <img
                                                src={msg.sender?.avatar_url || `https://ui-avatars.com/api/?name=${msg.sender?.name || 'User'}`}
                                                className="w-8 h-8 rounded-full border border-white/10"
                                                alt=""
                                            />
                                        )}
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            {selectedGroup && !isMe && (
                                                <span className="text-xs text-gray-400 mb-1 ml-2">{msg.sender?.name || 'Unknown'}</span>
                                            )}
                                            <div className={`px-4 py-3 rounded-2xl ${isMe
                                                ? 'bg-indigo-600 text-white rounded-br-md'
                                                : 'bg-white/5 text-white rounded-bl-md border border-white/10'
                                                }`}>
                                                {msg.message_type === 'image' ? (
                                                    <img
                                                        src={msg.content}
                                                        alt="Shared image"
                                                        className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => window.open(msg.content, '_blank')}
                                                    />
                                                ) : (
                                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                                )}
                                                <div className={`text-xs mt-1.5 ${isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {msg.is_public && <span className="ml-2" title="Public">👁️</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white/5 backdrop-blur-xl border-t border-white/10">
                <AISmartReply
                    lastMessage={messages[messages.length - 1]?.content}
                    onSelectReply={(reply) => setNewMessage(reply)}
                />
                <div className="p-4">
                    <form onSubmit={(e) => sendMessage(e)} className="space-y-3">
                        {!selectedGroup && (
                            <div className="flex items-center">
                                <input
                                    id="public-toggle"
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-white/5"
                                />
                                <label htmlFor="public-toggle" className="ml-2 text-sm text-gray-300">
                                    Public Message
                                </label>
                            </div>
                        )}
                        <div className="flex space-x-3 items-center">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                accept="image/*"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="p-2.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-all"
                                title="Attach Image"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                            </button>

                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={uploading ? "Uploading..." : "Type a message..."}
                                disabled={uploading}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                            />

                            <button
                                type="submit"
                                disabled={!newMessage.trim() || uploading}
                                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
