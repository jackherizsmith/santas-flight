import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import { GameRenderer } from '../game/renderer';
import { getTodaysSeed, formatDate } from '../utils/random';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants';
import type { GameState } from '../types';

export function Game() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [finalDistance, setFinalDistance] = useState(0);
  const [finalCarrots, setFinalCarrots] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialise game
    const seed = getTodaysSeed();

    const engine = new GameEngine(seed);
    const renderer = new GameRenderer(canvas);
    const initialState = engine.createInitialState();

    engineRef.current = engine;
    rendererRef.current = renderer;
    stateRef.current = initialState;

    renderer.render(initialState);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const startGameLoop = useCallback(() => {
    if (animationRef.current) return; // Already running

    const gameLoop = () => {
      if (engineRef.current && rendererRef.current && stateRef.current) {
        engineRef.current.update(stateRef.current);
        rendererRef.current.render(stateRef.current);

        if (!stateRef.current.gameOver) {
          animationRef.current = requestAnimationFrame(gameLoop);
        } else {
          setFinalDistance(Math.floor(stateRef.current.distance));
          setFinalCarrots(stateRef.current.carrotsCollected);
          setShowShare(true);
          animationRef.current = null;
        }
      }
    };

    animationRef.current = requestAnimationFrame(gameLoop);
  }, []);

  const handleScreenClick = useCallback(() => {
    if (!engineRef.current || !stateRef.current) return;
    if (stateRef.current.gameOver) return; // Don't respond to clicks when game is over

    const wasNotStarted = !stateRef.current.gameStarted;

    engineRef.current.jump(stateRef.current);

    if (wasNotStarted) {
      startGameLoop();
    }
  }, [startGameLoop]);

  const handleRestart = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const seed = getTodaysSeed();
    const engine = new GameEngine(seed);
    const renderer = rendererRef.current;
    const initialState = engine.createInitialState();

    engineRef.current = engine;
    stateRef.current = initialState;
    setShowShare(false);
    setFinalDistance(0);
    setFinalCarrots(0);

    if (renderer) {
      renderer.render(initialState);
    }
  };

  const handleShare = async () => {
    const today = formatDate(new Date());
    const url = (window as { SHARE_URL?: string }).SHARE_URL ?? window.location.href;
    const text = `🎅 Santa's Flight ${today}\n${finalDistance}m travelled\n🥕 ${finalCarrots} carrots collected\n${url}`;

    try {
      await navigator.clipboard.writeText(text);
      alert('Results copied to clipboard!');
    } catch {
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div ref={containerRef} style={styles.container}>
      <div
        style={styles.gameArea}
        onClick={handleScreenClick}
        onTouchStart={(e) => {
          e.preventDefault();
          handleScreenClick();
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={styles.canvas}
        />

        {showShare && (
          <div style={styles.overlay}>
            <div style={styles.buttons}>
              <button onClick={handleRestart} style={styles.button}>
                Play Again
              </button>
              <button onClick={handleShare} style={styles.button}>
                Share Results 📋
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(to bottom, #0f0f1e, #1a1a2e)',
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0,
  },
  gameArea: {
    position: 'relative',
    cursor: 'pointer',
    touchAction: 'none',
    userSelect: 'none',
  },
  canvas: {
    border: '3px solid #dc143c',
    borderRadius: '10px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    maxWidth: '100vw',
    maxHeight: '100vh',
    width: 'auto',
    height: 'auto',
    display: 'block',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    paddingTop: '100px',
  },
  buttons: {
    display: 'flex',
    gap: '15px',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'auto',
  },
  button: {
    padding: '15px 40px',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ffffff',
    background: 'linear-gradient(to bottom, #dc143c, #a01028)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(220, 20, 60, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    minWidth: '200px',
  },
};
