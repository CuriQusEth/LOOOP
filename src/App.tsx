/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from './lib/wagmi';
import { useGameStore } from './store/gameStore';
import { TitleScreen } from './components/TitleScreen';
import { WalletConnect, SayGMButton } from './components/Web3Components';
import { UpgradesMenu } from './components/UpgradesMenu';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { GameCanvas } from './components/GameCanvas';
import { AnimatePresence } from 'motion/react';

const queryClient = new QueryClient();

function GameRoot() {
  const currentScreen = useGameStore((state) => state.currentScreen);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans selection:bg-neon-magenta selection:text-white flex flex-col">
      <WalletConnect />
      <div className="absolute top-4 left-4 z-50">
        <SayGMButton />
      </div>
      
      <AnimatePresence mode="wait">
        {currentScreen === 'title' && <TitleScreen key="title" />}
        {currentScreen === 'game' && <GameCanvas key="game" />}
        {currentScreen === 'upgrades' && <UpgradesMenu key="upgrades" />}
        {currentScreen === 'leaderboard' && <LeaderboardScreen key="leaderboard" />}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <GameRoot />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
