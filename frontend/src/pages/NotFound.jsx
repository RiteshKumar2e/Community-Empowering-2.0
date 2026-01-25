import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, RefreshCcw, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DINO_SPRITES_1X } from '../constants/assets';
import '../styles/NotFound.css';

const NotFound = () => {
    const navigate = useNavigate();
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(() => {
        return parseInt(localStorage.getItem('dino-high-score') || '0');
    });
    const [gameState, setGameState] = useState('waiting'); // waiting, playing, crashed
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const gameRef = useRef({
        dino: { x: 50, y: 100, width: 44, height: 47, vY: 0, jumping: false },
        obstacles: [],
        speed: 6,
        distance: 0,
        lastSpawn: 0,
        groundY: 127
    });

    const startGame = useCallback(() => {
        setGameState('playing');
        setScore(0);
        gameRef.current = {
            dino: { x: 50, y: 100, width: 44, height: 47, vY: 0, jumping: false },
            obstacles: [],
            speed: 6,
            distance: 0,
            lastSpawn: Date.now(),
            groundY: 127
        };
    }, []);

    const jump = useCallback(() => {
        if (!gameRef.current.dino.jumping && gameState === 'playing') {
            gameRef.current.dino.vY = -12;
            gameRef.current.dino.jumping = true;
        } else if (gameState === 'waiting' || gameState === 'crashed') {
            startGame();
        }
    }, [gameState, startGame]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                jump();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [jump]);

    const update = useCallback(() => {
        if (gameState !== 'playing') return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const game = gameRef.current;
        const { dino, obstacles, groundY } = game;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update Dino
        if (dino.jumping) {
            dino.vY += 0.6; // Gravity
            dino.y += dino.vY;
            if (dino.y >= groundY - dino.height) {
                dino.y = groundY - dino.height;
                dino.jumping = false;
                dino.vY = 0;
            }
        }

        // Spawn Obstacles
        if (Date.now() - game.lastSpawn > 1500 + Math.random() * 2000) {
            obstacles.push({
                x: canvas.width,
                y: groundY - 35,
                width: 24,
                height: 48,
                type: 'cactus'
            });
            game.lastSpawn = Date.now();
        }

        // Update Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].x -= game.speed;

            // Collision Detection (Circle based or simple box)
            const dX = (dino.x + dino.width / 2) - (obstacles[i].x + obstacles[i].width / 2);
            const dY = (dino.y + dino.height / 2) - (obstacles[i].y + obstacles[i].height / 2);
            const distance = Math.sqrt(dX * dX + dY * dY);

            if (distance < 35) { // Collision threshold
                setGameState('crashed');
                return;
            }

            if (obstacles[i].x + obstacles[i].width < 0) {
                obstacles.splice(i, 1);
            }
        }

        // Update Score
        game.distance += 0.15;
        const currentScore = Math.floor(game.distance);
        if (currentScore !== score) {
            setScore(currentScore);
            if (currentScore > highScore) {
                setHighScore(currentScore);
                localStorage.setItem('dino-high-score', currentScore.toString());
            }
            if (currentScore % 100 === 0) {
                game.speed += 0.2;
            }
        }

        // Draw Ground
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(canvas.width, groundY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Dino
        const img = new Image();
        img.src = DINO_SPRITES_1X;

        // Use sprite mapping from Chrome Dino
        // Dino running frame toggle
        const frameX = (Math.floor(Date.now() / 100) % 2) === 0 ? 936 : 980;
        ctx.drawImage(img, frameX, 2, 44, 47, dino.x, dino.y, dino.width, dino.height);

        // Draw Obstacles (Cactus)
        obstacles.forEach(obs => {
            // Cactus sprite at 446 in 2x/1x mapping variations
            ctx.drawImage(img, 446, 2, 34, 70, obs.x, obs.y, obs.width, obs.height);
        });

        requestRef.current = requestAnimationFrame(update);
    }, [gameState, score, highScore]);

    useEffect(() => {
        if (gameState === 'playing') {
            requestRef.current = requestAnimationFrame(update);
        } else {
            cancelAnimationFrame(requestRef.current);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState, update]);

    return (
        <div className="not-found-container">
            <div className="gradient-bg"></div>

            <motion.div
                className="not-found-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1 className="error-code-bg">404</h1>

                <div className="glass-card error-card">
                    <div className="card-header">
                        <div className="status-dot"></div>
                        <span>Connection Lost in Cyberspace</span>
                    </div>

                    <h2 className="error-title">Oops! Remote Server Not Found.</h2>
                    <p className="error-text">
                        We couldn't find the page you're looking for.
                        It might have been archived or moved to a new sector.
                    </p>

                    <div className="dino-game-wrapper" onClick={jump}>
                        <canvas
                            ref={canvasRef}
                            width={600}
                            height={150}
                            className="game-canvas"
                        />
                        <AnimatePresence>
                            {gameState === 'waiting' && (
                                <motion.div
                                    className="game-overlay"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <p className="pulse-text">Click or Press SPACE to Start</p>
                                </motion.div>
                            )}
                            {gameState === 'crashed' && (
                                <motion.div
                                    className="game-overlay crashed"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <h3>SYSTEM MALFUNCTION</h3>
                                    <p>Tap to Reboot Simulation</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="stats-row">
                        <div className="stat">
                            <span className="label">SCORE</span>
                            <span className="value">{score.toString().padStart(5, '0')}</span>
                        </div>
                        <div className="stat">
                            <span className="label">
                                <Trophy size={12} style={{ marginRight: '4px', display: 'inline' }} />
                                HI-SCORE
                            </span>
                            <span className="value">{highScore.toString().padStart(5, '0')}</span>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button onClick={() => navigate('/')} className="btn-home">
                            <Home size={20} />
                            Back to Earth
                        </button>
                        <button onClick={() => window.location.reload()} className="btn-retry">
                            <RefreshCcw size={20} />
                            Retry
                        </button>
                    </div>
                </div>
            </motion.div>

            <div className="floating-particles">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="particle"
                        animate={{
                            y: [0, -window.innerHeight],
                            opacity: [0, 0.5, 0],
                        }}
                        transition={{
                            duration: Math.random() * 10 + 5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            left: `${Math.random() * 100}%`,
                            bottom: `-10px`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default NotFound;
