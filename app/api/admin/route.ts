import { requireAdminActor } from '@/lib/admin-auth';
import { memberDB, parseJSON } from '@/lib/member-db';

export const dynamic = 'force-dynamic';
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const statuses = [
  'New',
  'Reviewing',
  'Contacted',
  'Qualified',
  'Discovery Scheduled',
  'Proposal',
  'Client',
  'Not Qualified',
  'Closed',
];
const priorities = ['High', 'Medium', 'Low'];
type Row = Record<string, unknown>;

function leadScore(user: Row) {
  let score = 0;
  if (user.assessment) score += 20;
  if (Number((user.scores as Row | undefined)?.automation ?? 0) >= 70)
    score += 20;
  const employees = String(
    (user.profile as Row | undefined)?.employees ??
      (user.responses as Row | undefined)?.employees ??
      '',
  );
  if (/51|201|500/.test(employees)) score += 15;
  else if (/11/.test(employees)) score += 8;
  const problems = Number(user.problemCount ?? 0);
  score += Math.min(20, problems * 4);
  if (user.roadmap) score += 10;
  if (user.roi) score += 7;
  if (user.consultationRequested) score += 8;
  return Math.min(100, score);
}

async function loadUsers() {
  const db = memberDB();
  const { results: profiles } = await db
    .prepare('SELECT * FROM member_profiles ORDER BY created_at DESC')
    .all<Row>();
  const users = await Promise.all(
    profiles.map(async (profileRow) => {
      const id = String(profileRow.user_id);
      const [
        assessment,
        opportunity,
        roi,
        roadmap,
        admin,
        notes,
        events,
        consultation,
        saved,
        staffRole,
      ] = await Promise.all([
        db
          .prepare(
            'SELECT * FROM assessment_reports WHERE user_id=? ORDER BY updated_at DESC LIMIT 1',
          )
          .bind(id)
          .first<Row>(),
        db
          .prepare(
            'SELECT * FROM opportunity_reports WHERE user_id=? ORDER BY created_at DESC LIMIT 1',
          )
          .bind(id)
          .first<Row>(),
        db
          .prepare(
            'SELECT * FROM roi_calculations WHERE user_id=? ORDER BY created_at DESC LIMIT 1',
          )
          .bind(id)
          .first<Row>(),
        db
          .prepare('SELECT * FROM member_roadmaps WHERE user_id=?')
          .bind(id)
          .first<Row>(),
        db
          .prepare('SELECT * FROM member_admin_records WHERE user_id=?')
          .bind(id)
          .first<Row>(),
        db
          .prepare(
            'SELECT n.*,s.display_name author_name,s.email author_email FROM admin_notes n LEFT JOIN admin_staff s ON s.user_id=n.author_user_id WHERE member_user_id=? ORDER BY n.created_at DESC',
          )
          .bind(id)
          .all<Row>(),
        db
          .prepare(
            'SELECT event_name,context_json,created_at FROM member_events WHERE user_id=? ORDER BY created_at DESC',
          )
          .bind(id)
          .all<Row>(),
        db
          .prepare(
            'SELECT * FROM consultation_requests WHERE user_id=? OR lower(email)=lower(?) ORDER BY created_at DESC LIMIT 1',
          )
          .bind(id, String(profileRow.email))
          .first<Row>(),
        db
          .prepare(
            'SELECT resource_url,created_at FROM saved_resources WHERE user_id=? ORDER BY created_at DESC',
          )
          .bind(id)
          .all<Row>(),
        db
          .prepare(
            'SELECT role,active FROM admin_staff WHERE user_id=? OR lower(email)=lower(?) LIMIT 1',
          )
          .bind(id, String(profileRow.email))
          .first<Row>(),
      ]);
      const profile = parseJSON<Row>(profileRow.profile_json, {});
      const responses = assessment
        ? parseJSON<Row>(assessment.responses_json, {})
        : {};
      const scores = assessment
        ? parseJSON<Row>(assessment.scores_json, {})
        : {};
      const results = opportunity
        ? parseJSON<Row[]>(opportunity.results_json, [])
        : [];
      const eventRows = events.results ?? [];
      const consultationEvent = eventRows.find(
        (event) => event.event_name === 'consultation_submitted',
      );
      const user: Row = {
        id,
        email: profileRow.email,
        profile,
        responses,
        scores,
        assessment: assessment
          ? { id: assessment.id, createdAt: assessment.created_at }
          : null,
        opportunity: opportunity
          ? {
              selections: parseJSON<string[]>(opportunity.selections_json, []),
              results,
              createdAt: opportunity.created_at,
            }
          : null,
        problemCount: results.length,
        roi: roi
          ? {
              inputs: parseJSON<Row>(roi.inputs_json, {}),
              results: parseJSON<Row>(roi.results_json, {}),
              createdAt: roi.created_at,
            }
          : null,
        roadmap: roadmap ? parseJSON<Row>(roadmap.roadmap_json, {}) : null,
        roadmapUpdatedAt: roadmap?.updated_at ?? null,
        admin: admin ?? {
          account_status: 'active',
          lead_status: 'New',
          lead_priority: 'Medium',
          consultation_status: 'New',
          client_tier: 'Free Member',
        },
        notes: notes.results ?? [],
        events: eventRows,
        resources: saved.results ?? [],
        consultationRequested: Boolean(consultation || consultationEvent),
        consultationDate:
          consultation?.created_at ?? consultationEvent?.created_at ?? null,
        consultation,
        registrationDate: profileRow.created_at,
        lastLogin: profileRow.updated_at,
        accountRole:
          staffRole?.active && staffRole.role === 'admin'
            ? 'admin'
            : staffRole?.active && staffRole.role === 'sales'
              ? 'sales'
              : 'member',
      };
      user.leadScore = leadScore(user);
      return user;
    }),
  );
  return users;
}

