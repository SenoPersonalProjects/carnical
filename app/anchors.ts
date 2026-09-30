export type Anchor={touchstone:string;conviction:string};
export function readAnchors(touchstones:string,convictions:string):Anchor[]{
  const pillars=touchstones.split("\n"),beliefs=convictions.split("\n");
  return Array.from({length:Math.max(pillars.length,beliefs.length,1)},(_,i)=>({touchstone:pillars[i]??"",conviction:beliefs[i]??""}));
}
