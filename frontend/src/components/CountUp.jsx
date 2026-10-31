import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

// Counts from 0 up to the number in `value` ("10K+", "50+", "10,000+") the
// first time it scrolls into view, keeping whatever prefix/suffix it had.
const CountUp = ({ value, duration = 1400 }) => {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-40px' })
    const reduceMotion = useReducedMotion()
    const match = String(value).match(/^(\D*)([\d,]+)(.*)$/)
    const target = match ? parseInt(match[2].replace(/,/g, ''), 10) : 0
    const useCommas = match ? match[2].includes(',') : false
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        if (!inView || !match) return
        if (reduceMotion) {
            setCurrent(target)
            return
        }
        let frame
        const start = performance.now()
        const step = (now) => {
            const t = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - t, 3)
            setCurrent(Math.round(target * eased))
            if (t < 1) frame = requestAnimationFrame(step)
        }
        frame = requestAnimationFrame(step)
        return () => cancelAnimationFrame(frame)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView, target, duration, reduceMotion])

    if (!match) return <span ref={ref}>{value}</span>

    const shown = useCommas ? current.toLocaleString('en-IN') : current
    return <span ref={ref}>{match[1]}{shown}{match[3]}</span>
}

export default CountUp
