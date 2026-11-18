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

# Localmente, carrega o .env na raiz do projeto.
# No GitHub Actions, as credenciais vêm dos GitHub Secrets.
load_dotenv(BASE_DIR.parent / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

TIMEZONE = ZoneInfo("America/Sao_Paulo")

DIAS_HISTORICO = 90
TIMEOUT = 30
INTERVALO_ENTRE_FUNDOS = 0.4
TAMANHO_LOTE = 500

FONTE_DADOS = "Fundamentus"

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}


class PaginaFundamentusSemTabela(Exception):
    """A página não apresentou a tabela de proventos esperada."""


# ==========================================
# CONEXÃO E UTILITÁRIOS
# ==========================================

def agora():
    return datetime.now(TIMEZONE)


def conectar_supabase():

    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError(
            "Credenciais do Supabase não encontradas. "
            "Verifique SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
        )

    return create_client(SUPABASE_URL, SUPABASE_KEY)


def converter_valor(valor):

    if pd.isna(valor):
        raise ValueError("Valor de dividendo vazio.")

    if isinstance(valor, str):
        valor = (
            valor.replace(".", "")
            .replace(",", ".")
            .strip()
        )

    return Decimal(str(valor)).quantize(Decimal("0.01"))


# ==========================================
# AUDITORIA
# ==========================================

