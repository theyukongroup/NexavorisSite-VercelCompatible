import { getChatGPTUser } from '@/app/chatgpt-auth';
import { ensureMemberSchema, memberDB, parseJSON } from '@/lib/member-db';

export const dynamic = 'force-dynamic';
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
async function auth() {
  const user = await getChatGPTUser();
  if (!user) return null;
  await ensureMemberSchema();
  const administration = await memberDB()
    .prepare('SELECT account_status FROM member_admin_records WHERE user_id=?')
    .bind(user.id)
    .first<{ account_status: string }>();
  if (administration?.account_status === 'suspended') return null;
  const now = new Date().toISOString();
  await memberDB()
    .prepare(
      'INSERT INTO member_profiles (user_id,email,created_at,updated_at) VALUES (?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET email=excluded.email,updated_at=excluded.updated_at',
    )
    .bind(user.id, user.email, now, now)
    .run();
  return user;
}

export async function GET() {
  const user = await auth();
  if (!user) return json({ error: 'Authentication required' }, 401);
  const db = memberDB();
  const [profile, assessment, opportunity, roi, roadmap] = await Promise.all([
    db
      .prepare('SELECT * FROM member_profiles WHERE user_id=?')
      .bind(user.id)
      .first(),
    db
      .prepare(
        'SELECT * FROM assessment_reports WHERE user_id=? ORDER BY updated_at DESC LIMIT 1',
      )
      .bind(user.id)
      .first(),
    db
      .prepare(
        'SELECT * FROM opportunity_reports WHERE user_id=? ORDER BY created_at DESC LIMIT 1',
      )
      .bind(user.id)
      .first(),
    db
      .prepare(
        'SELECT * FROM roi_calculations WHERE user_id=? ORDER BY created_at DESC LIMIT 1',
      )
      .bind(user.id)
      .first(),
    db
      .prepare('SELECT * FROM member_roadmaps WHERE user_id=?')
      .bind(user.id)
      .first(),
  ]);
  return json({
    user,
    profile: parseJSON(profile?.profile_json, {}),
    assessment: assessment
      ? {
          responses: parseJSON(assessment.responses_json, {}),
          scores: parseJSON(assessment.scores_json, {}),
        }
      : null,
    opportunity: opportunity
      ? {
          selections: parseJSON(opportunity.selections_json, []),
          results: parseJSON(opportunity.results_json, []),
        }
      : null,
    roi: roi
      ? {
          inputs: parseJSON(roi.inputs_json, {}),
          results: parseJSON(roi.results_json, {}),
        }
      : null,
    roadmap: roadmap ? parseJSON(roadmap.roadmap_json, null) : null,
  });
}

export async function POST(request: Request) {
  const user = await auth();
  if (!user) return json({ error: 'Authentication required' }, 401);
  const text = await request.text();
  if (text.length > 100000) return json({ error: 'Request too large' }, 413);
  let body: any;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  const now = new Date().toISOString(),
    db = memberDB(),
    id = crypto.randomUUID();
  if (body.type === 'profile') {
    await db
      .prepare(
        'UPDATE member_profiles SET profile_json=?,updated_at=? WHERE user_id=?',
      )
      .bind(JSON.stringify(body.profile ?? {}), now, user.id)
      .run();
  } else if (body.type === 'assessment') {
    await db
      .prepare(
        'INSERT INTO assessment_reports (id,user_id,responses_json,scores_json,created_at,updated_at) VALUES (?,?,?,?,?,?)',
      )
      .bind(
        id,
        user.id,
        JSON.stringify(body.responses ?? {}),
        JSON.stringify(body.scores ?? {}),
        now,
        now,
      )
      .run();
    const selectedIndustry = String(body.responses?.industry ?? '').trim();
    if (selectedIndustry) {
      const existing = await db
        .prepare('SELECT profile_json FROM member_profiles WHERE user_id=?')
        .bind(user.id)
        .first<{ profile_json: string }>();
      const profile = parseJSON<Record<string, unknown>>(existing?.profile_json, {});
      if (!profile.industry) {
        profile.industry = selectedIndustry;
        await db
          .prepare('UPDATE member_profiles SET profile_json=?,updated_at=? WHERE user_id=?')
          .bind(JSON.stringify(profile), now, user.id)
          .run();
      }
    }
  } else if (body.type === 'opportunity') {
    await db
      .prepare(
        'INSERT INTO opportunity_reports (id,user_id,selections_json,results_json,created_at) VALUES (?,?,?,?,?)',
      )
      .bind(
        id,
        user.id,
        JSON.stringify(body.selections ?? []),
        JSON.stringify(body.results ?? []),
        now,
      )
      .run();
  } else if (body.type === 'roi') {
    await db
      .prepare(
        'INSERT INTO roi_calculations (id,user_id,inputs_json,results_json,created_at) VALUES (?,?,?,?,?)',
      )
      .bind(
        id,
        user.id,
        JSON.stringify(body.inputs ?? {}),
        JSON.stringify(body.results ?? {}),
        now,
      )
      .run();
  } else if (body.type === 'roadmap') {
    await db
      .prepare(
        'INSERT INTO member_roadmaps (user_id,roadmap_json,updated_at) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET roadmap_json=excluded.roadmap_json,updated_at=excluded.updated_at',
      )
      .bind(user.id, JSON.stringify(body.roadmap ?? {}), now)
      .run();
  } else {
    return json({ error: 'Unsupported record type' }, 400);
  }
  return json({ ok: true, id });
}
