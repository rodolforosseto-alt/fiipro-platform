
import os
import time
import requests
import pandas as pd

from decimal import Decimal
from pathlib import Path
from io import StringIO
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from dotenv import load_dotenv
from supabase import create_client


# ==========================================
# CONFIGURAÇÕES
# ==========================================

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR.parent / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

TIMEZONE = ZoneInfo("America/Sao_Paulo")

DIAS_HISTORICO = 90

TIMEOUT = 30

FONTE_DADOS = "Fundamentus"

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}


def conectar_supabase():

    if not SUPABASE_URL or not SUPABASE_KEY:

        raise RuntimeError(
            "Credenciais do Supabase não encontradas."
        )

    return create_client(
        SUPABASE_URL,
        SUPABASE_KEY
    )


# ==========================================
# DATAS E VALORES
# ==========================================

def data_atual():

    return datetime.now(TIMEZONE).date()


def converter_valor(valor):

    if pd.isna(valor):
        raise ValueError("Valor de dividendo vazio.")

    if isinstance(valor, str):

        valor = (
            valor
            .replace(".", "")
            .replace(",", ".")
            .strip()
        )

    return Decimal(str(valor)).quantize(
        Decimal("0.01")
    )


# ==========================================
# BUSCAR FUNDOS ATIVOS
# ==========================================

def buscar_fundos(supabase):

    resposta = (
        supabase
        .table("fundos")
        .select("id,ticker,cotacao")
        .eq("ativo", True)
        .execute()
    )

    return resposta.data or []


# ==========================================
# BUSCAR DIVIDENDOS NO FUNDAMENTUS
# ==========================================

def buscar_dividendos(
    ticker,
    data_desde,
    session
):

    url = (
        "https://www.fundamentus.com.br/"
        f"fii_proventos.php?papel={ticker}&tipo=2"
    )

    resposta = session.get(
        url,
        headers=HEADERS,
        timeout=TIMEOUT
    )

    resposta.raise_for_status()

    resposta.encoding = "ISO-8859-1"

    try:

        tabelas = pd.read_html(
            StringIO(resposta.text),
            attrs={"id": "resultado"},
            decimal=",",
            thousands="."
        )

    except ValueError:

        return None

    if not tabelas:

        return None

    tabela = tabelas[0]

    tabela.columns = (
        tabela.columns
        .astype(str)
        .str.strip()
    )

    colunas_obrigatorias = {
        "Última Data Com",
        "Data de Pagamento",
        "Valor"
    }

    faltantes = colunas_obrigatorias.difference(tabela.columns)

    if faltantes:
        print(
            f"{ticker}: colunas ausentes na tabela: "
            f"{', '.join(sorted(faltantes))}"
        )
        return None

    registros = []

    for _, linha in tabela.iterrows():

        data_corte = pd.to_datetime(
            linha["Última Data Com"],
            dayfirst=True,
            errors="coerce"
        )

        data_pagamento = pd.to_datetime(
            linha["Data de Pagamento"],
            dayfirst=True,
            errors="coerce"
        )

        if (
            pd.isna(data_corte)
            or pd.isna(data_pagamento)
        ):
            continue

        if data_pagamento.date() < data_desde:

            continue

        valor = converter_valor(
            linha["Valor"]
        )

        registros.append({

            "ticker": ticker,

            "data_corte":
                data_corte.strftime("%Y-%m-%d"),

            "data_pagamento":
                data_pagamento.strftime("%Y-%m-%d"),

            "valor": float(valor)

        })

    return registros


# ==========================================
# IDENTIFICAR DIVIDENDOS EXISTENTES
# ==========================================

def buscar_existentes(
    supabase,
    fundo_id,
    data_desde
):

    resposta = (
        supabase
        .table("dividendos")
        .select("data_pagamento,valor")
        .eq("fundo_id", fundo_id)
        .gte(
            "data_pagamento",
            data_desde.isoformat()
        )
        .execute()
    )

    existentes = set()

    for item in resposta.data or []:

        chave = (
            item["data_pagamento"],
            converter_valor(item["valor"])
        )

        existentes.add(chave)

    return existentes


# ==========================================
# INSERIR NOVOS DIVIDENDOS
# ==========================================

