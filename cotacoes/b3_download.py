import argparse
import zipfile
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

TIMEZONE = ZoneInfo("America/Sao_Paulo")
BASE_URL = "https://bvmf.bmfbovespa.com.br/InstDados/SerHist"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "output"
MAX_DIAS_BUSCA = 10
TIMEOUT = 45


def baixar_ultimo_pregao(data_inicial=None):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if data_inicial is None:
        # Nunca tenta a cotação do próprio dia: começa em ontem.
        data_inicial = datetime.now(TIMEZONE).date() - timedelta(days=1)

    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (compatible; FIIPro/1.0)",
        "Accept": "application/zip,application/octet-stream,*/*",
    })

    tentativas = []

    try:
        for deslocamento in range(MAX_DIAS_BUSCA):
            data = data_inicial - timedelta(days=deslocamento)
            nome = f"COTAHIST_D{data:%d%m%Y}.ZIP"
            url = f"{BASE_URL}/{nome}"

            print(f"Verificando pregão de {data:%d/%m/%Y}...")

            try:
                resposta = session.get(url, timeout=TIMEOUT)
            except requests.RequestException as erro:
                tentativas.append(f"{data}: erro de conexão: {erro}")
                print(f"  Falha de conexão: {erro}")
                continue

            if resposta.status_code != 200:
                tentativas.append(f"{data}: HTTP {resposta.status_code}")
                print(f"  Não disponível (HTTP {resposta.status_code}).")
                continue

            # Rejeita páginas HTML de erro/bloqueio que retornem HTTP 200.
            if not resposta.content.startswith(b"PK"):
                tentativas.append(f"{data}: resposta não é ZIP")
                print("  Resposta não parece ser um ZIP.")
                continue

            caminho_zip = OUTPUT_DIR / nome
            caminho_zip.write_bytes(resposta.content)

            try:
                with zipfile.ZipFile(caminho_zip, "r") as arquivo_zip:
                    problema = arquivo_zip.testzip()
                    if problema:
                        raise zipfile.BadZipFile(f"CRC inválido: {problema}")

                    membros_txt = [
                        membro for membro in arquivo_zip.namelist()
                        if membro.lower().endswith(".txt")
                    ]
                    if not membros_txt:
                        raise zipfile.BadZipFile("ZIP sem arquivo TXT.")

                    membro_txt = membros_txt[0]
                    caminho_txt = OUTPUT_DIR / Path(membro_txt).name
                    with arquivo_zip.open(membro_txt) as origem:
                        caminho_txt.write_bytes(origem.read())

            except (zipfile.BadZipFile, OSError) as erro:
                caminho_zip.unlink(missing_ok=True)
                tentativas.append(f"{data}: ZIP inválido: {erro}")
                print(f"  Arquivo rejeitado: {erro}")
                continue

            print("\n==============================")
            print("DOWNLOAD B3 CONCLUÍDO")
            print("==============================")
            print(f"Data do pregão: {data:%Y-%m-%d}")
            print(f"ZIP: {caminho_zip}")
            print(f"Tamanho ZIP: {caminho_zip.stat().st_size:,} bytes")
            print(f"TXT extraído: {caminho_txt}")
            print(f"Tamanho TXT: {caminho_txt.stat().st_size:,} bytes")

            return caminho_txt

    finally:
        session.close()

    print("\nNenhum arquivo diário válido encontrado.")
    for tentativa in tentativas:
        print(f"- {tentativa}")

    raise RuntimeError(
        f"Nenhum ZIP diário válido encontrado nos últimos "
        f"{MAX_DIAS_BUSCA} dias consultados."
    )


def main():
    parser = argparse.ArgumentParser(
        description="Baixa o último COTAHIST diário disponível na B3."
    )
    parser.add_argument(
        "--desde",
        help="Data inicial AAAA-MM-DD para teste; a busca recua a partir dela."
    )
    args = parser.parse_args()

    data_inicial = (
        datetime.strptime(args.desde, "%Y-%m-%d").date()
        if args.desde
        else None
    )

    baixar_ultimo_pregao(data_inicial)


if __name__ == "__main__":
    main()
