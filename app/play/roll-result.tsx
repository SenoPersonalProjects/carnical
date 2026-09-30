import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import { evaluateTest, type RollRecord } from "./dice";

export default function RollResult({ record, canReroll, onReroll }: { record: RollRecord; canReroll: boolean; onReroll: (indices: number[]) => void }) {
  const [selected, setSelected] = useState<number[]>([]);
  const result = record.kind === "test" ? evaluateTest(record.dice, record.difficulty) : null;
  const toggle = (index: number) => setSelected(current => current.includes(index) ? current.filter(item => item !== index) : current.length < 3 ? [...current, index] : current);
  const explanation = result?.type === "messy" ? "O teste passou com um par de 10 e pelo menos um 10 de Fome: a Besta interfere no sucesso. Também chamado de crítico bagunçado."
    : result?.type === "bestial" ? "O teste falhou e há pelo menos um 1 de Fome: a Besta interfere na falha."
    : result?.type === "critical" ? "O teste passou com um par de 10. Cada par vale quatro sucessos."
    : result?.type === "success" ? "A quantidade de sucessos atingiu a dificuldade. Um 1 de Fome não causa falha bestial quando o teste passa."
    : result ? "A quantidade de sucessos ficou abaixo da dificuldade, sem 1 de Fome." : "Teste de Despertar usa um dado comum: 6 a 10 passa; 1 a 5 aumenta a Fome.";
  return <article className={`resolved-roll ${result?.type || "rouse"}`}>
    <div className="roll-result-head"><div><span>{record.label}</span><strong>{result?.outcome || record.outcome}</strong></div><small>{result ? `${result.successes} sucesso(s) · Dif. ${record.difficulty} · Margem ${result.margin >= 0 ? "+" : ""}${result.margin}` : "1 dado comum"}</small></div>
    <div className="resolved-dice" aria-label="Resultados dos dados">{record.dice.map((die, index) => {
      const label = die.value === 10 ? "10 · crítico" : die.value >= 6 ? "sucesso" : die.hunger && die.value === 1 ? "1 · Besta" : "falha";
      const decisive = !!result && ((result.type === "bestial" && die.hunger && die.value === 1) || (result.pairs > 0 && die.value === 10));
      const selectable = canReroll && !die.hunger;
      return <div className="resolved-die" key={index}><button type="button" disabled={!selectable || (selected.length === 3 && !selected.includes(index))} aria-pressed={selectable ? selected.includes(index) : undefined} aria-label={`Dado ${index + 1}, ${die.hunger ? "Fome" : "comum"}, resultado ${die.value}, ${label}${die.previousValue !== undefined ? `, antes ${die.previousValue}` : ""}${selectable ? ", selecionar para rerrolar" : ""}`} onClick={() => toggle(index)} className={`die-face ${die.hunger ? "hunger" : "normal"} ${die.value >= 6 ? "hit" : "miss"} ${decisive ? "decisive" : ""} ${selected.includes(index) ? "selected" : ""}`}><span>{die.value}</span></button><small className={die.hunger ? "hunger-label" : ""}>{die.hunger ? "Fome" : "Comum"}</small><span className="die-meaning">{label}</span>{die.previousValue !== undefined && <span className="die-previous">antes {die.previousValue}</span>}</div>;
    })}</div>
    {result && <p className="roll-count">{result.base} sucessos nos dados + {result.bonus} de {result.pairs} par(es) de 10 = <strong>{result.successes} sucessos</strong></p>}
    <p className="roll-explanation">{explanation}</p>
    {canReroll && <div className="reroll-selection"><p>Selecione até 3 dados comuns, inclusive sucessos ou 10. Dados de Fome não podem ser rerrolados.</p><button className="reroll-button" disabled={selected.length === 0} onClick={() => onReroll(selected)}><RefreshCcw size={14}/>Rerrolar {selected.length} dado(s) · 1 Vontade</button></div>}
    {record.rerolled && <small className="reroll-used">Rerrolagem de Vontade usada · valores anteriores preservados</small>}
  </article>;
}
