import { NextRequest, NextResponse } from 'next/server';

// API base URL - configure this to point to your Express backend
// In production, this could be another Vercel deployment or external service
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  const pathname = pathSegments?.join('/') || '';
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${API_BASE_URL}/api/${pathname}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // Add body for methods that support it
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const body = await request.json().catch(() => ({}));
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to reach API server', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 502 }
    );
  }
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path, 'GET');
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path, 'POST');
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path, 'PUT');
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path, 'PATCH');
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path, 'DELETE');
}
