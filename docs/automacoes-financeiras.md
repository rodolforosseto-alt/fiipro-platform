# Automações financeiras FIIPro

## Fonte prioritária
UseBolsaAI é a fonte prioritária para dividendos, cotações e fundamentos. Credenciais ficam somente nas variáveis de ambiente da Vercel, nunca no repositório.

## Rotas
- `GET /api/cron/dividendos`
- `GET /api/cron/cotacoes`

Ambas exigem `Authorization: Bearer <CRON_SECRET>`.

## Agendamento Hobby
- Dividendos: domingo às 08:30 de Brasília (`30 11 * * 0` UTC).
- Cotações: segunda a sexta às 20:30 de Brasília (`30 23 * * 1-5` UTC).

O Hobby permite no máximo uma execução diária por Cron Job. A execução pode ocorrer dentro da janela de horário documentada pela Vercel. As rotas declaram `maxDuration = 60`; validar o limite efetivo do projeto e a duração real das funções antes de produção.

## Variáveis de ambiente da Vercel
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (somente server-side; nunca prefixar NEXT_PUBLIC)
- `USEBOLSAI_API_KEY`
- `CRON_SECRET`

## Dividendos
- Consulta fundos ativos e pagamentos com `payment_date` nos últimos 12 meses.
- Atualiza ou insere incrementalmente; nunca apaga histórico.
- Compara evento por fundo, data de pagamento e data de corte.
- Respeita o índice UNIQUE atual `(fundo_id, data_pagamento, valor)`; colisões são encaminhadas para revisão.
- Registra auditoria em `public.importacoes`.
- Execução semanal aos domingos; a periodicidade poderá ser revista conforme o volume de divulgações e limites da API.

## Cotações
- Consulta `/stocks/{ticker}/quote` e utiliza `trade_date` e `close`.
- O agendamento ocorre de segunda a sexta após o fechamento; a API deve fornecer o último pregão disponível, inclusive após feriados.
- Insere ou corrige o registro de `cotacoes_historico` para o fundo/data.
- Atualiza a cotação corrente em `fundos.cotacao`.
- Registra auditoria em `public.importacoes`.

## Segurança e operação
- Não colocar chaves no repositório.
- Endpoints rejeitam requisições sem CRON_SECRET.
- Erros por fundo são registrados sem interromper todos os demais.
- Nunca remover registros automaticamente.
- Testar manualmente em Preview com variáveis de ambiente antes de ativar Cron em produção.

## Validações pendentes antes de produção
- Validar no Vercel Hobby o tempo real das duas rotas; o processamento atual usa concorrência limitada a oito fundos.
- Confirmar que o processamento dos fundos cabe no limite de duração efetivo; se não couber, implementar lotes persistentes com cursor e retomada antes de ativar em produção.
- Confirmar no Supabase que `cotacoes_historico` possui UNIQUE `(fundo_id, data)` e que os campos `fundos.cotacao`, `ultima_atualizacao` e `fonte_dados` existem com os tipos esperados.
- Confirmar que a tabela `importacoes` possui as colunas de métricas utilizadas pelas rotas.
- Revisar os campos de resumo de dividendos usados pela interface antes de desativar o legado.
- Vercel Hobby é destinado a uso pessoal/não comercial; avaliar upgrade antes de operação comercial.
- Não desativar workflows antigos até a nova rotina estar comprovadamente estável.