def inserir_dividendos(
    supabase,
    registros
):

    novos = 0

    for inicio in range(0, len(registros), 500):

        lote = registros[inicio:inicio + 500]

        resposta = (
            supabase
            .table("dividendos")
            .upsert(
                lote,
                on_conflict=(
                    "fundo_id,data_pagamento,valor"
                ),
                ignore_duplicates=True
            )
            .execute()
        )

        novos += len(resposta.data or [])

    return novos


# ==========================================
# ATUALIZAR RESUMO DOS FUNDOS
# ==========================================

def atualizar_resumos(
    supabase,
    fundos
):

    atualizados = 0

    erros = 0

    for fundo in fundos:

        try:

            resposta = (
                supabase
                .table("dividendos")
                .select(
                    "valor,data_pagamento"
                )
                .eq("fundo_id", fundo["id"])
                .order(
                    "data_pagamento",
                    desc=True
                )
                .limit(1)
                .execute()
            )

            if not resposta.data:

                continue

            ultimo = resposta.data[0]

            valor = float(
                ultimo["valor"]
            )

            cotacao = fundo.get("cotacao")

            if cotacao is not None and float(cotacao) > 0:

                dy = (
                    valor / float(cotacao)
                ) * 100

            else:

                dy = None

            (
                supabase
                .table("fundos")
                .update({

                    "ultimo_dividendo": valor,

                    "dy_mensal": dy,

                    "ultima_atualizacao":
                        datetime.now(TIMEZONE).isoformat()

                })
                .eq("id", fundo["id"])
                .execute()
            )

            atualizados += 1

        except Exception as erro:

            erros += 1

            print(
                f"Erro atualizando resumo "
                f"{fundo['ticker']}: {erro}"
            )

    return atualizados, erros


# ==========================================
# REGISTRAR IMPORTAÇÃO
# ==========================================

def iniciar_importacao(supabase):

    resposta = (
        supabase
        .table("importacoes")
        .insert({

            "tipo": "dividendos",

            "arquivo_nome":
                "automacao_fundamentus",

            "status": "processando",

            "created_at":
                datetime.now(TIMEZONE).isoformat()

        })
        .execute()
    )

    if not resposta.data:

        raise RuntimeError(
            "Não foi possível registrar a importação."
        )

    return resposta.data[0]["id"]


def finalizar_importacao(
    supabase,
    importacao_id,
    quantidade,
    processados,
    novos,
    duplicados,
    erros,
    atualizados,
    mensagem
):

    supabase \
        .table("importacoes") \
        .update({

            "status":
                "concluido" if erros == 0 else "erro",

            "quantidade_registros": quantidade,

            "registros_processados": processados,

            "registros_novos": novos,

            "registros_duplicados": duplicados,

            "registros_erro": erros,

            "registros_atualizados": atualizados,

            "registros_sem_alteracao": 0,

            "mensagem": mensagem,

            "finalizado_em":
                datetime.now(TIMEZONE).isoformat()

        }) \
        .eq("id", importacao_id) \
        .execute()


# ==========================================
# PROCESSAMENTO PRINCIPAL
# ==========================================

