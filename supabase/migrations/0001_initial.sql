-- ASEAN Cyber Signals: initial single-owner schema.
-- Supabase Auth registration must remain disabled. The first and only Auth user is
-- provisioned as the owner by the auth.users trigger near the end of this file.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create type public.profile_role as enum ('owner');
create type public.source_kind as enum ('sitemap', 'rss', 'html', 'pdf', 'manual');
create type public.source_health as enum ('shadow', 'active', 'degraded', 'disabled');
create type public.source_item_status as enum (
  'discovered',
  'fetched',
  'needs_review',
  'approved',
  'rejected',
  'stale',
  'archived'
);
create type public.ingestion_job_status as enum (
  'queued',
  'running',
  'succeeded',
  'failed',
  'quarantined'
);
create type public.source_role as enum (
  'observed_trend',
  'operational_alert',
  'incident_case',
  'regulatory_trigger',
  'control_guidance'
);
create type public.metric_kind as enum (
  'reported_incidents',
  'detected_infrastructure',
  'unique_ips',
  'phishing_attempts',
  'ransomware_activities',
  'affected_entities',
  'qualitative'
);
create type public.review_status as enum (
  'needs_review',
  'approved',
  'rejected',
  'stale',
  'archived'
);
create type public.trend_version_status as enum ('draft', 'in_review', 'published');
create type public.product_mapping_role as enum ('primary', 'supporting');
create type public.brief_status as enum ('draft', 'generated', 'reviewed');
create type public.ai_run_status as enum ('running', 'succeeded', 'failed', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text,
  role public.profile_role not null default 'owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_normalized check (email = lower(email))
);

create table public.countries (
  code text primary key,
  name text not null unique,
  native_name text,
  sort_order smallint not null,
  created_at timestamptz not null default now(),
  constraint countries_supported check (code in ('SG', 'MY', 'ID')),
  constraint countries_sort_order_positive check (sort_order > 0)
);

