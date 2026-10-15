import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
const root="app",strings=new Set(),files=[];
function list(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory()){if(!["auth","export","content"].includes(entry.name))list(file)}else if(file.endsWith(".tsx")&&!file.endsWith("preferences.tsx")&&!file.endsWith("ui-text.tsx"))files.push(file)}}
list(root);let changes=0;
for(const file of files){
 let text=fs.readFileSync(file,"utf8");if(!text.includes("import { UiText"))continue;
 const source=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),edits=[];
 function branch(node){
  if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node)){if(node.text.trim()&&/[A-Za-zÀ-ÿ]/.test(node.text)){strings.add(node.text);edits.push({start:node.getStart(source),end:node.end,text:`<UiText text=${JSON.stringify(node.text)}/>`})}}
  else if(ts.isConditionalExpression(node)){branch(node.whenTrue);branch(node.whenFalse)}
  else if(ts.isBinaryExpression(node)&&node.operatorToken.kind===ts.SyntaxKind.AmpersandAmpersandToken)branch(node.right);
 }
 function visit(node){if(ts.isJsxExpression(node)&&node.expression&&!ts.isJsxAttribute(node.parent)&&!ts.isJsxSpreadAttribute(node.parent))branch(node.expression);ts.forEachChild(node,visit)}
 visit(source);for(const edit of edits.sort((a,b)=>b.start-a.start))text=text.slice(0,edit.start)+edit.text+text.slice(edit.end);
 if(edits.length){fs.writeFileSync(file,text);changes+=edits.length}
}
fs.writeFileSync("D:/DEV/2026/carnical-content-work/ui-branch-strings.json",JSON.stringify([...strings],null,2));console.log(`${changes} rendered labels wrapped; personal values and saved identifiers unchanged.`);
