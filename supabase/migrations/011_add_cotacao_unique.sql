alter table public.cotacoes_historico

add constraint cotacoes_historico_unique_day

unique
(
fundo_id,
data
);