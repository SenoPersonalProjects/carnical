import { chatGPTSignOutPath, getChatGPTUser, requireChatGPTUser } from "../chatgpt-auth";
import RulesReader from "./rules-reader";
import library from "./rules-data.json";

export const dynamic = "force-dynamic";

export default async function RulesPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const books=library.books.map(book=>({...book,chapters:book.chapters.map(chapter=>({id:chapter.id,title:chapter.title,section:chapter.section}))}));
  const params=await searchParams,requestedBook=typeof params.book==="string"?params.book:"",requestedChapter=typeof params.chapter==="string"?params.chapter:"",requestedQuery=typeof params.q==="string"?params.q:"";
  const initialBook=books.find(book=>book.id===requestedBook)??books[0];
  const initialChapterId=initialBook.chapters.some(chapter=>chapter.id===requestedChapter)?requestedChapter:initialBook.chapters[0].id;
  const readerProps={books,initialBookId:initialBook.id,initialChapterId,initialQuery:requestedQuery};
  const currentUser = await getChatGPTUser();
  if (!currentUser && process.env.NODE_ENV === "development") {
    return <RulesReader {...readerProps} displayName="Prévia local" signOutPath="/" />;
  }
  const user = currentUser ?? await requireChatGPTUser("/rules");
  return <RulesReader {...readerProps} displayName={user.fullName ?? user.email.split("@")[0]} signOutPath={chatGPTSignOutPath("/rules")} />;
}
