import React, { useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const ParticleCursor = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const [isMobile, setIsMobile] = useState(false);
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    const spring = { damping: 15, stiffness: 400, mass: 0.1 }; // Much more responsive settings
    const x = useSpring(mouseX, spring);
    const y = useSpring(mouseY, spring);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile) return;

        const move = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        // Efficient hover detection
        const over = (e) => {
            const target = e.target;
            if (!target) return;
            const isClickable = target.closest('a, button, input, select, .clickable, [role="button"]');
            setIsHovered(!!isClickable);
        };

        const theme = () => setIsDarkMode(!document.body.classList.contains('light-theme'));

        window.addEventListener('mousemove', move, { passive: true });
        window.addEventListener('mouseover', over, { passive: true });

        const obs = new MutationObserver(theme);
        obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        theme();

        return () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseover', over);
            obs.disconnect();
        };
    }, [isMobile, mouseX, mouseY]);

    const color = isDarkMode ? '#00f2ff' : '#6366f1';

    if (isMobile) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2147483647 }}>
            {/* Dot */}
            <motion.div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    x: x,
                    y: y,
                    width: 8,
                    height: 8,
                    marginLeft: '-4px',
                    marginTop: '-4px',
                    backgroundColor: color,
                    borderRadius: '50%',
                    boxShadow: `0 0 10px ${color}`,
                    willChange: 'transform'
                }}
                animate={{ scale: isHovered ? 0.5 : 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            />

            {/* Ring */}
            <motion.div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    x: x,
                    y: y,
                    width: 30,
                    height: 30,
                    marginLeft: '-15px',
                    marginTop: '-15px',
                    border: `2px solid ${color}`,
                    borderRadius: '50%',
                    willChange: 'transform'
                }}
                animate={{
                    scale: isHovered ? 2 : 1,
                    opacity: isHovered ? 1 : 0.6,
                    borderWidth: isHovered ? '3px' : '2px'
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            />
        </div>
    );
};

export default ParticleCursor;
