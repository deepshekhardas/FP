import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI (FREE tier - no credit card needed!)
const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. AI features will return fallback data.')
}
const genAI = new GoogleGenerativeAI(apiKey || 'dummy_key')

export async function generateAISuggestions(userProfile: { name?: string; email: string; connections: number }) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        const prompt = `You are a professional networking assistant. Based on this user profile:
- Name: ${userProfile.name || 'User'}
- Email: ${userProfile.email}
- Current Connections: ${userProfile.connections}

Suggest 5 types of professionals they should connect with to grow their network. Format as:
1. [Job Title] - [Reason why this connection is valuable]

Keep it concise and professional.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()
    } catch (error) {
        console.error('Gemini API error:', error)
        return 'Unable to generate suggestions at this time.'
    }
}

export async function generateProfileSummary(userData: { name?: string; email: string; role?: string }) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        const prompt = `Write a professional LinkedIn-style bio (2-3 sentences) for:
- Name: ${userData.name || 'Professional'}
- Role: ${userData.role || 'Professional'}
- Email domain: ${userData.email.split('@')[1]}

Focus on their expertise and networking goals. Be professional and concise.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()
    } catch (error) {
        console.error('Gemini API error:', error)
        return 'Professional with expertise in technology and networking.'
    }
}

export async function generateSmartReplies(lastMessage: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        const prompt = `Someone sent you this message: "${lastMessage}"

Generate 3 short, professional reply options (each max 10 words). Format as:
1. [Reply 1]
2. [Reply 2]
3. [Reply 3]

Make them natural and conversational.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Parse the numbered list
        const replies = text.split('\n')
            .filter(line => line.match(/^\d+\./))
            .map(line => line.replace(/^\d+\.\s*/, '').trim())
            .slice(0, 3)

        return replies.length === 3 ? replies : [
            "Thanks for reaching out!",
            "I appreciate that.",
            "Let's discuss this further."
        ]
    } catch (error) {
        console.error('Gemini API error:', error)
        return [
            "Thanks for reaching out!",
            "I appreciate that.",
            "Let's discuss this further."
        ]
    }
}
