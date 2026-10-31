import { useState, useEffect } from 'react'
import '../styles/FontSizeControl.css'

// A- / A / A+ text-size switch, the kind government websites carry for
// accessibility. Almost every size in the stylesheets is in rem, so changing
// the root font size scales the whole site.
const SIZES = [
    { id: 'small', label: 'A-', px: 14, title: 'Decrease text size' },
    { id: 'normal', label: 'A', px: 16, title: 'Normal text size' },
    { id: 'large', label: 'A+', px: 18, title: 'Increase text size' },
]
const STORAGE_KEY = 'font-size'
const CHANGE_EVENT = 'fontsizechange'

const getSavedSize = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return SIZES.some((s) => s.id === saved) ? saved : 'normal'
}

// Called from main.jsx before the first render so the saved size applies without a flash.
export const applySavedFontSize = () => {
    const size = SIZES.find((s) => s.id === getSavedSize())
    document.documentElement.style.fontSize = `${size.px}px`
}

const FontSizeControl = ({ className = '' }) => {
    const [current, setCurrent] = useState(getSavedSize)

    // The navbar and the mobile menu each render a copy; keep them in sync.
    useEffect(() => {
        const sync = () => setCurrent(getSavedSize())
        window.addEventListener(CHANGE_EVENT, sync)
        return () => window.removeEventListener(CHANGE_EVENT, sync)
    }, [])

    const choose = (size) => {
        localStorage.setItem(STORAGE_KEY, size.id)
        document.documentElement.style.fontSize = `${size.px}px`
        setCurrent(size.id)
        window.dispatchEvent(new Event(CHANGE_EVENT))
    }

    return (
        <div className={`font-size-control ${className}`} role="group" aria-label="Text size">
            {SIZES.map((size) => (
                <button
                    key={size.id}
                    type="button"
                    className={`font-size-btn font-size-btn-${size.id} ${current === size.id ? 'active' : ''}`}
                    onClick={() => choose(size)}
                    title={size.title}
                    aria-label={size.title}
                    aria-pressed={current === size.id}
                >
                    {size.label}
                </button>
            ))}
        </div>
    )
}

export default FontSizeControl
