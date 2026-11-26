# FiiPro — histórico técnico e estado atual

Documento de continuidade do projeto. Atualizado em 25/11/2026. Regras estáveis de trabalho ficam no `CLAUDE.md`; aqui ficam o estado, as decisões e os próximos passos. Nunca registrar valores de segredos neste arquivo.

## 1. Estado atual (25/11/2026)

| Componente | Estado | Observação |
| --- | --- | --- |
| UseBolsaAI — cotações | Em produção | Cron seg–sáb às 06:30 (Brasília); primeira execução no novo horário confirmada em 25/11. |
| UseBolsaAI — dividendos | Em produção | Cron diário às 06:00 (Brasília); primeira execução diária ainda a confirmar (26/11). |
| Auditoria (`public.importacoes`) | Validada | `duracao_ms` e métricas registradas; cotações registram `tradeDates`; dividendos registram `A definir` e `Órfãos`. |
| Vercel Production | Ready | Último deploy: merge do PR #5. |
| Vercel Schedules | Não migrado | Ainda em beta; ver decisões. |

## 2. Repositório e histórico de mudanças

Repositório: https://github.com/rodolforosseto-alt/fiipro-platform

| Quando | Mudança | Referência |
| --- | --- | --- |
| 23/11 | Integração inicial UseBolsaAI (dividendos e cotações) | PR #2, merge `9e0b05a` |
| 24/11 | Cron de cotações passa para a manhã seguinte (`30 9 * * 2-6`) e auditoria registra `tradeDates` | PR #4, merge `2551c1f` |
| 25/11 | Cron de dividendos passa para diário (`0 9 * * *`) | commit direto na `main`, `8849dfa` |
| 25/11 | Dividendos: "pagamento a definir" tratado à parte e relatório de registros órfãos (sem apagar) | PR #5, merge `c8e1930` |

## 3. Integração UseBolsaAI

- Base: `https://api.usebolsai.com/api/v1`, autenticação por cabeçalho `X-API-Key`.
- `GET /api/cron/dividendos` consulta `/fiis/{ticker}/distributions?years=2`; `GET /api/cron/cotacoes` consulta `/stocks/{ticker}/quote`.
- As duas rotas exigem `Authorization: Bearer <CRON_SECRET>`. Runtime Node.js, `maxDuration` 60 s, concorrência de 8 fundos.
- O provedor coleta à noite, em dias úteis e aos sábados, em ciclos diários. Um dividendo anunciado durante o dia aparece na manhã seguinte; o fechamento de um pregão também.
- Retificações: a API substitui o registro antigo. A data-com pode mudar, então não serve como chave fixa. O provedor recomenda substituir os pagamentos recentes a cada sincronização e sugere `years=1` para consultas diárias.
- `9999-12-31` em `payment_date` é o padrão da B3 para "a definir".
- O `dividend_yield_ttm` devolvido pela API soma dividendos declarados e ainda não pagos; não usar como DY real.

## 4. Linha do tempo

