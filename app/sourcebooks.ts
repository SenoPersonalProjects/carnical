export const SOURCEBOOKS = [
  { value: "core_v5_ptbr", libraryId: "core-v5", label: "Livro Básico V5", short: "BÁSICO" },
  { value: "chicago_by_night_v5", libraryId: "chicago-by-night-v5", label: "Chicago by Night V5", short: "CHICAGO" },
  { value: "camarilla_v5", libraryId: "camarilla-v5", label: "Camarilla V5", short: "CAMARILLA" },
  { value: "anarch_v5", libraryId: "anarch-v5", label: "Anarch V5", short: "ANARCH" },
  { value: "cultos_deuses_sangue_v5", libraryId: "cultos-deuses-sangue-v5", label: "Cultos dos Deuses de Sangue V5", short: "CULTOS" },
  { value: "companion_v5", libraryId: "companion-v5", label: "Companion V5", short: "COMPANION" },
  { value: "sabbat_black_hand_v5", libraryId: "sabbat-black-hand-v5", label: "Sabbat: The Black Hand V5", short: "SABBAT" },
  { value: "players_guide_v5", libraryId: "players-guide-v5", label: "Player’s Guide V5", short: "PLAYER’S GUIDE" },
  { value: "gehenna_war_v5", libraryId: "gehenna-war-v5", label: "Gehenna War V5", short: "GEHENNA" },
  { value: "sigilos_de_sangue_v5", libraryId: "sigilos-de-sangue-v5", label: "Sigilos de Sangue V5", short: "SIGILOS" },
  { value: "let_the_streets_run_red_v5", libraryId: "let-the-streets-run-red-v5", label: "Let the Streets Run Red V5", short: "STREETS RUN RED" },
] as const;

export function sourcebookLabel(value: string, locale:"pt-BR"|"en"="pt-BR") {
  const en=locale==="en";
  if(value.startsWith("clan:"))return en?"Granted by clan":"Concedido pelo clã";
  if(value.startsWith("predator-required:"))return en?"Required by Predator Type":"Exigido pelo Predador";
  if(value.startsWith("predator:"))return en?"Granted by Predator Type":"Concedido pelo Predador";
  if(value==="xp")return en?"XP purchase":"Compra com XP";
  if(value==="custom")return en?"Custom content":"Conteúdo personalizado";
  const source=SOURCEBOOKS.find(source => source.value === value||source.libraryId===value);
  const english:Record<string,string>={core_v5_ptbr:"V5 Corebook",cultos_deuses_sangue_v5:"Cults of the Blood Gods V5",sigilos_de_sangue_v5:"Blood Sigils V5"};
  return source?(en?english[source.value]||source.label:source.label):value;
}

export function sourcebookShort(value: string) {
  if(value.startsWith("clan:"))return "CLÃ";
  return SOURCEBOOKS.find(source => source.value === value)?.short ?? (value === "custom" ? "HOMEBREW" : value);
}
