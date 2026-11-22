# Automacoes financeiras FIIPro

## Fonte oficial

UseBolsaAI e a fonte prioritaria para dividendos, cotacoes e fundamentos. Credenciais ficam somente nas variaveis de ambiente da Vercel, nunca no repositorio.

## Dividendos — primeira integracao

- Endpoint: `GET /api/cron/dividendos`
- Agendamento Hobby: uma vez ao dia, 11:30 UTC (janela aproximada 11:30–12:29 UTC; 08:30–09:29 em Brasilia).
- Endpoint exige `Authorization: Bearer $CRON_SECRET`.
- Usa `USEBOLSAI_API_KEY`, `SUPABASE_URL` (ou `NEXT_PUBLIC_SUPABASE_URL`) e `SUPABASE_SERVICE_ROLE_KEY`.
- Consulta os fundos ativos e os pagamentos com `payment_date` nos ultimos 12 meses.
- Atualiza ou insere incrementalmente; nao apaga dados.
- Registra auditoria em `public.importacoes`.

## Variaveis de ambiente necessarias

- `CRON_SECRET`: segredo aleatorio longo, igual na Vercel.
- `USEBOLSAI_API_KEY`: chave da conta UseBolsaAI.
- `SUPABASE_URL`: URL do projeto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: chave service role, somente server-side.

## Seguranca e operacao

Nunca adicionar segredos ao Git. A rota recusa chamadas se CRON_SECRET estiver ausente ou incorreto. O endpoint e incremental e pode ser chamado novamente sem apagar o historico.

## Proximas etapas

1. Fazer deploy de preview e testar manualmente com a chave CRON_SECRET.
2. Comparar contagens e resultados com o importador Python validado.
3. Somente depois ativar o Cron em producao.
4. Criar o importador de cotacoes e seu segundo agendamento depois de validar o endpoint e a tabela `cotacoes_historico`.
5. Desativar workflows antigos somente depois da nova rotina estar comprovadamente estavel.
