import 'server-only';
import { getVerifiedUser } from '@/lib/auth';
import { requireEnv } from '@/lib/env';
import { ensureMemberSchema, memberDB } from '@/lib/member-db';

// VERCEL-ONLY replacement for the origin's version - never overwrite it from
// the origin. The SQL is unchanged. What differs is where identity comes from
// (Supabase instead of ChatGPT headers), and that an email address is trusted
// only once Supabase has confirmed it. Without that, anyone could register an
// administrator's address and inherit the role through the bootstrap list or
// the email match below.

export type StaffRole = 'admin' | 'sales';
export type AdminActor = {
  id: string;
  email: string;
  name?: string;
  role: StaffRole;
};

function bootstrapEmails() {
  return new Set(
    requireEnv('NEXAVORIS_ADMIN_EMAILS')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function getAdminActor(): Promise<AdminActor | null> {
  const verified = await getVerifiedUser();
  if (!verified?.emailConfirmed) return null;
  const user = { id: verified.id, email: verified.email, name: verified.name };
  await ensureMemberSchema();
  const db = memberDB();
  const now = new Date().toISOString();
  if (bootstrapEmails().has(user.email.toLowerCase())) {
    await db
      .prepare(
        "INSERT INTO admin_staff (user_id,email,display_name,role,active,created_at,updated_at) VALUES (?,?,?,'admin',1,?,?) ON CONFLICT(email) DO UPDATE SET user_id=excluded.user_id,display_name=excluded.display_name,active=1,updated_at=excluded.updated_at",
      )
      .bind(user.id, user.email, user.name ?? null, now, now)
      .run();
  }
  const staff = await db
    .prepare(
      'SELECT role,active,user_id FROM admin_staff WHERE user_id=? OR lower(email)=lower(?)',
    )
    .bind(user.id, user.email)
    .first<{ role: StaffRole; active: number; user_id: string }>();
  if (!staff || !staff.active) return null;
  if (staff.user_id !== user.id)
    await db
      .prepare(
        'UPDATE admin_staff SET user_id=?,display_name=?,updated_at=? WHERE user_id=?',
      )
      .bind(user.id, user.name ?? null, now, staff.user_id)
      .run();
  return { ...user, role: staff.role };
}

export async function requireAdminActor(role?: 'admin') {
  const actor = await getAdminActor();
  if (!actor || (role === 'admin' && actor.role !== 'admin')) return null;
  return actor;
}
