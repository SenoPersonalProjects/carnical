// Migrate static JSX copy to explicit component translations. Saved values stay canonical.
import fs from 'node:fs';import path from 'node:path';import ts from 'typescript';
const root=path.resolve('app'),keys=new Set();
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(dir,entry.name)):entry.name.endsWith('.tsx')?[path.join(dir,entry.name)]:[])}
for(const file of files(root)){
 if(file.endsWith('preferences.tsx')||file.includes(`${path.sep}export${path.sep}`)||file.endsWith('ui-text.tsx'))continue;
 const source=fs.readFileSync(file,'utf8'),tree=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),edits=[],hooks=new Set();let textUsed=false;
 if(source.includes('import { UiText')||source.includes('import { useUiText')||file.includes(`${path.sep}auth${path.sep}`))continue;
 function owner(node){for(let p=node.parent;p;p=p.parent)if(ts.isFunctionDeclaration(p)&&p.name&&/^[A-Z]/.test(p.name.text))return p;return null}
 function walk(node){
  if(ts.isJsxText(node)){
   const value=node.text.replace(/\s+/g,' ').trim();
   if(value&&/[A-Za-zÀ-ÿ]/.test(value)&&!value.includes('://')){
    keys.add(value);textUsed=true;edits.push({start:node.getStart(tree),end:node.end,text:`<UiText text=${JSON.stringify(value)}/>`});
    const parent=node.parent;
    if(ts.isJsxElement(parent)&&parent.openingElement.tagName.getText(tree)==='option'&&!parent.openingElement.attributes.properties.some(a=>ts.isJsxAttribute(a)&&a.name.getText(tree)==='value'))edits.push({start:parent.openingElement.end-1,end:parent.openingElement.end-1,text:` value=${JSON.stringify(value)}`});
   }
  }
  if(ts.isJsxAttribute(node)&&['placeholder','title','aria-label'].includes(node.name.getText(tree))&&node.initializer&&ts.isStringLiteral(node.initializer)){
   const component=owner(node),value=node.initializer.text;if(component){keys.add(value);hooks.add(component);edits.push({start:node.initializer.getStart(tree),end:node.initializer.end,text:`{t(${JSON.stringify(value)})}`})}
  }
  ts.forEachChild(node,walk);
 }
 walk(tree);if(!edits.length)continue;
 for(const component of hooks)edits.push({start:component.body.getStart(tree)+1,end:component.body.getStart(tree)+1,text:'\n  const t=useUiText();\n'});
 let relative=path.relative(path.dirname(file),path.join(root,'ui-text')).replaceAll('\\','/');if(!relative.startsWith('.'))relative='./'+relative;
 const names=[...(textUsed?['UiText']:[]),...(hooks.size?['useUiText']:[])];
 const importAt=source.startsWith('"use client";')?'"use client";'.length:0;edits.push({start:importAt,end:importAt,text:`\nimport { ${names.join(', ')} } from ${JSON.stringify(relative)};\n`});
 let result=source;for(const edit of edits.sort((a,b)=>b.start-a.start))result=result.slice(0,edit.start)+edit.text+result.slice(edit.end);fs.writeFileSync(file,result);
}
fs.writeFileSync('D:/DEV/2026/carnical-content-work/ui-strings.json',JSON.stringify([...keys],null,2));console.log(`${keys.size} static UI strings migrated`);
