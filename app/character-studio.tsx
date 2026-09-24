"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Check, ChevronLeft, ChevronRight, CircleAlert, Dna, Feather, LogOut, Menu, Plus, Save, ShieldCheck, Sparkles, UserRound, X } from "lucide-react";

type Values = Record<string, number>;
type CharacterData = {
  sire: string; mortalName: string; embraceYear: string; chronicle: string;
  customClan: string; ageCategory: string; generation: string; bloodPotency: number;
  attributes: Values; skills: Values; skillPreset: string; disciplines: Values;
  predator: string; advantages: string; flaws: string; convictions: string; touchstones: string;
  ambition: string; desire: string; humanity: number; notes: string; allowHomebrew: boolean;
};
type Character = { id?: number; name: string; concept: string; clan: string; sourcebook: string; data: CharacterData };

declare global {
  interface Document {
    modelContext?: {
      registerTool(tool: {
        name: string; title?: string; description: string; inputSchema: object;
        annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
        execute(input: unknown): unknown | Promise<unknown>;
      }, options?: { signal?: AbortSignal }): void | Promise<void>;
    };
  }
}

const ATTRIBUTES = ["Força", "Destreza", "Vigor", "Carisma", "Manipulação", "Autocontrole", "Inteligência", "Raciocínio", "Determinação"];
const SKILLS = ["Atletismo", "Briga", "Furtividade", "Armas Brancas", "Armas de Fogo", "Condução", "Ladroagem", "Ofícios", "Sobrevivência", "Empatia com Animais", "Etiqueta", "Intimidação", "Liderança", "Manha", "Performance", "Persuasão", "Sagacidade", "Subterfúgio", "Ciência", "Erudição", "Finanças", "Investigação", "Medicina", "Ocultismo", "Percepção", "Política", "Tecnologia"];
const STEPS = [
  { name: "Identidade", icon: UserRound }, { name: "Linhagem", icon: Dna }, { name: "Atributos", icon: Sparkles },
  { name: "Habilidades", icon: Feather }, { name: "Predador", icon: BookOpen }, { name: "Crenças", icon: ShieldCheck }, { name: "Revisão", icon: Check },
];
const CLANS = [
  ["Brujah", "core_v5_ptbr", "Celeridade, Potência, Presença"], ["Gangrel", "core_v5_ptbr", "Animalismo, Fortitude, Proteanismo"],
  ["Malkaviano", "core_v5_ptbr", "Auspícios, Dominação, Ofuscação"], ["Nosferatu", "core_v5_ptbr", "Animalismo, Ofuscação, Potência"],
  ["Toreador", "core_v5_ptbr", "Auspícios, Celeridade, Presença"], ["Tremere", "core_v5_ptbr", "Auspícios, Dominação, Feitiçaria de Sangue"],
  ["Ventrue", "core_v5_ptbr", "Dominação, Fortitude, Presença"], ["Lasombra", "chicago_by_night_v5", "Dominação, Oblívio, Potência"],
  ["Caitiff", "core_v5_ptbr", "Duas Disciplinas quaisquer"], ["Sangue-Ralo", "core_v5_ptbr", "Criação própria, sem Disciplinas intrínsecas"],
];
const PREDATORS = ["Consensualista", "Fazendeiro", "Osíris", "Sacoleiro", "Sandman", "Sanguessuga", "Scene Queen", "Sereia", "Trinchador", "Vira-lata"];
const blankValues = (names: string[], value = 0) => Object.fromEntries(names.map((name) => [name, value]));
const blankCharacter = (): Character => ({
  name: "", concept: "", clan: "", sourcebook: "core_v5_ptbr",
  data: { sire: "", mortalName: "", embraceYear: "", chronicle: "", customClan: "", ageCategory: "Criança da Noite", generation: "13ª", bloodPotency: 1,
    attributes: blankValues(ATTRIBUTES, 2), skills: blankValues(SKILLS), skillPreset: "Equilibrado", disciplines: {}, predator: "", advantages: "", flaws: "",
    convictions: "", touchstones: "", ambition: "", desire: "", humanity: 7, notes: "", allowHomebrew: true },
});

