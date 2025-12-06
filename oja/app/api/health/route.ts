import { NextRequest, NextResponse } from 'next/server';

// This is a simple health check endpoint
// For full API functionality, you may want to deploy the Express backend separately
// or migrate the Express routes to Next.js API routes

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'last-price-api'
  });
}