- **20/11**: importação anterior em `importacoes` (120 novos, 120 atualizados, 2 duplicados). 20/11 foi feriado (B3 fechada); o último pregão na base é 19/11.
- **23/11**: merge do PR #2. Testes manuais em Preview: dividendos com 122 fundos (121 OK, CARE11 sem cobertura, dois eventos HAAA11 sem data) e cotações com 122 fundos e zero falhas. À noite, o cron das 20:30 rodou sem erros, mas a API ainda não entregava o fechamento do dia (122 fundos "sem alteração"). Fechamento de 23/11 importado manualmente depois.
- **24/11**: diagnóstico confirmou que a API passa a entregar o fechamento só durante a noite/madrugada; cron movido para a manhã seguinte (PR #4).
- **25/11**: execução das 06:30 confirmada (cotações do dia anterior gravadas). Cron de dividendos passou a diário. Respostas do suporte da UseBolsaAI esclareceram o ciclo de atualização, as retificações e o significado de `9999-12-31`. PR #5 tratou o "a definir" e adicionou o relatório de órfãos.
- **26/11**: primeiras execuções automáticas em produção confirmadas (dividendos 06:06, cotações 06:36). Dividendos: `A definir: 2`, `Órfãos: 0`, mas `Revisão: 39` (eram 2 em 23/11). Causa provável: um workflow antigo do GitHub Actions (Fundamentus) ainda rodava todo dia e gravava valores arredondados (ex.: MXRF11 0,10 contra 0,095 da UseBolsaAI); como o valor faz parte da chave única, as duas linhas coexistiam. Os workflows foram desativados pelo usuário e removidos do repositório. Limpeza dos duplicados já gravados: pendente (somente com autorização).
- **26/11 (segurança do admin)**: a tela de importação por CSV (`/admin/importar`) e os serviços dela foram removidos (a importação manual deixou de ser usada). O admin passou a ler os dados no servidor com a chave de serviço, depois de validar a sessão, e o cookie fixo `fiipro_admin=true` foi substituído por um token assinado com validade de 8 h. Ajuste das políticas de RLS (restringir a escrita pública) fica para depois da validação do deploy.

## 5. Casos especiais

- **CARE11**: mantido no cadastro por decisão do usuário. A UseBolsaAI retorna 404; classificado como `unavailable` (`TICKER_NAO_COBERTO_PELA_USEBOLSAI`), não como falha.
- **HAAA11**: o fundo suspendeu o pagamento de dividendos (pode segurar por até 6 meses). A API traz dois eventos "a definir": R$ 0,88 (data-com 30/06/2026) e R$ 1,39 (data-com 30/12/2025). O último pagamento foi em 14/07/2026 (R$ 0,08). Classificados como `PAGAMENTO_A_DEFINIR`; não são gravados sem data e entram sozinhos quando a B3 definir.
- **Divergência conhecida (HAAA11)**: o Investidor10 mostra data-com 30/12/2025 paga em 15/01/2026 (R$ 0,08), que não vem na API. Se essa linha existir no banco, aparecerá como órfã.
- **BTCI11 e VINO11**: havia conflito entre registros UseBolsaAI e Fundamentus. A UseBolsaAI é a fonte oficial; o registro Fundamentus do BTCI11 foi excluído pelo usuário.

## 6. Decisões vigentes

- Fonte oficial de dividendos e cotações: UseBolsaAI. A Fundamentus não alimenta mais esses dados.
- Cotações: seg–sáb às 06:30 (Brasília), `30 9 * * 2-6`. Dividendos: diário às 06:00, `0 9 * * *`.
- Não migrar para Vercel Schedules por enquanto: ainda em beta; a migração é uma mudança de configuração e o código das rotas continua valendo. Reavaliar quando sair do beta ou se houver necessidade real (por exemplo, mais de uma execução por dia).
- Registros órfãos: só listar; apagar apenas com autorização do usuário.
- Mudanças na `main` só com autorização explícita do usuário (tudo que entra na `main` vai para produção). Branch e PR são opcionais.
- Precisão máxima para fundos pequenos não é prioridade, segundo o usuário.

## 7. Próximos passos

1. Limpar os dividendos duplicados Fundamentus x UseBolsaAI (linhas do Fundamentus que têm equivalente da UseBolsaAI para o mesmo fundo e data de pagamento), com autorização do usuário; depois confirmar que `Revisão` volta a ficar próximo de zero.
2. Acompanhar `Órfãos` nas próximas execuções (26/11: 0). Se aparecerem, decidir manter, corrigir ou apagar, com autorização do usuário.
2b. Restringir as políticas de RLS (item C do plano de segurança): remover INSERT/UPDATE públicos de `dividendos` e demais tabelas, deixando leitura pública só para `fundos`, `dividendos` e `cotacoes_historico` e apenas INSERT para `feedbacks`, `contacts` e `acessos_fundos`. Só depois de validar o deploy do admin no servidor.
3. Confirmar com o administrador do HAAA11 a situação do evento de R$ 1,39 (data-com 30/12/2025).
4. Conferir se a execução de cotações continua pegando o dia anterior nos próximos dias; ajustar o horário se vier "sem alteração".
5. (Opcional) Avaliar `years=1` nas consultas de dividendos, como sugere o provedor.
6. (Opcional) Definir o critério de DY a exibir: dividendos pagos ou declarados.
7. Reavaliar Vercel Schedules quando sair do beta.
8. Teste em ADVPL/Protheus (`TSTUSBOLSA.PRW`, FWRest, parâmetro `MV_USBKEY`): proposto, ainda não compilado nem testado no AppServer; conferir a assinatura dos métodos FWRest na versão do Protheus.

## 8. Variáveis de ambiente (nomes, sem valores)

`CRON_SECRET`, `USEBOLSAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL` (ou `SUPABASE_URL`), `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Cadastradas na Vercel para All Environments.

## 9. Links úteis

- GitHub: https://github.com/rodolforosseto-alt/fiipro-platform
- Vercel: https://vercel.com/fiip-ro/fiipro-platform
- Cron Jobs: https://vercel.com/docs/cron-jobs
- Schedules: https://vercel.com/docs/schedules