create table public.sectors (
  id text primary key,
  name text not null unique,
  description text,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  constraint sectors_slug check (id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

insert into public.countries (code, name, native_name, sort_order)
values
  ('SG', 'Singapore', 'Singapore', 1),
  ('MY', 'Malaysia', 'Malaysia', 2),
  ('ID', 'Indonesia', 'Indonesia', 3);

insert into public.sectors (id, name, description, sort_order)
values
  ('financial-services', 'Financial services', 'Banks, insurers, capital markets, and payment providers.', 1),
  ('critical-infrastructure', 'Critical infrastructure', 'Essential and nationally significant services.', 2),
  ('manufacturing-ot', 'Manufacturing and OT', 'Industrial environments and operational technology.', 3);

create table public.source_registry (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  country_code text references public.countries (code) on delete restrict,
  publisher text not null,
  base_url text not null,
  allowed_hosts text[] not null default '{}',
  source_kind public.source_kind not null,
  schedule_cron text,
  health public.source_health not null default 'shadow',
  automation_enabled boolean not null default false,
  shadow_started_at timestamptz,
  last_checked_at timestamptz,
  last_successful_at timestamptz,
  consecutive_failures integer not null default 0,
  parser_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint source_registry_key check (source_key ~ '^[a-z0-9_]+$'),
  constraint source_registry_https check (base_url ~ '^https://'),
  constraint source_registry_hosts_present check (cardinality(allowed_hosts) > 0),
  constraint source_registry_failure_count check (consecutive_failures >= 0)
);

create table public.ingestion_jobs (
  id uuid primary key default gen_random_uuid(),
  source_registry_id uuid not null references public.source_registry (id) on delete cascade,
  status public.ingestion_job_status not null default 'queued',
  started_at timestamptz,
  finished_at timestamptz,
  items_seen integer not null default 0,
  items_created integer not null default 0,
  items_quarantined integer not null default 0,
  error_code text,
  error_detail text,
  created_at timestamptz not null default now(),
  constraint ingestion_counts_nonnegative check (
    items_seen >= 0 and items_created >= 0 and items_quarantined >= 0
  ),
  constraint ingestion_finish_after_start check (
    finished_at is null or started_at is null or finished_at >= started_at
  )
);

create table public.source_items (
  id uuid primary key default gen_random_uuid(),
  source_registry_id uuid not null references public.source_registry (id) on delete cascade,
  canonical_url text not null,
  title text not null,
  original_title text,
  original_language text not null default 'en',
  publisher_date date,
  retrieved_at timestamptz not null default now(),
  content_type text,
  content_hash text,
  status public.source_item_status not null default 'discovered',
  metadata jsonb not null default '{}'::jsonb,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_registry_id, canonical_url),
  constraint source_items_https check (canonical_url ~ '^https://'),
  constraint source_items_language check (original_language ~ '^[a-z]{2,3}(?:-[A-Z]{2})?$'),
  constraint source_items_metadata_object check (jsonb_typeof(metadata) = 'object'),
  constraint source_items_approval_metadata check (
    status <> 'approved' or (reviewed_by is not null and reviewed_at is not null)
  )
);

create table public.source_snapshots (
  id uuid primary key default gen_random_uuid(),
  source_item_id uuid not null references public.source_items (id) on delete cascade,
  storage_path text,
  content_hash text not null,
  http_status smallint,
  etag text,
  last_modified text,
  parser_version text,
  safe_excerpt text,
  captured_at timestamptz not null default now(),
  unique (source_item_id, content_hash),
  constraint source_snapshots_http_status check (
    http_status is null or http_status between 100 and 599
  ),
  constraint source_snapshots_excerpt_length check (
    safe_excerpt is null or char_length(safe_excerpt) <= 2000
  )
);

create table public.evidence_claims (
  id uuid primary key default gen_random_uuid(),
  source_item_id uuid not null references public.source_items (id) on delete restrict,
  country_code text not null references public.countries (code) on delete restrict,
  source_role public.source_role not null,
  metric_kind public.metric_kind not null default 'qualitative',
  metric_value numeric,
  metric_unit text,
  claim_text text not null,
  original_text text,
  original_language text not null default 'en',
  observation_start date,
  observation_end date,
  observation_label text not null,
  evidence_confidence smallint not null,
  content_hash text not null,
  status public.review_status not null default 'needs_review',
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  stale_after date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_item_id, content_hash),
  constraint evidence_claims_confidence check (evidence_confidence between 0 and 5),
  constraint evidence_claims_metric_consistency check (
    (metric_kind = 'qualitative' and metric_value is null)
    or (metric_kind <> 'qualitative' and metric_value is not null)
  ),
  constraint evidence_claims_observation_period check (
    observation_end is null or observation_start is null or observation_end >= observation_start
  ),
  constraint evidence_claims_text_length check (char_length(claim_text) between 1 and 1200),
  constraint evidence_claims_approval_metadata check (
    status <> 'approved' or (reviewed_by is not null and reviewed_at is not null)
  )
);

create table public.trends (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  country_code text not null references public.countries (code) on delete restrict,
  category text not null,
  archived_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trends_slug check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.trend_versions (
  id uuid primary key default gen_random_uuid(),
  trend_id uuid not null references public.trends (id) on delete cascade,
  version integer not null,
  status public.trend_version_status not null default 'draft',
  title text not null,
  summary text not null,
  customer_impact text not null,
  momentum_narrative text,
  regulatory_context text,
  discovery_questions text[] not null default '{}',
  suggested_workshop text,
  sector_ids text[] not null default '{}',
  impact smallint not null,
  momentum smallint not null,
  prevalence smallint not null,
  regulatory_urgency smallint not null,
  evidence_confidence smallint not null,
  capability_match smallint not null,
  installed_base_adjacency smallint not null,
  maturity_gap smallint not null,
  engagement_timing smallint not null,
  proof_asset smallint not null,
  threat_priority_score numeric(5,2) generated always as (
    ((impact * 30 + momentum * 25 + prevalence * 20 + regulatory_urgency * 15 + evidence_confidence * 10)::numeric / 5)
  ) stored,
  opportunity_fit_score numeric(5,2) generated always as (
    ((capability_match * 30 + installed_base_adjacency * 25 + maturity_gap * 20 + engagement_timing * 15 + proof_asset * 10)::numeric / 5)
  ) stored,
  created_by uuid references public.profiles (id) on delete set null,
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  unique (trend_id, version),
  constraint trend_versions_version_positive check (version > 0),
  constraint trend_versions_scores check (
    impact between 0 and 5
    and momentum between 0 and 5
    and prevalence between 0 and 5
    and regulatory_urgency between 0 and 5
    and evidence_confidence between 0 and 5
    and capability_match between 0 and 5
    and installed_base_adjacency between 0 and 5
    and maturity_gap between 0 and 5
    and engagement_timing between 0 and 5
    and proof_asset between 0 and 5
  ),
  constraint trend_versions_publish_metadata check (
    status <> 'published' or (published_at is not null and reviewed_by is not null)
  )
);

create table public.trend_version_claims (
  trend_version_id uuid not null references public.trend_versions (id) on delete cascade,
  evidence_claim_id uuid not null references public.evidence_claims (id) on delete restrict,
  sort_order smallint not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (trend_version_id, evidence_claim_id),
  constraint trend_version_claims_sort_nonnegative check (sort_order >= 0)
);

create table public.cisco_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  outcome_category text not null,
  summary text not null,
  official_url text not null,
  approved boolean not null default false,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  review_due_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cisco_products_slug check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint cisco_products_https check (official_url ~ '^https://'),
  constraint cisco_products_approval_metadata check (
    not approved or (reviewed_by is not null and reviewed_at is not null)
  )
);

