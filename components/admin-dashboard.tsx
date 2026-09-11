'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Gauge,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  ScanSearch,
  Users,
} from 'lucide-react';

type Row = Record<string, any>;
type Props = {
  actor: { id: string; email: string; name?: string; role: 'admin' | 'sales' };
  initialTab?: string;
};
const labels: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'Users',
  leads: 'Leads',
  consultations: 'Consultations',
  assessments: 'Assessments',
  roadmaps: 'Roadmaps',
  analytics: 'Analytics',
  seoGeo: 'SEO + GEO',
  settings: 'Admin Settings',
};
const icons = {
  dashboard: Gauge,
  users: Users,
  leads: BriefcaseBusiness,
  consultations: CalendarCheck,
  assessments: FileText,
  roadmaps: Activity,
  analytics: BarChart3,
  seoGeo: ScanSearch,
  settings: Settings,
};
const val = (o: Row | undefined, ...keys: string[]) =>
  keys
    .map((k) => o?.[k])
    .find((v) => v !== undefined && v !== null && v !== '') ?? '—';
const name = (u: Row) =>
  [u.profile?.firstName, u.profile?.lastName].filter(Boolean).join(' ') ||
  u.profile?.name ||
  u.email;

export function AdminDashboard({ actor, initialTab = 'dashboard' }: Props) {
  const [data, setData] = useState<Row | null>(null),
    [tab, setTab] = useState(initialTab),
    [selected, setSelected] = useState<Row | null>(null),
    [query, setQuery] = useState(''),
    [industry, setIndustry] = useState(''),
    [companySize, setCompanySize] = useState(''),
    [scoreRange, setScoreRange] = useState(''),
    [registrationAge, setRegistrationAge] = useState(''),
    [status, setStatus] = useState(''),
    [consult, setConsult] = useState(''),
    [roadmap, setRoadmap] = useState(''),
    [sort, setSort] = useState('registration'),
    [page, setPage] = useState(1),
    [message, setMessage] = useState('');
  const load = () =>
    fetch('/api/admin')
      .then((r) => {
        if (!r.ok) throw new Error('Access denied');
        return r.json();
      })
      .then(setData)
      .catch(() => setMessage('Unable to load administrator data.'));
  useEffect(() => {
    void load();
  }, []);
  const users = useMemo(() => {
    let rows = [...(data?.users ?? [])];
    if (query)
      rows = rows.filter((u: Row) =>
        `${name(u)} ${u.email} ${u.profile?.company ?? ''}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      );
    if (industry)
      rows = rows.filter((u: Row) => val(u.profile, 'industry') === industry);
    if (companySize)
      rows = rows.filter(
        (u: Row) =>
          String(u.profile?.employees ?? u.responses?.employees ?? '') ===
          companySize,
      );
    if (scoreRange) {
      const [low, high] = scoreRange.split('-').map(Number);
      rows = rows.filter(
        (u: Row) =>
          Number(u.scores?.overall ?? -1) >= low &&
          Number(u.scores?.overall ?? -1) <= high,
      );
    }
    if (registrationAge)
      rows = rows.filter(
        (u: Row) =>
          Date.now() - new Date(u.registrationDate).getTime() <=
          Number(registrationAge) * 86400000,
      );
    if (status) rows = rows.filter((u: Row) => u.admin?.lead_status === status);
    if (consult)
      rows = rows.filter(
        (u: Row) => String(Boolean(u.consultationRequested)) === consult,
      );
    if (roadmap)
      rows = rows.filter((u: Row) => String(Boolean(u.roadmap)) === roadmap);
    if (tab === 'leads')
      rows = rows.filter(
        (u: Row) => !['Not Qualified', 'Closed'].includes(u.admin?.lead_status),
      );
    if (tab === 'consultations')
      rows = rows.filter((u: Row) => u.consultationRequested);
    if (tab === 'assessments') rows = rows.filter((u: Row) => u.assessment);
    if (tab === 'roadmaps') rows = rows.filter((u: Row) => u.roadmap);
    rows.sort((a: Row, b: Row) =>
      sort === 'score'
        ? Number(b.leadScore) - Number(a.leadScore)
        : sort === 'readiness'
          ? Number(b.scores?.overall ?? 0) - Number(a.scores?.overall ?? 0)
          : String(b.registrationDate).localeCompare(
              String(a.registrationDate),
            ),
    );
    return rows;
  }, [
    data,
    query,
    industry,
    companySize,
    scoreRange,
    registrationAge,
    status,
    consult,
    roadmap,
    sort,
    tab,
  ]);
  const industries = [
    ...new Set(
      (data?.users ?? [])
        .map((u: Row) => String(val(u.profile, 'industry')))
        .filter((x: string) => x !== '—'),
    ),
  ] as string[];
  const mutate = async (body: Row) => {
    setMessage('Saving…');
    const r = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const response = (await r.json().catch(() => ({}))) as Row;
    setMessage(
      r.ok ? 'Saved securely.' : response.error || 'Update was not permitted.',
    );
    if (r.ok) {
      await load();
      if (selected)
        setSelected(
          (await (await fetch('/api/admin')).json()).users.find(
            (u: Row) => u.id === selected.id,
          ),
        );
    }
  };
  if (!data)
    return (
      <main className="admin-loading">
        <ShieldCheck />{' '}
        <p>{message || 'Loading secure administrator workspace…'}</p>
      </main>
    );
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <ShieldCheck />
          <b>Nexavoris Admin</b>
          <small>
            {actor.role === 'admin' ? 'Administrator' : 'Sales / Advisor'}
          </small>
        </div>
        <nav>
          {Object.entries(labels).map(([id, label]) => {
            const Icon = icons[id as keyof typeof icons];
            if (id === 'settings' && actor.role !== 'admin') return null;
            return (
              <button
                key={id}
                className={tab === id ? 'active' : ''}
                onClick={() => {
                  if (id === 'seoGeo') {
                    window.location.href = '/admin/seo-geo';
                    return;
                  }
                  setTab(id);
                  setSelected(null);
                  setPage(1);
                }}
              >
                <Icon size={17} />
                {label}
              </button>
            );
          })}
        </nav>
        <a href="/signout-with-chatgpt?return_to=%2F" target="_top">
          <LogOut size={16} /> Sign out
        </a>
      </aside>
      <section className="admin-main">
        <header>
          <div>
            <span>SECURE WORKSPACE</span>
            <h1>{labels[tab]}</h1>
          </div>
          <div className="admin-identity">
            {actor.name || actor.email}
            <small>{actor.email}</small>
          </div>
        </header>
        {message && <div className="admin-toast">{message}</div>}
        {tab === 'dashboard' && (
          <Dashboard data={data} open={(u) => setSelected(u)} />
        )}
        {['users', 'leads', 'assessments', 'roadmaps'].includes(tab) && (
          <UsersView
            users={users}
            all={data}
            query={query}
            setQuery={setQuery}
            industry={industry}
            setIndustry={setIndustry}
            companySize={companySize}
            setCompanySize={setCompanySize}
            scoreRange={scoreRange}
            setScoreRange={setScoreRange}
            registrationAge={registrationAge}
            setRegistrationAge={setRegistrationAge}
            status={status}
            setStatus={setStatus}
            consult={consult}
            setConsult={setConsult}
            roadmap={roadmap}
            setRoadmap={setRoadmap}
            sort={sort}
            setSort={setSort}
            page={page}
            setPage={setPage}
            open={setSelected}
          />
        )}
        {tab === 'consultations' && (
          <ConsultationView
            requests={data.consultationRequests}
            users={data.users}
            open={setSelected}
          />
        )}
        {tab === 'analytics' && <Analytics data={data} />}{' '}
        {tab === 'settings' && actor.role === 'admin' && (
          <SettingsView data={data} />
        )}
      </section>
      {selected && (
        <UserDrawer
          user={selected}
          data={data}
          role={actor.role}
          close={() => setSelected(null)}
          mutate={mutate}
        />
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: any }) {
  return (
    <article className="admin-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
function Bars({ title, rows }: { title: string; rows: any[] }) {
  const max = Math.max(1, ...rows.map((r) => Number(r[1])));
  return (
    <section className="admin-card">
      <h2>{title}</h2>
      <div className="admin-bars">
        {rows.length ? (
          rows.map(([label, count]) => (
            <div key={label}>
              <span>
                {label}
                <b>{count}</b>
              </span>
              <i>
                <em style={{ width: `${(Number(count) / max) * 100}%` }} />
              </i>
            </div>
          ))
        ) : (
          <p>No data yet.</p>
        )}
      </div>
    </section>
  );
}
function Dashboard({ data, open }: { data: Row; open: (u: Row) => void }) {
  const m = data.summary.metrics;
  return (
    <>
      <div className="admin-metrics">
        {[
          ['Registered users', m.total],
          ['New today', m.today],
          ['New this week', m.week],
          ['New this month', m.month],
          ['Assessments started', m.assessmentStarted],
          ['Assessments completed', m.assessmentCompleted],
          ['Registration conversion', `${m.conversionRate}%`],
          ['Opportunity reports', m.opportunities],
          ['ROI calculations', m.roi],
          ['Roadmaps', m.roadmaps],
          ['Consultations', m.consultations],
          ['Qualified leads', m.qualified],
          ['Converted clients', m.clients],
        ].map(([l, v]) => (
          <Metric key={String(l)} label={String(l)} value={v} />
        ))}
      </div>
      <div className="admin-grid">
        <Bars title="Users by industry" rows={data.summary.industry} />
        <Bars title="Users by company size" rows={data.summary.companySize} />
        <Bars
          title="Most common business problems"
          rows={data.summary.problems}
        />
        <Bars
          title="Most recommended solutions"
          rows={data.summary.solutions}
        />
      </div>
      <section className="admin-card">
        <h2>Average readiness scores</h2>
        <div className="readiness-row">
          {Object.entries(data.summary.averages).map(([k, v]) => (
            <Metric
              key={k}
              label={`${k.toUpperCase()} readiness`}
              value={`${v}/100`}
            />
          ))}
        </div>
      </section>
      <div className="admin-grid">
        <Recent
          title="Recent registrations"
          users={data.summary.recent}
          open={open}
        />
        <Recent
          title="Recent consultation activity"
          users={data.summary.consultations}
          open={open}
        />
      </div>
    </>
  );
}
function Recent({
  title,
  users,
  open,
}: {
  title: string;
  users: Row[];
  open: (u: Row) => void;
}) {
  return (
    <section className="admin-card">
      <h2>{title}</h2>
      {users.length ? (
        users.map((u) => (
          <button className="recent-user" key={u.id} onClick={() => open(u)}>
            <span>
              {name(u)}
              <small>{val(u.profile, 'company')}</small>
            </span>
            <b>{u.scores?.overall ?? '—'}</b>
          </button>
        ))
      ) : (
        <p>No records yet.</p>
      )}
    </section>
  );
}

function UsersView(p: Row) {
  const pageSize = 10,
    start = (p.page - 1) * pageSize,
    shown = p.users.slice(start, start + pageSize);
  return (
    <>
      <section className="admin-filters">
        <label>
          <Search size={16} />
          <input
            value={p.query}
            onChange={(e) => {
              p.setQuery(e.target.value);
              p.setPage(1);
            }}
            placeholder="Search name, company, or email"
          />
        </label>
        <select
          value={p.industry}
          onChange={(e) => p.setIndustry(e.target.value)}
        >
          <option value="">All industries</option>
          {p.all.summary.industry.map(([x]: string[]) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select value={p.status} onChange={(e) => p.setStatus(e.target.value)}>
          <option value="">All lead statuses</option>
          {p.all.statuses.map((x: string) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          value={p.companySize}
          onChange={(e) => p.setCompanySize(e.target.value)}
        >
          <option value="">All company sizes</option>
          {p.all.summary.companySize.map(([x]: string[]) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          value={p.scoreRange}
          onChange={(e) => p.setScoreRange(e.target.value)}
        >
          <option value="">Any readiness score</option>
          <option value="0-40">0–40</option>
          <option value="41-60">41–60</option>
          <option value="61-80">61–80</option>
          <option value="81-100">81–100</option>
        </select>
        <select
          value={p.registrationAge}
          onChange={(e) => p.setRegistrationAge(e.target.value)}
        >
          <option value="">Any registration date</option>
          <option value="1">Today</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
        </select>
        <select
          value={p.consult}
          onChange={(e) => p.setConsult(e.target.value)}
        >
          <option value="">Any consultation</option>
          <option value="true">Requested</option>
          <option value="false">Not requested</option>
        </select>
        <select
          value={p.roadmap}
          onChange={(e) => p.setRoadmap(e.target.value)}
        >
          <option value="">Any roadmap</option>
          <option value="true">Generated</option>
          <option value="false">Not generated</option>
        </select>
        <select value={p.sort} onChange={(e) => p.setSort(e.target.value)}>
          <option value="registration">Newest registration</option>
          <option value="score">Highest lead score</option>
          <option value="readiness">Highest readiness</option>
        </select>
        <a className="export-button" href="/api/admin?format=csv">
          <Download size={15} /> Export CSV
        </a>
      </section>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name / Company</th>
              <th>Email</th>
              <th>Industry</th>
              <th>Employees</th>
              <th>Registered</th>
              <th>Readiness</th>
              <th>Roadmap</th>
              <th>Consultation</th>
              <th>Lead</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((u: Row) => (
              <tr key={u.id} onClick={() => p.open(u)}>
                <td>
                  <b>{name(u)}</b>
                  <small>{val(u.profile, 'company')}</small>
                </td>
                <td>{u.email}</td>
                <td>
                  {val(u.profile, 'industry') === '—'
                    ? val(u.responses, 'industry')
                    : val(u.profile, 'industry')}
                </td>
                <td>
                  {val(u.profile, 'employees') === '—'
                    ? val(u.responses, 'employees')
                    : val(u.profile, 'employees')}
                </td>
                <td>{new Date(u.registrationDate).toLocaleDateString()}</td>
                <td>{u.scores?.overall ?? '—'}</td>
                <td>{u.roadmap ? 'Yes' : 'No'}</td>
                <td>{u.consultationRequested ? 'Yes' : 'No'}</td>
                <td>
                  <span
                    className={`lead-priority ${String(u.admin.lead_priority).toLowerCase()}`}
                  >
                    {u.admin.lead_status}
                    <small>Internal score {u.leadScore}</small>
                  </span>
                </td>
                <td>
                  {val(
                    p.all.staff.find(
                      (s: Row) => s.user_id === u.admin.assigned_owner_id,
                    ),
                    'display_name',
                    'email',
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <span>{p.users.length} users</span>
        <button disabled={p.page === 1} onClick={() => p.setPage(p.page - 1)}>
          <ChevronLeft />
        </button>
        <b>
          {p.page} / {Math.max(1, Math.ceil(p.users.length / pageSize))}
        </b>
        <button
          disabled={start + pageSize >= p.users.length}
          onClick={() => p.setPage(p.page + 1)}
        >
          <ChevronRight />
        </button>
      </div>
    </>
  );
}

function ConsultationView({
  requests,
  users,
  open,
}: {
  requests: Row[];
  users: Row[];
  open: (user: Row) => void;
}) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Member</th>
            <th>Company</th>
            <th>Industry</th>
            <th>Requested</th>
            <th>Main challenge</th>
            <th>Readiness</th>
            <th>Recommended focus</th>
            <th>Status</th>
            <th>Owner</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => {
            const user = users.find(
              (item) =>
                item.id === request.user_id ||
                String(item.email).toLowerCase() ===
                  String(request.email).toLowerCase(),
            );
            return (
              <tr key={request.id} onClick={() => user && open(user)}>
                <td>
                  <b>{request.name}</b>
                  <small>{request.email}</small>
                </td>
                <td>{request.company}</td>
                <td>{request.industry || '—'}</td>
                <td>{new Date(request.created_at).toLocaleDateString()}</td>
                <td>{request.description}</td>
                <td>{user?.scores?.overall ?? '—'}</td>
                <td>{request.interest}</td>
                <td>{user?.admin?.consultation_status ?? 'New'}</td>
                <td>{user?.admin?.assigned_owner_id || 'Unassigned'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!requests.length && (
        <p className="empty-table">No consultation requests yet.</p>
      )}
    </div>
  );
}

function Analytics({ data }: { data: Row }) {
  const bins = [
    [0, 20],
    [21, 40],
    [41, 60],
    [61, 80],
    [81, 100],
  ].map(([a, b]) => [
    `${a}–${b}`,
    data.users.filter(
      (u: Row) =>
        Number(u.scores?.overall ?? -1) >= a &&
        Number(u.scores?.overall ?? -1) <= b,
    ).length,
  ]);
  const dates = Object.entries(
    data.users.reduce((acc: Row, u: Row) => {
      const d = new Date(u.registrationDate).toLocaleDateString();
      acc[d] = (acc[d] ?? 0) + 1;
      return acc;
    }, {}),
  );
  return (
    <div className="admin-grid">
      <Bars title="Registrations over time" rows={dates} />
      <Bars title="Readiness score distribution" rows={bins} />
      <Bars title="Leads by status" rows={data.summary.leadStatus} />
      <Bars title="Users by industry" rows={data.summary.industry} />
      <section className="admin-card">
        <h2>Conversion funnel</h2>
        <div className="funnel">
          {[
            ['Assessments started', data.summary.metrics.assessmentStarted],
            ['Assessments completed', data.summary.metrics.assessmentCompleted],
            ['Registered users', data.summary.metrics.total],
            ['Consultations', data.summary.metrics.consultations],
            ['Clients', data.summary.metrics.clients],
          ].map(([x, n]) => (
            <div key={String(x)}>
              <b>{n}</b>
              <span>{x}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="admin-card">
        <h2>Lead scoring logic</h2>
        <p>
          Assessment +20; automation score ≥70 +20; company size +8 or +15;
          operational problems up to +20; roadmap +10; ROI +7; consultation +8.
          Maximum 100. This internal score is never shown to members.
        </p>
      </section>
    </div>
  );
}

function SettingsView({ data }: { data: Row }) {
  return (
    <div className="admin-grid">
      <section className="admin-card">
        <h2>Administrator and advisor access</h2>
        <p>
          Access is enforced on the server. Open a registered member from Users
          to assign Member, Sales / Advisor, or Administrator access.
        </p>
        {data.staff.map((s: Row) => (
          <div className="staff-row" key={s.email}>
            <span>
              {s.display_name || s.email}
              <small>{s.email}</small>
            </span>
            <b>{s.role}</b>
          </div>
        ))}
      </section>
      <section className="admin-card">
        <h2>Activity log</h2>
        {data.audit.map((a: Row) => (
          <div className="audit-row" key={a.id}>
            <b>{a.action.replace('_', ' ')}</b>
            <span>
              {a.actor_email}
              <small>{new Date(a.created_at).toLocaleString()}</small>
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}

function UserDrawer({
  user,
  data,
  role,
  close,
  mutate,
}: {
  user: Row;
  data: Row;
  role: string;
  close: () => void;
  mutate: (b: Row) => void;
}) {
  const [leadStatus, setLeadStatus] = useState(user.admin.lead_status),
    [priority, setPriority] = useState(user.admin.lead_priority),
    [owner, setOwner] = useState(user.admin.assigned_owner_id ?? ''),
    [follow, setFollow] = useState(user.admin.follow_up_date ?? ''),
    [consultStatus, setConsultStatus] = useState(
      user.admin.consultation_status ?? 'New',
    ),
    [note, setNote] = useState('');
  const [accountRole, setAccountRole] = useState(user.accountRole ?? 'member');
  const [primaryIndustry, setPrimaryIndustry] = useState(user.profile.industry ?? 'Other');
  const profile = user.profile,
    responses = user.responses;
  return (
    <div
      className="drawer-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <aside className="user-drawer">
        <button className="drawer-close" onClick={close}>
          Close
        </button>
        <span className="member-kicker">MEMBER PROFILE</span>
        <h1>{name(user)}</h1>
        <p>
          {profile.company || 'Company not provided'} · {user.email}
        </p>
        <div className="drawer-actions">
          {role === 'admin' && (
            <>
              <label htmlFor="primary-industry">Primary industry</label>
              <select id="primary-industry" value={primaryIndustry} onChange={(e) => setPrimaryIndustry(e.target.value)}>
                {['Wholesale Distribution','HVAC / Field Service','Construction','Manufacturing','Retail','Professional Services','Other'].map((option) => <option key={option}>{option}</option>)}
              </select>
              <button onClick={() => mutate({ action: 'profile_industry', userId: user.id, industry: primaryIndustry })}>Save industry</button>
              <label htmlFor="account-role">Nexavoris role</label>
              <select
                id="account-role"
                value={accountRole}
                onChange={(e) => setAccountRole(e.target.value)}
              >
                <option value="member">Member</option>
                <option value="sales">Sales / Advisor</option>
                <option value="admin">Administrator</option>
              </select>
              <button
                onClick={() =>
                  mutate({
                    action: 'staff_role',
                    email: user.email,
                    role: accountRole,
                  })
                }
              >
                Save role
              </button>
            </>
          )}
          <select
            value={leadStatus}
            onChange={(e) => setLeadStatus(e.target.value)}
          >
            {data.statuses.map((x: string) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            {data.priorities.map((x: string) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select value={owner} onChange={(e) => setOwner(e.target.value)}>
            <option value="">Unassigned</option>
            {data.staff
              .filter((s: Row) => s.active)
              .map((s: Row) => (
                <option value={s.user_id} key={s.user_id}>
                  {s.display_name || s.email}
                </option>
              ))}
          </select>
          <input
            type="date"
            value={follow}
            onChange={(e) => setFollow(e.target.value)}
          />
          <select
            value={consultStatus}
            onChange={(e) => setConsultStatus(e.target.value)}
          >
            {[
              'New',
              'Reviewing',
              'Contacted',
              'Scheduled',
              'Completed',
              'Converted',
              'Closed',
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <button
            onClick={() =>
              mutate({
                action: 'lead_update',
                userId: user.id,
                leadStatus,
                leadPriority: priority,
                assignedOwnerId: owner,
                followUpDate: follow,
                consultationStatus: consultStatus,
              })
            }
          >
            Save lead
          </button>
          {role === 'admin' && (
            <button
              className="danger-soft"
              onClick={() =>
                mutate({
                  action: 'account_status',
                  userId: user.id,
                  status:
                    user.admin.account_status === 'suspended'
                      ? 'active'
                      : 'suspended',
                })
              }
            >
              {user.admin.account_status === 'suspended'
                ? 'Restore account'
                : 'Suspend account'}
            </button>
          )}
        </div>
        <ProfileSection
          title="Contact information"
          rows={[
            ['Name', name(user)],
            ['Company', profile.company],
            ['Email', user.email],
            ['Phone', profile.phone],
            ['Job role', profile.role],
            ['Industry', profile.industry || responses.industry],
          ]}
        />
        <ProfileSection
          title="Company profile"
          rows={[
            ['Employees', profile.employees || responses.employees],
            ['Locations', profile.locations || responses.locations],
            ['Warehouses', profile.warehouses],
            ['Current ERP', profile.currentErp],
            ['Accounting software', profile.accountingSoftware],
            ['CRM', profile.crm],
            ['Primary challenge', profile.challenge],
          ]}
        />
        <ProfileSection
          title="Assessment results"
          rows={['overall', 'ai', 'erp', 'automation', 'data'].map((k) => [
            `${k.toUpperCase()} readiness`,
            user.scores?.[k] !== undefined ? `${user.scores[k]}/100` : '—',
          ])}
        />
        <section>
          <h2>Assessment responses</h2>
          <div className="response-grid">
            {Object.entries(responses).map(([k, v]) => (
              <div key={k}>
                <span>{k}</span>
                <b>{String(v)}</b>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2>Opportunity finder</h2>
          {user.opportunity?.results?.map((r: Row) => (
            <article className="drawer-item" key={r.id}>
              <b>{r.problem}</b>
              <span>
                {r.solution} · {r.priority}
              </span>
              <p>{r.implementation}</p>
            </article>
          )) || <p>No opportunity report.</p>}
        </section>
        <section>
          <h2>ROI calculator</h2>
          {user.roi ? (
            <pre>
              {JSON.stringify(
                { assumptions: user.roi.inputs, results: user.roi.results },
                null,
                2,
              )}
            </pre>
          ) : (
            <p>No saved calculation.</p>
          )}
        </section>
        <section>
          <h2>Roadmap</h2>
          {user.roadmap?.phases?.map((p: Row) => (
            <article className="drawer-item" key={p.title}>
              <b>{p.title}</b>
              <ul>
                {p.items.map((x: string) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </article>
          )) || <p>No roadmap generated.</p>}
        </section>
        <ProfileSection
          title="Engagement"
          rows={[
            ['Registered', new Date(user.registrationDate).toLocaleString()],
            ['Last activity', new Date(user.lastLogin).toLocaleString()],
            ['Assessment completed', user.assessment?.createdAt],
            [
              'Tools used',
              [
                user.assessment && 'Assessment',
                user.opportunity && 'Opportunity Finder',
                user.roi && 'ROI Calculator',
                user.roadmap && 'Roadmap',
              ]
                .filter(Boolean)
                .join(', '),
            ],
            ['Resources saved', user.resources?.length],
            [
              'Consultation activity',
              user.consultationRequested
                ? `${user.consultationDate} · ${consultStatus}`
                : 'None',
            ],
            ['Internal lead score', `${user.leadScore}/100`],
          ]}
        />
        <section>
          <h2>Internal notes</h2>
          <p className="privacy-note">
            Visible only to authorized Nexavoris staff.
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={2000}
            placeholder="Add a factual internal note…"
          />
          <button
            onClick={() => {
              if (note.trim()) {
                mutate({ action: 'note', userId: user.id, note });
                setNote('');
              }
            }}
          >
            Add note
          </button>
          {user.notes?.map((n: Row) => (
            <blockquote key={n.id}>
              {n.note_text}
              <footer>
                {n.author_name || n.author_email} ·{' '}
                {new Date(n.created_at).toLocaleString()}
              </footer>
            </blockquote>
          ))}
        </section>
      </aside>
    </div>
  );
}
function ProfileSection({ title, rows }: { title: string; rows: any[][] }) {
  return (
    <section>
      <h2>{title}</h2>
      <dl>
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v || '—'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
