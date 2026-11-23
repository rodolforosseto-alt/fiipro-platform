ALTER TABLE public.importacoes
ADD COLUMN IF NOT EXISTS duracao_ms integer;

COMMENT ON COLUMN public.importacoes.duracao_ms IS
'Tempo total da execução da rotina, em milissegundos.';