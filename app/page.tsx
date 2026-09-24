import { chatGPTSignOutPath, getChatGPTUser, requireChatGPTUser } from "./chatgpt-auth";
import CharacterStudio from "./character-studio";

export const dynamic = "force-dynamic";

export default async function Home() {
  const currentUser = await getChatGPTUser();
  if (!currentUser && process.env.NODE_ENV === "development") {
    return <CharacterStudio displayName="Prévia local" signOutPath="/" previewMode />;
  }
  const user = currentUser ?? await requireChatGPTUser("/");
  return (
    <CharacterStudio displayName={user.fullName ?? user.email.split("@")[0]} signOutPath={chatGPTSignOutPath("/")} />
  );
}
