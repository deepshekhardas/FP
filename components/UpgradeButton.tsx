'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

declare global {
    interface Window {
        Razorpay: any
    }
}

export default function UpgradeButton({ currentUser }: { currentUser: any }) {
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handleUpgrade = async () => {
        setLoading(true)
        const res = await loadRazorpay()

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?')
            setLoading(false)
            return
        }

        // 1. Create Order
        const response = await fetch('/api/create-order', {
            method: 'POST',
        })
        const data = await response.json()

        if (!data.id) {
            alert('Server error. Are you sure you set up Razorpay keys?')
            setLoading(false)
            return
        }

        // 2. Open Checkout
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID', // Enter the Key ID generated from the Dashboard
            amount: data.amount,
            currency: data.currency,
            name: 'Networking App Premium',
            description: 'Upgrade to Premium Features',
            order_id: data.id,
            handler: async function (response: any) {
                // 3. On Success, update user status
                // In a real app, you should verify the signature on the backend (webhook)
                // For this demo, we will trust the client-side success (NOT SECURE for production)

                try {
                    const { error } = await supabase
                        .from('users')
                        .update({ is_premium: true })
                        .eq('id', currentUser.id)

                    if (error) throw error

                    alert('Payment Successful! You are now a Premium User.')
                    router.refresh()
                } catch (err) {
                    console.error('Error updating profile:', err)
                    alert('Payment successful but failed to update profile. Contact support.')
                }
            },
            prefill: {
                name: currentUser.user_metadata?.name || currentUser.email,
                email: currentUser.email,
            },
            theme: {
                color: '#4F46E5', // Indigo-600
            },
        }

        const paymentObject = new window.Razorpay(options)
        paymentObject.open()
        setLoading(false)
    }

    return (
        <button
            onClick={handleUpgrade}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
        >
            {loading ? 'Processing...' : 'Upgrade to Premium (₹499)'}
        </button>
    )
}
