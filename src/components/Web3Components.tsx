import { useAccount, useConnect, useDisconnect, useSendTransaction, useSignMessage } from 'wagmi';
import { motion } from 'motion/react';
import { useState } from 'react';
import { encodeAttributionData } from '../lib/erc8021/attribution';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { sendTransactionAsync } = useSendTransaction();
  
  return (
    <div className="absolute top-4 right-4 z-50 flex items-center space-x-3 text-sm font-mono">
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
          className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan rounded-sm hover:bg-neon-cyan/30 transition-all box-glow-cyan uppercase font-bold tracking-widest relative overflow-hidden group"
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
      // Step 1: SIWE signature for proof
      const message = `I am verifying my LOOOP run on Base Mainnet.\nLoops: ${loops}\nDistance: ${distance}\nForever on-chain.`;
      await signMessageAsync({ message, account: address });
      
      setStatus('sending');
      // Step 2: Record transaction with ERC-8021
      const calldata = encodeAttributionData(`LOOOP_SCORE:${distance};LOOPS:${loops}`);
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
