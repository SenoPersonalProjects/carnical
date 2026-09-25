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
] as const;

export function sourcebookLabel(value: string) {
  return SOURCEBOOKS.find(source => source.value === value)?.label ?? (value === "custom" ? "Conteúdo personalizado" : value);
}

export function sourcebookShort(value: string) {
  return SOURCEBOOKS.find(source => source.value === value)?.short ?? (value === "custom" ? "HOMEBREW" : value);
}
