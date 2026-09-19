"use client";


import { useState } from "react";

import { calculateSnowball } from "../services/calculator.service";

import { CalculatorResult } from "../types/calculator";

import { SnowballResult } from "./SnowballResult";


interface Props {
  ticker: string;
  cotacao: number;
  dividendo: number;
}


export function CalculatorForm({
  ticker,
  cotacao,
  dividendo,
}: Props) {

  const [quantidade, setQuantidade] =
    useState(100);


  const [result, setResult] =
    useState<CalculatorResult | null>(null);


  function handleCalculate() {

    const calculation =
      calculateSnowball({
        quantidade,
        cotacao,
        dividendo,
      });


    setResult(calculation);
  }


  return (

    <div>


      <div className="rounded-xl border bg-white p-6">


        <h2 className="text-xl font-bold">
          {ticker}
        </h2>


        <div className="mt-6 grid gap-4 md:grid-cols-2">


          <div>

            <p className="text-sm text-gray-500">
              Cotação atual
            </p>

            <strong>
              R$ {cotacao.toFixed(2)}
            </strong>

          </div>


          <div>

            <p className="text-sm text-gray-500">
              Último dividendo
            </p>

            <strong className="text-green-600">
              R$ {dividendo.toFixed(2)}
            </strong>

          </div>


        </div>


        <div className="mt-6">

          <label
            htmlFor="quantidade"
            className="mb-2 block font-medium"
          >
            Quantidade de cotas
          </label>


          <input
            id="quantidade"
            type="number"
            min="0"
            value={quantidade}
            onChange={(event) =>
              setQuantidade(
                Number(event.target.value)
              )
            }
            className="w-full rounded-lg border p-3"
          />

        </div>


        <button
          onClick={handleCalculate}
          className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white"
        >
          Calcular minha bola de neve
        </button>


      </div>


      {result && (
        <SnowballResult result={result}/>
      )}


    </div>

  );
}