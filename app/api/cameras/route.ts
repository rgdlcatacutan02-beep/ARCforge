import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// In-memory fallback if Firestore admin credentials are not active in the current environment
let fallbackCameras: Array<{
  id: string;
  name: string;
  location: string;
  streamUrl: string;
  status: string;
  enabled: boolean;
  lastUpdated: string;
}> = [
  {
    id: '1',
    name: 'NODE-CAM-01',
    location: 'REAR TANK',
    streamUrl: '',
    status: 'online',
    enabled: true,
    lastUpdated: new Date().toISOString()
  }
];

export async function GET() {
  try {
    if (adminDb) {
      const snapshot = await adminDb.collection('cameras').get();
      const cameras = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return NextResponse.json({ cameras });
    }

    // Fallback mode for local development/demo
    return NextResponse.json({ cameras: fallbackCameras });
  } catch (error) {
    console.error('Fetch cameras error:', error);
    return NextResponse.json({ cameras: fallbackCameras });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Missing required camera name' }, { status: 400 });
    }

    const newCamera = {
      name: body.name,
      location: body.location || 'Grow Tank',
      streamUrl: body.streamUrl || '',
      status: body.status || 'online',
      enabled: typeof body.enabled === 'boolean' ? body.enabled : true,
      lastUpdated: new Date().toISOString()
    };

    if (adminDb) {
      const docRef = await adminDb.collection('cameras').add({
        ...newCamera,
        lastUpdated: new Date()
      });
      return NextResponse.json({ success: true, id: docRef.id, camera: { id: docRef.id, ...newCamera } });
    }

    // Fallback mode
    const id = Math.random().toString(36).substring(2, 9);
    const cameraWithId = { id, ...newCamera };
    fallbackCameras.push(cameraWithId);

    return NextResponse.json({ success: true, id, camera: cameraWithId });
  } catch (error) {
    console.error('Camera registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 });
  }
}

