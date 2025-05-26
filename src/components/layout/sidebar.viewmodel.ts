import { selectAuthUser } from "@/lib/auth/reducer";
import { selectNotifications } from "@/lib/notifications/slices/notifications.slice";
import { createSelector } from "@reduxjs/toolkit";
import { Notification as AppNotification } from "@/lib/notifications/model/notification.entity";

type AuthUserFromState = ReturnType<typeof selectAuthUser>;

const selectSidebarAuthUserViewModel = createSelector(
  [selectAuthUser],
  (authUser: AuthUserFromState) => {
    return {
      username: authUser?.username ?? "",
      profilePicture: authUser?.profilePicture ?? "",
      profileUrl: authUser && authUser.id ? `/u/${authUser.id}` : "/profile", // Example default
    };
  }
);

const selectUnreadNotificationsInfo = createSelector(
  [selectNotifications],

  (allNotifications: AppNotification[]) => {
    const unreadCount = allNotifications.filter((n) => !n.read).length;
    return {
      count: unreadCount,
      hasNew: unreadCount > 0,
    };
  }
);

export const createSidebarViewModel = createSelector(
  [selectSidebarAuthUserViewModel, selectUnreadNotificationsInfo],
  (authUserViewModel, notificationsInfo) => {
    return {
      notificationLabel: `Notifications${
        notificationsInfo.hasNew ? ` (${notificationsInfo.count})` : ""
      }`,
      unreadNotifications: notificationsInfo.hasNew,
      authUser: authUserViewModel,
    };
  }
);
