import { NextResponse, type NextRequest } from 'next/server';
import { getSessionUser, loginPath, safeReturnTo } from '@/lib/auth';

// Vercel-only. Origin components link to OpenAI Sites' /signin-with-chatgpt;
// this keeps those links working and sends visitors to our sign-in page.

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const returnTo = safeReturnTo(request.nextUrl.searchParams.get('return_to'));
  const user = await getSessionUser();
  return NextResponse.redirect(new URL(user ? returnTo : loginPath(returnTo), request.url), 303);
}
