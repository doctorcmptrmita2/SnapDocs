/**
 * Easypanel API Test Endpoint
 * 
 * GET /api/admin/easypanel/test - Test Easypanel API connection
 * 
 * Only accessible by authenticated users
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { easypanel, isEasypanelEnabled } from '@/lib/easypanel/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isEasypanelEnabled()) {
      return NextResponse.json({
        enabled: false,
        message: 'Easypanel integration not configured',
        requiredEnvVars: ['EASYPANEL_URL', 'EASYPANEL_TOKEN'],
      });
    }

    const result = await easypanel.testConnection();

    return NextResponse.json({
      enabled: true,
      connected: result.success,
      error: result.error,
      message: result.message,
      config: {
        url: process.env.EASYPANEL_URL,
        project: process.env.EASYPANEL_PROJECT || 'repodocs',
        service: process.env.EASYPANEL_SERVICE || 'app',
      },
      note: 'Easypanel does not have a public API for domain management. Domains must be added manually in Easypanel dashboard.',
    });
  } catch (error) {
    console.error('Easypanel test error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
