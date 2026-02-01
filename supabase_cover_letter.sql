-- Create cover_letters table
create table public.cover_letters (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  cv_id uuid references public.cvs (id) on delete set null,
  title text not null default 'Untitled Cover Letter',
  job_title text null,
  company_name text null,
  job_description text null,
  content text null,
  tone text null,
  created_at timestamp with time zone not null default now(),
  constraint cover_letters_pkey primary key (id)
);

-- Enable RLS
alter table public.cover_letters enable row level security;

-- Policies
create policy "Users can view their own cover letters"
on public.cover_letters
for select
to authenticated
using (
  (auth.uid() = user_id)
);

create policy "Users can insert their own cover letters"
on public.cover_letters
for insert
to authenticated
with check (
  (auth.uid() = user_id)
);

create policy "Users can update their own cover letters"
on public.cover_letters
for update
to authenticated
using (
  (auth.uid() = user_id)
);

create policy "Users can delete their own cover letters"
on public.cover_letters
for delete
to authenticated
using (
  (auth.uid() = user_id)
);
