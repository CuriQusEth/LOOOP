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
      status: "active",
      description: "Active MCP server for Looop Three Orchestrator Agent",
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

  // Agent API Endpoint
  app.get("/api/agent", (req, res) => {
    res.json({
      name: "Looop Three Orchestrator",
      status: "active",
      wallet: "0x29536D0bc1004ab274c4F0F59734Ad74D4559b7B",
      platform: "Looop Three",
      version: "1.0.0"
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
