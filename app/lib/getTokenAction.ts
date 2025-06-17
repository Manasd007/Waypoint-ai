'use server';
import { auth } from '@clerk/nextjs/server';
 
export async function getAuthTokenAction() {
  return (await auth().getToken({ template: 'convex' })) ?? undefined;
} 