create table public.cotacoes_historico (

    id uuid primary key default gen_random_uuid(),

    fundo_id uuid not null references public.fundos(id)
    on delete cascade,

    data date not null,

    valor numeric not null,

    created_at timestamp with time zone default now()

);