function summarize(users: Row[]) {
  const now = Date.now(),
    day = 86400000;
  const countSince = (days: number) =>
    users.filter(
      (u) => now - new Date(String(u.registrationDate)).getTime() < day * days,
    ).length;
  const eventCount = (name: string) =>
    users.reduce(
      (sum, u) =>
        sum +
        ((u.events as Row[]) ?? []).filter((e) => e.event_name === name).length,
      0,
    );
  const completed = users.filter((u) => u.assessment).length;
  const dimensions = ['ai', 'erp', 'automation', 'data'];
  const averages = Object.fromEntries(
    dimensions.map((key) => [
      key,
      completed
        ? Math.round(
            users.reduce(
              (sum, u) => sum + Number((u.scores as Row)?.[key] ?? 0),
              0,
            ) / completed,
          )
        : 0,
    ]),
  );
  const group = (getter: (u: Row) => string) =>
    Object.entries(
      users.reduce<Record<string, number>>((acc, u) => {
        const key = getter(u) || 'Not provided';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {}),
    ).sort((a, b) => b[1] - a[1]);
  const problems = new Map<string, number>(),
    solutions = new Map<string, number>();
  users.forEach((u) =>
    (((u.opportunity as Row | null)?.results as Row[]) ?? []).forEach((r) => {
      const p = String(r.problem),
        s = String(r.solution);
      problems.set(p, (problems.get(p) ?? 0) + 1);
      solutions.set(s, (solutions.get(s) ?? 0) + 1);
    }),
  );
  const consultations = users.filter((u) => u.consultationRequested);
  return {
    metrics: {
      total: users.length,
      today: countSince(1),
      week: countSince(7),
      month: countSince(30),
      assessmentStarted: eventCount('assessment_started'),
      assessmentCompleted: completed,
      conversionRate: eventCount('assessment_started')
        ? Math.round((completed / eventCount('assessment_started')) * 100)
        : 0,
      opportunities: users.filter((u) => u.opportunity).length,
      roi: users.filter((u) => u.roi).length,
      roadmaps: users.filter((u) => u.roadmap).length,
      consultations: consultations.length,
      qualified: users.filter((u) =>
        ['Qualified', 'Discovery Scheduled', 'Proposal'].includes(
          String((u.admin as Row).lead_status),
        ),
      ).length,
      clients: users.filter(
        (u) => String((u.admin as Row).lead_status) === 'Client',
      ).length,
    },
    averages,
    industry: group((u) =>
      String(
        (u.profile as Row).industry ?? (u.responses as Row).industry ?? '',
      ),
    ),
    companySize: group((u) =>
      String(
        (u.profile as Row).employees ?? (u.responses as Row).employees ?? '',
      ),
    ),
    leadStatus: group((u) => String((u.admin as Row).lead_status)),
    problems: [...problems.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
    solutions: [...solutions.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
    recent: users.slice(0, 8),
    consultations: consultations.slice(0, 8),
  };
}

export async function GET(request: Request) {
  const actor = await requireAdminActor('admin');
  if (!actor) return json({ error: 'Administrator access required' }, 403);
  const url = new URL(request.url),
    users = await loadUsers();
  if (url.searchParams.get('format') === 'csv') {
    const esc = (v: unknown) => `"${String(v ?? '').replaceAll('"', '""')}"`;
    const header = [
      'Name',
      'Company',
      'Email',
      'Phone',
      'Industry',
      'Employees',
      'Readiness Score',
      'Automation Score',
      'Lead Status',
      'Registration Date',
      'Consultation Requested',
    ];
    const lines = users.map((u) => {
      const p = u.profile as Row,
        a = u.admin as Row,
        s = u.scores as Row;
      return [
        p.firstName || p.name,
        p.company,
        u.email,
        p.phone,
        p.industry || (u.responses as Row).industry,
        p.employees || (u.responses as Row).employees,
        s.overall,
        s.automation,
        a.lead_status,
        u.registrationDate,
        u.consultationRequested ? 'Yes' : 'No',
      ]
        .map(esc)
        .join(',');
    });
    return new Response([header.map(esc).join(','), ...lines].join('\r\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="nexavoris-leads.csv"',
        'Cache-Control': 'no-store',
      },
    });
  }
  const { results: staff } = await memberDB()
    .prepare(
      'SELECT user_id,email,display_name,role,active,created_at FROM admin_staff ORDER BY email',
    )
    .all<Row>();
  const { results: audit } = await memberDB()
    .prepare(
      'SELECT a.*,s.email actor_email FROM admin_audit_log a LEFT JOIN admin_staff s ON s.user_id=a.actor_user_id ORDER BY a.created_at DESC LIMIT 100',
    )
    .all<Row>();
  const { results: consultationRequests } = await memberDB()
    .prepare(
      'SELECT * FROM consultation_requests ORDER BY created_at DESC LIMIT 500',
    )
    .all<Row>();
  const summary = summarize(users);
  summary.metrics.consultations = consultationRequests.length;
  return json({
    actor,
    users,
    summary,
    staff,
    audit,
    consultationRequests,
    statuses,
    priorities,
  });
}

export async function POST(request: Request) {
  const actor = await requireAdminActor('admin');
  if (!actor) return json({ error: 'Administrator access required' }, 403);
  const body = (await request.json()) as Row,
    action = String(body.action ?? '');
  let target = String(body.userId ?? '');
  const db = memberDB(),
    now = new Date().toISOString();
  let detail: Row = {};
  if (action === 'lead_update') {
    const status = String(body.leadStatus ?? 'New'),
      priority = String(body.leadPriority ?? 'Medium');
    if (!statuses.includes(status) || !priorities.includes(priority))
      return json({ error: 'Invalid lead value' }, 400);
    await db
      .prepare(
        'INSERT INTO member_admin_records (user_id,lead_status,lead_priority,assigned_owner_id,follow_up_date,consultation_status,client_tier,updated_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET lead_status=excluded.lead_status,lead_priority=excluded.lead_priority,assigned_owner_id=excluded.assigned_owner_id,follow_up_date=excluded.follow_up_date,consultation_status=excluded.consultation_status,client_tier=excluded.client_tier,updated_at=excluded.updated_at',
      )
      .bind(
        target,
        status,
        priority,
        body.assignedOwnerId || null,
        body.followUpDate || null,
        body.consultationStatus || 'New',
        status === 'Client' ? 'Client' : 'Free Member',
        now,
      )
      .run();
    detail = { status, priority };
  } else if (action === 'note') {
    const note = String(body.note ?? '').trim();
    if (!note || note.length > 2000)
      return json({ error: 'Note must be 1–2000 characters' }, 400);
    await db
      .prepare(
        'INSERT INTO admin_notes (id,member_user_id,author_user_id,note_text,created_at) VALUES (?,?,?,?,?)',
      )
      .bind(crypto.randomUUID(), target, actor.id, note, now)
      .run();
    detail = { noteAdded: true };
  } else if (action === 'account_status') {
    const status = body.status === 'suspended' ? 'suspended' : 'active';
    await db
      .prepare(
        'INSERT INTO member_admin_records (user_id,account_status,updated_at) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET account_status=excluded.account_status,updated_at=excluded.updated_at',
      )
      .bind(target, status, now)
      .run();
    detail = { status };
  } else if (action === 'profile_industry') {
    const industry = String(body.industry ?? '').trim();
    const allowed = [
      'Wholesale Distribution',
      'HVAC / Field Service',
      'Construction',
      'Manufacturing',
      'Retail',
      'Professional Services',
      'Other',
    ];
    if (!allowed.includes(industry))
      return json({ error: 'Invalid primary industry' }, 400);
    const member = await db
      .prepare('SELECT profile_json FROM member_profiles WHERE user_id=?')
      .bind(target)
      .first<Row>();
    if (!member) return json({ error: 'Registered member not found' }, 404);
    const profile = parseJSON<Row>(member.profile_json, {});
    const previousIndustry = profile.industry ?? null;
    profile.industry = industry;
    await db
      .prepare('UPDATE member_profiles SET profile_json=?,updated_at=? WHERE user_id=?')
      .bind(JSON.stringify(profile), now, target)
      .run();
    detail = { previousIndustry, industry };
  } else if (action === 'staff_role') {
    const email = String(body.email ?? '')
        .trim()
        .toLowerCase(),
      role = String(body.role ?? '');
    if (!email) return json({ error: 'Email required' }, 400);
    if (!['member', 'sales', 'admin'].includes(role))
      return json({ error: 'Invalid role' }, 400);
    const member = await db
      .prepare(
        'SELECT user_id,email,profile_json FROM member_profiles WHERE lower(email)=lower(?) LIMIT 1',
      )
      .bind(email)
      .first<Row>();
    if (!member)
      return json(
        { error: 'No registered Nexavoris member has that email address' },
        404,
      );
    target = String(member.user_id);
    const current = await db
      .prepare(
        'SELECT role,active FROM admin_staff WHERE user_id=? OR lower(email)=lower(?) LIMIT 1',
      )
      .bind(target, email)
      .first<Row>();
    if (current?.role === 'admin' && current.active && role !== 'admin') {
      const adminCount = await db
        .prepare("SELECT count(*) AS count FROM admin_staff WHERE role='admin' AND active=1")
        .first<{ count: number }>();
      if (Number(adminCount?.count ?? 0) <= 1)
        return json({ error: 'The last active administrator cannot be demoted' }, 409);
    }
    const profile = parseJSON<Row>(member.profile_json, {});
    const displayName =
      [profile.firstName, profile.lastName].filter(Boolean).join(' ') ||
      profile.name ||
      null;
    if (role === 'member') {
      await db
        .prepare('DELETE FROM admin_staff WHERE user_id=? OR lower(email)=lower(?)')
        .bind(target, email)
        .run();
    } else {
      await db
        .prepare(
          'INSERT INTO admin_staff (user_id,email,display_name,role,active,created_at,updated_at) VALUES (?,?,?,?,1,?,?) ON CONFLICT(email) DO UPDATE SET user_id=excluded.user_id,display_name=excluded.display_name,role=excluded.role,active=1,updated_at=excluded.updated_at',
        )
        .bind(target, String(member.email), displayName, role, now, now)
        .run();
    }
    detail = { email, previousRole: current?.role ?? 'member', role };
  } else return json({ error: 'Unsupported action' }, 400);
  await db
    .prepare(
      'INSERT INTO admin_audit_log (id,actor_user_id,target_user_id,action,detail_json,created_at) VALUES (?,?,?,?,?,?)',
    )
    .bind(
      crypto.randomUUID(),
      actor.id,
      target,
      action,
      JSON.stringify(detail),
      now,
    )
    .run();
  return json({ ok: true });
}
