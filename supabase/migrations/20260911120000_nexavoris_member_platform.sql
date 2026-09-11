-- Nexavoris member platform, admin dashboard and SEO/GEO control center.
--
-- Translated from the origin site's SQLite (Cloudflare D1) schema:
--   07 Website\nexavoris-website\lib\member-db.ts ensureMemberSchema() @ f1e592f
--   07 Website\nexavoris-website\.openai\drizzle\0001_member_platform.sql, 0002_admin_dashboard.sql
--
-- Column types deliberately mirror what the application code expects:
-- ISO-8601 timestamps and *_json payloads stay TEXT, flags stay INTEGER 0/1.
-- SQLite REAL is 8-byte, so it maps to double precision (Postgres REAL is 4-byte).
--
-- The app connects to Postgres directly (lib/member-db.ts) as the table owner,
-- which bypasses row level security. RLS is enabled with NO policies and the
-- anon/authenticated roles lose all privileges, so the public Supabase key can
-- never read or write these tables through the Data API.
--
-- Idempotent: safe to run more than once. Apply in the Supabase SQL editor.

begin;

-- Member platform ----------------------------------------------------------

create table if not exists public.member_profiles (
  user_id text primary key,
  email text not null,
  profile_json text not null default '{}',
  preferences_json text not null default '{}',
  created_at text not null,
  updated_at text not null
);

create table if not exists public.assessment_reports (
  id text primary key,
  user_id text not null,
  responses_json text not null,
  scores_json text not null,
  created_at text not null,
  updated_at text not null
);
create index if not exists idx_assessments_user_updated on public.assessment_reports (user_id, updated_at desc);

create table if not exists public.opportunity_reports (
  id text primary key,
  user_id text not null,
  selections_json text not null,
  results_json text not null,
  created_at text not null
);
create index if not exists idx_opportunities_user_created on public.opportunity_reports (user_id, created_at desc);

create table if not exists public.roi_calculations (
  id text primary key,
  user_id text not null,
  inputs_json text not null,
  results_json text not null,
  created_at text not null
);
create index if not exists idx_roi_user_created on public.roi_calculations (user_id, created_at desc);

create table if not exists public.member_roadmaps (
  user_id text primary key,
  roadmap_json text not null,
  updated_at text not null
);

create table if not exists public.saved_resources (
  user_id text not null,
  resource_url text not null,
  created_at text not null,
  primary key (user_id, resource_url)
);

create table if not exists public.member_events (
  id text primary key,
  user_id text,
  event_name text not null,
  context_json text not null default '{}',
  created_at text not null
);
create index if not exists idx_events_name_created on public.member_events (event_name, created_at desc);

-- Administration -------------------------------------------------------------

create table if not exists public.admin_staff (
  user_id text primary key,
  email text not null unique,
  display_name text,
  role text not null check (role in ('admin', 'sales')),
  active integer not null default 1,
  created_at text not null,
  updated_at text not null
);

create table if not exists public.member_admin_records (
  user_id text primary key,
  account_status text not null default 'active' check (account_status in ('active', 'suspended')),
  lead_status text not null default 'New',
  lead_priority text not null default 'Medium' check (lead_priority in ('High', 'Medium', 'Low')),
  assigned_owner_id text,
  follow_up_date text,
  consultation_status text not null default 'New',
  client_tier text not null default 'Free Member' check (client_tier in ('Free Member', 'Client')),
  updated_at text not null
);
create index if not exists idx_admin_records_status on public.member_admin_records (lead_status, lead_priority);

create table if not exists public.admin_notes (
  id text primary key,
  member_user_id text not null,
  author_user_id text not null,
  note_text text not null,
  created_at text not null
);
create index if not exists idx_admin_notes_member_created on public.admin_notes (member_user_id, created_at desc);

create table if not exists public.admin_audit_log (
  id text primary key,
  actor_user_id text not null,
  target_user_id text,
  action text not null,
  detail_json text not null default '{}',
  created_at text not null
);
create index if not exists idx_admin_audit_created on public.admin_audit_log (created_at desc);

create table if not exists public.consultation_requests (
  id text primary key,
  user_id text,
  name text not null,
  company text not null,
  email text not null,
  phone text,
  industry text,
  employees text,
  software text,
  interest text not null,
  description text not null,
  created_at text not null
);
create index if not exists idx_consultations_user_created on public.consultation_requests (user_id, created_at desc);
create index if not exists idx_consultations_created on public.consultation_requests (created_at desc);

-- SEO / GEO control center ----------------------------------------------------

create table if not exists public.seo_keywords (
  id text primary key,
  keyword text not null unique,
  category text not null check (category in ('Branded', 'Core', 'Industry', 'Buyer')),
  target_url text not null,
  priority text not null default 'Medium' check (priority in ('High', 'Medium', 'Low')),
  active integer not null default 1,
  created_at text not null,
  updated_at text not null
);
create index if not exists idx_seo_keywords_category_active on public.seo_keywords (category, active);

