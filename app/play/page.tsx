import { chatGPTSignOutPath, getChatGPTUser, requireChatGPTUser } from "../chatgpt-auth";
import GameSheet from "./game-sheet";

export const dynamic="force-dynamic";
export default async function PlayPage(){
  const currentUser=await getChatGPTUser();
  if(!currentUser&&process.env.NODE_ENV==="development")return <GameSheet displayName="Prévia local" signOutPath="/"/>;
  const user=currentUser??await requireChatGPTUser("/play");
  return <GameSheet displayName={user.fullName??user.email.split("@")[0]} signOutPath={chatGPTSignOutPath("/play")}/>;
}
