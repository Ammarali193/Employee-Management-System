import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    data: [
      { id: 1, name: 'Morning Shift', start: '09:00', end: '17:00' },
      { id: 2, name: 'Night Shift', start: '21:00', end: '05:00' }
    ]
  });
}

export async function POST(request: Request) {
  const data = await request.json();
  return NextResponse.json({ message: 'Shift created', data });
}

