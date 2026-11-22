# Automações financeiras FIIPro

## Fonte prioritária
UseBolsaAI é a fonte prioritária para dividendos, cotações e fundamentos. Credenciais ficam somente nas variáveis de ambiente da Vercel, nunca no repositório.

## Rotas
- `GET /api/cron/dividendos`
- `GET /api/cron/cotacoes`

Ambas exigem `Authorization: Bearer <CRON_SECRET>`.

## Agendamento Hobby
- Dividendos: `30 11 * * *` UTC (08:30 em Brasília; execução pode ocorrer dentro da hora programada).
- Cotações: `0 23 * * *` UTC (20:00 em Brasília; execução pode ocorrer dentro da hora programada).

O Hobby permite no máximo uma execução diária por Cron Job. Validar duração real das funções; ambas têm limite declarado de 60 segundos no código, sujeito aos limites efetivos do plano/projeto.

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

## Cotações
- Consulta `/stocks/{ticker}/quote` e utiliza `trade_date` e `close`.
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
- Validar no Vercel Hobby o tempo real das duas rotas; o processamento de 122 fundos usa concorrência limitada.
- Confirmar no Supabase que `cotacoes_historico` possui UNIQUE `(fundo_id, data)` e que os campos `fundos.cotacao`, `ultima_atualizacao` e `fonte_dados` existem com os tipos esperados.
- Confirmar que a tabela `importacoes` possui as colunas de métricas utilizadas pelas rotas.
- Revisar os campos de resumo de dividendos usados pela interface antes de desativar o legado.
- Vercel Hobby é destinado a uso pessoal/não comercial; avaliar upgrade antes de operação comercial.
- Não desativar workflows antigos até a nova rotina estar comprovadamente estável.
