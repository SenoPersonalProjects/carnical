"use client";
import { PREDATOR_CHOICES, type PackageChoice } from "./predator-choices";
export default function PredatorChoiceEditor({predatorId,id,value,onChange}:{predatorId:string;id:string;value:string;onChange:(value:string)=>void}){
  const spec=PREDATOR_CHOICES[predatorId]?.[id];if(!spec)return null;
  let allocation:Record<string,number>={},items:PackageChoice[]=[];
  try{if(value){if(spec.type==="allocation"){const parsed=JSON.parse(value);if(parsed&&typeof parsed==="object"&&!Array.isArray(parsed))allocation=parsed}else if(spec.type==="flaws"){const parsed=JSON.parse(value);if(Array.isArray(parsed))items=parsed}}}catch{}
  const total=spec.type==="allocation"?spec.options.reduce((sum,item)=>sum+(Number(allocation[item.name])||0),0):items.reduce((sum,item)=>sum+(Number(item.dots)||0),0);
  return <div className="guided-package-choice">
    <p>{spec.creation?"Distribuição dos pontos de criação":"Benefício adicional do Predador"}: {spec.type==="select"?`${spec.points} ponto(s) em uma opção`:`${total}/${spec.points} pontos`}. {spec.creation&&"Esses pontos fazem parte do total inicial; não são pontos extras."}</p>
    {spec.type==="select"?<select aria-label={`Escolha de ${id}`} value={spec.options.some(option=>option.name===value)?value:""} onChange={event=>onChange(event.target.value)}><option value="">Escolha uma opção…</option>{spec.options.map(option=><option key={option.name}>{option.name}</option>)}</select>:
      spec.type==="allocation"?spec.options.map(option=>{const current=Number(allocation[option.name])||0;return <label key={option.name}><span>{option.name}</span><select aria-label={`Pontos em ${option.name}`} value={current} onChange={event=>onChange(JSON.stringify({...allocation,[option.name]:Number(event.target.value)}))}>{Array.from({length:spec.points+1},(_,dots)=><option key={dots} value={dots} disabled={dots-current+total>spec.points}>{dots} ponto(s)</option>)}</select></label>}):<>
        <p>Escolha até duas opções, somando exatamente 2 pontos. Os Defeitos Míticos têm custo fixo; Inimigo pode receber 1 ou 2.</p>
        {spec.options.map(option=>{const current=items.find(item=>item.name===option.name)?.dots||0;return <label key={option.name}><span>{option.name}</span><select aria-label={`Pontos em ${option.name}`} value={current} onChange={event=>{const dots=Number(event.target.value);onChange(JSON.stringify([...items.filter(item=>item.name!==option.name),...(dots?[{name:option.name,dots}]:[])]))}}><option value={0}>Não escolher</option>{(option.dots?[option.dots]:[1,2]).map(dots=><option key={dots} value={dots} disabled={dots-current+total>spec.points}>{dots} ponto(s)</option>)}</select></label>})}
        <a href="/rules?book=core-v5&chapter=regras-e-criacao-vantagens-e-defeitos&q=Míticos">Consultar Defeitos Míticos (Livro Básico, pp. 182–183)</a>
      </>}
    {value&&spec.type!=="select"&&!value.startsWith("{")&&!value.startsWith("[")&&<p className="legacy-choice">Registro anterior preservado: {value}. Confira a regra e refaça esta escolha nos controles acima.</p>}
  </div>;
}
