# LOOOP - The Eternal Runner

LOOOP is a minimalist, deeply addictive time-loop endless runner. You are trapped in an infinite glowing loop. Run, jump, and manipulate time to break through increasingly difficult cycles.

This application is built with React, Vite, Tailwind CSS, Canvas, and Framer Motion, and integrates with the Base blockchain to store your high scores and records on-chain eternally.

## Features

- **Loop Mechanic**: Rewind time when you crash, maintaining your earned "Essence", while the world gets faster and more complex.
- **Canvas Rendering**: High-performance rendering for smooth physics, particle systems, and neon trails.
- **Upgrades / Evolution Codex**: Spend collected Essence to unlock Double Jump (Phantom Step), Slow Time (Chrono Dilator), and Dash (Neon Phase).
- **Web3 Integration**: Record your peak runs directly as transactions on the Base blockchain using ERC-8021 metadata attribution. Include the generic `say GM` trustless agent interaction!
- **On-chain Leaderboard**: Showcase eternal loopers and peak distances securely using Wagmi and Viem.
- **AI Agent & MCP Capabilities**: Fully configured to support Looop Three Orchestrator actions with integrated endpoints for AI agents.

## Stack
- React 19 + Vite
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Wagmi + Viem
- Express Server (for Agent / MCP Endpoints)

## AI Agent Integrations
LOOOP integrates Agent-to-Agent (A2A) communications and Model Context Protocol (MCP) endpoints natively:
- **`/.well-known/agent-card.json`**: Agent discovery & identity.
- **`/api/mcp`**: Active model context control operations via REST.
- **`/api/agent`**: Primary agent status and synchronization.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Enjoy and break the eternal loop!
