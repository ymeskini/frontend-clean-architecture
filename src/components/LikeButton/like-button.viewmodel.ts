import { createSelector } from "@reduxjs/toolkit";

import { selectAuthUserId } from "@/lib/auth/reducer";
import { selectLikesByMessage } from "@/lib/timelines/slices/likes.slice";
import { RootState } from "@/lib/create-store";

export const createLikeButtonViewModel = ({
  messageId,
}: {
  messageId: string;
}) =>
  createSelector(
    [selectAuthUserId, (state: RootState) => selectLikesByMessage(messageId, state)],
    (authUserId, likes) => {
      const authUserLike = likes.find((l) => l.userId === authUserId);
      return {
        likesCount: likes.length,
        authUserLike,
      };
    }
  );
