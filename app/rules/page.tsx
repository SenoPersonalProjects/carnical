import { chatGPTSignOutPath, getChatGPTUser, requireChatGPTUser } from "../chatgpt-auth";
import RulesReader from "./rules-reader";
import RulesCatalog from "./rules-catalog";
import library from "./rules-data.json";

export const dynamic = "force-dynamic";

export default async function RulesPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const books=library.books.map(book=>({...book,chapters:book.chapters.map(chapter=>({id:chapter.id,title:chapter.title,section:chapter.section}))}));
  const params=await searchParams,requestedBook=typeof params.book==="string"?params.book:"",requestedChapter=typeof params.chapter==="string"?params.chapter:"",requestedQuery=typeof params.q==="string"?params.q:"";
  const initialBook=books.find(book=>book.id===requestedBook);
  const currentUser = await getChatGPTUser();
  let displayName:string,signOutPath:string;
  if (!currentUser && process.env.NODE_ENV === "development") {
    displayName="Prévia local";
    signOutPath="/";
  } else {
    const user = currentUser ?? await requireChatGPTUser("/rules");
    displayName=user.fullName ?? user.email.split("@")[0];
    signOutPath=chatGPTSignOutPath("/rules");
  }
  if (!initialBook) return <RulesCatalog books={books} initialQuery={requestedQuery} displayName={displayName} signOutPath={signOutPath}/>;
  const initialChapterId=initialBook.chapters.some(chapter=>chapter.id===requestedChapter)?requestedChapter:initialBook.chapters[0].id;
  return <RulesReader books={books} initialBookId={initialBook.id} initialChapterId={initialChapterId} initialQuery={requestedQuery} displayName={displayName} signOutPath={signOutPath}/>;
}
