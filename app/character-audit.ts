import { AGE_RULES, OBLIVION_POWERS, PREDATOR_RULES, SKILL_PRESETS, rulesUrl, type SourceRef } from "./game-rules";

export type AuditIssue={id:string;kind:"warning"|"info";title:string;detail:string;source?:SourceRef};
type Merit={dots?:number};
type AuditData={
  attributes?:Record<string,number>;skills?:Record<string,number>;skillPreset?:string;disciplines?:Record<string,number>;disciplinePowers?:Record<string,string[]>;
  merits?:Merit[];flawItems?:Merit[];ageCategory?:string;generation?:string;bloodPotency?:number;predator?:string;predatorApplied?:string;
  predatorDiscipline?:string;convictions?:string;touchstones?:string;allowHomebrew?:boolean;
};
export type AuditableCharacter={name?:string;concept?:string;clan?:string;data:AuditData};

const core=(chapter:string,query:string,label:string):SourceRef=>({book:"core-v5",chapter,query,label});
const creation=core("regras-e-criacao-criacao-de-personagem","Validações mínimas do builder","Livro Básico V5, criação de personagem");
const disciplines=core("regras-e-criacao-disciplinas","pré-requisitos","Livro Básico V5, Disciplinas");

function lines(value?:string){return (value||"").split("\n").map(item=>item.trim()).filter(Boolean)}
function counts(values:Record<string,number>={},positiveOnly=false){return Object.values(values).reduce<Record<number,number>>((result,value)=>{if(!positiveOnly||value>0)result[value]=(result[value]||0)+1;return result},{})}

