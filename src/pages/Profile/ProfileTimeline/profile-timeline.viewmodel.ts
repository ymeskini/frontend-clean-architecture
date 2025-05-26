import { format as timeAgo } from "timeago.js";
import { createSelector } from "@reduxjs/toolkit";

import { AppDispatch, RootState } from "@/lib/create-store";
import {
  selectErrorMessage,
  selectMessagesOrderedByPublicationDateDesc,
} from "@/lib/timelines/slices/messages.slice";
import {
  selectIsUserTimelineLoading,
  selectTimelineForUser,
} from "@/lib/timelines/slices/timelines.slice";
import { postMessage } from "@/lib/timelines/usecases/post-message.usecase";
import { selectUser } from "@/lib/users/slices/users.slice";
import { Timeline } from "@/lib/timelines/model/timeline.entity";
import { Message } from "@/lib/timelines/model/message.entity";
import { User } from "@/lib/users/model/user.entity";

export enum ProfileTimelineViewModelType {
  NoTimeline = "NO_TIMELINE",
  LoadingTimeline = "LOADING_TIMELINE",
  EmptyTimeline = "EMPTY_TIMELINE",
  WithMessages = "TIMELINE_WITH_MESSAGES",
}

type TimelineModelArgs = {
  userId: string;
  getNow: () => string;
  dispatch: AppDispatch;
};

type MessageViewModel = {
  id: string;
  userId: string;
  username: string;
  profilePictureUrl: string;
  publishedAt: string;
  text: string;
  failedToBePosted: boolean;
  backgroundColor: string;
  errorMessage?: string;
  retryToPostMessage: () => void;
};

export type ProfileTimelineData =
  | { type: ProfileTimelineViewModelType.NoTimeline }
  | { type: ProfileTimelineViewModelType.LoadingTimeline; info: string }
  | { type: ProfileTimelineViewModelType.EmptyTimeline; info: string }
  | {
      type: ProfileTimelineViewModelType.WithMessages;
      id: string;
      messages: MessageViewModel[];
    };

export type ProfileTimelineSelectorResult = {
  timeline: ProfileTimelineData;
};

export const createProfileTimelineViewModel = ({
  userId,
  getNow,
  dispatch,
}: TimelineModelArgs) => {
  const selectTimelineEntity = (state: RootState): Timeline | undefined =>
    selectTimelineForUser(userId, state);

  const selectIsLoading = (state: RootState): boolean =>
    selectIsUserTimelineLoading(userId, state);

  const selectOrderedDomainMessages = createSelector(
    [selectTimelineEntity, (state: RootState) => state],
    (timeline, rootState): Message[] => {
      if (!timeline || timeline.messages.length === 0) {
        return [];
      }
      return selectMessagesOrderedByPublicationDateDesc(
        timeline.messages,
        rootState
      );
    }
  );

  const selectMessagesViewModel = createSelector(
    [
      selectOrderedDomainMessages,
      selectTimelineEntity,
      (state: RootState) => state,
      () => getNow,
      () => dispatch,
    ],
    (
      orderedMessages,
      timeline,
      rootState,
      resolveGetNow,
      resolveDispatch
    ): MessageViewModel[] => {
      if (!timeline || orderedMessages.length === 0) {
        return [];
      }
      const currentTime = resolveGetNow();

      return orderedMessages
        .map((msg) => {
          const author = selectUser(msg.author, rootState) as User | undefined;
          if (!author) {
            return null;
          }

          const maybeErrorMessage = selectErrorMessage(msg.id, rootState);
          const failedToBePosted = maybeErrorMessage !== undefined;


          return {
            id: msg.id,
            userId: msg.author,
            username: author.username,
            profilePictureUrl: author.profilePicture,
            publishedAt: timeAgo(msg.publishedAt, "", {
              relativeDate: currentTime,
            }),
            text: msg.text,
            failedToBePosted,
            backgroundColor: failedToBePosted ? "red.50" : "white",
            errorMessage: maybeErrorMessage,
            retryToPostMessage: () =>
              resolveDispatch(
                postMessage({
                  messageId: msg.id,
                  text: msg.text,
                  timelineId: timeline.id,
                })
              ),
          };
        })
        .filter(Boolean) as MessageViewModel[];
    }
  );

  return createSelector(
    [
      selectIsLoading,
      selectTimelineEntity,
      selectMessagesViewModel,
    ],
    (
      isLoading,
      timelineEntity,
      messages
    ): ProfileTimelineSelectorResult => {
      if (isLoading) {
        return {
          timeline: {
            type: ProfileTimelineViewModelType.LoadingTimeline,
            info: "Loading...",
          },
        };
      }

      if (!timelineEntity) {
        return {
          timeline: { type: ProfileTimelineViewModelType.NoTimeline },
        };
      }

      if (timelineEntity.messages.length === 0) {
        return {
          timeline: {
            type: ProfileTimelineViewModelType.EmptyTimeline,
            info: "There is no messages yet",
          },
        };
      }

      return {
        timeline: {
          id: timelineEntity.id,
          type: ProfileTimelineViewModelType.WithMessages,
          messages: messages,
        },
      };
    }
  );
};