def iniciar_importacao(supabase):

    resposta = (
        supabase
        .table("importacoes")
        .insert({
            "tipo": "dividendos",
            "arquivo_nome": "automacao_fundamentus",
            "status": "processando",
            "created_at": agora().isoformat()
        })
        .execute()
    )

    if not resposta.data:
        raise RuntimeError(
            "Não foi possível registrar o início da importação."
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

    status = "concluido" if erros == 0 else "erro"

    (
        supabase
        .table("importacoes")
        .update({
            "status": status,
            "quantidade_registros": quantidade,
            "registros_processados": processados,
            "registros_novos": novos,
            "registros_duplicados": duplicados,
            "registros_erro": erros,
            "registros_atualizados": atualizados,
            "registros_sem_alteracao": 0,
            "mensagem": mensagem,
            "finalizado_em": agora().isoformat()
        })
        .eq("id", importacao_id)
        .execute()
    )


def registrar_falha_geral(supabase, importacao_id, erro):

    if not importacao_id:
        return

    try:
        (
            supabase
            .table("importacoes")
            .update({
                "status": "erro",
                "mensagem": f"Falha geral: {str(erro)[:1500]}",
                "finalizado_em": agora().isoformat()
            })
            .eq("id", importacao_id)
            .execute()
        )
    except Exception as erro_auditoria:
        print(
            "ATENÇÃO: não foi possível atualizar a auditoria: "
            f"{erro_auditoria}"
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
        .order("ticker")
        .execute()
    )

    return resposta.data or []


# ==========================================
# BUSCAR DIVIDENDOS NO FUNDAMENTUS
# ==========================================

def buscar_dividendos(ticker, data_desde, session):

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
    except ValueError as erro:
        raise PaginaFundamentusSemTabela(
            f"Fundamentus não apresentou a tabela esperada para {ticker}."
        ) from erro

    if not tabelas:
        raise PaginaFundamentusSemTabela(
            f"Nenhuma tabela retornada pelo Fundamentus para {ticker}."
        )

    tabela = tabelas[0]
    tabela.columns = tabela.columns.astype(str).str.strip()

    colunas_obrigatorias = {
        "Última Data Com",
        "Data de Pagamento",
        "Valor"
    }

    faltantes = colunas_obrigatorias.difference(tabela.columns)

    if faltantes:
        raise PaginaFundamentusSemTabela(
            f"Estrutura inesperada para {ticker}. "
            f"Colunas ausentes: {', '.join(sorted(faltantes))}"
        )

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

        if pd.isna(data_corte) or pd.isna(data_pagamento):
            continue

        if data_pagamento.date() < data_desde:
            continue

        valor = converter_valor(linha["Valor"])

        if valor <= 0:
            continue

        registros.append({
            "ticker": ticker,
            "data_corte": data_corte.strftime("%Y-%m-%d"),
            "data_pagamento": data_pagamento.strftime("%Y-%m-%d"),
            "valor": float(valor)
        })

    return registros


# ==========================================
# IDENTIFICAR DIVIDENDOS EXISTENTES
# ==========================================

def buscar_existentes(supabase, fundo_id, data_desde):

    resposta = (
        supabase
        .table("dividendos")
        .select("data_pagamento,valor")
        .eq("fundo_id", fundo_id)
        .gte("data_pagamento", data_desde.isoformat())
        .execute()
    )

    existentes = set()

    for item in resposta.data or []:
        existentes.add((
            item["data_pagamento"],
            converter_valor(item["valor"])
        ))

    return existentes


# ==========================================
# INSERIR NOVOS DIVIDENDOS
# ==========================================

def inserir_dividendos(supabase, registros):

    novos = 0

    for inicio in range(0, len(registros), TAMANHO_LOTE):

        lote = registros[inicio:inicio + TAMANHO_LOTE]

        resposta = (
            supabase
            .table("dividendos")
            .upsert(
                lote,
                on_conflict="fundo_id,data_pagamento,valor",
                ignore_duplicates=True
            )
            .select("id")
            .execute()
        )

        novos += len(resposta.data or [])

    return novos


# ==========================================
# ATUALIZAR RESUMO DOS FUNDOS
# ==========================================

def atualizar_resumos(supabase, fundos):

    atualizados = 0
    erros = 0

    for fundo in fundos:

        try:
            resposta = (
                supabase
                .table("dividendos")
                .select("valor,data_pagamento")
                .eq("fundo_id", fundo["id"])
                .order("data_pagamento", desc=True)
                .limit(1)
                .execute()
            )

            if not resposta.data:
                continue

            ultimo = resposta.data[0]
            valor = float(ultimo["valor"])
            cotacao = fundo.get("cotacao")

            if cotacao is not None and float(cotacao) > 0:
                dy = (valor / float(cotacao)) * 100
            else:
                dy = None

            (
                supabase
                .table("fundos")
                .update({
                    "ultimo_dividendo": valor,
                    "dy_mensal": dy,
                    "ultima_atualizacao": agora().isoformat()
                })
                .eq("id", fundo["id"])
                .execute()
            )

            atualizados += 1

        except Exception as erro:
            erros += 1
            print(
                f"Erro atualizando resumo de {fundo['ticker']}: {erro}"
            )

    return atualizados, erros


# ==========================================
# PROCESSAMENTO PRINCIPAL
# ==========================================

def main():

    supabase = conectar_supabase()
    session = requests.Session()

    importacao_id = None
    auditoria_finalizada = False

    try:
        # Cria a auditoria antes de iniciar as consultas de negócio.
        importacao_id = iniciar_importacao(supabase)

        fundos = buscar_fundos(supabase)

        data_desde = (
            agora().date() - timedelta(days=DIAS_HISTORICO)
        )

        registros_novos = []
        fundos_sem_registros = []
        fundos_com_erro_fonte = []

        registros_processados = 0
        duplicados = 0
        erros = 0

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

                if not dados:
                    print("Nenhum pagamento no período.")
                    fundos_sem_registros.append(ticker)
                    time.sleep(INTERVALO_ENTRE_FUNDOS)
                    continue

                existentes = buscar_existentes(
                    supabase,
                    fundo["id"],
                    data_desde
                )

                for item in dados:

                    registros_processados += 1

                    chave = (
                        item["data_pagamento"],
                        converter_valor(item["valor"])
                    )

                    if chave in existentes:
                        duplicados += 1
                        continue

                    existentes.add(chave)

                    registros_novos.append({
                        "fundo_id": fundo["id"],
                        "data_corte": item["data_corte"],
                        "data_pagamento": item["data_pagamento"],
                        "valor": item["valor"],
                        "fonte_dados": FONTE_DADOS,
                        "ultima_atualizacao": agora().isoformat()
                    })

                print(
                    f"Encontrados: {len(dados)} | "
                    f"Novos candidatos acumulados: {len(registros_novos)}"
                )

            except PaginaFundamentusSemTabela as erro_fonte:
                erros += 1
                fundos_com_erro_fonte.append(ticker)
                print(f"Falha de leitura da fonte: {erro_fonte}")

            except Exception as erro_fundo:
                erros += 1
                print(f"Erro em {ticker}: {erro_fundo}")

            time.sleep(INTERVALO_ENTRE_FUNDOS)

        # Executa mesmo quando a lista de novos registros está vazia.
        novos = inserir_dividendos(supabase, registros_novos)

        # Se outra execução inseriu um registro entre a consulta e o upsert,
        # o índice único do banco o protege e ele entra como duplicado.
        duplicados += len(registros_novos) - novos

        atualizados, erros_resumo = atualizar_resumos(
            supabase,
            fundos
        )

        erros += erros_resumo

        mensagem = (
            f"Fundos consultados: {len(fundos)} | "
            f"Novos: {novos} | "
            f"Duplicados: {duplicados} | "
            f"Sem registros no período: {len(fundos_sem_registros)} | "
            f"Falhas de leitura da fonte: {len(fundos_com_erro_fonte)} | "
            f"Erros: {erros}"
        )

        finalizar_importacao(
            supabase=supabase,
            importacao_id=importacao_id,
            quantidade=registros_processados,
            processados=registros_processados,
            novos=novos,
            duplicados=duplicados,
            erros=erros,
            atualizados=atualizados,
            mensagem=mensagem
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
        print(f"Sem registros no período: {len(fundos_sem_registros)}")
        print(f"Falhas de leitura da fonte: {len(fundos_com_erro_fonte)}")
        print(f"Resumos atualizados: {atualizados}")
        print(f"Erros totais: {erros}")
        print()
        print("Importação registrada no Supabase.")

        if erros:
            raise RuntimeError(
                f"Automação concluída parcialmente, com {erros} erro(s)."
            )

    except Exception as erro_geral:

        print(f"Falha na automação: {erro_geral}")

        # Se a auditoria já foi finalizada como erro parcial, preserva
        # a mensagem detalhada em vez de sobrescrevê-la.
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
