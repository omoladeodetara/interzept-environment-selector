import { NextResponse } from 'next/server';

/**
 * Health Check API Route
 */

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'last-price-api'
  });
}
