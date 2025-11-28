'use client'

import { useEffect, useRef } from 'react'

export default function StarfieldBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let stars: { x: number; y: number; z: number }[] = []
        const numStars = 1000
        const speed = 0.05

        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            initStars()
        }

        const initStars = () => {
            stars = []
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width - canvas.width / 2,
                    y: Math.random() * canvas.height - canvas.height / 2,
                    z: Math.random() * canvas.width
                })
            }
        }

        const draw = () => {
            ctx.fillStyle = '#030712'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            const cx = canvas.width / 2
            const cy = canvas.height / 2

            stars.forEach((star) => {
                star.z -= speed * 20
                if (star.z <= 0) {
                    star.z = canvas.width
                    star.x = Math.random() * canvas.width - canvas.width / 2
                    star.y = Math.random() * canvas.height - canvas.height / 2
                }

                const x = (star.x / star.z) * canvas.width + cx
                const y = (star.y / star.z) * canvas.height + cy
                const size = (1 - star.z / canvas.width) * 2

                if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
                    const alpha = (1 - star.z / canvas.width)
                    ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`
                    ctx.beginPath()
                    ctx.arc(x, y, size, 0, Math.PI * 2)
                    ctx.fill()
                }
            })

            animationFrameId = requestAnimationFrame(draw)
        }

        window.addEventListener('resize', resizeCanvas)
        resizeCanvas()
        draw()

        return () => {
            window.removeEventListener('resize', resizeCanvas)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 -z-50 w-full h-full bg-[#030712]"
        />
    )
}
