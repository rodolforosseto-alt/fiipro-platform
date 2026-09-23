alter table public.importacoes

add column registros_processados integer default 0,

add column registros_novos integer default 0,

add column registros_duplicados integer default 0,

add column registros_erro integer default 0;