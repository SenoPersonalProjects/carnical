"use client";
import { UiText, useUiText } from "./ui-text";

import { type Anchor } from "./anchors";
export default function AnchorEditor({items,onChange}:{items:Anchor[];onChange:(items:Anchor[])=>void}) {
  const t=useUiText();

  const update=(index:number,patch:Partial<Anchor>)=>onChange(items.map((item,i)=>i===index?{...item,...patch}:item));
  return <section className="anchor-editor"><h3><UiText text="Pilares e suas Convicções"/></h3><p><UiText text="Preencha cada vínculo no mesmo cartão. O Pilar é uma pessoa mortal que representa ou inspira essa Convicção. O padrão usa de 1 a 3 Convicções."/></p>
    {items.map((item,index)=><article className="anchor-pair" key={index}><header><strong><UiText text="Vínculo "/>{index+1}</strong><button type="button" disabled={items.length===1} onClick={()=>onChange(items.filter((_,i)=>i!==index))} aria-label={`Remover vínculo ${index+1}`}><UiText text="Remover vínculo"/></button></header><div className="form-grid"><label className="field"><span><UiText text="Pilar mortal"/></span><input value={item.touchstone} onChange={event=>update(index,{touchstone:event.target.value})} placeholder={t("Ex.: Ana, minha irmã, professora")}/></label><label className="field"><span><UiText text="Convicção ligada a esse Pilar"/></span><input value={item.conviction} onChange={event=>update(index,{conviction:event.target.value})} placeholder={t("Ex.: Nunca abandonar quem depende de mim")}/></label></div>{!!item.touchstone.trim()!==!!item.conviction.trim()&&<p className="anchor-pending"><UiText text="Complete os dois campos deste vínculo."/></p>}</article>)}
    <button type="button" className="add-wide" disabled={items.length>=3} onClick={()=>onChange([...items,{touchstone:"",conviction:""}])}><UiText text="Adicionar vínculo Pilar + Convicção"/></button>
    {items.length>3&&<p><UiText text="Seus vínculos antigos foram preservados. Confira com o Narrador a quantidade acima do padrão."/></p>}
  </section>;
}
