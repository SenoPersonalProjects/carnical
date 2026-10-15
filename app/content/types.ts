import type { Locale } from "../preferences";
export type ContentKind = "clan"|"clan-variant"|"predator"|"power"|"ritual"|"ceremony"|"formula"|"merit"|"flaw"|"background"|"loresheet";
export type RuleSection = { title:string; text:string };
export type ContentVersion = {
  level?:number;
  names?:Record<Locale,string>;
  id:string;book:string;sourceTitle:string;pages:Array<{pdfPage:number;printedPage:number|null}>;
  descriptions:Record<Locale,RuleSection[]>;
  pdfSha256?:string;sourceLanguage?:Locale;
  requirements?:{disciplines?:Record<string,number>;prerequisites?:string[];prerequisiteAlternatives?:string[][];clans?:string[];characterTypes?:Array<"vampire"|"ghoul"|"mortal">;creationOnly?:boolean;storytellerApproval?:boolean};
};
export type ContentEntry = {
  id:string;legacyIds?:string[];kind:ContentKind;names:Record<Locale,string>;aliases:string[];discipline?:string;level?:number;versions:ContentVersion[];
};
export type ContentResponse = { id:string;name:string;kind:ContentKind;source:string;sections:RuleSection[];versionId:string;pages:Array<{pdfPage:number;printedPage:number|null;url:string}>;versions:Array<{id:string;source:string}>;locale:Locale };
