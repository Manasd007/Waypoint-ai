import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
 
export async function GET() {
  const token = await auth().getToken({ template: 'convex' });
  return NextResponse.json({ token });
} 