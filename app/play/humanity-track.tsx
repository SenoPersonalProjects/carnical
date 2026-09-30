import { humanityTrack } from "./dice";

export default function HumanityTrack({humanity,stains,impaired=false,onHumanityChange,onStainsChange}:{humanity:number;stains:number;impaired?:boolean;onHumanityChange:(value:number)=>void;onStainsChange:(value:number)=>void}) {
  const track=humanityTrack(humanity,stains);
  return <section className="damage-card humanity-card" aria-label="Trilha de Humanidade e Máculas">
    <header><span>Humanidade e Máculas</span><strong>{humanity}/10 · {stains} Máculas</strong></header>
    <div className="damage-boxes humanity-boxes">{Array.from({length:10},(_,index)=>{const human=index<humanity,stained=!human&&index>=10-Math.min(stains,track.empty);return <i key={index} className={human?"humanity-filled":stained?"aggravated":""} aria-label={`Caixa ${index+1}: ${human?"Humanidade":stained?"Mácula":"vazia"}`}>{human?"■":stained?"×":""}</i>})}</div>
    <div className="damage-actions"><span>Humanidade</span><button aria-label="Diminuir Humanidade" disabled={!humanity} onClick={()=>onHumanityChange(humanity-1)}>−</button><button aria-label="Aumentar Humanidade" disabled={humanity>=10} onClick={()=>onHumanityChange(humanity+1)}>+</button><span>Máculas</span><button aria-label="Remover Mácula" disabled={!stains} onClick={()=>onStainsChange(stains-1)}>−</button><button aria-label="Adicionar Mácula" disabled={stains>=10} onClick={()=>onStainsChange(stains+1)}>+</button></div>
    <p>{track.empty-Math.min(stains,track.empty)} caixas vazias · Remorso: {track.remorsePool} dado(s).</p>
    {(impaired||track.impaired)&&<p role="alert">Debilitado · {track.overflow} Mácula(s) excedente(s) · −2 dados.</p>}
    {humanity===0&&<p role="alert">Humanidade 0: personagem dominado pela Besta, sob controle do Narrador.</p>}
  </section>;
}
