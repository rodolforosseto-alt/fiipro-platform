create table public.fundos (

    id uuid primary key default gen_random_uuid(),

    ticker varchar(10) unique not null,

    nome text not null,

    segmento text,

    gestor text,

    cotacao numeric(10,2),

    ultimo_dividendo numeric(10,2),

    dy_mensal numeric(10,2),

    ativo boolean default true,

    created_at timestamp with time zone default now()

);