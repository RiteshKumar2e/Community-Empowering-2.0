import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, RefreshCcw, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/NotFound.css';

// The runner and cactus are drawn with canvas primitives rather than a sprite
// sheet. The bundled DINO_SPRITES_1X data URI was a truncated paste — no IEND
// chunk and a base64 length not divisible by 4 — so the browser rejected it
// with ERR_INVALID_URL and nothing was ever painted. Drawing the shapes keeps
// the game working with no binary asset to go stale.
const drawRunner = (ctx, dino, color, legPhase) => {
    const { x, y, width: w, height: h } = dino;
    ctx.fillStyle = color;

    // Body
    ctx.fillRect(x, y + h * 0.32, w * 0.62, h * 0.42);
    // Tail
    ctx.fillRect(x - w * 0.16, y + h * 0.36, w * 0.2, h * 0.16);
    // Head
    ctx.fillRect(x + w * 0.5, y, w * 0.5, h * 0.3);
    // Snout
    ctx.fillRect(x + w * 0.86, y + h * 0.18, w * 0.22, h * 0.1);
    // Eye (punched out)
    ctx.clearRect(x + w * 0.78, y + h * 0.08, 3, 3);
    // Legs alternate so the runner reads as moving
    const legY = y + h * 0.74;
    const legH = h * 0.26;
    if (legPhase === 0) {
        ctx.fillRect(x + w * 0.08, legY, w * 0.16, legH);
        ctx.fillRect(x + w * 0.38, legY, w * 0.16, legH * 0.6);
    } else {
        ctx.fillRect(x + w * 0.08, legY, w * 0.16, legH * 0.6);
        ctx.fillRect(x + w * 0.38, legY, w * 0.16, legH);
    }
};

const drawCactus = (ctx, obs, color) => {
    const { x, y, width: w, height: h } = obs;
    ctx.fillStyle = color;

    // Trunk
    ctx.fillRect(x + w * 0.35, y, w * 0.3, h);
    // Left arm
    ctx.fillRect(x, y + h * 0.3, w * 0.18, h * 0.28);
    ctx.fillRect(x, y + h * 0.3, w * 0.45, w * 0.22);
    // Right arm
    ctx.fillRect(x + w * 0.82, y + h * 0.22, w * 0.18, h * 0.34);
    ctx.fillRect(x + w * 0.55, y + h * 0.22, w * 0.45, w * 0.22);
};

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

        // Theme-aware palette, read once per frame from the active theme.
        const styles = getComputedStyle(document.body);
        const groundColor = styles.getPropertyValue('--border-strong').trim() || '#9aa1ac';
        const runnerColor = styles.getPropertyValue('--text-primary').trim() || '#16191d';
        const cactusColor = styles.getPropertyValue('--success-600').trim() || '#059669';

        // Draw Ground
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(canvas.width, groundY);
        ctx.strokeStyle = groundColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw runner, alternating legs to suggest a stride
        drawRunner(ctx, dino, runnerColor, Math.floor(Date.now() / 120) % 2);

        // Draw Obstacles (Cactus)
        obstacles.forEach(obs => drawCactus(ctx, obs, cactusColor));

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
        </div>
    );
};

export default NotFound;