create table public.trend_product_mappings (
  id uuid primary key default gen_random_uuid(),
  trend_version_id uuid not null references public.trend_versions (id) on delete cascade,
  cisco_product_id uuid not null references public.cisco_products (id) on delete restrict,
  mapping_role public.product_mapping_role not null,
  outcome_statement text not null,
  rationale text not null,
  approved boolean not null default false,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trend_version_id, cisco_product_id),
  constraint trend_product_mappings_approval_metadata check (
    not approved or (reviewed_by is not null and reviewed_at is not null)
  )
);

create unique index trend_product_mappings_one_primary
  on public.trend_product_mappings (trend_version_id)
  where mapping_role = 'primary';

create table public.briefs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'ASEAN Cyber Signals brief',
  country_code text not null references public.countries (code) on delete restrict,
  sector_id text not null references public.sectors (id) on delete restrict,
  maturity smallint not null,
  environment_flags jsonb not null default '[]'::jsonb,
  current_cisco_capability_flags jsonb not null default '[]'::jsonb,
  engagement_stage text not null,
  objective text not null,
  selected_trend_ids text[] not null,
  status public.brief_status not null default 'draft',
  output jsonb,
  evidence_snapshot jsonb,
  reviewed_for_sharing boolean not null default false,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint briefs_maturity check (maturity between 0 and 5),
  constraint briefs_trend_count check (cardinality(selected_trend_ids) between 1 and 5),
  constraint briefs_environment_array check (jsonb_typeof(environment_flags) = 'array'),
  constraint briefs_cisco_flags_array check (jsonb_typeof(current_cisco_capability_flags) = 'array'),
  constraint briefs_output_object check (output is null or jsonb_typeof(output) = 'object'),
  constraint briefs_snapshot_object check (evidence_snapshot is null or jsonb_typeof(evidence_snapshot) = 'object'),
  constraint briefs_objective_length check (char_length(objective) between 1 and 300),
  constraint briefs_review_metadata check (
    not reviewed_for_sharing or reviewed_at is not null
  )
);

create table public.brief_citations (
  brief_id uuid not null references public.briefs (id) on delete cascade,
  evidence_claim_id uuid not null references public.evidence_claims (id) on delete restrict,
  section_key text not null,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  primary key (brief_id, evidence_claim_id, section_key),
  constraint brief_citations_section_key check (section_key ~ '^[a-z0-9_]+$'),
  constraint brief_citations_sort_nonnegative check (sort_order >= 0)
);

create table public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references public.briefs (id) on delete cascade,
  provider text not null,
  model text not null,
  prompt_version text not null,
  status public.ai_run_status not null default 'running',
  input_claim_ids text[] not null default '{}',
  input_hash text not null,
  response_hash text,
  latency_ms integer,
  error_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint ai_runs_latency_nonnegative check (latency_ms is null or latency_ms >= 0),
  constraint ai_runs_completion_order check (
    completed_at is null or completed_at >= created_at
  )
);

create table public.generation_usage (
  owner_id uuid not null references public.profiles (id) on delete cascade,
  window_start timestamptz not null,
  request_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (owner_id, window_start),
  constraint generation_usage_count check (request_count between 0 and 10)
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now(),
  constraint audit_before_object check (before_state is null or jsonb_typeof(before_state) = 'object'),
  constraint audit_after_object check (after_state is null or jsonb_typeof(after_state) = 'object')
);

