import { createSelector } from "@reduxjs/toolkit";
import { format as timeAgo } from "timeago.js";

import {
  selectAreNotificationsLoading,
  selectNotifications,
} from "@/lib/notifications/slices/notifications.slice";

export enum NotificationsViewModelType {
  NotificationsLoading = "NOTIFICATIONS_LOADING",
  NoNotifications = "NO_NOTIFICATIONS",
  NotificationsLoaded = "NOTIFICATIONS_LOADED",
}

export type NotificationsViewModel =
  | {
      type: NotificationsViewModelType.NotificationsLoading;
    }
  | {
      type: NotificationsViewModelType.NoNotifications;
      message: string;
    }
  | {
      type: NotificationsViewModelType.NotificationsLoaded;
      notifications: {
        id: string;
        title: string;
        text: string;
        occuredAt: string;
        url: string;
        read: boolean;
        imageUrl: string;
      }[];
      newNotifications: string;
    };

type IViewModelDependencies = {
  now: Date;
  lastSeenNotificationId: string;
  setLastSeenNotificationId: (notificationId: string) => void;
};

export const createNotificationsViewModel = ({
  now,
  lastSeenNotificationId,
  setLastSeenNotificationId,
}: IViewModelDependencies) =>
  createSelector(
    [selectAreNotificationsLoading, selectNotifications],
    (areNotificationsLoading, notifications): NotificationsViewModel => {
      if (areNotificationsLoading) {
        return {
          type: NotificationsViewModelType.NotificationsLoading,
        };
      }

      if (notifications.length === 0) {
        return {
          type: NotificationsViewModelType.NoNotifications,
          message: "Aucune notification",
        };
      }

      notifications.sort(
        (n1, n2) =>
          new Date(n2.occuredAt).getTime() - new Date(n1.occuredAt).getTime()
      );

      const indexOfLastSeenNotification = notifications.findIndex(
        (n) => n.id === lastSeenNotificationId
      );

      if (indexOfLastSeenNotification === -1) {
        setLastSeenNotificationId(notifications[0].id);
      }

      return {
        type: NotificationsViewModelType.NotificationsLoaded,
        notifications: notifications
          .slice(
            indexOfLastSeenNotification === -1 ? 0 : indexOfLastSeenNotification
          )
          .map((n) => ({
            ...n,
            occuredAt: timeAgo(n.occuredAt, undefined, { relativeDate: now }),
          })),
        newNotifications:
          indexOfLastSeenNotification > 0
            ? `${indexOfLastSeenNotification} nouvelle(s) notification(s)`
            : "",
      };
    }
  );
