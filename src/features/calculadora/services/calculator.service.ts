import {
  CalculatorInput,
  CalculatorResult,
} from "../types/calculator";


export function calculateSnowball(
  input: CalculatorInput
): CalculatorResult {

  const {
    quantidade,
    cotacao,
    dividendo,
  } = input;


  const valorPosicaoAtual =
    quantidade * cotacao;


  const rendaMensal =
    quantidade * dividendo;


  const cotasEquivalentes =
    cotacao > 0
      ? rendaMensal / cotacao
      : 0;


  const novasCotasInteiras =
    Math.floor(cotasEquivalentes);


  const saldoRestante =
    rendaMensal -
    novasCotasInteiras * cotacao;


  const cotasParaUmaNovaCota =
    dividendo > 0
      ? Math.ceil(cotacao / dividendo)
      : 0;


  return {
    valorPosicaoAtual,
    rendaMensal,
    cotasEquivalentes,
    novasCotasInteiras,
    saldoRestante,
    cotasParaUmaNovaCota,
  };
}