export function auditCharacter(character:AuditableCharacter):AuditIssue[]{
  const data=character.data||{},issues:AuditIssue[]=[];
  const add=(issue:AuditIssue)=>issues.push(issue);
  if(!character.name?.trim())add({id:"identity-name",kind:"warning",title:"Nome não preenchido",detail:"A criação padrão precisa identificar o personagem. Você pode salvar e continuar mesmo assim.",source:creation});
  if(!character.concept?.trim())add({id:"identity-concept",kind:"warning",title:"Conceito não preenchido",detail:"O conceito orienta as escolhas da criação, mas pode ser definido depois.",source:creation});
  if(!character.clan?.trim())add({id:"identity-clan",kind:"warning",title:"Clã ou linhagem não definido",detail:"A escolha determina as Disciplinas iniciais e outras regras. Conteúdo personalizado continua permitido.",source:creation});

  const attributeCounts=counts(data.attributes);
  if(!(attributeCounts[4]===1&&attributeCounts[3]===3&&attributeCounts[2]===4&&attributeCounts[1]===1))add({id:"attributes",kind:"warning",title:"Distribuição de Atributos fora do padrão",detail:"O padrão inicial é 1 Atributo em 4, 3 em 3, 4 em 2 e 1 em 1. A ficha não será alterada automaticamente.",source:core("regras-e-criacao-atributos-habilidades-e-especializacoes","Distribuição inicial","Livro Básico V5, pp. 152–171")});

  const skillTarget=SKILL_PRESETS[data.skillPreset||""],skillCounts=counts(data.skills,true);
  if(skillTarget&&(!Object.entries(skillTarget).every(([level,total])=>(skillCounts[Number(level)]||0)===total)||Object.values(skillCounts).reduce((a,b)=>a+b,0)!==Object.values(skillTarget).reduce((a,b)=>a+b,0)))add({id:"skills",kind:"warning",title:`Habilidades não correspondem a ${data.skillPreset}`,detail:`O preset escolhido espera ${Object.entries(skillTarget).sort((a,b)=>Number(b[0])-Number(a[0])).map(([level,total])=>`${total} em ${level}`).join(", ")}.`,source:core("regras-e-criacao-atributos-habilidades-e-especializacoes","Distribuições rápidas de Habilidades","Livro Básico V5, pp. 152–171")});

  const predator=PREDATOR_RULES.find(rule=>rule.name===data.predator),applied=PREDATOR_RULES.find(rule=>rule.name===data.predatorApplied);
  const age=AGE_RULES[data.ageCategory||""];
  if(age&&character.clan!=="Sangue-Ralo"&&(!age.generations.includes(data.generation||"")||data.bloodPotency!==age.bloodPotency+(applied?.bloodPotency||0)))add({id:"age",kind:"warning",title:"Geração ou Potência de Sangue fora da faixa inicial",detail:`${data.ageCategory} usa ${age.generations.join(" ou ")} Geração e Potência de Sangue ${age.bloodPotency}${applied?.bloodPotency?` + ${applied.bloodPotency} do Predador`:""}. A crônica pode substituir essa faixa.`,source:core("regras-e-criacao-sangue-fome-geracao-e-potencia-de-sangue","Geração","Livro Básico V5, pp. 201–242")});
  if(predator&&data.predatorApplied!==predator.name)add({id:"predator",kind:"warning",title:"Pacote de Predador ainda não aplicado",detail:"O tipo foi escolhido, mas a especialização, a Disciplina e as alterações diretas ainda não foram confirmadas.",source:predator.source});
  if(data.predatorDiscipline==="Feitiçaria de Sangue"&&character.clan!=="Tremere")add({id:"blood-sorcery-predator",kind:"warning",title:"Feitiçaria de Sangue exige Tremere nesta escolha",detail:"Nos tipos de Predador que oferecem essa opção, o material enviado restringe a escolha a personagens Tremere. Ela permanece registrada como possível regra da crônica.",source:predator?.source||creation});

  const disciplineDots=Object.values(data.disciplines||{}).reduce((a,b)=>a+b,0),expected=3+(data.predatorApplied?1:0);
  if(character.clan!=="Sangue-Ralo"&&disciplineDots!==expected)add({id:"discipline-dots",kind:"warning",title:"Total de Disciplinas fora da criação padrão",detail:`A criação comum distribui 3 pontos (2 + 1) e o Predador aplicado normalmente acrescenta 1. Esta ficha tem ${disciplineDots}; o esperado aqui é ${expected}.`,source:disciplines});
  for(const [name,powers] of Object.entries(data.disciplinePowers||{})){
    const dots=data.disciplines?.[name]||0;
    if(powers.filter(Boolean).length>dots)add({id:`power-count-${name}`,kind:"warning",title:`Mais poderes de ${name} do que pontos`,detail:`Há ${powers.filter(Boolean).length} poderes registrados para ${dots} ponto(s). A regra geral associa a escolha de um poder a cada ponto adquirido.`,source:disciplines});
  }
  const oblivionPowers=data.disciplinePowers?.["Oblívio"]||[],oblivionDots=data.disciplines?.["Oblívio"]||0,potence=data.disciplines?.["Potência"]||0;
  for(const name of oblivionPowers){const power=OBLIVION_POWERS.find(item=>item.name===name);if(!power){add({id:`homebrew-oblivion-${name}`,kind:"info",title:`Poder personalizado: ${name}`,detail:"Este nome não está no catálogo de Oblívio normalizado de Chicago by Night. Ele foi preservado como conteúdo personalizado."});continue}if(power.level>oblivionDots)add({id:`power-level-${power.id}`,kind:"warning",title:`${power.name} acima do nível de Oblívio`,detail:`O poder é de nível ${power.level}, mas a ficha tem Oblívio ${oblivionDots}.`,source:power.source});if(power.id==="arms-of-ahriman"&&potence<2)add({id:"arms-amalgam",kind:"warning",title:"Arms of Ahriman sem Potência 2",detail:"O poder possui o pré-requisito Amálgama: Potência 2. A escolha continua salva para permitir exceções da crônica.",source:power.source})}

  const meritDots=(data.merits||[]).reduce((a,b)=>a+(b.dots||0),0),flawDots=(data.flawItems||[]).reduce((a,b)=>a+(b.dots||0),0);
  if(meritDots!==7)add({id:"merits",kind:"warning",title:"Vantagens não somam 7 pontos",detail:`A criação padrão distribui 7 pontos em Vantagens; a ficha soma ${meritDots}. Benefícios do Predador são tratados à parte.`,source:core("regras-e-criacao-vantagens-e-defeitos","7 pontos","Livro Básico V5, criação de personagem")});
  if(flawDots<2)add({id:"flaws",kind:"warning",title:"Menos de 2 pontos de Defeitos",detail:`A criação padrão adquire ao menos 2 pontos de Defeitos, além dos recebidos pelo Predador; a ficha soma ${flawDots}.`,source:core("regras-e-criacao-vantagens-e-defeitos","2 pontos","Livro Básico V5, criação de personagem")});
  const convictions=lines(data.convictions),touchstones=lines(data.touchstones);
  if(convictions.length<1||convictions.length>3||convictions.length!==touchstones.length)add({id:"convictions",kind:"warning",title:"Convicções e Pilares não estão em correspondência",detail:`O padrão usa de 1 a 3 Convicções e a mesma quantidade de Pilares. Há ${convictions.length} Convicção(ões) e ${touchstones.length} Pilar(es).`,source:core("regras-e-criacao-humanidade-conviccoes-pilares-ambicao-e-desejo","Convicções","Livro Básico V5, Humanidade e Convicções")});
  return issues;
}

export function auditSourceUrl(issue:AuditIssue){return issue.source?rulesUrl(issue.source):null}
