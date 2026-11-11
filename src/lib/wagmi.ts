import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Base Mainnet configured with Denim upgrade (canonical 200ms blocks)
export const baseDenimMainnet = {
  ...base,
  name: 'Base Mainnet (Denim)',
  rpcUrls: {
    ...base.rpcUrls,
    default: {
      http: ['https://mainnet.base.org'],
    },
    public: {
      http: ['https://mainnet.base.org'],
    },
  },
} as const;

export const wagmiConfig = createConfig({
  chains: [baseDenimMainnet],
  transports: {
    [baseDenimMainnet.id]: http('https://mainnet.base.org', {
      batch: true,
      retryCount: 3,
    }),
  },
  connectors: [
    injected(),
  ],
  // Denim replaces Flashblocks with native 200ms canonical blocks
  pollingInterval: 200,
});