create index source_items_status_idx on public.source_items (status, retrieved_at desc);
create index ingestion_jobs_source_created_idx on public.ingestion_jobs (source_registry_id, created_at desc);
create index evidence_claims_country_status_idx on public.evidence_claims (country_code, status);
create index trends_country_idx on public.trends (country_code) where archived_at is null;
create index trend_versions_status_score_idx on public.trend_versions (status, threat_priority_score desc);
create index cisco_products_review_due_idx on public.cisco_products (review_due_at) where approved;
create index briefs_owner_created_idx on public.briefs (owner_id, created_at desc);
create index ai_runs_brief_created_idx on public.ai_runs (brief_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger source_registry_set_updated_at before update on public.source_registry
for each row execute function public.set_updated_at();
create trigger source_items_set_updated_at before update on public.source_items
for each row execute function public.set_updated_at();
create trigger evidence_claims_set_updated_at before update on public.evidence_claims
for each row execute function public.set_updated_at();
create trigger trends_set_updated_at before update on public.trends
for each row execute function public.set_updated_at();
create trigger cisco_products_set_updated_at before update on public.cisco_products
for each row execute function public.set_updated_at();
create trigger trend_product_mappings_set_updated_at before update on public.trend_product_mappings
for each row execute function public.set_updated_at();
create trigger briefs_set_updated_at before update on public.briefs
for each row execute function public.set_updated_at();
create trigger generation_usage_set_updated_at before update on public.generation_usage
for each row execute function public.set_updated_at();

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to authenticated;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- v1 is intentionally single-owner and Auth registration must remain disabled.
  if exists (select 1 from public.profiles) then
    raise exception 'ASEAN Cyber Signals supports one owner account';
  end if;

  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    'owner'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.prevent_published_trend_version_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status = 'published' then
    raise exception 'Published trend versions are immutable';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger trend_versions_immutable_after_publish
before update or delete on public.trend_versions
for each row execute function public.prevent_published_trend_version_mutation();

create or replace function public.prevent_published_trend_relation_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  version_status public.trend_version_status;
begin
  if tg_op in ('UPDATE', 'DELETE') then
    select status into version_status
    from public.trend_versions
    where id = old.trend_version_id;
    if version_status = 'published' then
      raise exception 'Relations for published trend versions are immutable';
    end if;
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    select status into version_status
    from public.trend_versions
    where id = new.trend_version_id;
    if version_status = 'published' then
      raise exception 'Relations for published trend versions are immutable';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger trend_version_claims_immutable_after_publish
before insert or update or delete on public.trend_version_claims
for each row execute function public.prevent_published_trend_relation_mutation();
create trigger trend_product_mappings_immutable_after_publish
before insert or update or delete on public.trend_product_mappings
for each row execute function public.prevent_published_trend_relation_mutation();

create or replace function public.enforce_supporting_product_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  supporting_count integer;
begin
  if new.mapping_role <> 'supporting' then
    return new;
  end if;

  select count(*) into supporting_count
  from public.trend_product_mappings
  where trend_version_id = new.trend_version_id
    and mapping_role = 'supporting'
    and id <> new.id;

  if supporting_count >= 2 then
    raise exception 'A trend version may have at most two supporting products';
  end if;
  return new;
end;
$$;

create trigger trend_product_mappings_supporting_limit
before insert or update on public.trend_product_mappings
for each row execute function public.enforce_supporting_product_limit();

create or replace function public.validate_trend_publication()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  claim_count integer;
  approved_claim_count integer;
  primary_mapping_count integer;
  mapping_count integer;
  approved_mapping_count integer;
begin
  if new.status <> 'published' or old.status = 'published' then
    return new;
  end if;

  select count(*), count(*) filter (where ec.status = 'approved')
  into claim_count, approved_claim_count
  from public.trend_version_claims tvc
  join public.evidence_claims ec on ec.id = tvc.evidence_claim_id
  where tvc.trend_version_id = new.id;

  if claim_count = 0 or approved_claim_count <> claim_count then
    raise exception 'Publishing requires at least one approved evidence claim and no unapproved claims';
  end if;

  select count(*) into primary_mapping_count
  from public.trend_product_mappings tpm
  join public.cisco_products cp on cp.id = tpm.cisco_product_id
  where tpm.trend_version_id = new.id
    and tpm.mapping_role = 'primary'
    and tpm.approved
    and cp.approved;

  if primary_mapping_count <> 1 then
    raise exception 'Publishing requires exactly one approved primary Cisco product mapping';
  end if;

  select count(*), count(*) filter (where tpm.approved and cp.approved)
  into mapping_count, approved_mapping_count
  from public.trend_product_mappings tpm
  join public.cisco_products cp on cp.id = tpm.cisco_product_id
  where tpm.trend_version_id = new.id;

  if approved_mapping_count <> mapping_count then
    raise exception 'All Cisco product mappings must be approved before publishing';
  end if;

  return new;
end;
$$;

create trigger trend_versions_validate_publication
before update on public.trend_versions
for each row execute function public.validate_trend_publication();

create or replace function public.prevent_audit_event_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Audit events are append-only';
end;
$$;

create trigger audit_events_append_only
before update or delete on public.audit_events
for each row execute function public.prevent_audit_event_mutation();

alter table public.profiles enable row level security;
alter table public.countries enable row level security;
alter table public.sectors enable row level security;
alter table public.source_registry enable row level security;
alter table public.ingestion_jobs enable row level security;
alter table public.source_items enable row level security;
alter table public.source_snapshots enable row level security;
alter table public.evidence_claims enable row level security;
alter table public.trends enable row level security;
alter table public.trend_versions enable row level security;
alter table public.trend_version_claims enable row level security;
alter table public.cisco_products enable row level security;
alter table public.trend_product_mappings enable row level security;
alter table public.briefs enable row level security;
alter table public.brief_citations enable row level security;
alter table public.ai_runs enable row level security;
alter table public.generation_usage enable row level security;
alter table public.audit_events enable row level security;

create policy owner_all_profiles on public.profiles
for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy owner_all_countries on public.countries
for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy owner_all_sectors on public.sectors
for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy owner_all_source_registry on public.source_registry
for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy owner_all_ingestion_jobs on public.ingestion_jobs
for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy owner_all_source_items on public.source_items
for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy owner_all_source_snapshots on public.source_snapshots
for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy owner_all_evidence_claims on public.evidence_claims
for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy owner_all_trends on public.trends
for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy owner_all_trend_versions on public.trend_versions
for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy owner_all_trend_version_claims on public.trend_version_claims
for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy owner_all_cisco_products on public.cisco_products
for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy owner_all_trend_product_mappings on public.trend_product_mappings
for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy owner_all_briefs on public.briefs
for all to authenticated using (public.is_owner() and owner_id = auth.uid())
with check (public.is_owner() and owner_id = auth.uid());
create policy owner_all_brief_citations on public.brief_citations
for all to authenticated using (
  public.is_owner() and exists (
    select 1 from public.briefs where briefs.id = brief_citations.brief_id and briefs.owner_id = auth.uid()
  )
) with check (
  public.is_owner() and exists (
    select 1 from public.briefs where briefs.id = brief_citations.brief_id and briefs.owner_id = auth.uid()
  )
);
create policy owner_all_ai_runs on public.ai_runs
for all to authenticated using (
  public.is_owner() and exists (
    select 1 from public.briefs where briefs.id = ai_runs.brief_id and briefs.owner_id = auth.uid()
  )
) with check (
  public.is_owner() and exists (
    select 1 from public.briefs where briefs.id = ai_runs.brief_id and briefs.owner_id = auth.uid()
  )
);
create policy owner_all_generation_usage on public.generation_usage
for all to authenticated using (public.is_owner() and owner_id = auth.uid())
with check (public.is_owner() and owner_id = auth.uid());
create policy owner_all_audit_events on public.audit_events
for all to authenticated using (public.is_owner()) with check (public.is_owner());

revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('evidence-snapshots', 'evidence-snapshots', false, 10485760, array['application/pdf', 'text/html', 'text/plain']),
  ('brief-assets', 'brief-assets', false, 5242880, array['application/pdf', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy owner_read_private_objects on storage.objects
for select to authenticated
using (bucket_id in ('evidence-snapshots', 'brief-assets') and public.is_owner());
create policy owner_insert_private_objects on storage.objects
for insert to authenticated
with check (bucket_id in ('evidence-snapshots', 'brief-assets') and public.is_owner());
create policy owner_update_private_objects on storage.objects
for update to authenticated
using (bucket_id in ('evidence-snapshots', 'brief-assets') and public.is_owner())
with check (bucket_id in ('evidence-snapshots', 'brief-assets') and public.is_owner());
create policy owner_delete_private_objects on storage.objects
for delete to authenticated
using (bucket_id in ('evidence-snapshots', 'brief-assets') and public.is_owner());
