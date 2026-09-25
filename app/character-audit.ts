import { AGE_RULES, DEFAULT_CHRONICLE_RULES, POWER_CATALOG, PREDATOR_RULES, SKILL_PRESETS, rulesUrl, type ChronicleRules, type SourceRef } from "./game-rules";
import { ownItemDots } from "./predator-benefits";
import { purchasedLevels, xpBudget, xpSpent, type XpPurchase } from "./experience";

export type AuditIssue={id:string;kind:"warning"|"info"|"approved";title:string;detail:string;source?:SourceRef};
type Merit={dots?:number};
type AuditData={
  attributes?:Record<string,number>;skills?:Record<string,number>;skillPreset?:string;disciplines?:Record<string,number>;disciplinePowers?:Record<string,string[]>;
  merits?:Merit[];flawItems?:Merit[];ageCategory?:string;generation?:string;bloodPotency?:number;predator?:string;predatorApplied?:string;
  predatorDiscipline?:string;convictions?:string;touchstones?:string;allowHomebrew?:boolean;
  predatorResolutions?:Record<string,string>;chronicleRules?:ChronicleRules;
  xpTotal?:string;xpSpent?:string;xpPurchases?:XpPurchase[];
};
export type AuditableCharacter={name?:string;concept?:string;clan?:string;data:AuditData};

const core=(chapter:string,query:string,label:string):SourceRef=>({book:"core-v5",chapter,query,label});
const creation=core("regras-e-criacao-criacao-de-personagem","Validações mínimas do builder","Livro Básico V5, criação de personagem");
const disciplines=core("regras-e-criacao-disciplinas","pré-requisitos","Livro Básico V5, Disciplinas");

function lines(value?:string){return (value||"").split("\n").map(item=>item.trim()).filter(Boolean)}
function counts(values:Record<string,number>={},positiveOnly=false){return Object.values(values).reduce<Record<number,number>>((result,value)=>{if(!positiveOnly||value>0)result[value]=(result[value]||0)+1;return result},{})}

