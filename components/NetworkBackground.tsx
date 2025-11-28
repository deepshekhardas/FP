'use client'

import { motion } from 'framer-motion'

export default function NetworkBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-[#030712]">
            {/* Large Animated Gradient Orbs */}
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, -100, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-600/30 to-indigo-600/30 rounded-full blur-3xl"
            />

            <motion.div
                animate={{
                    x: [0, -150, 0],
                    y: [0, 100, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-1/4 right-0 w-[700px] h-[700px] bg-gradient-to-bl from-blue-600/20 to-cyan-600/20 rounded-full blur-3xl"
            />

            <motion.div
                animate={{
                    x: [0, 100, -50, 0],
                    y: [0, -50, 100, 0],
                    scale: [1, 1.1, 1.2, 1],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-600/25 to-purple-600/25 rounded-full blur-3xl"
            />

            {/* Smaller accent orbs */}
            <motion.div
                animate={{
                    x: [0, -80, 0],
                    y: [0, 80, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-full blur-2xl"
            />

            <motion.div
                animate={{
                    x: [0, 60, 0],
                    y: [0, -60, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-l from-blue-600/15 to-indigo-600/15 rounded-full blur-2xl"
            />

            {/* Grid overlay for depth */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                }}
            />
        </div>
    )
}
