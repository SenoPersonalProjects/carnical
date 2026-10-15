import fs from 'node:fs';import {execFileSync} from 'node:child_process';import ts from 'typescript';
const list=execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split('\n').filter(file=>file.endsWith('.tsx'));
for(const file of list){
 const original=execFileSync('git',['show',`HEAD:${file}`],{encoding:'utf8'}),source=fs.readFileSync(file,'utf8'),oldTree=ts.createSourceFile(file,original,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),current=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),strings=new Map(),edits=[];
 function collect(node){if(ts.isJsxText(node)){const normalized=node.text.replace(/\s+/g,' '),key=normalized.trim();if(key){const queue=strings.get(key)||[];queue.push(normalized);strings.set(key,queue)}}ts.forEachChild(node,collect)}collect(oldTree);
 function update(node){if(ts.isJsxSelfClosingElement(node)&&node.tagName.getText(current)==='UiText'){const attr=node.attributes.properties.find(p=>ts.isJsxAttribute(p)&&p.name.getText(current)==='text');if(attr?.initializer&&ts.isStringLiteral(attr.initializer)){const queue=strings.get(attr.initializer.text.trim()),value=queue?.shift();if(value)edits.push({start:attr.initializer.getStart(current),end:attr.initializer.end,text:JSON.stringify(value)})}}ts.forEachChild(node,update)}update(current);
 let result=source;for(const edit of edits.sort((a,b)=>b.start-a.start))result=result.slice(0,edit.start)+edit.text+result.slice(edit.end);fs.writeFileSync(file,result);
}
console.log('Static JSX spacing preserved.');
