import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    protocol: "MCP",
    version: "1.0.0",
    name: "Looop Three Orchestrator",
    status: "active",
    description: "Active MCP server for Looop Three Orchestrator Agent",
    capabilities: { tools: {}, prompts: {}, resources: {} },
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
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
        // Try to handle direct custom pings outside MCP standard
        if (!method) {
           return NextResponse.json(
            {
              status: "success",
              message: "MCP command received",
              agent: "Looop Three Orchestrator",
              receivedAt: new Date().toISOString(),
              payload: body
            },
            {
                headers: buildCorsHeaders()
            });
        }
        return NextResponse.json(
            { error: "Method not found" },
            { status: 404, headers: buildCorsHeaders() }
        );
    }

    return NextResponse.json({
      jsonrpc: "2.0",
      id: id || null,
      result
    }, { headers: buildCorsHeaders() });

  } catch (error) {
    return NextResponse.json({ error: "Invalid MCP request" }, { status: 400, headers: buildCorsHeaders() });
  }
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders()
  });
}

function buildCorsHeaders() {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}
