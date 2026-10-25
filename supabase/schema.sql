-- ─────────────────────────────────────────────────────────────────────────────
--  College Chatbot — Supabase (Postgres) schema
--  Run this once in the Supabase dashboard → SQL Editor → New query → Run.
--  Safe to re-run: everything uses IF NOT EXISTS / CREATE OR REPLACE.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Shared trigger: keep updated_at current ─────────────────────────────────
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ═════════════════════════════════════════════════════════════════════════════
--  INTENTS  (was models/Intent.js)
-- ═════════════════════════════════════════════════════════════════════════════
create table if not exists intents (
  id               uuid primary key default gen_random_uuid(),
  intent_name      text not null unique,
  display_name     text not null,
  category         text not null default 'general'
                   check (category in ('admissions','academics','fees','campus','contact','events','general')),
  training_phrases text[] not null check (cardinality(training_phrases) >= 1),
  responses        text[] not null check (cardinality(responses) >= 1),
  keywords         text[] not null default '{}',
  entities         text[] not null default '{}',
  is_active        boolean not null default true,
  hit_count        integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists intents_active_idx on intents (is_active);

drop trigger if exists intents_updated_at on intents;
create trigger intents_updated_at before update on intents
  for each row execute function set_updated_at();

create or replace function increment_intent_hit(p_id uuid) returns void
language sql as $$
  update intents set hit_count = hit_count + 1 where id = p_id;
$$;

-- ═════════════════════════════════════════════════════════════════════════════
--  CHAT LOGS  (was models/ChatLog.js — embedded messages → chat_messages)
-- ═════════════════════════════════════════════════════════════════════════════
create table if not exists chat_logs (
  id             uuid primary key default gen_random_uuid(),
  session_id     text not null unique,
  user_id        text not null default 'anonymous',
  total_messages integer not null default 0,
  resolved_count integer not null default 0,
  fallback_count integer not null default 0,
  last_activity  timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists chat_logs_last_activity_idx on chat_logs (last_activity desc);

drop trigger if exists chat_logs_updated_at on chat_logs;
create trigger chat_logs_updated_at before update on chat_logs
  for each row execute function set_updated_at();

create table if not exists chat_messages (
  id          bigint generated always as identity primary key,
  chat_log_id uuid not null references chat_logs(id) on delete cascade,
  role        text not null check (role in ('user','bot')),
  text        text not null,
  "timestamp" timestamptz not null default now(),
  intent      text,
  confidence  double precision,
  entities    text[] not null default '{}'
);
create index if not exists chat_messages_log_idx on chat_messages (chat_log_id, id);

-- Atomically record one user→bot exchange (upsert session + 2 messages)
create or replace function log_chat_exchange(
  p_session_id  text,
  p_user_id     text,
  p_user_text   text,
  p_bot_text    text,
  p_intent      text,
  p_confidence  double precision,
  p_entities    text[],
  p_is_fallback boolean
) returns void
language plpgsql as $$
declare
  v_log_id uuid;
begin
  insert into chat_logs (session_id, user_id, total_messages, resolved_count, fallback_count, last_activity)
  values (p_session_id, coalesce(p_user_id, 'anonymous'), 2,
          case when p_is_fallback then 0 else 1 end,
          case when p_is_fallback then 1 else 0 end,
          now())
  on conflict (session_id) do update set
    total_messages = chat_logs.total_messages + 2,
    resolved_count = chat_logs.resolved_count + case when p_is_fallback then 0 else 1 end,
    fallback_count = chat_logs.fallback_count + case when p_is_fallback then 1 else 0 end,
    last_activity  = now()
  returning id into v_log_id;

  insert into chat_messages (chat_log_id, role, text) values (v_log_id, 'user', p_user_text);
  insert into chat_messages (chat_log_id, role, text, intent, confidence, entities)
  values (v_log_id, 'bot', p_bot_text, p_intent, p_confidence, coalesce(p_entities, '{}'));
end $$;

-- Totals for /api/chat/stats
create or replace function chat_stats() returns table (
  total_sessions bigint, total_messages bigint, total_resolved bigint, total_fallback bigint
)
language sql stable as $$
  select count(*),
         coalesce(sum(total_messages), 0),
         coalesce(sum(resolved_count), 0),
         coalesce(sum(fallback_count), 0)
  from chat_logs;
$$;

-- ═════════════════════════════════════════════════════════════════════════════
--  LIVE CHATS  (was models/LiveChat.js — embedded messages → live_chat_messages)
-- ═════════════════════════════════════════════════════════════════════════════
create table if not exists live_chats (
  id                 uuid primary key default gen_random_uuid(),
  room_id            text not null unique,
  session_id         text not null,
  student_socket_id  text not null,
  student_id         text not null default 'anonymous',
  student_name       text not null default 'Student',
  admin_socket_id    text,
  admin_id           text,
  admin_name         text,
  status             text not null default 'queued'
                     check (status in ('queued','active','closed','abandoned')),
  language           text not null default 'en',
  subject            text not null default 'General Query',
  trigger_message    text not null default '',
  trigger_confidence double precision not null default 0,
  queued_at          timestamptz not null default now(),
  accepted_at        timestamptz,
  closed_at          timestamptz,
  rating             smallint check (rating between 1 and 5),
  feedback           text,
  unread_by_admin    integer not null default 0,
  unread_by_student  integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists live_chats_status_idx  on live_chats (status, queued_at);
create index if not exists live_chats_session_idx on live_chats (session_id);

drop trigger if exists live_chats_updated_at on live_chats;
create trigger live_chats_updated_at before update on live_chats
  for each row execute function set_updated_at();

create table if not exists live_chat_messages (
  id           bigint generated always as identity primary key,
  live_chat_id uuid not null references live_chats(id) on delete cascade,
  sender       text not null check (sender in ('student','admin','bot','system')),
  sender_name  text not null default 'Unknown',
  text         text not null,
  "timestamp"  timestamptz not null default now(),
  is_read      boolean not null default false,
  lang         text not null default 'en'
);
create index if not exists live_chat_messages_chat_idx on live_chat_messages (live_chat_id, id);

-- Atomically append a message and bump the unread counter
create or replace function add_live_chat_message(
  p_room_id text, p_sender text, p_sender_name text, p_text text, p_lang text
) returns void
language plpgsql as $$
declare
  v_chat_id uuid;
begin
  update live_chats set
    unread_by_admin   = unread_by_admin   + case when p_sender = 'student' then 1 else 0 end,
    unread_by_student = unread_by_student + case when p_sender = 'admin'   then 1 else 0 end
  where room_id = p_room_id
  returning id into v_chat_id;

  if v_chat_id is null then
    raise exception 'Session not found: %', p_room_id;
  end if;

  insert into live_chat_messages (live_chat_id, sender, sender_name, text, lang)
  values (v_chat_id, p_sender, coalesce(p_sender_name, 'Unknown'), p_text, coalesce(p_lang, 'en'));
end $$;

-- ═════════════════════════════════════════════════════════════════════════════
--  SECURITY
--  The Node server talks to Supabase with the service_role key, which bypasses
--  RLS. Enabling RLS with no policies means the public anon key can read or
--  write nothing, so leaking it is harmless.
-- ═════════════════════════════════════════════════════════════════════════════
alter table intents            enable row level security;
alter table chat_logs          enable row level security;
alter table chat_messages      enable row level security;
alter table live_chats         enable row level security;
alter table live_chat_messages enable row level security;

revoke execute on function increment_intent_hit(uuid)                     from public, anon, authenticated;
revoke execute on function log_chat_exchange(text,text,text,text,text,double precision,text[],boolean) from public, anon, authenticated;
revoke execute on function chat_stats()                                   from public, anon, authenticated;
revoke execute on function add_live_chat_message(text,text,text,text,text) from public, anon, authenticated;
grant  execute on function increment_intent_hit(uuid)                     to service_role;
grant  execute on function log_chat_exchange(text,text,text,text,text,double precision,text[],boolean) to service_role;
grant  execute on function chat_stats()                                   to service_role;
grant  execute on function add_live_chat_message(text,text,text,text,text) to service_role;
