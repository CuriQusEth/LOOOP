import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: "Looop Three Orchestrator",
    status: "active",
    wallet: "0x29536D0bc1004ab274c4F0F59734Ad74D4559b7B",
    platform: "Looop Three",
    version: "1.0.0"
  }, { headers: buildCorsHeaders() });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      name: "Looop Three Orchestrator",
      status: "active",
      message: "Agent endpoint POST action received",
      receivedAt: new Date().toISOString(),
      payload: body
    }, { headers: buildCorsHeaders() });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: buildCorsHeaders() });
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
