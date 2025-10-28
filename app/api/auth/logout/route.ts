import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear both local session and jaayvee-world auth cookies
  response.cookies.delete('session');
  response.cookies.delete('auth-token');
  
  return response;
}