create table if not exists public.seo_google_rankings (
  id text primary key,
  keyword_id text not null,
  checked_date text not null,
  position double precision not null,
  target_url text not null,
  actual_url text,
  result_page integer,
  country text,
  language text,
  device text,
  notes text,
  checked_by text not null,
  source_type text not null default 'MANUAL GOOGLE SEARCH',
  created_at text not null
);
create index if not exists idx_seo_rankings_keyword_date on public.seo_google_rankings (keyword_id, checked_date desc);

create table if not exists public.seo_gsc_metrics (
  id text primary key,
  metric_date text not null,
  query text not null,
  page text not null,
  clicks integer not null default 0,
  impressions integer not null default 0,
  ctr double precision not null default 0,
  average_position double precision,
  country text,
  device text,
  source_type text not null default 'GOOGLE SEARCH CONSOLE',
  imported_by text not null,
  created_at text not null
);
create index if not exists idx_seo_gsc_date_query on public.seo_gsc_metrics (metric_date desc, query);

create table if not exists public.seo_indexing_status (
  url text primary key,
  indexed_status text not null default 'Unknown' check (indexed_status in ('Yes', 'No', 'Unknown')),
  google_canonical text,
  expected_canonical text not null,
  in_sitemap integer not null default 1,
  last_checked text,
  notes text,
  checked_by text,
  updated_at text not null
);

create table if not exists public.seo_geo_tests (
  id text primary key,
  platform text not null check (platform in ('Google AI', 'ChatGPT', 'Bing/Copilot')),
  checked_date text not null,
  prompt text not null,
  keyword text,
  mentioned text not null default 'Unknown' check (mentioned in ('Yes', 'No', 'Unknown')),
  cited text not null default 'Unknown' check (cited in ('Yes', 'No', 'Unknown')),
  cited_url text,
  correct_description text not null default 'Unknown' check (correct_description in ('Yes', 'No', 'Unknown')),
  position_value double precision,
  competitors text,
  notes text,
  checked_by text not null,
  source_type text not null,
  created_at text not null
);
create index if not exists idx_seo_geo_platform_date on public.seo_geo_tests (platform, checked_date desc);

create table if not exists public.seo_backlinks (
  id text primary key,
  referring_domain text not null,
  source_url text not null,
  target_url text not null,
  first_discovered text not null,
  link_type text not null default 'Unknown' check (link_type in ('Follow', 'NoFollow', 'Unknown')),
  authority_notes text,
  industry text,
  status text not null default 'Active' check (status in ('Active', 'Lost', 'Pending', 'Outreach', 'Rejected')),
  notes text,
  checked_by text not null,
  source_type text not null default 'MANUAL BACKLINK ENTRY',
  created_at text not null,
  updated_at text not null
);
create index if not exists idx_seo_backlinks_domain_status on public.seo_backlinks (referring_domain, status);

create table if not exists public.seo_authority_profiles (
  id text primary key,
  platform text not null,
  profile_url text not null,
  verified_status text not null default 'Unknown' check (verified_status in ('Yes', 'No', 'Unknown')),
  backlink_status text not null default 'Unknown' check (backlink_status in ('Yes', 'No', 'Unknown')),
  created_date text,
  status text,
  notes text,
  checked_by text not null,
  created_at text not null,
  updated_at text not null
);

create table if not exists public.seo_manual_tasks (
  id text primary key,
  title text not null,
  task_type text not null,
  cadence text not null check (cadence in ('Weekly', 'Monthly', 'One-time')),
  due_date text,
  status text not null default 'Pending' check (status in ('Pending', 'Complete', 'Skipped')),
  checked_date text,
  result text,
  notes text,
  assigned_to text,
  created_at text not null,
  updated_at text not null
);
create index if not exists idx_seo_tasks_status_due on public.seo_manual_tasks (status, due_date);

-- Lock every table away from the Data API --------------------------------------
-- Keep this list identical to db/schema.ts. Never FORCE row level security:
-- the application's owner-role connection must keep bypassing it.

do $$
declare
  t text;
begin
  foreach t in array array[
    'member_profiles', 'assessment_reports', 'opportunity_reports', 'roi_calculations',
    'member_roadmaps', 'saved_resources', 'member_events', 'admin_staff',
    'member_admin_records', 'admin_notes', 'admin_audit_log', 'consultation_requests',
    'seo_keywords', 'seo_google_rankings', 'seo_gsc_metrics', 'seo_indexing_status',
    'seo_geo_tests', 'seo_backlinks', 'seo_authority_profiles', 'seo_manual_tasks'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
  end loop;
end
$$;

commit;
