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

O Hobby permite no máximo uma execução diária por Cron Job. A execução pode ocorrer dentro da janela de horário documentada pela Vercel. As rotas declaram `maxDuration = 60`. Nos testes manuais em Preview, dividendos executaram em aproximadamente 7,5–9 segundos e cotações em 12,6 segundos para 122 fundos.

## Variáveis de ambiente da Vercel
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (somente server-side; nunca prefixar NEXT_PUBLIC)
- `USEBOLSAI_API_KEY`
- `CRON_SECRET`

## Dividendos
- Consulta fundos ativos e pagamentos com `payment_date` a partir dos últimos 12 meses, incluindo pagamentos futuros já anunciados pela fonte.
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

## Validações concluídas em Preview
- Dividendos: 122 fundos consultados; 121 processados; CARE11 classificado como sem cobertura; zero falhas técnicas; duração observada entre 7,5 e 9 segundos.
- Cotações: 122 fundos processados; zero falhas; duração observada de aproximadamente 12,6 segundos.
- Auditoria: `duracao_ms` adicionada a `public.importacoes`; início, término, métricas e status parcial registrados.
- Eventos com data sentinela `9999-12-31` são identificados para revisão, sem serem gravados como pagamentos válidos.

## Pendências antes de ativar em produção
- Confirmar no Supabase que `cotacoes_historico` possui UNIQUE `(fundo_id, data)` e que os campos `fundos.cotacao`, `ultima_atualizacao` e `fonte_dados` existem com os tipos esperados.
- Confirmar a configuração das variáveis no ambiente Production da Vercel.
- Confirmar os Cron Jobs no deployment de produção após o merge.
- Manter os workflows antigos desativados até a nova rotina estar comprovadamente estável.
- Vercel Hobby é destinado a uso pessoal/não comercial; avaliar upgrade antes de operação comercial.
