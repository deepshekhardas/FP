import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

// Initialize Razorpay
// NOTE: You need to add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env.local file
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET',
})

export async function POST(request: Request) {
    try {
        // In a real app, you might want to check if the user is already premium here
        // const { userId } = await request.json()

        const options = {
            amount: 49900, // amount in the smallest currency unit (paise for INR). 49900 = ₹499
            currency: 'INR',
            receipt: 'receipt_' + Math.random().toString(36).substring(7),
        }

        const order = await razorpay.orders.create(options)

        return NextResponse.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
        })
    } catch (error) {
        console.error('Error creating Razorpay order:', error)
        return NextResponse.json(
            { error: 'Error creating order' },
            { status: 500 }
        )
    }
}
