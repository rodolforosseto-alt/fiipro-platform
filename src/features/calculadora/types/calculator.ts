export interface CalculatorInput {
  quantidade: number;
  cotacao: number;
  dividendo: number;
}

export interface CalculatorResult {
  valorPosicaoAtual: number;
  rendaMensal: number;
  cotasEquivalentes: number;
  novasCotasInteiras: number;
  saldoRestante: number;
  cotasParaUmaNovaCota: number;
}