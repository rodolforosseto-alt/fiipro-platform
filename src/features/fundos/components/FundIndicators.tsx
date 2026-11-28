import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/finance/MetricCard";
import { formatDateBR, formatDecimal, formatPercent } from "@/lib/format";
import { Fundo } from "../types/fundo";

const COMPOSITION_LABELS: Record<string, string> = {
  real_estate_leased_pct: "Imóveis locados",
  real_estate_under_construction_pct: "Imóveis em construção",
  real_estate_for_sale_pct: "Imóveis para venda",
  land_pct: "Terrenos",
  other_real_estate_pct: "Outros imóveis",
  cri_pct: "CRI",
  lci_pct: "LCI",
  cepac_pct: "CEPAC",
  debentures_pct: "Debêntures",
  fii_holdings_pct: "Cotas de FIIs",
  fip_fdic_pct: "FIP/FIDC",
  stocks_pct: "Ações",
  cash_pct: "Caixa",
  other_pct: "Outros",
};

interface Props {
  fundo: Fundo;
}

export function FundIndicators({ fundo }: Props) {
  const hasIndicators =
    fundo.pvp != null || fundo.valor_patrimonial_cota != null || fundo.composicao_ativos != null;

  // Sem dados da API (fundo ainda não atualizado ou sem cobertura): não mostra a seção.
  if (!hasIndicators) return null;

  const referencia = formatDateBR(fundo.indicadores_referencia);

  const composition = Object.entries(fundo.composicao_ativos ?? {})
    .map(([key, value]) => ({ key, label: COMPOSITION_LABELS[key] ?? key, value: Number(value) }))
    .filter((item) => Number.isFinite(item.value) && item.value > 0)
    .sort((a, b) => b.value - a.value);

  const hasProperties =
    fundo.vacancia_pct != null ||
    fundo.inadimplencia_pct != null ||
    fundo.percentual_locado != null ||
    fundo.imoveis_qtd != null;

  return (
    <section className="mt-10">
      <h2 className="mb-5 text-2xl font-bold">Indicadores</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="P/VP"
          value={formatDecimal(fundo.pvp)}
          description="Cotação dividida pelo valor patrimonial por cota"
        />

        <MetricCard
          title="Valor patrimonial por cota"
          value={fundo.valor_patrimonial_cota != null ? `R$ ${formatDecimal(fundo.valor_patrimonial_cota)}` : "--"}
          description={`Informe mensal de referência: ${referencia}`}
        />

        <MetricCard
          title="DY 12 meses"
          value={formatPercent(fundo.dy_12m)}
          description="Dividendos pagos nos últimos 12 meses"
        />
      </div>

      {hasProperties && (
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <MetricCard title="Vacância" value={formatPercent(fundo.vacancia_pct)} />
          <MetricCard title="Inadimplência" value={formatPercent(fundo.inadimplencia_pct)} />
          <MetricCard title="Percentual locado" value={formatPercent(fundo.percentual_locado)} />
          <MetricCard
            title="Imóveis"
            value={fundo.imoveis_qtd != null ? String(fundo.imoveis_qtd) : "--"}
          />
        </div>
      )}

      {composition.length > 0 && (
        <div className="mt-4">
          <Card>
            <p className="mb-4 font-semibold">Composição da carteira</p>

            <div className="space-y-3">
              {composition.map((item) => (
                <div key={item.key}>
                  <div className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="font-semibold">{formatPercent(item.value)}</span>
                  </div>

                  <div className="mt-1 h-2 w-full rounded bg-gray-100">
                    <div
                      className="h-2 rounded bg-brand"
                      style={{ width: `${Math.min(100, item.value)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Fonte: informe mensal enviado à CVM (referência {referencia}). Os dados podem ter defasagem de semanas.
            </p>
          </Card>
        </div>
      )}
    </section>
  );
}
