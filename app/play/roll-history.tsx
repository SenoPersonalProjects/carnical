"use client";

import { useEffect, useRef } from "react";
import type { RollRecord } from "./dice";
import RollResult from "./roll-result";

export default function RollHistory({ records, canRerollLatest, onReroll, onClear }: {
  records: RollRecord[];
  canRerollLatest: boolean;
  onReroll: (record: RollRecord, indices: number[]) => void;
  onClear: () => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const latestId = records[0]?.id;
  useEffect(() => {
    if (viewport.current) viewport.current.scrollTop = 0;
  }, [latestId]);

  return <section className="roll-history-panel" aria-label="Histórico de rolagens">
    <header className="roll-history-header">
      <div><h4>Histórico de rolagens</h4><p role="status">{records.length ? `${records.length} rolagens · Mais recentes primeiro · Até 20 por ficha` : "Nenhuma rolagem no histórico."}</p></div>
      <button type="button" onClick={onClear} disabled={!records.length}>Limpar rolagens</button>
    </header>
    {records.length > 0 && <div className="roll-history" ref={viewport} tabIndex={0} role="region" aria-label="Rolagens salvas, role para ver as anteriores">
      {records.map((record, index) => <RollResult key={record.id} record={record} canReroll={index === 0 && canRerollLatest} onReroll={indices => onReroll(record, indices)}/>)}
    </div>}
  </section>;
}
