import 'server-only';
import { getSessionUser, loginPath, requireSessionUser, type SessionUser } from '@/lib/auth';

// VERCEL-ONLY SHIM - NEVER OVERWRITE THIS FILE FROM THE ORIGIN.
// The origin's version trusts `oai-authenticated-user-*` request headers that
// only OpenAI Sites can set. On Vercel any client can send those headers, so
// copying it here would let anyone sign in as anyone. Identity comes from the
// Supabase session instead (lib/auth.ts). The export names match the origin so
// its pages and routes copy over unchanged.

export type ChatGPTUser = SessionUser;

export const getChatGPTUser = getSessionUser;

export function chatGPTSignInPath(returnTo = '/account') {
  return loginPath(returnTo);
}

export const requireChatGPTUser = requireSessionUser;
