import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import '../styles/ThemeToggle.css'

const ThemeToggle = () => {
    const [isLight, setIsLight] = useState(() => {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme) {
            return savedTheme === 'light'
        }
        return true // Default to light theme
    })

    useEffect(() => {
        if (isLight) {
            document.body.classList.add('light-theme')
            localStorage.setItem('theme', 'light')
        } else {
            document.body.classList.remove('light-theme')
            localStorage.setItem('theme', 'dark')
        }
    }, [isLight])

    return (
        <button
            onClick={() => setIsLight(!isLight)}
            className="theme-toggle"
            aria-label="Toggle theme"
        >
            {isLight ? (
                <Moon size={20} className="theme-icon" />
            ) : (
                <Sun size={20} className="theme-icon" />
            )}
        </button>
    )
}

export default ThemeToggle
