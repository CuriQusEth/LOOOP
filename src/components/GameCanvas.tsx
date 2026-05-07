import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { RecordRunButton } from './Web3Components';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Entity = { x: number; y: number; w: number; h: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number };

// --- Constants ---
const GRAVITY = 0.5;
const GROUND_Y_OFFSET = 100;

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setScreen, updateCurrentRun, commitRun, upgrades, currentScreen } = useGameStore();

  const [gameState, setGameState] = useState<'playing' | 'crashed' | 'looping'>('playing');
  const [distanceDisplay, setDistanceDisplay] = useState(0);
  const [loopsDisplay, setLoopsDisplay] = useState(0);
  
  // Game Engine State (Refs for performance)
  const engine = useRef({
    dimensions: { w: 800, h: 600 },
    player: { x: 50, y: 0, w: 30, h: 30, vy: 0, jumpsLeft: 1, isDashing: false, dashTimer: 0 },
    obstacles: [] as Entity[],
    essenceOrbs: [] as Entity[],
    particles: [] as Particle[],
    speed: 8,
    worldX: 0,
    distance: 0,
    loops: 0,
    timeSlowActive: false,
    collectedEssenceAmount: 0,
    isHoldingJump: false,
  });

  const reqRef = useRef<number>(0);

  // --- Handlers ---
  const handleJump = () => {
    const p = engine.current.player;
    if (p.jumpsLeft > 0) {
      p.vy = -12; // Base jump force
      p.jumpsLeft -= 1;
      spawnParticles(p.x + p.w / 2, p.y + p.h, 10, '#0ff');
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameState !== 'playing') return;
    
    const cw = engine.current.dimensions.w;
    // Right side click/touch for dash or time slow if upgraded
    if (e.clientX > cw / 2) {
      if (upgrades.dash && !engine.current.player.isDashing) {
        engine.current.player.isDashing = true;
        engine.current.player.dashTimer = 30; // frames
        spawnParticles(engine.current.player.x, engine.current.player.y + 15, 20, '#b0f');
      } else if (upgrades.timeSlow) {
        engine.current.timeSlowActive = true;
      }
    } else {
      handleJump();
      engine.current.isHoldingJump = true;
    }
  };

  const handlePointerUp = () => {
    engine.current.isHoldingJump = false;
    engine.current.timeSlowActive = false;
  };

  const spawnParticles = (x: number, y: number, count: number, color: string) => {
    for (let i = 0; i < count; i++) {
       engine.current.particles.push({
         x, y,
         vx: (Math.random() - 0.5) * 8,
         vy: (Math.random() - 0.5) * 8 - 2,
         life: 1.0,
         color,
         size: Math.random() * 4 + 2
       });
    }
  };

  // --- Game Loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize handler
    const updateSize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      canvas.width = clientWidth;
      canvas.height = clientHeight;
      engine.current.dimensions = { w: clientWidth, h: clientHeight };
      engine.current.player.y = clientHeight - GROUND_Y_OFFSET - engine.current.player.h;
    };
    window.addEventListener('resize', updateSize);
    updateSize();

    // Reset Engine
    engine.current.player.jumpsLeft = upgrades.doubleJump ? 2 : 1;
    
    // Generator
    const generateObstacle = (xOffset: number) => {
      engine.current.obstacles.push({
        x: engine.current.dimensions.w + xOffset,
        y: engine.current.dimensions.h - GROUND_Y_OFFSET - (Math.random() * 40 + 20),
        w: Math.random() * 30 + 20,
        h: Math.random() * 60 + 20,
      });
      // Maybe spawn essence
      if (Math.random() > 0.5) {
        engine.current.essenceOrbs.push({
          x: engine.current.dimensions.w + xOffset,
          y: engine.current.dimensions.h - GROUND_Y_OFFSET - 120 - Math.random() * 100,
          w: 16, h: 16
        });
      }
    };

    let frameCount = 0;

    const tick = () => {
      if (gameState !== 'playing') {
        reqRef.current = requestAnimationFrame(tick);
        return;
      }

      frameCount++;
      const eng = engine.current;
      const { w, h } = eng.dimensions;
      const groundY = h - GROUND_Y_OFFSET;

      // Physics Modifiers
      const effSpeed = eng.timeSlowActive ? eng.speed * 0.4 : eng.speed;
      const effGav = eng.isHoldingJump && eng.player.vy < 0 ? GRAVITY * 0.5 : GRAVITY;

      // Player Physics
      eng.player.vy += effGav;
      eng.player.y += eng.timeSlowActive ? eng.player.vy * 0.5 : eng.player.vy;

      if (eng.player.y >= groundY - eng.player.h) {
        eng.player.y = groundY - eng.player.h;
        eng.player.vy = 0;
        eng.player.jumpsLeft = upgrades.doubleJump ? 2 : 1;
      }

      // Dash Logic
      if (eng.player.isDashing) {
        eng.player.dashTimer--;
        eng.player.vy = 0; // Hover while dashing
        spawnParticles(eng.player.x, eng.player.y + eng.player.h/2, 1, '#b0f');
        if (eng.player.dashTimer <= 0) eng.player.isDashing = false;
      }

      // Update World
      eng.distance += effSpeed;
      eng.worldX += effSpeed;

      // Spawn Entities
      if (frameCount % Math.max(30, Math.floor(100 - eng.speed * 2)) === 0) {
        generateObstacle((Math.random() * 200));
      }

      // Progression
      eng.speed = 8 + (eng.distance / 10000); // Speed scales up very slowly

      // Move & Collide Entities
      // Obstacles
      for (let i = eng.obstacles.length - 1; i >= 0; i--) {
        const obs = eng.obstacles[i];
        obs.x -= effSpeed;
        
        // Collision
        if (!eng.player.isDashing &&
            eng.player.x < obs.x + obs.w &&
            eng.player.x + eng.player.w > obs.x &&
            eng.player.y < obs.y + obs.h &&
            eng.player.y + eng.player.h > obs.y) 
        {
          // Loop Crash! Time rewinds.
          setGameState('crashed');
          setTimeout(() => {
            handleLoopReset();
          }, 1500);
          spawnParticles(eng.player.x + 15, eng.player.y + 15, 50, '#f0f');
        }

        if (obs.x + obs.w < 0) eng.obstacles.splice(i, 1);
      }

      // Essence
      for (let i = eng.essenceOrbs.length - 1; i >= 0; i--) {
        const orb = eng.essenceOrbs[i];
        orb.x -= effSpeed;
        
        // Float effect
        orb.y += Math.sin(frameCount * 0.1) * 1;

        if (eng.player.x < orb.x + orb.w &&
            eng.player.x + eng.player.w > orb.x &&
            eng.player.y < orb.y + orb.h &&
            eng.player.y + eng.player.h > orb.y) 
        {
          eng.collectedEssenceAmount += 1;
          spawnParticles(orb.x, orb.y, 10, '#ff0');
          eng.essenceOrbs.splice(i, 1);
        } else if (orb.x + orb.w < 0) {
          eng.essenceOrbs.splice(i, 1);
        }
      }

      // Move Particles
      for (let i = eng.particles.length - 1; i >= 0; i--) {
        const p = eng.particles[i];
        p.x += p.vx - effSpeed;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) eng.particles.splice(i, 1);
      }

      // --- Rendering ---
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, w, h);

      // Grid Pattern
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const gridOffset = eng.worldX % 50;
      for (let i = 0; i < w + 50; i += 50) {
        ctx.moveTo(i - gridOffset, groundY);
        ctx.lineTo(Math.max(i - gridOffset - 200, 0), h);
      }
      ctx.stroke();

      // Ground Line
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#0ff';
      ctx.strokeStyle = '#0ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.stroke();

      // Draw Obstacles
      ctx.shadowColor = '#f0f';
      ctx.fillStyle = '#110011';
      ctx.strokeStyle = '#f0f';
      ctx.lineWidth = 2;
      eng.obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      });

      // Draw Essence Orbs
      ctx.shadowColor = '#ff0';
      ctx.fillStyle = '#ff0';
      eng.essenceOrbs.forEach(orb => {
        ctx.beginPath();
        ctx.arc(orb.x + 8, orb.y + 8, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Player
      ctx.shadowColor = eng.player.isDashing ? '#b0f' : '#0ff';
      ctx.fillStyle = eng.player.isDashing ? '#b0f' : '#0ff';
      ctx.fillRect(eng.player.x, eng.player.y, eng.player.w, eng.player.h);

      // Draw Particles
      eng.particles.forEach(p => {
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });
      ctx.shadowBlur = 0; // reset

      // Sync State visually
      if (frameCount % 5 === 0) {
        setDistanceDisplay(Math.floor(eng.distance));
        setLoopsDisplay(eng.loops);
      }

      reqRef.current = requestAnimationFrame(tick);
    };

    reqRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(reqRef.current);
  }, [gameState, upgrades]);

  const handleLoopReset = () => {
    // Increase Loop Count, reset speed & distance (or keep dist, just reset local state)
    // Concept: You rewind, but keep distance as total score
    engine.current.loops += 1;
    // Rewind logic
    engine.current.obstacles = [];
    engine.current.essenceOrbs = [];
    engine.current.speed = 8 + (engine.current.loops * 1); // Loops actually make baseline faster
    
    // Visual Loop
    setGameState('looping');
    
    setTimeout(() => {
      engine.current.player.y = 0; // Fall from sky
      engine.current.player.vy = 0;
      setGameState('playing');
    }, 1500);
  };

  const handleEndRun = () => {
    // Commit to global store
    updateCurrentRun(distanceDisplay, loopsDisplay);
    commitRun(engine.current.collectedEssenceAmount);
    // Go to game over / loop broke screen
    // We will render it conditionally below
    setGameState('crashed');
  };

  return (
    <div 
      className="absolute inset-0 select-none bg-black overflow-hidden"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* HUD System */}
      <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between pointer-events-none z-10">
        <div className="flex flex-col space-y-1">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-white tracking-widest text-glow-cyan">{distanceDisplay}</span>
            <span className="text-sm font-mono text-neon-cyan uppercase">Dist</span>
          </div>
          <div className="text-yellow-400 font-mono font-bold text-xl drop-shadow-[0_0_8px_rgba(255,255,0,0.8)]">
            {engine.current.collectedEssenceAmount} Essence
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-5xl font-black italic tracking-tighter text-neon-magenta text-glow-magenta">
            {loopsDisplay} 
            <span className="text-lg uppercase ml-2 text-white not-italic tracking-normal text-shadow-none">Loops</span>
          </div>
        </div>
      </div>

      {/* Touch hints */}
      <div className="absolute bottom-10 left-10 text-xs font-mono text-gray-500 uppercase pointer-events-none opacity-50">
        Tap Left: Jump / Hold: Float
      </div>
      <div className="absolute bottom-10 right-10 text-xs font-mono text-gray-500 uppercase pointer-events-none opacity-50 text-right">
        Tap Right: Abilities
      </div>

      {/* Screen Effects & Menus */}
      <AnimatePresence>
        {gameState === 'looping' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center font-mono pointer-events-none mix-blend-difference"
          >
             <h1 className="text-6xl font-black italic tracking-widest text-black">LOOP RESET</h1>
             <p className="text-black font-bold mt-4 uppercase">Time is a circle.</p>
          </motion.div>
        )}

        {gameState === 'crashed' && (
           <motion.div 
           initial={{ opacity: 0, scale: 0.9 }} 
           animate={{ opacity: 1, scale: 1 }} 
           className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center"
         >
            <h2 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white uppercase mb-4 shadow-red-500 drop-shadow-2xl">
              Paradox Reached
            </h2>
            <div className="flex justify-center space-x-12 mb-8 font-mono">
               <div className="flex flex-col items-center">
                 <span className="text-gray-400 text-sm uppercase">Loops</span>
                 <span className="text-4xl text-neon-magenta font-bold">{loopsDisplay}</span>
               </div>
               <div className="flex flex-col items-center">
                 <span className="text-gray-400 text-sm uppercase">Distance</span>
                 <span className="text-4xl text-neon-cyan font-bold">{distanceDisplay}</span>
               </div>
               <div className="flex flex-col items-center">
                 <span className="text-gray-400 text-sm uppercase">Essence</span>
                 <span className="text-4xl text-yellow-400 font-bold">+{engine.current.collectedEssenceAmount}</span>
               </div>
            </div>

            <RecordRunButton distance={distanceDisplay} loops={loopsDisplay} />

            <div className="mt-8 flex space-x-4">
              <button 
                onClick={() => {
                  commitRun(engine.current.collectedEssenceAmount);
                  engine.current.collectedEssenceAmount = 0;
                  setGameState('playing');
                  engine.current.distance = 0;
                  engine.current.loops = 0;
                  engine.current.obstacles = [];
                  engine.current.player.y = 0;
                }}
                className="px-6 py-2 bg-neon-cyan/20 border border-neon-cyan text-white uppercase font-mono tracking-widest rounded-sm hover:bg-neon-cyan/40 box-glow-cyan"
              >
                Restart Paradox
              </button>
              <button 
                onClick={() => {
                  commitRun(engine.current.collectedEssenceAmount);
                  setScreen('title');
                }}
                className="px-6 py-2 bg-white/5 border border-gray-600 text-gray-300 uppercase font-mono tracking-widest rounded-sm hover:bg-white/10"
              >
                Return to Hub
              </button>
            </div>
         </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
