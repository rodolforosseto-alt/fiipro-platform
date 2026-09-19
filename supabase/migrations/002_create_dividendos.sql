create table public.dividendos (

    id uuid primary key default gen_random_uuid(),

    fundo_id uuid references public.fundos(id),

    data_pagamento date not null,

    valor numeric(10,2) not null,

    created_at timestamp with time zone default now()

);