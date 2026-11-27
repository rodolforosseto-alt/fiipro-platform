@AGENTS.md

# FiiPro — plataforma de fundos imobiliários (FIIs)

Beta de uso próprio para visualizar dados de FIIs, com plano de evoluir. Responder em português, de forma objetiva, com passos concretos e **um comando por etapa** quando eu estiver operando terminal ou painel.

## Stack
- Next.js (rotas de API em Node.js), um pouco de Python
- Hospedagem: Vercel (Cron Jobs definidos em `vercel.json`). Tudo que entra na `main` vai para produção. Domínio: `fiipro.com.br` (registrado no Registro.br, DNS no próprio Registro.br).
- Banco: Supabase (migrations em `supabase/migrations/`)
- Fonte oficial de dados: UseBolsaAI (`https://api.usebolsai.com/api/v1`, cabeçalho `X-API-Key`)
- Admin (`/admin/dashboard`): sessão por cookie assinado (`src/lib/admin-session.ts`). As consultas do admin rodam no servidor com a chave de serviço (`src/lib/supabase-admin.ts`) e só depois de validar a sessão. Nunca usar a chave de serviço em componentes `use client`.
- A chave pública (anon) serve apenas para leitura pública e para inserir feedbacks, contatos e acessos. Não deve gravar nas demais tabelas (as políticas de RLS do banco refletem isso desde 26/11; `importacoes` não tem políticas, só a chave de serviço acessa).

