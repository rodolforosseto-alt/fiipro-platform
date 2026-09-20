create table public.importacoes (

    id uuid primary key default gen_random_uuid(),

    tipo text not null,

    arquivo_nome text,

    quantidade_registros integer default 0,

    status text default 'processando',

    mensagem text,

    created_at timestamp with time zone default now(),

    finalizado_em timestamp with time zone

);