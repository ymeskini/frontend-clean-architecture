import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "@/lib/create-store";
import {
  selectAreFollowingOfLoading,
  selectFollowingOf,
} from "@/lib/users/slices/relationships.slice";
import { selectUser, selectUsersState } from "@/lib/users/slices/users.slice";

export enum ProfileFollowingViewModelType {
  ProfileFollowingLoading = "PROFILE_FOLLOWING_LOADING",
  ProfileFollowingLoaded = "PROFILE_FOLLOWING_LOADED",
}

type FollowingUserViewModel = {
  id: string;
  username: string;
  followersCount: number;
  isFollowedByAuthUser: boolean;
  profilePicture: string;
  link: string;
};

type ProfileFollowingLoadingState = {
  type: ProfileFollowingViewModelType.ProfileFollowingLoading;
};

type ProfileFollowingLoadedState = {
  type: ProfileFollowingViewModelType.ProfileFollowingLoaded;
  following: FollowingUserViewModel[];
};

export type ProfileFollowingViewModel =
  | ProfileFollowingLoadingState
  | ProfileFollowingLoadedState;

export const createProfileFollowingViewModel = ({ of }: { of: string }) =>
  createSelector(
    [
      (state: RootState): boolean => selectAreFollowingOfLoading(of, state),
      (state: RootState): string[] => selectFollowingOf(of, state),
      selectUsersState,
    ],
    (
      areFollowingLoading,
      followingUserIds,
      usersState
    ): ProfileFollowingViewModel => {
      if (areFollowingLoading) {
        return {
          type: ProfileFollowingViewModelType.ProfileFollowingLoading,
        };
      }

      const mappedFollowing = followingUserIds
        .map((userId): FollowingUserViewModel | null => {
          const followedUser = selectUser(userId, {
            users: { users: usersState },
          } as RootState);

          if (!followedUser) {
            return null;
          }

          return {
            id: followedUser.id, // or userId
            username: followedUser.username,
            followersCount: followedUser.followersCount,
            isFollowedByAuthUser: followedUser.isFollowedByAuthUser,
            profilePicture: followedUser.profilePicture,
            link: `/u/${followedUser.id}`,
          };
        })
        .filter((user): user is FollowingUserViewModel => user !== null); // Type guard to remove nulls

      return {
        type: ProfileFollowingViewModelType.ProfileFollowingLoaded,
        following: mappedFollowing,
      };
    }
  );