## Regras de trabalho (obrigatórias)
- Nunca alterar a `main` sem minha autorização explícita. Com autorização, pode commitar direto na `main` em mudanças pequenas (ex.: horário de cron). Em mudanças de comportamento, é melhor usar branch + PR para ter o preview da Vercel, mas não é obrigatório criar branch sempre.
- Antes de escrever, verificar a branch atual e o estado do repositório.
- Não fazer merge sem minha autorização e sem conferir o estado dos checks (preview/deploy da Vercel).
- Não apagar dados no Supabase sem consulta prévia.
- Nunca ler, pedir, imprimir ou registrar valores de segredos: `CRON_SECRET`, `USEBOLSAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (nem em commits, docs ou mensagens).
- Se não tiver certeza de como algo funciona, ler o código e dizer o que foi verificado e o que é suposição. Não inventar dados, datas ou valores.

## Fontes de dados
- Dividendos e cotações vêm **somente** da UseBolsaAI. A Fundamentus não deve voltar a alimentar esses dados.
- Rotas: `GET /api/cron/dividendos` (`/fiis/{ticker}/distributions?years=2`), `GET /api/cron/cotacoes` (`/stocks/{ticker}/quote`) e `GET /api/cron/indicadores` (`/fiis/{ticker}`: P/VP, valor patrimonial por cota, patrimônio, cotistas, tipo e gestão, administrador, composição da carteira, vacância etc.).
- `GET /api/cron/fundos` (`/fiis/`, lista com ~400 FIIs): cadastra em `fundos` os tickers que faltam. Não tem cron e nunca altera nem apaga fundos existentes. Sem parâmetros só mostra a prévia; grava com `?confirmar=1` (opcionais: `&ativo=0` entra desativado, `&limite=N`). Os nomes da CVM vêm em maiúsculas e são limpos (melhor esforço); `segmento` do fundo novo é preenchido pela rota de indicadores com o `fund_type` da API.
- Todas exigem `Authorization: Bearer <CRON_SECRET>`. maxDuration 300 s (limite do plano Hobby), concorrência de 8 fundos.
- HTTP 207 / status `partial` indica ocorrências de dados para revisar (ex.: órfãos, sem cobertura), **não** falha técnica.
- A UseBolsaAI coleta os dados à noite, em dias úteis e aos sábados, e atualiza em ciclos diários (não em tempo real). Por isso a sincronização roda de manhã, e o dado de um dia só aparece na manhã seguinte.
- Quando o administrador retifica valor ou datas de um dividendo, a API substitui o registro antigo. A data-com pode mudar, então não serve como chave fixa.
- O campo `dividend_yield_ttm` da API inclui dividendos declarados e ainda não pagos. Não usar como DY real; calcular a partir do banco.
- `fundos.ultimo_dividendo`, `dy_mensal` e `dy_12m` são calculados pela rota de indicadores a partir de `dividendos`, só com pagamentos já realizados (`data_pagamento <= hoje`), sem arredondar. O `/fiis/{ticker}` não traz último dividendo nem DY mensal. Dividendos aparecem no site sem arredondar para 2 casas (`formatDividend`, até 4 casas), porque o banco guarda o valor exato (ex.: 0,095).
- O `segment` do `/fiis/{ticker}` não é confiável (MXRF11 vem como "Logística"). O `segmento` do cadastro é mantido por nós; o `fund_type` da API vai para `tipo_fundo`. Informes mensais têm defasagem: mostrar `indicadores_referencia`.

## Casos especiais já decididos
- **CARE11**: continua no cadastro. A UseBolsaAI retorna 404; classificar como `unavailable` (motivo `TICKER_NAO_COBERTO_PELA_USEBOLSAI`), nunca como falha, e não remover o fundo.
- **Pagamento a definir (HAAA11)**: `payment_date` 9999-12-31 é o padrão da B3 para "a definir" (dividendo anunciado ou retido pelo fundo, que pode segurar o pagamento por até 6 meses). Classificar como `PAGAMENTO_A_DEFINIR`, sem tornar a execução `parcial`. Não inventar data nem gravar o evento sem data; quando a B3 definir, a sincronização diária grava.
- **Registros órfãos** (na base, nos últimos 12 meses, mas ausentes na API): só listar no relatório. Nunca apagar sem minha autorização.
- Duplicidades entre fontes: a UseBolsaAI prevalece sobre a Fundamentus.

## Supabase
- `public.importacoes`: auditoria de cada execução (início `created_at`, fim `finalizado_em`, `duracao_ms`, métricas, status `processando` / `concluido` / `parcial` / `erro`). Em cotações, o `mensagem` traz `tradeDates` (quantos fundos vieram por data de pregão).
- `public.cotacoes_historico`: `fundo_id`, `data`, `valor`; único por (`fundo_id`, `data`).
- `public.dividendos`: identificado por data de pagamento + data-com; único por (`fundo_id`, `data_pagamento`, `valor`).
- `public.fundos`: `ticker` único; `ativo` (verdadeiro/falso; desativado some do site e das rotinas, alterado em `/admin/dashboard`); `cotacao`, `ultima_atualizacao`, `fonte_dados`; indicadores (`pvp`, `valor_patrimonial_cota`, `patrimonio`, `numero_cotistas`, `cotas_emitidas`, `tipo_fundo`, `tipo_gestao`, `administrador`, `mandato`, `data_inicio`, `composicao_ativos`, `vacancia_pct`, `inadimplencia_pct`, `percentual_locado`, `imoveis_qtd`, `area_total_m2`, `indicadores_referencia`, `indicadores_atualizados_em`) e dividendos derivados (`ultimo_dividendo`, `dy_mensal`, `dy_12m`).

## Cron Jobs (`vercel.json`)
- Cotações: `30 9 * * 2-6` (terça a sábado, 09:30 UTC / 06:30 Brasília). Pega o fechamento do dia útil anterior.
- Dividendos: `0 9 * * *` (todos os dias, 09:00 UTC / 06:00 Brasília).
- Indicadores: `45 9 * * *` (todos os dias, 09:45 UTC / 06:45 Brasília). No plano Hobby a precisão é de ±59 min, então a ordem entre as rotas não é garantida; a rota de indicadores não depende da ordem (usa o fechamento devolvido pela própria API para o DY).
- Decisão: não migrar para Vercel Schedules (ainda em beta) por enquanto; reavaliar quando sair do beta ou se houver necessidade real.

## Histórico e próximos passos
O estado atual, os testes realizados e os próximos passos ficam em `docs/HISTORICO.md` (não neste arquivo). Atualizar esse histórico ao fim de cada mudança relevante.
