import { createSelector } from "@reduxjs/toolkit";

import { selectAuthUserId } from "@/lib/auth/reducer";
import {
  selectIsProfilePictureUploading,
  selectUser,
} from "@/lib/users/slices/users.slice";
import { RootState } from "@/lib/create-store";

export const createProfileLayoutViewModel = ({ userId }: { userId: string }) =>
  createSelector(
    [
      (state: RootState) => selectUser(userId, state),
      selectAuthUserId,
      selectIsProfilePictureUploading,
    ],
    (user, authUserId, isProfilePictureUploading) => {
      const isAuthUserProfile = authUserId === userId;

      return {
        username: user?.username ?? "Unknown",
        profilePicture: user?.profilePicture ?? "",
        isAuthUserProfile,
        timelineLink: `/u/${userId}`,
        followingLink: `/u/${userId}/following`,
        followersLink: `/u/${userId}/followers`,
        tabs: {
          following: `Following (${user?.followingCount ?? 0})`,
          followers: `Followers (${user?.followersCount ?? 0})`,
        },
        profilePictureUploading: isAuthUserProfile && isProfilePictureUploading,
      };
    }
  );
