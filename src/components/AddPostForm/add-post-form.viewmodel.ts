import { selectAuthUser } from "@/lib/auth/reducer";
import { RootState } from "@/lib/create-store";

export const createAddPostFormViewModel =
  ({
    maxCharacters,
    charactersCount,
    setCharactersCount,
  }: {
    maxCharacters: number;
    charactersCount: number;
    setCharactersCount: (newCharactersCount: number) => void;
  }) =>
  (state: RootState) => {
    const authUser = selectAuthUser(state);
    const hasReachedMaxCount = charactersCount > maxCharacters;
    const canSubmit = charactersCount !== 0 && !hasReachedMaxCount;

    const inputBackroundColor = hasReachedMaxCount ? "red.300" : "white";
    const charCounterColor = hasReachedMaxCount ? "red.300" : "muted";

    return {
      handleTextChange(newText: string) {
        setCharactersCount(newText.trim().length);
      },
      canSubmit,
      inputBackroundColor,
      charCounterColor,
      remaining: maxCharacters - charactersCount,
      authUser: {
        profilePicture: authUser?.profilePicture ?? "",
        profileUrl: `/u/${authUser?.id}`,
      },
    };
  };
