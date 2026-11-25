@AGENTS.md

# FiiPro — plataforma de fundos imobiliários (FIIs)

Beta de uso próprio para visualizar dados de FIIs, com plano de evoluir. Responder em português, de forma objetiva, com passos concretos e **um comando por etapa** quando eu estiver operando terminal ou painel.

## Stack
- Next.js (rotas de API em Node.js), um pouco de Python
- Hospedagem: Vercel (Cron Jobs definidos em `vercel.json`). Tudo que entra na `main` vai para produção.
- Banco: Supabase (migrations em `supabase/migrations/`)
- Fonte oficial de dados: UseBolsaAI (`https://api.usebolsai.com/api/v1`, cabeçalho `X-API-Key`)

## Regras de trabalho (obrigatórias)
- Nunca alterar a `main` sem minha autorização explícita. Com autorização, pode commitar direto na `main` em mudanças pequenas (ex.: horário de cron). Em mudanças de comportamento, é melhor usar branch + PR para ter o preview da Vercel, mas não é obrigatório criar branch sempre.
- Antes de escrever, verificar a branch atual e o estado do repositório.
- Não fazer merge sem minha autorização e sem conferir o estado dos checks (preview/deploy da Vercel).
- Não apagar dados no Supabase sem consulta prévia.
- Nunca ler, pedir, imprimir ou registrar valores de segredos: `CRON_SECRET`, `USEBOLSAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (nem em commits, docs ou mensagens).
- Se não tiver certeza de como algo funciona, ler o código e dizer o que foi verificado e o que é suposição. Não inventar dados, datas ou valores.

## Fontes de dados
- Dividendos e cotações vêm **somente** da UseBolsaAI. A Fundamentus não deve voltar a alimentar esses dados.
- Rotas: `GET /api/cron/dividendos` (`/fiis/{ticker}/distributions?years=2`) e `GET /api/cron/cotacoes` (`/stocks/{ticker}/quote`).
- As duas exigem `Authorization: Bearer <CRON_SECRET>`. maxDuration 60 s, concorrência de 8 fundos.
- HTTP 207 / status `partial` indica ocorrências de dados para revisar (ex.: órfãos, sem cobertura), **não** falha técnica.
- A UseBolsaAI coleta os dados à noite, em dias úteis e aos sábados, e atualiza em ciclos diários (não em tempo real). Por isso a sincronização roda de manhã, e o dado de um dia só aparece na manhã seguinte.
- Quando o administrador retifica valor ou datas de um dividendo, a API substitui o registro antigo. A data-com pode mudar, então não serve como chave fixa.
- O campo `dividend_yield_ttm` da API inclui dividendos declarados e ainda não pagos. Não usar como DY real; calcular a partir do banco.

## Casos especiais já decididos
- **CARE11**: continua no cadastro. A UseBolsaAI retorna 404; classificar como `unavailable` (motivo `TICKER_NAO_COBERTO_PELA_USEBOLSAI`), nunca como falha, e não remover o fundo.
- **Pagamento a definir (HAAA11)**: `payment_date` 9999-12-31 é o padrão da B3 para "a definir" (dividendo anunciado ou retido pelo fundo, que pode segurar o pagamento por até 6 meses). Classificar como `PAGAMENTO_A_DEFINIR`, sem tornar a execução `parcial`. Não inventar data nem gravar o evento sem data; quando a B3 definir, a sincronização diária grava.
- **Registros órfãos** (na base, nos últimos 12 meses, mas ausentes na API): só listar no relatório. Nunca apagar sem minha autorização.
- Duplicidades entre fontes: a UseBolsaAI prevalece sobre a Fundamentus.

## Supabase
- `public.importacoes`: auditoria de cada execução (início `created_at`, fim `finalizado_em`, `duracao_ms`, métricas, status `processando` / `concluido` / `parcial` / `erro`). Em cotações, o `mensagem` traz `tradeDates` (quantos fundos vieram por data de pregão).
- `public.cotacoes_historico`: `fundo_id`, `data`, `valor`; único por (`fundo_id`, `data`).
- `public.dividendos`: identificado por data de pagamento + data-com; único por (`fundo_id`, `data_pagamento`, `valor`).
- `public.fundos`: `ticker` único; `cotacao`, `ultima_atualizacao`, `fonte_dados`.

## Cron Jobs (`vercel.json`)
- Cotações: `30 9 * * 2-6` (terça a sábado, 09:30 UTC / 06:30 Brasília). Pega o fechamento do dia útil anterior.
- Dividendos: `0 9 * * *` (todos os dias, 09:00 UTC / 06:00 Brasília).
- Decisão: não migrar para Vercel Schedules (ainda em beta) por enquanto; reavaliar quando sair do beta ou se houver necessidade real.

## Histórico e próximos passos
O estado atual, os testes realizados e os próximos passos ficam em `docs/HISTORICO.md` (não neste arquivo). Atualizar esse histórico ao fim de cada mudança relevante.