def main():

    supabase = conectar_supabase()
    session = requests.Session()

    importacao_id = None
    auditoria_finalizada = False

    # Contadores e listas para auditoria
    fundos = []
    registros_novos = []
    fundos_sem_registros = []
    fundos_para_revisar = []

    registros_processados = 0
    duplicados = 0
    erros_tecnicos = 0
    novos = 0
    atualizados = 0

    data_desde = data_atual() - timedelta(days=DIAS_HISTORICO)

    try:
        # A auditoria é aberta antes das consultas principais.
        importacao_id = iniciar_importacao(supabase)

        fundos = buscar_fundos(supabase)

        print()
        print("==============================")
        print("AUTOMAÇÃO DE DIVIDENDOS")
        print("==============================")
        print(f"Fundos ativos: {len(fundos)}")
        print(f"Período inicial: {data_desde}")
        print("==============================")

        for fundo in fundos:

            ticker = fundo["ticker"]

            print()
            print(f"Buscando {ticker}...")

            try:
                dados = buscar_dividendos(
                    ticker,
                    data_desde,
                    session
                )

                # None = não foi possível encontrar a tabela esperada.
                # Não presumimos que o fundo não exista: fica para revisão.
                if dados is None:
                    fundos_para_revisar.append({
                        "ticker": ticker,
                        "motivo": "Fonte sem tabela de dividendos"
                    })
                    print(
                        f"{ticker}: tabela não encontrada; "
                        "registrado para revisão."
                    )
                    time.sleep(0.4)
                    continue

                # [] = a tabela existe, mas não há pagamentos no período.
                if len(dados) == 0:
                    fundos_sem_registros.append(ticker)
                    print(
                        f"{ticker}: tabela encontrada, "
                        "mas sem pagamentos nos últimos 90 dias."
                    )
                    time.sleep(0.4)
                    continue

                existentes = buscar_existentes(
                    supabase,
                    fundo["id"],
                    data_desde
                )

                quantidade_fundo = 0

                for item in dados:

                    registros_processados += 1
                    quantidade_fundo += 1

                    chave = (
                        item["data_pagamento"],
                        converter_valor(item["valor"])
                    )

                    if chave in existentes:
                        duplicados += 1
                        continue

                    # Evita duplicidade também dentro da própria execução.
                    existentes.add(chave)

                    registros_novos.append({
                        "fundo_id": fundo["id"],
                        "data_corte": item["data_corte"],
                        "data_pagamento": item["data_pagamento"],
                        "valor": item["valor"],
                        "fonte_dados": FONTE_DADOS,
                        "ultima_atualizacao":
                            datetime.now(TIMEZONE).isoformat()
                    })

                print(
                    f"Encontrados: {quantidade_fundo} | "
                    f"Novos dividendos acumulados: "
                    f"{len(registros_novos)}"
                )

            except Exception as erro_fundo:
                erros_tecnicos += 1
                print(
                    f"Erro técnico em {ticker}: {erro_fundo}"
                )

            time.sleep(0.4)            

        # A gravação é executada mesmo quando não há registros novos.
        novos = inserir_dividendos(
            supabase,
            registros_novos
        )

        # Protege contra inserção concorrente entre consulta e upsert.
        duplicados += len(registros_novos) - novos

        # Atualiza os indicadores mesmo se todos os dividendos forem duplicados.
        atualizados, erros_resumo = atualizar_resumos(
            supabase,
            fundos
        )

        erros_tecnicos += erros_resumo

        mensagem = (
            f"Fundos consultados: {len(fundos)} | "
            f"Registros processados: {registros_processados} | "
            f"Novos: {novos} | "
            f"Duplicados: {duplicados} | "
            f"Sem pagamentos no período: {len(fundos_sem_registros)} | "
            f"Para revisão: {len(fundos_para_revisar)} | "
            f"Erros técnicos: {erros_tecnicos}"
        )

        if fundos_para_revisar:
            detalhes_revisao = "; ".join(
                f"{item['ticker']}: {item['motivo']}"
                for item in fundos_para_revisar
            )
            mensagem += f" | Revisar: {detalhes_revisao}"

        finalizar_importacao(
            supabase,
            importacao_id,
            registros_processados,
            registros_processados,
            novos,
            duplicados,
            erros_tecnicos,
            atualizados,
            mensagem
        )

        auditoria_finalizada = True

        print()
        print("==============================")
        print("RESUMO DA AUTOMAÇÃO")
        print("==============================")
        print(f"Fundos consultados: {len(fundos)}")
        print(f"Registros processados: {registros_processados}")
        print(f"Novos dividendos: {novos}")
        print(f"Duplicados: {duplicados}")
        print(
            "Sem pagamentos nos últimos 90 dias: "
            f"{len(fundos_sem_registros)}"
        )
        print(
            "Fundos para revisão: "
            f"{len(fundos_para_revisar)}"
        )

        for item in fundos_para_revisar:
            print(
                f"  - {item['ticker']}: {item['motivo']}"
            )

        print(f"Resumos atualizados: {atualizados}")
        print(f"Erros técnicos: {erros_tecnicos}")
        print()
        print(
            "Status da auditoria: "
            + ("CONCLUÍDO" if erros_tecnicos == 0
               else "CONCLUÍDO COM ERROS TÉCNICOS")
        )
        print("Importação registrada no Supabase.")

        # Pendências cadastrais/de fonte não derrubam o workflow.
        # Erros técnicos reais mantêm exit code diferente de zero.
        if erros_tecnicos:
            raise RuntimeError(
                "Automação concluída parcialmente, "
                f"com {erros_tecnicos} erro(s) técnico(s)."
            )

    except Exception as erro_geral:

        print(f"Falha geral na automação: {erro_geral}")

        if not auditoria_finalizada:
            registrar_falha_geral(
                supabase,
                importacao_id,
                erro_geral
            )

        raise

    finally:
        session.close()


if __name__ == "__main__":

    main()
