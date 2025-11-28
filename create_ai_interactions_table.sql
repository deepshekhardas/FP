-- Create table for tracking AI interactions
create table if not exists ai_interactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  feature_type text not null check (feature_type in ('suggestions', 'summary', 'replies')),
  input_context text,
  output_result text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table ai_interactions enable row level security;

-- Create policy to allow users to insert their own interactions
create policy "Users can insert their own AI interactions"
  on ai_interactions for insert
  with check (auth.uid() = user_id);

-- Create policy to allow users to view their own interactions
create policy "Users can view their own AI interactions"
  on ai_interactions for select
  using (auth.uid() = user_id);
