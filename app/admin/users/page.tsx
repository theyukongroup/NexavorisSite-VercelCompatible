import { notFound } from 'next/navigation';
import { requireChatGPTUser } from '@/app/chatgpt-auth';
import { getAdminActor } from '@/lib/admin-auth';
import { AdminDashboard } from '@/components/admin-dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  await requireChatGPTUser('/admin/users');
  const actor = await getAdminActor();
  if (!actor || actor.role !== 'admin') notFound();
  return <AdminDashboard actor={actor} initialTab="users" />;
}
