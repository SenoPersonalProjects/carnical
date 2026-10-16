/** Livro Básico V5, p. 214 (PDF p. 216). Initial age bands are separate. */
export function bloodPotencyRange(generation:string|undefined,clan?:string):{min:number;max:number}|undefined {
  if(clan==="Sangue-Ralo")return {min:0,max:0};
  const match=generation?.trim().match(/^(\d{1,2})(?:\s*(?:ª|º|a|st|nd|rd|th))?$/i);
  if(!match)return undefined;
  const value=Number(match[1]);
  if(value===4)return {min:5,max:10};
  if(value===5)return {min:4,max:9};
  if(value===6)return {min:3,max:8};
  if(value===7)return {min:3,max:7};
  if(value===8)return {min:2,max:6};
  if(value===9)return {min:2,max:5};
  if(value===10||value===11)return {min:1,max:4};
  if(value===12||value===13)return {min:1,max:3};
  if(value>=14&&value<=16)return {min:0,max:0};
  return undefined;
}

export function canIncreaseBloodPotency(current:number,generation:string|undefined,clan?:string):boolean {
  const range=bloodPotencyRange(generation,clan);
  return !!range&&Number.isInteger(current)&&current>=range.min&&current<range.max;
}
