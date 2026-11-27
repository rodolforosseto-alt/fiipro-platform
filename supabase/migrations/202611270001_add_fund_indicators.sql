-- Indicadores dos fundos (fonte: UseBolsaAI, endpoint /fiis/{ticker}) e DY de 12 meses.
-- Idempotente: pode ser executada mais de uma vez.
-- `patrimonio` e `numero_cotistas` já existem e passam a ser preenchidos pela rota
-- /api/cron/indicadores. `ultimo_dividendo`, `dy_mensal` e `dy_12m` são calculados pela
-- mesma rota a partir de `public.dividendos` (somente dividendos já pagos).

alter table public.fundos
  add column if not exists dy_12m numeric(14, 8),
  add column if not exists pvp numeric(10, 4),
  add column if not exists valor_patrimonial_cota numeric(14, 6),
  add column if not exists cotas_emitidas bigint,
  add column if not exists tipo_fundo text,
  add column if not exists tipo_gestao text,
  add column if not exists administrador text,
  add column if not exists mandato text,
  add column if not exists data_inicio date,
  add column if not exists composicao_ativos jsonb,
  add column if not exists vacancia_pct numeric(8, 4),
  add column if not exists inadimplencia_pct numeric(8, 4),
  add column if not exists percentual_locado numeric(8, 4),
  add column if not exists imoveis_qtd integer,
  add column if not exists area_total_m2 numeric(14, 2),
  add column if not exists indicadores_referencia date,
  add column if not exists indicadores_atualizados_em timestamp with time zone;

comment on column public.fundos.dy_12m is 'DY 12 meses (%): soma dos dividendos pagos nos últimos 12 meses / cotação. Calculado pelo banco, não pela API.';
comment on column public.fundos.dy_mensal is 'DY do último dividendo pago (%): último dividendo pago / cotação.';
comment on column public.fundos.pvp is 'P/VP informado pela UseBolsaAI (cotação / valor patrimonial por cota do último informe).';
comment on column public.fundos.indicadores_referencia is 'Data de referência do informe mensal usado nos indicadores (reference_date da API).';
