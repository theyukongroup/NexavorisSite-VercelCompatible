import { getChatGPTUser } from '@/app/chatgpt-auth';
import { ensureMemberSchema, memberDB } from '@/lib/member-db';

const allowedInterest = new Set([
  'Private AI',
  'ERP',
  'AI + ERP',
  'Automation',
  'Not Sure',
]);
export async function POST(request: Request) {
  const text = await request.text();
  if (text.length > 20000)
    return Response.json({ error: 'Request too large' }, { status: 413 });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
  for (const key of ['name', 'company', 'email', 'interest', 'description'])
    if (!String(body[key] ?? '').trim())
      return Response.json({ error: `${key} is required` }, { status: 400 });
  const email = String(body.email).trim();
  if (
    !/^\S+@\S+\.\S+$/.test(email) ||
    !allowedInterest.has(String(body.interest))
  )
    return Response.json({ error: 'Invalid form values' }, { status: 400 });
  await ensureMemberSchema();
  const user = await getChatGPTUser();
  await memberDB()
    .prepare(
      'INSERT INTO consultation_requests (id,user_id,name,company,email,phone,industry,employees,software,interest,description,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
    )
    .bind(
      crypto.randomUUID(),
      user?.id ?? null,
      String(body.name).slice(0, 200),
      String(body.company).slice(0, 200),
      email.slice(0, 320),
      String(body.phone ?? '').slice(0, 80),
      String(body.industry ?? '').slice(0, 120),
      String(body.employees ?? '').slice(0, 80),
      String(body.software ?? '').slice(0, 300),
      String(body.interest).slice(0, 80),
      String(body.description).slice(0, 5000),
      new Date().toISOString(),
    )
    .run();
  return Response.json({ ok: true });
}
