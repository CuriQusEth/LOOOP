import { motion } from 'motion/react';
import { useGameStore } from '../store/gameStore';

export function TitleScreen() {
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black z-10 overflow-hidden"
    >
      {/* Background abstract loop effects */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-[150vw] h-[150vw] sm:w-[80vw] sm:h-[80vw] border-[1px] border-neon-cyan rounded-full border-dashed"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-[120vw] h-[120vw] sm:w-[60vw] sm:h-[60vw] border-[2px] border-neon-magenta rounded-full border-dotted"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[100vw] h-[100vw] sm:w-[40vw] sm:h-[40vw] bg-neon-cyan/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-12">
        <div className="text-center">
          <motion.h1 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 10, stiffness: 50 }}
            className="text-7xl sm:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-magenta text-glow-cyan"
          >
            LOOOP
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 font-mono tracking-[0.3em] uppercase mt-4 text-sm sm:text-lg"
          >
            The Eternal Runner
          </motion.p>
        </div>

        <div className="flex flex-col space-y-4 w-full max-w-sm">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setScreen('game')}
            className="w-full py-4 bg-neon-cyan/20 border border-neon-cyan text-white text-xl font-mono uppercase tracking-widest box-glow-cyan relative overflow-hidden group rounded-sm"
          >
            <div className="absolute inset-0 bg-neon-cyan w-0 group-hover:w-full transition-all duration-300 opacity-20"></div>
            Start Loop
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setScreen('upgrades')}
            className="w-full py-3 bg-neon-magenta/10 border border-neon-magenta text-neon-magenta font-mono uppercase tracking-wider box-glow-magenta rounded-sm hover:bg-neon-magenta/20 transition-colors"
          >
            Evolution Codex
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setScreen('leaderboard')}
            className="w-full py-3 bg-white/5 border border-white/20 text-gray-300 font-mono uppercase tracking-wider rounded-sm hover:bg-white/10 transition-colors"
          >
            Eternal Leaderboard
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
