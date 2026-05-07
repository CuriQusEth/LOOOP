import { motion } from 'motion/react';
import { useGameStore, Upgrades } from '../store/gameStore';

export function UpgradesMenu() {
  const { essence, upgrades, purchaseUpgrade, setScreen } = useGameStore();

  const upgradeList: Array<{ id: keyof Upgrades; name: string; desc: string; cost: number; color: string }> = [
    {
      id: 'doubleJump',
      name: 'Phantom Step (Double Jump)',
      desc: 'Jump while in mid-air to defy gravity.',
      cost: 50,
      color: 'border-neon-cyan text-neon-cyan',
    },
    {
      id: 'timeSlow',
      name: 'Chrono Dilator (Slow Time)',
      desc: 'Hold right side of screen to slow time instantly.',
      cost: 150,
      color: 'border-neon-magenta text-neon-magenta',
    },
    {
      id: 'dash',
      name: 'Neon Phase (Dash)',
      desc: 'Swipe right to phase through matter temporarily.',
      cost: 300,
      color: 'border-neon-purple text-neon-purple',
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="absolute inset-0 bg-black/95 p-6 flex flex-col z-20"
    >
      <div className="flex justify-between items-center mb-12 mt-8">
        <h2 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-magenta to-white text-glow-magenta uppercase">
          Evolution Codex
        </h2>
        <div className="text-xl font-mono text-yellow-400">
          {essence} Essence
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto">
        {upgradeList.map((up) => {
          const isOwned = upgrades[up.id];
          const canAfford = !isOwned && essence >= up.cost;

          return (
            <div 
              key={up.id} 
              className={`p-6 border ${isOwned ? 'border-gray-700 opacity-50 bg-gray-900/50' : `bg-black/50 hover:bg-white/5 ${up.color}`} rounded-sm flex flex-col sm:flex-row sm:items-center justify-between transition-all`}
            >
              <div className="mb-4 sm:mb-0 max-w-md">
                <h3 className="text-2xl font-bold font-sans tracking-tight mb-1">{up.name}</h3>
                <p className="text-gray-400 font-mono text-sm leading-relaxed">{up.desc}</p>
              </div>
              <button
                disabled={isOwned || !canAfford}
                onClick={() => purchaseUpgrade(up.id, up.cost)}
                className={`px-6 py-3 font-mono font-bold uppercase tracking-widest border ${
                  isOwned 
                    ? 'border-gray-600 text-gray-500' 
                    : canAfford 
                      ? `${up.color} hover:bg-white/10` 
                      : 'border-red-900 text-red-800'
                } rounded-sm`}
              >
                {isOwned ? 'Acquired' : canAfford ? `Upgrade [${up.cost}]` : `Requires ${up.cost}`}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-6 flex justify-center">
        <button
          onClick={() => setScreen('title')}
          className="px-8 py-3 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-400 font-mono uppercase tracking-widest rounded-sm transition-colors"
        >
          Return to Hub
        </button>
      </div>
    </motion.div>
  );
}
