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

  // Indicadores (migration 202611270001); opcionais até a primeira execução da rota de indicadores.
  dy_12m?:number | null;

  pvp?:number | null;

  valor_patrimonial_cota?:number | null;

  cotas_emitidas?:number | null;

  tipo_fundo?:string | null;

  tipo_gestao?:string | null;

  administrador?:string | null;

  mandato?:string | null;

  data_inicio?:string | null;

  composicao_ativos?:Record<string, number | null> | null;

  vacancia_pct?:number | null;

  inadimplencia_pct?:number | null;

  percentual_locado?:number | null;

  imoveis_qtd?:number | null;

  area_total_m2?:number | null;

  indicadores_referencia?:string | null;

  indicadores_atualizados_em?:string | null;

}