export type SourceRef={book:"core-v5"|"chicago-by-night-v5";chapter:string;query:string;label:string};
export type PowerRule={id:string;name:string;discipline:string;level:number;cost:string;duration:string;pool?:string;amalgam?:string;source:SourceRef};
export type PredatorRule={id:string;name:string;specialtyChoices:string[];disciplineChoices:string[];humanity:number;bloodPotency:number;notes:string[];source:SourceRef};

const chicagoLasombra:SourceRef={book:"chicago-by-night-v5",chapter:"capitulos-chapter-six-lasombra",query:"Oblivion",label:"Chicago by Night, livro pp. 293–297"};
export const OBLIVION_POWERS:PowerRule[]=[
  {id:"shadow-cloak",name:"Shadow Cloak",discipline:"Oblívio",level:1,cost:"Gratuito",duration:"Passivo",source:chicagoLasombra},
  {id:"oblivions-sight",name:"Oblivion’s Sight",discipline:"Oblívio",level:1,cost:"Gratuito",duration:"Uma cena",source:chicagoLasombra},
  {id:"shadow-cast",name:"Shadow Cast",discipline:"Oblívio",level:2,cost:"Um Teste de Despertar",duration:"Uma cena",source:chicagoLasombra},
  {id:"arms-of-ahriman",name:"Arms of Ahriman",discipline:"Oblívio",level:2,cost:"Um Teste de Despertar",duration:"Uma cena ou até terminar/ser destruído",pool:"Raciocínio + Oblívio",amalgam:"Potência 2",source:chicagoLasombra},
  {id:"shadow-perspective",name:"Shadow Perspective",discipline:"Oblívio",level:3,cost:"Um Teste de Despertar",duration:"Até uma cena",source:chicagoLasombra},
  {id:"touch-of-oblivion",name:"Touch of Oblivion",discipline:"Oblívio",level:3,cost:"Um Teste de Despertar",duration:"Um turno",source:chicagoLasombra},
  {id:"stygian-shroud",name:"Stygian Shroud",discipline:"Oblívio",level:4,cost:"Um Teste de Despertar",duration:"Uma cena",source:chicagoLasombra},
  {id:"shadow-step",name:"Shadow Step",discipline:"Oblívio",level:5,cost:"Um Teste de Despertar",duration:"Um turno",source:chicagoLasombra},
  {id:"tenebrous-avatar",name:"Tenebrous Avatar",discipline:"Oblívio",level:5,cost:"Dois Testes de Despertar",duration:"Uma cena ou até terminar",source:chicagoLasombra},
];

const predatorSource=(query:string):SourceRef=>({book:"core-v5",chapter:"regras-e-criacao-tipos-de-predador",query,label:"Livro Básico V5, pp. 175–178"});
export const PREDATOR_RULES:PredatorRule[]=[
  {id:"consensualista",name:"Consensualista",specialtyChoices:["Medicina","Persuasão"],disciplineChoices:["Auspícios","Fortitude"],humanity:1,bloodPotency:0,notes:["Defeitos ligados à Máscara e à exclusão de presas sem consentimento devem ser escolhidos."],source:predatorSource("Consensualista")},
  {id:"fazendeiro",name:"Fazendeiro",specialtyChoices:["Empatia com Animais","Sobrevivência"],disciplineChoices:["Animalismo","Proteanismo"],humanity:1,bloodPotency:0,notes:["Recebe o Defeito de alimentação Fazendeiro; há restrições para Ventrue e Potência de Sangue elevada."],source:predatorSource("Fazendeiro")},
  {id:"osiris",name:"Osíris",specialtyChoices:["Ocultismo","Performance"],disciplineChoices:["Feitiçaria de Sangue","Presença"],humanity:0,bloodPotency:0,notes:["Fama/Rebanho e Defeitos dependem das escolhas do personagem."],source:predatorSource("Osíris")},
  {id:"sacoleiro",name:"Sacoleiro",specialtyChoices:["Ladroagem","Manha"],disciplineChoices:["Feitiçaria de Sangue","Ofuscação"],humanity:0,bloodPotency:0,notes:["Concede Esôfago de Ferro e um Inimigo; os pontos devem ser confirmados no livro."],source:predatorSource("Sacoleiro")},
  {id:"sandman",name:"Sandman",specialtyChoices:["Medicina","Furtividade"],disciplineChoices:["Auspícios","Ofuscação"],humanity:0,bloodPotency:0,notes:["Concede Recursos; a quantidade deve ser confirmada no livro."],source:predatorSource("Sandman")},
  {id:"sanguessuga",name:"Sanguessuga",specialtyChoices:["Briga","Furtividade"],disciplineChoices:["Celeridade","Proteanismo"],humanity:-1,bloodPotency:1,notes:["Segredo Sombrio/segregação e Exclusão de Presa exigem escolha."],source:predatorSource("Sanguessuga")},
  {id:"scene-queen",name:"Scene Queen",specialtyChoices:["Etiqueta","Liderança","Manha"],disciplineChoices:["Dominação","Potência"],humanity:0,bloodPotency:0,notes:["Fama, Contatos e Defeito são ligados à subcultura escolhida."],source:predatorSource("Scene Queen")},
  {id:"sereia",name:"Sereia",specialtyChoices:["Persuasão","Subterfúgio"],disciplineChoices:["Fortitude","Presença"],humanity:0,bloodPotency:0,notes:["Concede Belo e um Inimigo ligado a amante/parceiro."],source:predatorSource("Sereia")},
  {id:"trinchador",name:"Trinchador",specialtyChoices:["Persuasão","Subterfúgio"],disciplineChoices:["Dominação","Animalismo"],humanity:0,bloodPotency:0,notes:["Família no Mapa de Relacionamentos, Segredo Sombrio e Rebanho exigem registro."],source:predatorSource("Trinchador")},
  {id:"vira-lata",name:"Vira-lata",specialtyChoices:["Intimidação","Briga"],disciplineChoices:["Celeridade","Potência"],humanity:-1,bloodPotency:0,notes:["Concede Contatos criminosos; a quantidade deve ser confirmada no livro."],source:predatorSource("Vira-lata")},
];

export const SKILL_PRESETS:Record<string,Record<number,number>>={
  "Pau pra toda obra":{3:1,2:8,1:10},"Equilibrado":{3:3,2:5,1:7},"Especialista":{4:1,3:3,2:3,1:3},
};
export const AGE_RULES:Record<string,{generations:string[];bloodPotency:number;note:string}>={
  "Criança da Noite":{generations:["12ª","13ª"],bloodPotency:1,note:"Sangues-Ralos podem estar entre 14ª e 16ª Geração, com Potência de Sangue 0."},
  "Neófito":{generations:["12ª","13ª"],bloodPotency:1,note:"Faixa padrão resumida do Livro Básico."},
  "Ancilla":{generations:["10ª","11ª"],bloodPotency:2,note:"Faixa padrão resumida do Livro Básico."},
};

export function rulesUrl(source:SourceRef){return `/rules?book=${source.book}&chapter=${source.chapter}&q=${encodeURIComponent(source.query)}`}
