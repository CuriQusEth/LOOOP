import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // --- API Routes ---
  
  // MCP GET Endpoint
  app.get("/api/mcp", (req, res) => {
    res.json({
      protocol: "MCP",
      version: "1.0.0",
      name: "Looop Three MCP Endpoint",
      network: "Base Mainnet (Denim)",
      chainId: 8453,
      blockTime: "200ms",
      status: "active",
      description: "Active MCP server for Looop Three Orchestrator Agent on Base Denim Mainnet",
      capabilities: [
        "loop-mechanics", 
        "cyclic-automation", 
        "multi-phase-orchestration"
      ],
      timestamp: new Date().toISOString()
    });
  });

  // MCP POST Endpoint
  app.post("/api/mcp", (req, res) => {
    try {
      const body = req.body;
      const { method, params, id } = body;
      
      // Standard MCP protocol JSON-RPC handling
      if (method) {
        let result = {};
        
        switch(method) {
          case 'initialize':
            result = {
              protocolVersion: "2024-11-05",
              capabilities: { tools: {}, prompts: {}, resources: {} },
              serverInfo: { name: "Looop Three Orchestrator", version: "1.0.0" }
            };
            break;
          case 'tools/list':
            result = {
              tools: [
                { name: "get_race_status", description: "Get the current race status.", inputSchema: { type: "object", properties: {} } },
                { name: "start_race", description: "Start a new race.", inputSchema: { type: "object", properties: {} } },
                { name: "get_leaderboard", description: "Get the current leaderboard stats.", inputSchema: { type: "object", properties: {} } },
                { name: "optimize_speed", description: "Optimize the loop speed.", inputSchema: { type: "object", properties: {} } },
                { name: "get_track_info", description: "Get current track and loop information.", inputSchema: { type: "object", properties: {} } }
              ]
            };
            break;
          case 'tools/call':
            result = {
              content: [{ type: "text", text: `Tool ${params?.name} executed successfully.` }]
            };
            break;
          case 'prompts/list':
            result = { prompts: [] };
            break;
          case 'resources/list':
            result = { resources: [] };
            break;
          default:
            return res.status(404).json({ error: "Method not found" });
        }
        
        return res.json({
          jsonrpc: "2.0",
          id: id || null,
          result
        });
      }

      // Fallback for custom webhook pings
      res.json({
        status: "success",
        message: "MCP command received",
        agent: "Looop Three Orchestrator",
        receivedAt: new Date().toISOString(),
        payload: body
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid MCP request" });
    }
  });

  // Agent GET Endpoint
  app.get("/api/agent", (req, res) => {
    res.json({
      name: "Looop Three Orchestrator",
      status: "active",
      network: "Base Mainnet (Denim)",
      chainId: 8453,
      blockTime: "200ms",
      wallet: "0x29536D0bc1004ab274c4F0F59734Ad74D4559b7B",
      platform: "Looop Three",
      version: "1.0.0"
    });
  });

  // Agent POST Endpoint
  app.post("/api/agent", (req, res) => {
    res.json({
      name: "Looop Three Orchestrator",
      status: "active",
      message: "Agent endpoint POST action received",
      receivedAt: new Date().toISOString()
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For Express 4
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
