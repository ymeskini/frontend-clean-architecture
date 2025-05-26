import { createSelector } from "@reduxjs/toolkit";

import { selectAuthUser } from "@/lib/auth/reducer";

const MAX_CHARACTERS = 100;

export const createAddPostFormViewModel =
  ({
    charactersCount,
  }: {
    charactersCount: number;
  }) =>
  createSelector([selectAuthUser], (authUser) => {
    const hasReachedMaxCount = charactersCount > MAX_CHARACTERS;
    const canSubmit = charactersCount !== 0 && !hasReachedMaxCount;

    const inputBackroundColor = hasReachedMaxCount ? "red.300" : "white";
    const charCounterColor = hasReachedMaxCount ? "red.300" : "muted";

    return {
      canSubmit,
      inputBackroundColor,
      charCounterColor,
      remaining: MAX_CHARACTERS - charactersCount,
      authUser: {
        profilePicture: authUser?.profilePicture ?? "",
        profileUrl: `/u/${authUser?.id}`,
      },
    };
  });
