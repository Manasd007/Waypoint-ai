import { getToken } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
 
export async function GET() {
  const token = await getToken({ template: 'convex' });
  return NextResponse.json({ token });
} 