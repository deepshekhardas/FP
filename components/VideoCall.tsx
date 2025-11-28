'use client'

import { useEffect, useRef, useState } from 'react'
import Peer from 'simple-peer'
import { createClient } from '@/utils/supabase/client'

type Props = {
    roomId: string
    currentUser: any
    targetUser: any
    isInitiator: boolean
    onEndCall: () => void
}

export default function VideoCall({ roomId, currentUser, targetUser, isInitiator, onEndCall }: Props) {
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const [callAccepted, setCallAccepted] = useState(false)
    const [status, setStatus] = useState(isInitiator ? 'Calling...' : 'Connecting...')

    const userVideo = useRef<HTMLVideoElement>(null)
    const peerVideo = useRef<HTMLVideoElement>(null)
    const peerRef = useRef<Peer.Instance | null>(null)
    const supabase = createClient()
    const channelRef = useRef<any>(null)

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream)
                if (userVideo.current) {
                    userVideo.current.srcObject = currentStream
                }

                // Initialize channel for signaling
                const channel = supabase.channel(roomId)
                channelRef.current = channel

                channel
                    .on('broadcast', { event: 'signal' }, (payload) => {
                        // Receive signal from other peer
                        if (payload.payload.senderId !== currentUser.id) {
                            if (peerRef.current) {
                                peerRef.current.signal(payload.payload.signal)
                            }
                        }
                    })
                    .subscribe(async (status) => {
                        if (status === 'SUBSCRIBED') {
                            // Only initialize peer once we are subscribed and have stream
                            initializePeer(currentStream, channel)
                        }
                    })
            })
            .catch((err) => {
                console.error('Error accessing media devices:', err)
                setStatus('Error: Could not access camera/microphone')
            })

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
            if (peerRef.current) {
                peerRef.current.destroy()
            }
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
            }
        }
    }, [])

    function initializePeer(currentStream: MediaStream, channel: any) {
        const peer = new Peer({
            initiator: isInitiator,
            trickle: false,
            stream: currentStream,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        })

        peer.on('signal', (data) => {
            // Send signal to other peer via Supabase Broadcast
            channel.send({
                type: 'broadcast',
                event: 'signal',
                payload: {
                    senderId: currentUser.id,
                    signal: data
                }
            })
        })

        peer.on('stream', (currentRemoteStream) => {
            setRemoteStream(currentRemoteStream)
            if (peerVideo.current) {
                peerVideo.current.srcObject = currentRemoteStream
            }
            setCallAccepted(true)
            setStatus('Connected')
        })

        peer.on('error', (err) => {
            console.error('Peer error:', err)
            setStatus('Connection Failed')
        })

        peer.on('close', () => {
            onEndCall()
        })

        peerRef.current = peer
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex flex-col items-center justify-center">
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={onEndCall}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                    End Call
                </button>
            </div>

            <div className="text-white mb-4 text-xl font-semibold">
                {status} {callAccepted ? `with ${targetUser.name || targetUser.email}` : ''}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-6xl px-4">
                {/* My Video */}
                <div className="relative bg-black rounded-lg overflow-hidden shadow-lg border border-gray-700 w-full md:w-1/2 aspect-video">
                    <video
                        playsInline
                        muted
                        ref={userVideo}
                        autoPlay
                        className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
                        You
                    </div>
                </div>

                {/* Remote Video */}
                {callAccepted && (
                    <div className="relative bg-black rounded-lg overflow-hidden shadow-lg border border-gray-700 w-full md:w-1/2 aspect-video">
                        <video
                            playsInline
                            ref={peerVideo}
                            autoPlay
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
                            {targetUser.name || targetUser.email}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
