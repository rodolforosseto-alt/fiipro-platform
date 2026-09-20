export interface Fundo {

  id:string;

  ticker:string;

  nome:string;

  segmento:string;

  gestor:string;

  descricao:string | null;

  patrimonio:number | null;

  numero_cotistas:number | null;

  imagem_logo:string | null;

  cotacao:number;

  ultimo_dividendo:number;

  dy_mensal:number;

  ultima_atualizacao:string | null;

  fonte_dados:string | null;

}