import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const expectedKey = process.env.INGEST_API_KEY || 'sk_live_938xj290n1';

    // Support query param ?key=..., Authorization: Bearer ..., or x-api-key header
    const authHeader = req.headers.get('authorization');
    const xApiKey = req.headers.get('x-api-key');
    const queryKey = req.nextUrl.searchParams.get('key');

    let providedKey = queryKey;
    if (!providedKey && authHeader?.startsWith('Bearer ')) {
      providedKey = authHeader.substring(7);
    } else if (!providedKey && xApiKey) {
      providedKey = xApiKey;
    }

    if (!providedKey || providedKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing telemetry API key' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate minimal payload structure
    if (!body || typeof body !== 'object' || !body.metrics || typeof body.metrics !== 'object') {
      return NextResponse.json(
        { error: 'Invalid payload: Expected JSON body with a "metrics" object' },
        { status: 400 }
      );
    }

    const { metrics } = body;
    const deviceId = body.device_id || body.deviceId || 'rpi_master_node';
    const timestamp = body.timestamp ? new Date(body.timestamp) : new Date();

    // Compute aquaculture automated control decisions
    const commands: Record<string, string | boolean> = {};

    // 1. Aeration threshold (DO critical or water temp elevated)
    if (
      (typeof metrics.dissolvedOxygen === 'number' && metrics.dissolvedOxygen < 4.5) ||
      (typeof metrics.temperature === 'number' && metrics.temperature > 28.0) ||
      (typeof metrics.turbidity === 'number' && metrics.turbidity > 25.0)
    ) {
      commands.aerator = 'ON';
    } else if (typeof metrics.dissolvedOxygen === 'number' && metrics.dissolvedOxygen >= 6.0) {
      commands.aerator = 'AUTO_IDLE';
    }

    // 2. Thermal regulation
    if (typeof metrics.temperature === 'number') {
      if (metrics.temperature < 21.0) {
        commands.heater = 'ON';
      } else if (metrics.temperature > 25.0) {
        commands.heater = 'OFF';
      }
    }

    // 3. Power conservation mode
    if (typeof metrics.batterySoc === 'number' && metrics.batterySoc < 20) {
      commands.powerSavingMode = true;
      commands.secondaryPumps = 'OFF';
    }

    // Save telemetry to Firestore if Admin SDK is connected
    if (adminDb) {
      try {
        await adminDb.collection('telemetry').add({
          timestamp,
          deviceId,
          metrics,
          commands
        });

        // Update latest status document for dashboard real-time sync
        await adminDb.collection('system_status').doc('latest').set(
          {
            lastUpdated: timestamp,
            deviceId,
            ...metrics,
            activeCommands: commands
          },
          { merge: true }
        );
      } catch (dbError) {
        console.warn('Firestore write warning:', (dbError as Error).message);
      }
    }

    return NextResponse.json({
      success: true,
      deviceId,
      receivedAt: timestamp.toISOString(),
      commands,
      metricsReceived: Object.keys(metrics).length
    });
  } catch (error) {
    console.error('Ingest API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

