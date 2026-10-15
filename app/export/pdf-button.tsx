"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { usePreferredLocale } from "../preferences";
import { characterSnapshot, pdfFilename, type ExportCharacter } from "./character-snapshot";

export default function PdfButton({ character }: { character: ExportCharacter }) {
  const locale = usePreferredLocale(), en = locale === "en";
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function download() {
    if (busy) return;
    const snapshot = characterSnapshot(character);
    setBusy(true); setError("");
    try {
      const { createCharacterPdf } = await import("./character-pdf");
      const blob = await createCharacterPdf(snapshot, locale);
      const url = URL.createObjectURL(blob), anchor = document.createElement("a");
      anchor.href = url; anchor.download = pdfFilename(snapshot.name); document.body.appendChild(anchor); anchor.click(); anchor.remove();
      // Keep the object URL alive while the browser begins a mobile download.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setError(en ? "The PDF could not be generated. Try again." : "Não foi possível gerar o PDF. Tente novamente.");
    } finally { setBusy(false); }
  }
  return <div className="pdf-export"><button type="button" disabled={busy} onClick={() => void download()}>{busy ? <LoaderCircle size={16} className="animate-spin" /> : <Download size={16} />}<span>{busy ? en ? "Generating PDF…" : "Gerando PDF…" : en ? "Download character PDF" : "Baixar ficha em PDF"}</span></button><small>{en?"Includes reviewed item rules. Descriptions still awaiting review are identified in the PDF.":"Inclui as regras revisadas dos itens. Descrições ainda pendentes de revisão são identificadas no PDF."}</small><span role={error ? "alert" : "status"} aria-live="polite">{error}</span></div>;
}
