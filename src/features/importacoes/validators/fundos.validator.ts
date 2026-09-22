export function validarFundosCSV(
dados:any[]
){

if(dados.length === 0){

return {

ok:false,

mensagem:"Arquivo vazio."

};

}


const camposObrigatorios = [

"ticker",

"nome",

"segmento"

];


for(const campo of camposObrigatorios){

if(!dados[0]?.[campo]){

return {

ok:false,

mensagem:
`Campo obrigatório ausente: ${campo}`

};

}

}


return {

ok:true,

mensagem:"CSV de fundos válido"

};

}