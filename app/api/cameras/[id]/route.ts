import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (adminDb) {
      const doc = await adminDb.collection('cameras').doc(id).get();
      if (!doc.exists) {
        return NextResponse.json({ error: 'Camera not found' }, { status: 404 });
      }
      return NextResponse.json({ camera: { id: doc.id, ...doc.data() } });
    }

    return NextResponse.json({
      camera: {
        id,
        name: `Camera-${id}`,
        location: 'Tank Alpha',
        streamUrl: '',
        status: 'online',
        enabled: true
      }
    });
  } catch (error) {
    console.error('Camera fetch error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const allowedUpdates = ['name', 'location', 'streamUrl', 'status', 'enabled'];
    const updates: Record<string, any> = {
      lastUpdated: new Date().toISOString()
    };

    for (const key of allowedUpdates) {
      if (key in body) {
        updates[key] = body[key];
      }
    }

    if (adminDb) {
      await adminDb.collection('cameras').doc(id).set(updates, { merge: true });
    }

    return NextResponse.json({
      success: true,
      id,
      updates
    });
  } catch (error) {
    console.error('Camera update error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (adminDb) {
      await adminDb.collection('cameras').doc(id).delete();
    }

    return NextResponse.json({
      success: true,
      id,
      deleted: true
    });
  } catch (error) {
    console.error('Camera deletion error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