function Dots({ value, onChange, max = 5, min = 0, label }: { value: number; onChange: (v: number) => void; max?: number; min?: number; label: string }) {
  return <div className="dots" role="group" aria-label={`${label}: ${value} pontos`}>{Array.from({ length: max }, (_, i) => {
    const dot = i + 1; return <button type="button" key={dot} aria-label={`${dot} pontos`} onClick={() => onChange(value === dot ? min : dot)} className={dot <= value ? "dot active" : "dot"} />;
  })}</div>;
}

function Field({ label, value, onChange, placeholder = "", wide = false }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; wide?: boolean }) {
  return <label className={wide ? "field wide" : "field"}><span>{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>;
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return <label className="field wide"><span>{label}</span><textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>;
}

export default function CharacterStudio({ displayName, signOutPath, previewMode = false }: { displayName: string; signOutPath: string; previewMode?: boolean }) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [character, setCharacter] = useState<Character>(blankCharacter);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"loading" | "saved" | "saving" | "error">("loading");
  const [mobileNav, setMobileNav] = useState(false);
  const hydrated = useRef(false);
  const lastPersisted = useRef("");

  useEffect(() => { if (previewMode) { setStatus("saved"); return; } fetch("/api/characters").then(async (r) => { if (!r.ok) throw new Error(); return await r.json() as { characters: Character[] }; }).then(({ characters }) => {
    setCharacters(characters); const initial = characters[0] ?? blankCharacter(); setCharacter(initial); lastPersisted.current = JSON.stringify(initial); setStatus("saved"); hydrated.current = true;
  }).catch(() => { setStatus("error"); hydrated.current = true; }); }, [previewMode]);

  const save = useCallback(async (next: Character) => {
    setStatus("saving");
    try {
      const response = await fetch(next.id ? `/api/characters/${next.id}` : "/api/characters", { method: next.id ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(next) });
      if (!response.ok) throw new Error();
      const { character: saved } = await response.json() as { character: Character }; lastPersisted.current = JSON.stringify(saved); setCharacter(saved);
      setCharacters((items) => [saved, ...items.filter((item) => item.id !== saved.id)]); setStatus("saved");
    } catch { setStatus("error"); }
  }, []);

  useEffect(() => { if (!hydrated.current || JSON.stringify(character) === lastPersisted.current) return; const timer = setTimeout(() => save(character), 850); return () => clearTimeout(timer); }, [character, save]);

  const setTop = (key: keyof Pick<Character, "name" | "concept" | "clan" | "sourcebook">, value: string) => setCharacter((c) => ({ ...c, [key]: value }));
  const setData = <K extends keyof CharacterData>(key: K, value: CharacterData[K]) => setCharacter((c) => ({ ...c, data: { ...c.data, [key]: value } }));
  const setNested = (key: "attributes" | "skills" | "disciplines", name: string, value: number) => setCharacter((c) => ({ ...c, data: { ...c.data, [key]: { ...c.data[key], [name]: value } } }));
  const attrCounts = useMemo<Values>(() => Object.values(character.data.attributes).reduce<Values>((a, v) => { a[v] = (a[v] || 0) + 1; return a; }, {}), [character.data.attributes]);
  const validations = [
    { ok: !!character.name.trim(), text: "Nome do personagem" }, { ok: !!character.concept.trim(), text: "Conceito definido" }, { ok: !!character.clan.trim(), text: "Clã ou linhagem" },
    { ok: attrCounts[4] === 1 && attrCounts[3] === 3 && attrCounts[2] === 4 && attrCounts[1] === 1, text: "Distribuição de Atributos: 1/3/4/1" },
    { ok: !!character.data.predator, text: "Tipo de Predador" }, { ok: character.data.convictions.split("\n").filter(Boolean).length === character.data.touchstones.split("\n").filter(Boolean).length && !!character.data.convictions.trim(), text: "Convicções ligadas a Pilares" },
  ];
  const completed = validations.filter((v) => v.ok).length;
  const clanInfo = CLANS.find(([name]) => name === character.clan);
  const selectedSource = clanInfo?.[1] ?? (character.clan === "Personalizado" ? "custom" : character.sourcebook);

  const newCharacter = () => { const next = blankCharacter(); setCharacter(next); setStep(0); };
  const chooseCharacter = (item: Character) => { setCharacter(item); setStep(0); setMobileNav(false); };

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const report = (error: unknown) => console.error("WebMCP registration error", error);
    void Promise.resolve(context.registerTool({
      name: "start_character_creation", title: "Iniciar criação de personagem",
      description: "Abre uma nova ficha vazia no criador de personagens V5. A ficha só é salva depois que algum campo for preenchido.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute() { const next = blankCharacter(); setCharacter(next); setStep(0); return { status: "ready", step: "Identidade" }; },
    }, { signal: lifecycle.signal })).catch(report);
    void Promise.resolve(context.registerTool({
      name: "set_character_identity", title: "Preencher identidade do personagem",
      description: "Preenche nome, conceito, nome mortal e crônica na ficha atualmente aberta. O salvamento automático usa a mesma ação da interface.",
      inputSchema: { type: "object", properties: { name: { type: "string" }, concept: { type: "string" }, mortalName: { type: "string" }, chronicle: { type: "string" } }, required: ["name", "concept"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute(input) {
        if (!input || typeof input !== "object") throw new Error("Entrada inválida");
        const value = input as Record<string, unknown>;
        if (typeof value.name !== "string" || typeof value.concept !== "string") throw new Error("Nome e conceito são obrigatórios");
        setCharacter((current) => ({ ...current, name: value.name as string, concept: value.concept as string, data: { ...current.data, mortalName: typeof value.mortalName === "string" ? value.mortalName : current.data.mortalName, chronicle: typeof value.chronicle === "string" ? value.chronicle : current.data.chronicle } }));
        setStep(0); return { status: "staged", name: value.name, concept: value.concept };
      },
    }, { signal: lifecycle.signal })).catch(report);
    return () => lifecycle.abort();
  }, []);

  return <main className="studio-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark">N</div><div><strong>NOCTIS</strong><span>ARQUIVO DE PERSONAGENS</span></div></div>
      <div className="save-state" aria-live="polite"><span className={status === "error" ? "status-dot error" : "status-dot"} />{previewMode ? "Prévia local" : status === "saving" ? "Salvando…" : status === "error" ? "Falha ao salvar" : status === "loading" ? "Abrindo arquivo…" : "Salvo"}</div>
      <div className="user-area"><span>{displayName}</span><a href={signOutPath} target="_top" title="Sair"><LogOut size={17} /></a></div>
      <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Abrir navegação"><Menu /></button>
    </header>

    <div className="workspace">
      <aside className={`left-rail ${mobileNav ? "open" : ""}`}>
        <div className="rail-heading"><span>SUAS FICHAS</span><button onClick={newCharacter} title="Nova ficha"><Plus size={16} /></button></div>
        <div className="character-list">
          {characters.length === 0 && <p className="empty-copy">Sua primeira ficha aparecerá aqui quando você começar a preencher.</p>}
          {characters.map((item) => <button key={item.id} className={item.id === character.id ? "character-item active" : "character-item"} onClick={() => chooseCharacter(item)}><span className="portrait-seal">{(item.name || "?")[0]}</span><span><strong>{item.name || "Sem nome"}</strong><small>{item.clan || "Linhagem indefinida"}</small></span></button>)}
        </div>
        <div className="step-nav"><span>CRIAÇÃO</span>{STEPS.map((item, index) => <button key={item.name} className={index === step ? "active" : index < step ? "done" : ""} onClick={() => { setStep(index); setMobileNav(false); }}><item.icon size={16} /><span>{item.name}</span>{index < step && <Check size={14} />}</button>)}</div>
        <a className="rulebook-link" href="#sources"><BookOpen size={16} /> Fontes e regras</a>
      </aside>

      <section className="editor">
        <div className="editor-kicker"><span>ETAPA {step + 1} DE {STEPS.length}</span><span>{Math.round((step + 1) / STEPS.length * 100)}% DO PERCURSO</span></div>
        <div className="progress-track"><span style={{ width: `${(step + 1) / STEPS.length * 100}%` }} /></div>

        {step === 0 && <Section title="Quem você deixou para trás?" subtitle="Comece pela pessoa. Os números vêm depois.">
          <div className="form-grid"><Field label="Nome atual" value={character.name} onChange={(v) => setTop("name", v)} placeholder="Como a noite o conhece" /><Field label="Nome mortal" value={character.data.mortalName} onChange={(v) => setData("mortalName", v)} placeholder="Nome antes do Abraço" /><Field wide label="Conceito central" value={character.concept} onChange={(v) => setTop("concept", v)} placeholder="Ex.: legista que conversa com os mortos" /><Field label="Crônica" value={character.data.chronicle} onChange={(v) => setData("chronicle", v)} placeholder="Nome da crônica" /><Field label="Ano do Abraço" value={character.data.embraceYear} onChange={(v) => setData("embraceYear", v)} placeholder="Ex.: 2012" /><Field wide label="Senhor" value={character.data.sire} onChange={(v) => setData("sire", v)} placeholder="Quem concedeu a maldição?" /></div>
          <RuleNote>O conceito deve orientar suas escolhas sem aprisionar o personagem. O Senhor será ligado ao futuro Mapa de Relacionamentos.</RuleNote>
        </Section>}

        {step === 1 && <Section title="O Sangue carrega uma herança" subtitle="Escolha uma linhagem oficial ou escreva a sua própria.">
          <div className="source-filter"><span>FONTES ATIVAS</span><button className="source-chip active">Livro Básico V5</button><button className="source-chip chicago">Chicago by Night</button></div>
          <div className="clan-grid">{CLANS.map(([name, source, disciplines]) => <button key={name} className={character.clan === name ? "clan-card selected" : "clan-card"} onClick={() => { setTop("clan", name); setTop("sourcebook", source); }}><div><strong>{name}</strong><em className={source === "chicago_by_night_v5" ? "source chicago" : "source"}>{source === "chicago_by_night_v5" ? "CHICAGO" : "BÁSICO"}</em></div><p>{disciplines}</p></button>)}<button className={character.clan === "Personalizado" ? "clan-card selected custom" : "clan-card custom"} onClick={() => { setTop("clan", "Personalizado"); setTop("sourcebook", "custom"); }}><div><strong>Personalizado</strong><em className="source custom">HOMEBREW</em></div><p>Defina linhagem, Disciplinas e regras livremente.</p></button></div>
          {character.clan === "Personalizado" && <Field wide label="Nome da linhagem" value={character.data.customClan} onChange={(v) => setData("customClan", v)} placeholder="Nome do Clã ou linhagem" />}
          <div className="form-grid compact"><label className="field"><span>Categoria de idade</span><select value={character.data.ageCategory} onChange={(e) => setData("ageCategory", e.target.value)}><option>Criança da Noite</option><option>Neófito</option><option>Ancilla</option><option>Personalizada</option></select></label><Field label="Geração" value={character.data.generation} onChange={(v) => setData("generation", v)} /><label className="field"><span>Potência de Sangue</span><Dots label="Potência de Sangue" max={5} value={character.data.bloodPotency} onChange={(v) => setData("bloodPotency", v)} /></label></div>
        </Section>}

        {step === 2 && <Section title="Defina suas capacidades" subtitle="Distribua 1 Atributo em 4, 3 em 3, 4 em 2 e 1 em 1.">
          <div className="attribute-summary"><span className={attrCounts[4] === 1 ? "ok" : ""}>Nível 4 <b>{attrCounts[4] || 0}/1</b></span><span className={attrCounts[3] === 3 ? "ok" : ""}>Nível 3 <b>{attrCounts[3] || 0}/3</b></span><span className={attrCounts[2] === 4 ? "ok" : ""}>Nível 2 <b>{attrCounts[2] || 0}/4</b></span><span className={attrCounts[1] === 1 ? "ok" : ""}>Nível 1 <b>{attrCounts[1] || 0}/1</b></span></div>
          <TraitGroup title="FÍSICOS" names={ATTRIBUTES.slice(0, 3)} values={character.data.attributes} onChange={(n, v) => setNested("attributes", n, Math.max(1, v))} />
          <TraitGroup title="SOCIAIS" names={ATTRIBUTES.slice(3, 6)} values={character.data.attributes} onChange={(n, v) => setNested("attributes", n, Math.max(1, v))} />
          <TraitGroup title="MENTAIS" names={ATTRIBUTES.slice(6)} values={character.data.attributes} onChange={(n, v) => setNested("attributes", n, Math.max(1, v))} />
          <div className="derived"><div><span>Vitalidade</span><strong>{(character.data.attributes.Vigor || 1) + 3}</strong><small>Vigor + 3</small></div><div><span>Força de Vontade</span><strong>{(character.data.attributes.Autocontrole || 1) + (character.data.attributes.Determinação || 1)}</strong><small>Autocontrole + Determinação</small></div></div>
        </Section>}

        {step === 3 && <Section title="O que você aprendeu?" subtitle="Escolha um modelo e distribua suas Habilidades.">
          <div className="preset-row">{["Pau pra toda obra", "Equilibrado", "Especialista", "Livre"].map((p) => <button key={p} onClick={() => setData("skillPreset", p)} className={character.data.skillPreset === p ? "preset active" : "preset"}>{p}</button>)}</div>
          <div className="skill-grid">{SKILLS.map((name) => <div className="trait" key={name}><span>{name}</span><Dots label={name} value={character.data.skills[name] || 0} onChange={(v) => setNested("skills", name, v)} /></div>)}</div>
          <RuleNote>Especializações ficam separadas do valor-base. Você poderá descrevê-las nas notas da revisão enquanto o catálogo detalhado é ampliado.</RuleNote>
        </Section>}

        {step === 4 && <Section title="Como você caça?" subtitle="O Tipo de Predador modifica a ficha, mas não limita outras formas de alimentação.">
          <div className="predator-list">{PREDATORS.map((name) => <button key={name} onClick={() => setData("predator", name)} className={character.data.predator === name ? "predator selected" : "predator"}><span className="radio-mark" /><span><strong>{name}</strong><small>{predatorDescription(name)}</small></span></button>)}</div>
          <div className="form-grid"><TextArea label="Vantagens — 7 pontos" value={character.data.advantages} onChange={(v) => setData("advantages", v)} placeholder="Uma por linha. Ex.: Recursos ••" /><TextArea label="Defeitos — 2 pontos + Predador" value={character.data.flaws} onChange={(v) => setData("flaws", v)} placeholder="Uma por linha. Ex.: Inimigo •" /></div>
          <RuleNote>Pacotes de Predador aparecem como orientação. Uma escolha homebrew continua válida e será marcada como personalizada.</RuleNote>
        </Section>}

        {step === 5 && <Section title="O que ainda o torna humano?" subtitle="Cada Convicção deve estar ligada a um Pilar mortal.">
          <div className="form-grid"><TextArea label="Convicções" value={character.data.convictions} onChange={(v) => setData("convictions", v)} placeholder="Uma por linha. Ex.: Jamais abandone alguém que confia em você" /><TextArea label="Pilares correspondentes" value={character.data.touchstones} onChange={(v) => setData("touchstones", v)} placeholder="Na mesma ordem. Ex.: Helena, irmã mais nova" /><Field wide label="Ambição" value={character.data.ambition} onChange={(v) => setData("ambition", v)} placeholder="Grande objetivo de longo prazo" /><Field wide label="Desejo" value={character.data.desire} onChange={(v) => setData("desire", v)} placeholder="Objetivo imediato desta noite" /><label className="field wide"><span>Humanidade</span><Dots label="Humanidade" max={10} min={1} value={character.data.humanity} onChange={(v) => setData("humanity", v)} /></label></div>
        </Section>}

        {step === 6 && <Section title="Revise antes da primeira noite" subtitle="Alertas orientam a criação; eles nunca apagam suas escolhas.">
          <div className="review-identity"><div className="review-seal">{(character.name || "?")[0]}</div><div><span>{character.concept || "CONCEITO NÃO DEFINIDO"}</span><h2>{character.name || "Sem nome"}</h2><p>{character.clan === "Personalizado" ? character.data.customClan || "Linhagem personalizada" : character.clan || "Sem Clã"} · {character.data.generation} Geração · Humanidade {character.data.humanity}</p></div><em className={`source ${selectedSource === "custom" ? "custom" : selectedSource === "chicago_by_night_v5" ? "chicago" : ""}`}>{selectedSource === "custom" ? "HOMEBREW" : selectedSource === "chicago_by_night_v5" ? "CHICAGO" : "BÁSICO"}</em></div>
          <div className="review-grid"><div className="review-card"><span>PREDADOR</span><strong>{character.data.predator || "Não escolhido"}</strong></div><div className="review-card"><span>VITALIDADE</span><strong>{(character.data.attributes.Vigor || 1) + 3}</strong></div><div className="review-card"><span>FORÇA DE VONTADE</span><strong>{(character.data.attributes.Autocontrole || 1) + (character.data.attributes.Determinação || 1)}</strong></div><div className="review-card"><span>POTÊNCIA DE SANGUE</span><strong>{character.data.bloodPotency}</strong></div></div>
          <TextArea label="Notas livres, especializações e homebrews" value={character.data.notes} onChange={(v) => setData("notes", v)} placeholder="Registre exceções, detalhes narrativos e regras próprias da crônica." />
          <div className="final-checks">{validations.map((v) => <div key={v.text} className={v.ok ? "valid" : "warning"}>{v.ok ? <Check size={17} /> : <CircleAlert size={17} />}<span>{v.text}</span><b>{v.ok ? "Concluído" : "Revisar"}</b></div>)}</div>
        </Section>}

        <div className="editor-actions"><button disabled={step === 0} className="secondary-action" onClick={() => setStep(Math.max(0, step - 1))}><ChevronLeft size={18} /> Voltar</button>{step < STEPS.length - 1 ? <button className="primary-action" onClick={() => setStep(step + 1)}>Continuar <ChevronRight size={18} /></button> : <button className="primary-action" onClick={() => save(character)}><Save size={17} /> Salvar ficha</button>}</div>
      </section>

      <aside className="right-rail">
        <div className="completion"><div><span>CRIAÇÃO</span><strong>{completed}/{validations.length}</strong></div><div className="completion-ring" style={{ "--progress": `${completed / validations.length * 360}deg` } as React.CSSProperties}><span>{Math.round(completed / validations.length * 100)}%</span></div></div>
        <div className="validation-list">{validations.map((v) => <div key={v.text} className={v.ok ? "passed" : ""}>{v.ok ? <Check size={15} /> : <span />}{v.text}</div>)}</div>
        <div className="source-panel" id="sources"><span>FONTE DA ESCOLHA ATUAL</span><strong>{selectedSource === "custom" ? "Conteúdo personalizado" : selectedSource === "chicago_by_night_v5" ? "Chicago by Night V5" : "Livro Básico V5"}</strong><p>{selectedSource === "custom" ? "A regra original permanece preservada." : "Regras oficiais são identificadas por livro e podem receber overrides da crônica."}</p></div>
        <div className="freedom-note"><Sparkles size={17} /><div><strong>Sua crônica, suas regras</strong><p>Você pode continuar mesmo com alertas. O sistema orienta, não determina.</p></div></div>
      </aside>
    </div>
    {mobileNav && <button className="nav-backdrop" onClick={() => setMobileNav(false)} aria-label="Fechar navegação"><X /></button>}
  </main>;
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <div className="section"><div className="section-title"><h1>{title}</h1><p>{subtitle}</p></div>{children}</div>; }
function RuleNote({ children }: { children: React.ReactNode }) { return <div className="rule-note"><BookOpen size={18} /><p><strong>Nota de regra</strong>{children}</p></div>; }
function TraitGroup({ title, names, values, onChange }: { title: string; names: string[]; values: Values; onChange: (n: string, v: number) => void }) { return <div className="trait-group"><h3>{title}</h3>{names.map((name) => <div className="trait" key={name}><span>{name}</span><Dots label={name} min={1} value={values[name] || 1} onChange={(v) => onChange(name, v)} /></div>)}</div>; }
function predatorDescription(name: string) { const map: Record<string, string> = { Consensualista: "Busca consentimento para se alimentar", Fazendeiro: "Evita sangue humano e caça animais", Osíris: "Alimenta-se de seguidores e devotos", Sacoleiro: "Depende de sangue preservado", Sandman: "Caça vítimas adormecidas", Sanguessuga: "Alimenta-se de outros vampiros", "Scene Queen": "Caça dentro de uma subcultura", Sereia: "Usa sedução para se aproximar", Trinchador: "Oculta a caça entre família e amigos", "Vira-lata": "Caça por assalto e intimidação" }; return map[name]; }
