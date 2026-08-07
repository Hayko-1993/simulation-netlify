-- Run this once in Supabase: SQL Editor → New query → Paste → Run

create table if not exists carriers (
  id bigint generated always as identity primary key,
  company_legal_name text not null,
  mc_number text not null,
  dot_number text not null,
  contact_name text not null,
  phone text not null,
  email text not null unique,
  password_hash text not null,
  equipment text default '[]',
  preferred_lanes text default '[]',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists login_attempts (
  id bigint generated always as identity primary key,
  email text,
  carrier_id bigint references carriers(id),
  success integer not null default 0,
  ip_address text,
  password text,
  created_at timestamptz not null default now()
);

create table if not exists login_codes (
  id bigint generated always as identity primary key,
  carrier_id bigint not null references carriers(id),
  code text not null,
  expires_at bigint not null,
  used integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists twofa_attempts (
  id bigint generated always as identity primary key,
  carrier_id bigint references carriers(id),
  code text,
  success integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists visits (
  id bigint generated always as identity primary key,
  page text,
  referrer text,
  ip_address text,
  created_at timestamptz not null default now()
);
