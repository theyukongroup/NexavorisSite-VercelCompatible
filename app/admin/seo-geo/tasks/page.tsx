import { notFound } from 'next/navigation';
import { requireChatGPTUser } from '@/app/chatgpt-auth';
import { getAdminActor } from '@/lib/admin-auth';
import { SeoGeoControlCenter } from '@/components/seo-geo-control-center';

export const dynamic = 'force-dynamic';
export default async function SeoGeoTasksPage() {
  await requireChatGPTUser('/admin/seo-geo/tasks');
  const actor = await getAdminActor();
  if (!actor || actor.role !== 'admin') notFound();
  return <SeoGeoControlCenter actor={actor} initialTab="tasks" />;
}
