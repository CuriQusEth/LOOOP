import { motion } from 'motion/react';
import { useGameStore } from '../store/gameStore';
import { useAccount, useSendTransaction } from 'wagmi';
import { useState } from 'react';

export function LeaderboardScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const { isConnected, address } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const [gmStatus, setGmStatus] = useState<'idle'|'sending'|'success'>('idle');

  // Hardcoded eternal loopers + space to show current player stats
  const mockLeaderboard = [
    { name: '0x1F2A...3B4C', loops: 142, distance: 98402, rank: 1 },
    { name: '0x8B3E...984A', loops: 108, distance: 76000, rank: 2 },
    { name: '0x992B...C210', loops: 89, distance: 68300, rank: 3 },
    { name: '0x44AA...01DA', loops: 54, distance: 41200, rank: 4 },
    { name: '0x7120...E312', loops: 44, distance: 38040, rank: 5 },
  ];

  const highestLoops = useGameStore(s => s.highestLoops);
  const highestDistance = useGameStore(s => s.highestDistance);

  const handleGM = async () => {
    if (!address) return;
    try {
      setGmStatus('sending');
      await sendTransactionAsync({
        to: address,
        value: 0n,
        data: '0x474d' // 'GM' in hex
      });
      setGmStatus('success');
      setTimeout(() => setGmStatus('idle'), 3000);
    } catch {
      setGmStatus('idle');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '-100%' }}
      className="absolute inset-0 bg-black/95 p-6 flex flex-col z-20"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 mt-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-white text-glow-cyan uppercase">
            Eternal Loopers
          </h2>
          <p className="text-xs font-mono text-neon-cyan/70 flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Base Denim Mainnet &bull; 200ms Canonical Blocks
          </p>
        </div>
        {isConnected && (
          <button 
            onClick={handleGM}
            disabled={gmStatus !== 'idle'}
            className="px-4 py-2 border border-neon-cyan text-neon-cyan font-mono text-xs uppercase rounded-sm hover:bg-neon-cyan/20 disabled:opacity-50 flex items-center gap-2"
          >
            {gmStatus === 'idle' ? 'Say GM On Denim Mainnet' : gmStatus === 'sending' ? 'Broadcasting (200ms)...' : 'GM Immortallized!'}
          </button>
        )}
      </div>

      <div className="mb-8 p-4 border border-neon-magenta/50 bg-neon-magenta/10 rounded-sm">
        <h3 className="text-neon-magenta font-mono uppercase text-sm mb-2">Your Peak Cycle</h3>
        <div className="flex justify-between font-mono text-white text-xl">
          <span>{highestLoops} Loops</span>
          <span>{Math.floor(highestDistance)} Dist</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {mockLeaderboard.map((item) => (
          <div key={item.rank} className="flex items-center justify-between p-4 border border-gray-800 bg-gray-900/30 rounded-sm hover:border-gray-600 transition-colors">
            <div className="flex items-center space-x-4">
              <span className="text-yellow-500 font-mono font-bold text-xl w-6">#{item.rank}</span>
              <span className="font-mono text-gray-300">{item.name}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-neon-cyan font-bold font-mono">{item.loops} Loops</span>
              <span className="text-gray-500 font-mono text-sm">{item.distance} Dist</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setScreen('title')}
          className="px-8 py-3 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-400 font-mono uppercase tracking-widest rounded-sm transition-colors"
        >
          Return
        </button>
      </div>
    </motion.div>
  );
}
