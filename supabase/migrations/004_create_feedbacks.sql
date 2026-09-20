create table public.feedbacks (

    id uuid primary key default gen_random_uuid(),

    nome text,

    email text,

    tipo text not null,

    mensagem text not null,

    status text default 'novo',

    created_at timestamp with time zone default now()

);