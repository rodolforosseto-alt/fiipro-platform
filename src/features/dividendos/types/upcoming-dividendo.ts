export interface UpcomingDividendo {

id: string;

data_pagamento: string;

valor: number;

fundos?: {
  ticker:string;
  nome:string;
};

}