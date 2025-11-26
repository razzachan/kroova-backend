create table if not exists public.audit_export_anchors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  anchor_id text not null,
  digest text not null,
  generated_at timestamptz not null,
  provider text,
  request_id text,
  ok boolean not null default true,
  error text,
  signature text,
  version int not null
);
create index if not exists audit_export_anchors_created_idx on public.audit_export_anchors (created_at desc);
create index if not exists audit_export_anchors_anchor_id_idx on public.audit_export_anchors (anchor_id);
