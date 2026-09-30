"use client";
import { type Anchor } from "./anchors";
export default function AnchorEditor({items,onChange}:{items:Anchor[];onChange:(items:Anchor[])=>void}) {
  const update=(index:number,patch:Partial<Anchor>)=>onChange(items.map((item,i)=>i===index?{...item,...patch}:item));
  return <section className="anchor-editor"><h3>Pilares e suas Convicções</h3><p>Preencha cada vínculo no mesmo cartão. O Pilar é uma pessoa mortal que representa ou inspira essa Convicção. O padrão usa de 1 a 3 Convicções.</p>
    {items.map((item,index)=><article className="anchor-pair" key={index}><header><strong>Vínculo {index+1}</strong><button type="button" disabled={items.length===1} onClick={()=>onChange(items.filter((_,i)=>i!==index))} aria-label={`Remover vínculo ${index+1}`}>Remover vínculo</button></header><div className="form-grid"><label className="field"><span>Pilar mortal</span><input value={item.touchstone} onChange={event=>update(index,{touchstone:event.target.value})} placeholder="Ex.: Ana, minha irmã, professora"/></label><label className="field"><span>Convicção ligada a esse Pilar</span><input value={item.conviction} onChange={event=>update(index,{conviction:event.target.value})} placeholder="Ex.: Nunca abandonar quem depende de mim"/></label></div>{!!item.touchstone.trim()!==!!item.conviction.trim()&&<p className="anchor-pending">Complete os dois campos deste vínculo.</p>}</article>)}
    <button type="button" className="add-wide" disabled={items.length>=3} onClick={()=>onChange([...items,{touchstone:"",conviction:""}])}>Adicionar vínculo Pilar + Convicção</button>
    {items.length>3&&<p>Seus vínculos antigos foram preservados. Confira com o Narrador a quantidade acima do padrão.</p>}
  </section>;
}