export function auditCharacter(character:AuditableCharacter):AuditIssue[]{
  const data=character.data||{},issues:AuditIssue[]=[];
  const chronicle={...DEFAULT_CHRONICLE_RULES,...(data.chronicleRules||{})};
  const add=(issue:AuditIssue)=>issues.push(chronicle.approvedIssueIds.includes(issue.id)?{...issue,kind:"approved",detail:`Permitido pela crônica. ${issue.detail}`}:issue);
  if(!character.name?.trim())add({id:"identity-name",kind:"warning",title:"Nome não preenchido",detail:"A criação padrão precisa identificar o personagem. Você pode salvar e continuar mesmo assim.",source:creation});
  if(!character.concept?.trim())add({id:"identity-concept",kind:"warning",title:"Conceito não preenchido",detail:"O conceito orienta as escolhas da criação, mas pode ser definido depois.",source:creation});
  if(!character.clan?.trim())add({id:"identity-clan",kind:"warning",title:"Clã ou linhagem não definido",detail:"A escolha determina as Disciplinas iniciais e outras regras. Conteúdo personalizado continua permitido.",source:creation});

  const paidPurchases=data.xpPurchases||[];
  const alchemy="Alquimia do Sangue-Fraco";
  const freeFormulaNames=character.clan==="Sangue-Ralo"?(data.disciplinePowers?.[alchemy]||[]).filter(name=>POWER_CATALOG.some(power=>power.name===name&&power.discipline===alchemy&&power.kind==="formula")&&!paidPurchases.some(item=>item.kind==="formula"&&item.name===name)).slice(0,data.disciplines?.[alchemy]||0):[];
  const purchases:XpPurchase[]=[...paidPurchases,...freeFormulaNames.map(name=>({kind:"formula" as const,name,from:0,to:0,cost:0}))];
  const attributeCounts=counts(purchasedLevels(data.attributes||{},purchases,"attribute"));
  if(!(attributeCounts[4]===1&&attributeCounts[3]===3&&attributeCounts[2]===4&&attributeCounts[1]===1))add({id:"attributes",kind:"warning",title:"Distribuição de Atributos fora do padrão",detail:"O padrão inicial é 1 Atributo em 4, 3 em 3, 4 em 2 e 1 em 1. A ficha não será alterada automaticamente.",source:core("regras-e-criacao-atributos-habilidades-e-especializacoes","Distribuição inicial","Livro Básico V5, pp. 152–171")});

  const skillTarget=SKILL_PRESETS[data.skillPreset||""],skillCounts=counts(purchasedLevels(data.skills||{},purchases,"skill"),true);
  if(skillTarget&&(!Object.entries(skillTarget).every(([level,total])=>(skillCounts[Number(level)]||0)===total)||Object.values(skillCounts).reduce((a,b)=>a+b,0)!==Object.values(skillTarget).reduce((a,b)=>a+b,0)))add({id:"skills",kind:"warning",title:`Habilidades não correspondem a ${data.skillPreset}`,detail:`O preset escolhido espera ${Object.entries(skillTarget).sort((a,b)=>Number(b[0])-Number(a[0])).map(([level,total])=>`${total} em ${level}`).join(", ")}.`,source:core("regras-e-criacao-atributos-habilidades-e-especializacoes","Distribuições rápidas de Habilidades","Livro Básico V5, pp. 152–171")});

  const predator=PREDATOR_RULES.find(rule=>rule.name===data.predator),applied=PREDATOR_RULES.find(rule=>rule.name===data.predatorApplied);
  const age=AGE_RULES[data.ageCategory||""];
  if(!chronicle.generationOverride&&age&&character.clan!=="Sangue-Ralo"&&(!age.generations.includes(data.generation||"")||(data.bloodPotency||0)-purchases.filter(item=>item.kind==="blood-potency").length!==age.bloodPotency+(applied?.bloodPotency||0)))add({id:"age",kind:"warning",title:"Geração ou Potência de Sangue fora da faixa inicial",detail:`${data.ageCategory} usa ${age.generations.join(" ou ")} Geração e Potência de Sangue ${age.bloodPotency}${applied?.bloodPotency?` + ${applied.bloodPotency} do Predador`:""}. Compras posteriores com XP são tratadas separadamente.`,source:core("regras-e-criacao-sangue-fome-geracao-e-potencia-de-sangue","Geração","Livro Básico V5, pp. 201–242")});
  if(predator&&data.predatorApplied!==predator.name)add({id:"predator",kind:"warning",title:"Pacote de Predador ainda não aplicado",detail:"O tipo foi escolhido, mas a especialização, a Disciplina e as alterações diretas ainda não foram confirmadas.",source:predator.source});
  if(predator&&data.predatorApplied===predator.name){for(const resolution of predator.resolutions){if(resolution.required&&!data.predatorResolutions?.[resolution.id])add({id:`predator-resolution-${predator.id}-${resolution.id}`,kind:"warning",title:`Escolha pendente do Predador: ${resolution.label}`,detail:resolution.description,source:predator.source})}}
  if(data.predatorDiscipline==="Feitiçaria de Sangue"&&!(["Tremere","Banu Haqim"].includes(character.clan||"")&&["Sacoleiro","Osíris"].includes(data.predator||"")))add({id:"blood-sorcery-predator",kind:"warning",title:"Confira Feitiçaria de Sangue neste Predador",detail:"O Player’s Guide confirma esta opção para Banu Haqim nos tipos Sacoleiro e Osíris, além do acesso Tremere. Outras combinações dependem da crônica.",source:predator?.source||creation});

  const disciplineDots=Object.values(data.disciplines||{}).reduce((a,b)=>a+b,0)-purchases.filter(item=>item.kind.includes("discipline")).length,expected=(chronicle.customTargets?chronicle.disciplinePoints:3)+(data.predatorApplied?1:0);
  if(character.clan!=="Sangue-Ralo"&&disciplineDots!==expected)add({id:"discipline-dots",kind:"warning",title:"Total de Disciplinas fora da criação padrão",detail:`A criação comum distribui 3 pontos (2 + 1) e o Predador aplicado normalmente acrescenta 1. Esta ficha tem ${disciplineDots}; o esperado aqui é ${expected}.`,source:disciplines});
  for(const [name,powers] of Object.entries(data.disciplinePowers||{})){
    const dots=data.disciplines?.[name]||0;
    const normalPowers=powers.filter(powerName=>{const item=POWER_CATALOG.find(power=>power.name===powerName&&power.discipline===name);return !item?.kind||item.kind==="power"});
    if(normalPowers.filter(Boolean).length>dots)add({id:`power-count-${name}`,kind:"warning",title:`Mais poderes de ${name} do que pontos`,detail:`Há ${normalPowers.filter(Boolean).length} poderes registrados para ${dots} ponto(s). Rituais e Cerimônias são aprendidos separadamente.`,source:disciplines});
  }
  let freeCeremonies=0;
  for(const [disciplineName,powers] of Object.entries(data.disciplinePowers||{})){const dots=data.disciplines?.[disciplineName]||0;for(const name of powers){const power=POWER_CATALOG.find(item=>item.discipline===disciplineName&&item.name===name);if(!power){add({id:`homebrew-power-${disciplineName}-${name}`,kind:"info",title:`Poder personalizado: ${name}`,detail:`Este nome não está no catálogo indexado de ${disciplineName}. Ele foi preservado como conteúdo personalizado.`});continue}if(power.level>dots)add({id:`power-level-${power.id}`,kind:"warning",title:`${power.name} acima do nível de ${disciplineName}`,detail:`A opção é de nível ${power.level}, mas a ficha tem ${disciplineName} ${dots}.`,source:power.source});if(power.prerequisite&&!powers.includes(power.prerequisite))add({id:`power-prerequisite-${power.id}`,kind:"warning",title:`${power.name} sem ${power.prerequisite}`,detail:"A Cerimônia exige conhecer o poder indicado como pré-requisito.",source:power.source});if(power.kind&&power.kind!=="power"&&!purchases.some(item=>item.kind===power.kind&&item.name===power.name)){if(power.kind==="ceremony"&&power.level===1&&power.prerequisite&&powers.includes(power.prerequisite))freeCeremonies++;else add({id:`magic-xp-${power.id}`,kind:"warning",title:`${power.name} sem compra registrada`,detail:"Rituais, Cerimônias e Fórmulas são aprendidos separadamente. Registre a compra com XP ou aprove uma exceção da crônica.",source:power.source})}if(power.amalgam){const [requiredName,requiredLevel]=power.amalgam.split(/\s+(?=\d+$)/);if((data.disciplines?.[requiredName]||0)<Number(requiredLevel))add({id:`power-amalgam-${power.id}`,kind:"warning",title:`${power.name} sem ${power.amalgam}`,detail:`O poder possui o pré-requisito Amálgama: ${power.amalgam}. A escolha continua salva para permitir exceções da crônica.`,source:power.source})}}}
  if(freeCeremonies>1)add({id:"free-ceremonies",kind:"warning",title:"Mais de uma Cerimônia grátis na criação",detail:"A criação permite uma Cerimônia de nível 1 se o poder pré-requisito de Oblívio já for conhecido.",source:disciplines});

  const meritDots=ownItemDots(data.merits||[])-purchases.filter(item=>item.kind==="advantage").length,flawDots=ownItemDots(data.flawItems||[]),meritTarget=chronicle.customTargets?chronicle.meritPoints:data.ageCategory==="Ancilla"?9:7,flawTarget=chronicle.customTargets?chronicle.flawPoints:data.ageCategory==="Ancilla"?4:2;
  if(meritDots!==meritTarget)add({id:"merits",kind:"warning",title:`Vantagens não somam ${meritTarget} pontos`,detail:`A regra ativa distribui ${meritTarget} pontos livres em Vantagens; a ficha soma ${meritDots}. Benefícios do Predador e compras com XP aparecem na lista, mas não consomem esses pontos.`,source:core("regras-e-criacao-vantagens-e-defeitos","7 pontos","Livro Básico V5, criação de personagem")});
  if(flawDots<flawTarget)add({id:"flaws",kind:"warning",title:`Menos de ${flawTarget} pontos de Defeitos`,detail:`A regra ativa adquire ao menos ${flawTarget} pontos de Defeitos, além dos recebidos pelo Predador; a ficha soma ${flawDots}.`,source:core("regras-e-criacao-vantagens-e-defeitos","2 pontos","Livro Básico V5, criação de personagem")});
  if(xpSpent(data.xpSpent||"",purchases)>xpBudget(data.xpTotal||"",data.ageCategory||""))add({id:"xp-over-budget",kind:"warning",title:"XP gasto acima do disponível",detail:"Confira o saldo inicial por idade, o XP adicional da crônica e as compras registradas.",source:creation});
  const convictions=lines(data.convictions),touchstones=lines(data.touchstones);
  if(convictions.length<1||convictions.length>3||convictions.length!==touchstones.length)add({id:"convictions",kind:"warning",title:"Convicções e Pilares não estão em correspondência",detail:`O padrão usa de 1 a 3 Convicções e a mesma quantidade de Pilares. Há ${convictions.length} Convicção(ões) e ${touchstones.length} Pilar(es).`,source:core("regras-e-criacao-humanidade-conviccoes-pilares-ambicao-e-desejo","Convicções","Livro Básico V5, Humanidade e Convicções")});
  return issues;
}

export function auditSourceUrl(issue:AuditIssue){return issue.source?rulesUrl(issue.source):null}
