alter table public.dividendos

add column data_corte date,

add column fonte_dados text,

add column ultima_atualizacao timestamp with time zone;