"use client";
import { usePreferredLocale, translateUi } from "./preferences";
export function UiText({text}:{text:string}) { const locale=usePreferredLocale();return `${text.match(/^\s*/)?.[0]||""}${translateUi(text.trim(),locale)}${text.match(/\s*$/)?.[0]||""}`; }
export function useUiText() { const locale=usePreferredLocale();return (text:string)=>translateUi(text,locale); }
