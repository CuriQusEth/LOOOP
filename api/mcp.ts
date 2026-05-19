import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            protocol: "MCP",
            version: "1.0.0",
            name: "Looop Three Orchestrator",
            status: "active",
            description: "Active MCP server for Looop Three Orchestrator Agent",
            capabilities: { tools: {}, prompts: {}, resources: {} },
            timestamp: new Date().toISOString()
        });
    }

    if (req.method === 'POST') {
        try {
            const body = req.body;
            const { method, params, id } = body;

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
                    if (!method) {
                        return res.status(200).json({
                            status: "success",
                            message: "MCP command received",
                            agent: "Looop Three Orchestrator",
                            receivedAt: new Date().toISOString(),
                            payload: body
                        });
                    }
                    return res.status(404).json({ error: "Method not found" });
            }

            return res.status(200).json({
                jsonrpc: "2.0",
                id: id || null,
                result
            });
        } catch (error) {
            return res.status(400).json({ error: "Invalid MCP request" });
        }
    }

    return res.status(405).json({ error: "Method Not Allowed" });
}
