import { useAccount, useConnect, useDisconnect, useSendTransaction, useSignMessage } from 'wagmi';
import { motion } from 'motion/react';
import { useState } from 'react';
import { encodeAttributionData } from '../lib/erc8021/attribution';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  return (
    <div className="absolute top-4 right-4 z-50 flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm font-mono">
      {/* Base Denim Mainnet Indicator */}
      <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-blue-950/40 border border-blue-500/40 text-blue-300 rounded-full text-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-semibold">Base Denim</span>
        <span className="text-[10px] text-blue-400/80">200ms</span>
      </div>

      {isConnected ? (
        <>
          <div className="px-3 py-1.5 bg-black/60 border border-neon-cyan/50 text-neon-cyan rounded-full backdrop-blur-md box-glow-cyan shadow-neon">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
          <button 
            onClick={() => disconnect()}
            className="px-3 py-1.5 bg-red-900/40 border border-red-500/50 text-red-400 rounded-full hover:bg-red-900/60 transition-colors"
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={() => connect({ connector: connectors[0] })}
          className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan rounded-sm hover:bg-neon-cyan/30 transition-all box-glow-cyan uppercase font-bold tracking-widest relative overflow-hidden group text-xs sm:text-sm"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
          Connect Base
        </button>
      )}
    </div>
  );
}

export function RecordRunButton({ distance, loops }: { distance: number, loops: number }) {
  const { address, isConnected } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const { signMessageAsync } = useSignMessage();
  const [status, setStatus] = useState<'idle' | 'signing' | 'sending' | 'success' | 'error'>('idle');

  const handleRecord = async () => {
    if (!address) return;
    try {
      setStatus('signing');
      // Step 1: SIWE signature for proof on Base Denim Mainnet
      const message = `I am verifying my LOOOP run on Base Denim Mainnet (200ms blocks).\nLoops: ${loops}\nDistance: ${distance}\nForever on-chain.`;
      await signMessageAsync({ message, account: address });
      
      setStatus('sending');
      // Step 2: Record transaction with ERC-8021
      const calldata = encodeAttributionData(`LOOOP_SCORE:${distance};LOOPS:${loops};CHAIN:BASE_DENIM_MAINNET`);
      await sendTransactionAsync({
        to: address, // Send to self
        value: 0n,
        data: calldata,
      });
      
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  if (!isConnected) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleRecord}
      disabled={status !== 'idle'}
      className="mt-4 px-6 py-3 bg-neon-purple/20 border-2 border-neon-purple text-white font-mono uppercase tracking-widest rounded-lg flex items-center justify-center space-x-2 box-glow-magenta disabled:opacity-50"
    >
      {status === 'idle' && <span>Record Run On-Chain</span>}
      {status === 'signing' && <span>Signing SIWE...</span>}
      {status === 'sending' && <span>Broadcasting Tx...</span>}
      {status === 'success' && <span>Run Immortalized!</span>}
      {status === 'error' && <span>Transaction Failed</span>}
    </motion.button>
  );
}

import { Sun } from 'lucide-react';

export function SayGMButton() {
  const { address, isConnected } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const sendGMTransaction = async () => {
    if (!address) return;
    try {
      setStatus('sending');
      await sendTransactionAsync({
        to: '0xcD0dd3716C5561De47a24949335dF8a8CD8F71a3',
        value: 0n,
        data: '0x474d' // 'GM'
      });
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('idle');
    }
  };

  if (!isConnected) return null;

  return (
    <button 
      onClick={sendGMTransaction}
      disabled={status !== 'idle'}
      className="px-3 py-2 rounded-lg bg-[#E8A020]/20 hover:bg-[#E8A020]/30 border border-[#E8A020]/40 text-[#E8A020] transition-colors flex items-center gap-2 font-['Cinzel'] text-xs font-bold disabled:opacity-50"
    >
      <Sun size={14} />
      {status === 'idle' ? 'Say GM' : status === 'sending' ? 'Sending...' : 'GM Said!'}
    </button>
  );
}