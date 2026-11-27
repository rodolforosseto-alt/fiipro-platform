# FiiPro — histórico técnico e estado atual

Documento de continuidade do projeto. Atualizado em 27/11/2026. Regras estáveis de trabalho ficam no `CLAUDE.md`; aqui ficam o estado, as decisões e os próximos passos. Nunca registrar valores de segredos neste arquivo.

## 1. Estado atual (27/11/2026)

| Componente | Estado | Observação |
| --- | --- | --- |
| UseBolsaAI — cotações | Em produção | Cron terça a sábado às 06:30 (Brasília). Execuções de 25/11, 26/11 e 27/11 confirmadas. |
| UseBolsaAI — dividendos | Em produção | Cron diário às 06:00 (Brasília). Execução de 27/11: `concluido`, `Revisão: 0`, `Órfãos: 0`. |
| Auditoria (`public.importacoes`) | Validada | `duracao_ms` e métricas registradas; cotações registram `tradeDates`; dividendos registram `A definir` e `Órfãos`. |
| Base de dividendos | Limpa | 100% UseBolsaAI; 39 duplicados do Fundamentus removidos em 26/11. |
| Admin (`/admin/dashboard`) | Protegido | Sessão assinada (8 h) e consultas no servidor com chave de serviço. |
| RLS (Supabase) | Aplicado | Anon só lê `fundos`, `dividendos`, `cotacoes_historico` e só insere `feedbacks`, `contacts`, `acessos_fundos`; `importacoes` sem políticas. |
| Indicadores dos fundos | Em produção | Migration `202611270001` aplicada, rota `/api/cron/indicadores` (diária 06:45), flag `ativo` no admin e dividendos sem arredondar (PR #7). |
| Domínio | Em produção | `fiipro.com.br` (Registro.br, DNS do Registro.br) apontando para a Vercel; ativo em 26/11. `www.fiipro.com.br` redireciona (308) para o domínio principal desde 27/11. |
| Vercel Production | Ready | Último deploy: merge do PR #6. |
| Vercel Schedules | Não migrado | Ainda em beta; ver decisões. |

## 2. Repositório e histórico de mudanças

Repositório: https://github.com/rodolforosseto-alt/fiipro-platform

| Quando | Mudança | Referência |
| --- | --- | --- |
| 23/11 | Integração inicial UseBolsaAI (dividendos e cotações) | PR #2, merge `9e0b05a` |
| 24/11 | Cron de cotações passa para a manhã seguinte (`30 9 * * 2-6`) e auditoria registra `tradeDates` | PR #4, merge `2551c1f` |
| 25/11 | Cron de dividendos passa para diário (`0 9 * * *`) | commit direto na `main`, `8849dfa` |
| 25/11 | Dividendos: "pagamento a definir" tratado à parte e relatório de registros órfãos (sem apagar) | PR #5, merge `c8e1930` |
| 26/11 | Documentação da tabela `acessos_fundos` (migration idempotente) | commit `48b8d3c` |
| 26/11 | Remoção dos workflows antigos do GitHub Actions (Fundamentus/B3) | commit `1ea9460` |
| 26/11 | Admin seguro: sessão assinada, consultas no servidor, remoção da importação CSV | PR #6, merge `64f1619` |

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
- **26/11**: primeiras execuções automáticas em produção confirmadas (dividendos 06:06, cotações 06:36). Dividendos: `A definir: 2`, `Órfãos: 0`, mas `Revisão: 39` (eram 2 em 23/11). Causa provável: um workflow antigo do GitHub Actions (Fundamentus) ainda rodava todo dia e gravava valores arredondados (ex.: MXRF11 0,10 contra 0,095 da UseBolsaAI); como o valor faz parte da chave única, as duas linhas coexistiam. Os workflows foram desativados pelo usuário e removidos do repositório. Limpeza dos 39 duplicados feita ainda em 26/11, com autorização: removidas as linhas do Fundamentus que tinham equivalente da UseBolsaAI; MXRF11 ficou com uma linha e a base ficou 100% UseBolsaAI.
- **26/11 (segurança do admin)**: a tela de importação por CSV (`/admin/importar`) e os serviços dela foram removidos (a importação manual deixou de ser usada). O admin passou a ler os dados no servidor com a chave de serviço, depois de validar a sessão, e o cookie fixo `fiipro_admin=true` foi substituído por um token assinado com validade de 8 h. Depois de validar o admin em produção, as políticas de RLS foram restringidas (removidas as escritas públicas em `fundos`, `dividendos`, `cotacoes_historico` e todas as políticas de `importacoes`, além da leitura pública de `feedbacks` e `acessos_fundos`). Estado conferido pela listagem de `pg_policies`.
- **26/11 (domínio)**: `fiipro.com.br` registrado no Registro.br e adicionado na Vercel com um registro `A` na raiz (valor indicado pela própria Vercel). A zona demorou para ser publicada (servidores do domínio "em transição" no Registro.br); o site passou a abrir no mesmo dia. O `www` foi configurado em 27/11: adicionado na Vercel com redirecionamento 308 para `fiipro.com.br` e `CNAME` `www` criado no Registro.br com o valor indicado pela Vercel.
- **27/11**: execuções de produção confirmam o resultado da limpeza. Dividendos (06:06): 122 fundos, 121 consultas OK, 0 falhas técnicas, 1 sem cobertura (CARE11), 1434 iguais, `Revisão: 0`, `A definir: 2`, `Órfãos: 0`, `concluido`. Cotações (06:36): 122 fundos, 119 gravados com data de pregão 26/11, 1 com 25/11 e 3 sem alteração (2 com data de pregão 05/11, ou seja, sem negociação recente), `concluido`.

- **27/11 (indicadores, em PR)**: análise da tabela `fundos` mostrou que `ultimo_dividendo` e `dy_mensal` vinham só da carga manual (nenhuma rota os atualizava; 107 de 121 fundos com `dy_mensal` inconsistente com cotação e dividendo), `patrimonio`/`numero_cotistas` preenchidos só no MXRF11 (valores manuais errados: API informa 1,6 mi de cotistas e R$ 5,2 bi) e `gestor`/`descricao` parciais. A resposta real do `/fiis/MXRF11` confirmou que a API não traz último dividendo nem DY mensal e que o `segment` dela é pouco confiável. Decisão do usuário: DY de 12 meses calculado pelo banco (só pagos); P/VP, patrimônio, cotistas e tipo vêm da API; dividendos exibidos sem arredondar; flag `ativo` com botão no admin.

- **27/11 (indicadores em produção)**: PR #7 mergeado (`03bdc08`) após a migration. Primeira execução manual em produção: 122 fundos, 122 com indicadores, 0 erros, 13 s. Conferido no banco: MXRF11 com último dividendo 0,095, DY mensal 1,09% e DY 12m 13,69% (igual ao TTM da API); HAAA11 com DY 12m de 1,00% (só pagos). O CARE11 passou a receber indicadores (API respondeu no `/fiis/{ticker}`) mas segue sem dividendos no banco.
- **27/11 (fundos novos, em PR)**: a lista `/fiis/` da API traz 401 FIIs (sem paginação) com nomes brutos da CVM e `segment` inconsistente. Nova rota `/api/cron/fundos` (prévia por padrão; grava só com `?confirmar=1`), `maxDuration` das rotas subiu para 300 s (limite do Hobby) e o `segmento` vazio passa a ser preenchido com o tipo do fundo. Passo a passo para trazer os fundos: rodar a prévia, conferir nomes, rodar com `?confirmar=1`, depois executar manualmente dividendos, cotações e indicadores.
- **27/11 (prévia dos fundos novos)**: a prévia em produção deu 278 fundos novos, 1 ticker inválido (SPG211, fora do padrão de 4 letras + 2 números; não cadastrado) e nenhum cadastrado ausente da API. Muitos fundos têm poucos cotistas (29 com menos de 100, 102 com menos de 500, 135 com menos de 1.000). O limpador de nomes foi melhorado (sobras como "DE" no começo, "Resp Ltda", siglas) e a rota ganhou `minCotistas` para cadastrar os pequenos já desativados.

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

0. Aplicar a migration `202611270001_add_fund_indicators.sql` no Supabase (SQL Editor) ANTES do merge do PR de indicadores; depois conferir a primeira execução de `/api/cron/indicadores` em `importacoes` e o MXRF11 no site (último dividendo 0,095).
1. Acompanhar `Órfãos` nas próximas execuções (26/11 e 27/11: 0). Se aparecerem, decidir manter, corrigir ou apagar, com autorização do usuário.
2. Quando o site for aberto ao público, avaliar limite de envios nos INSERTs públicos (`feedbacks`, `contacts`, `acessos_fundos`).
2b. Trazer os ~280 fundos que faltam com a rota `/api/cron/fundos` (ver linha do tempo de 27/11) e desativar no admin os ilíquidos ou sem cobertura. Depois avaliar: rodar a rota de cadastro periodicamente para captar IPOs, e histórico de cotações dos fundos novos (começa no dia da entrada).
2c. Revisar nomes do cadastro original: a API lista APTO11 como "Navi Residencial" e AIEC11 como "Arch Edifícios Corporativos", enquanto o cadastro tem "Autonomy Edifícios Corporativos" nos dois; revisar também `tipo_fundo` x `segmento` (ex.: CARE11).
3. Acompanhar os fundos cuja data de pregão não avança (em 27/11, 2 fundos com 05/11).
3b. Confirmar com o administrador do HAAA11 a situação do evento de R$ 1,39 (data-com 30/12/2025).
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
