create table if not exists benchmark_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  job_title text,
  company_stage text,
  industry text,
  location text,
  current_salary text,
  current_ote text,
  currency text,
  created_at timestamptz default now()
);

alter table benchmark_leads enable row level security;
create policy "Service role full access — benchmark_leads"
  on benchmark_leads for all using (true) with check (true);
