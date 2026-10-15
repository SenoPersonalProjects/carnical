import {notFound} from "next/navigation";
import {getChatGPTUser,requireChatGPTUser} from "../../chatgpt-auth";
import raw from "../../content/source-pages.json";
import SourceViewer,{type SourceBook} from "./source-viewer";
export const dynamic="force-dynamic";
export default async function SourcePage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const params=await searchParams,book=(raw.books as SourceBook[]).find(book=>book.id===params.book),page=Number(params.page);
  if(!book||!book.pages.some(item=>item.pdfPage===page))notFound();
  if(process.env.NODE_ENV!=="development"||await getChatGPTUser())await requireChatGPTUser(`/rules/source?book=${book.id}&page=${page}`);
  return <SourceViewer book={book} initialPage={page}/>;
}
