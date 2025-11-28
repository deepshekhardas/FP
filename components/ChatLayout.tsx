'use client'

import { useState } from 'react'
import ChatSidebar from './ChatSidebar'
import ChatWindow from './ChatWindow'

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

export default function ChatLayout({ currentUser }: { currentUser: any }) {
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

    const handleSelectUser = (user: UserProfile) => {
        setSelectedUser(user)
        setSelectedGroup(null)
    }

    const handleSelectGroup = (group: Group) => {
        setSelectedGroup(group)
        setSelectedUser(null)
    }

    const hasSelection = selectedUser || selectedGroup

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden shadow-xl rounded-lg border border-gray-200 m-4">
            {/* Sidebar - Hidden on mobile if chat is open */}
            <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 ${hasSelection ? 'hidden md:block' : 'block'}`}>
                <ChatSidebar
                    currentUserId={currentUser.id}
                    onSelectUser={handleSelectUser}
                    onSelectGroup={handleSelectGroup}
                    selectedId={selectedUser?.id || selectedGroup?.id || null}
                />
            </div>

            {/* Chat Window - Hidden on mobile if no user selected */}
            <div className={`w-full md:w-2/3 lg:w-3/4 flex flex-col ${!hasSelection ? 'hidden md:flex' : 'flex'}`}>
                {hasSelection ? (
                    <>
                        {/* Mobile Back Button */}
                        <div className="md:hidden p-2 bg-gray-100 border-b border-gray-200">
                            <button
                                onClick={() => { setSelectedUser(null); setSelectedGroup(null); }}
                                className="text-indigo-600 text-sm font-medium flex items-center"
                            >
                                ← Back to List
                            </button>
                        </div>
                        <ChatWindow
                            currentUser={currentUser}
                            selectedUser={selectedUser}
                            selectedGroup={selectedGroup}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No chat selected</h3>
                            <p className="mt-1 text-sm text-gray-500">Select a person or group from the sidebar to start chatting.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
