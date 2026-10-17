
import { UiText, useUiText } from "../ui-text";
import { humanityTrack } from "./dice";

export default function HumanityTrack({humanity,stains,impaired=false,remorsePool,onHumanityChange,onStainsChange}:{humanity:number;stains:number;impaired?:boolean;remorsePool?:number;onHumanityChange:(value:number)=>void;onStainsChange:(value:number)=>void}) {
  const t=useUiText();

  const track=humanityTrack(humanity,stains);
  return <section className="damage-card humanity-card" aria-label={t("Trilha de Humanidade e Máculas")}>
    <header><span><UiText text="Humanidade e Máculas"/></span><strong>{humanity}/10 · {stains} <UiText text=" Máculas"/></strong></header>
    <div className="damage-boxes humanity-boxes">{Array.from({length:10},(_,index)=>{const human=index<humanity,stained=!human&&index>=10-Math.min(stains,track.empty);return <i key={index} className={human?"humanity-filled":stained?"aggravated":""} aria-label={`Caixa ${index+1}: ${human?"Humanidade":stained?"Mácula":"vazia"}`}>{human?"■":stained?<UiText text="×"/>:""}</i>})}</div>
    <div className="damage-actions"><span><UiText text="Humanidade"/></span><button aria-label={t("Diminuir Humanidade")} disabled={!humanity} onClick={()=>onHumanityChange(humanity-1)}>−</button><button aria-label={t("Aumentar Humanidade")} disabled={humanity>=10} onClick={()=>onHumanityChange(humanity+1)}>+</button><span><UiText text="Máculas"/></span><button aria-label={t("Remover Mácula")} disabled={!stains} onClick={()=>onStainsChange(stains-1)}>−</button><button aria-label={t("Adicionar Mácula")} disabled={stains>=10} onClick={()=>onStainsChange(stains+1)}>+</button></div>
    <p>{track.empty-Math.min(stains,track.empty)} <UiText text=" caixas vazias · Remorso: "/>{remorsePool??track.remorsePool} <UiText text=" dado(s)."/></p>
    {(impaired||track.impaired)&&<p role="alert"><UiText text="Debilitado · "/>{track.overflow} <UiText text=" Mácula(s) excedente(s) · −2 dados."/></p>}
    {humanity===0&&<p role="alert"><UiText text="Humanidade 0: personagem dominado pela Besta, sob controle do Narrador."/></p>}
  </section>;
}
