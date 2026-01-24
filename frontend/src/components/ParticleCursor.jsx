import React, { useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const ParticleCursor = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    const spring = { damping: 20, stiffness: 200, mass: 0.5 }; // Reduced stiffness for smoother performance
    const x = useSpring(mouseX, spring);
    const y = useSpring(mouseY, spring);

    useEffect(() => {
        const move = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        // Throttle hover detection to reduce overhead
        let hoverTimeout;
        const over = (e) => {
            if (hoverTimeout) return;
            hoverTimeout = setTimeout(() => {
                setIsHovered(!!e.target.closest('a, button, input, select, .clickable'));
                hoverTimeout = null;
            }, 50);
        };

        const theme = () => setIsDarkMode(!document.body.classList.contains('light-theme'));

        window.addEventListener('mousemove', move);
        window.addEventListener('mouseover', over);
        const obs = new MutationObserver(theme);
        obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        theme();

        return () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseover', over);
            obs.disconnect();
            if (hoverTimeout) clearTimeout(hoverTimeout);
        };
    }, [mouseX, mouseY]);

    const color = isDarkMode ? '#00f2ff' : '#6366f1';

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999 }}>
            {/* Dot */}
            <motion.div
                style={{
                    position: 'absolute',
                    left: x,
                    top: y,
                    width: 8,
                    height: 8,
                    backgroundColor: color,
                    borderRadius: '50%',
                    x: '-50%',
                    y: '-50%',
                    boxShadow: `0 0 10px ${color}`,
                }}
                animate={{ scale: isHovered ? 0 : 1 }}
            />

            {/* Ring */}
            <motion.div
                style={{
                    position: 'absolute',
                    left: x,
                    top: y,
                    width: 30,
                    height: 30,
                    border: `2px solid ${color}`,
                    borderRadius: '50%',
                    x: '-50%',
                    y: '-50%',
                }}
                animate={{
                    scale: isHovered ? 1.5 : 1,
                    opacity: isHovered ? 1 : 0.6,
                }}
            />
        </div>
    );
};

export default ParticleCursor;
