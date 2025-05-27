import { selectAuthUser } from "@/lib/auth/reducer";
import { selectNotifications } from "@/lib/notifications/slices/notifications.slice";
import { createSelector } from "@reduxjs/toolkit";

const selectSidebarAuthUserViewModel = createSelector(
  [selectAuthUser],
  (authUser) => {
    return {
      username: authUser?.username ?? "",
      profilePicture: authUser?.profilePicture ?? "",
      profileUrl: authUser && authUser.id ? `/u/${authUser.id}` : "/profile", // Example default
    };
  }
);

const selectUnreadNotificationsInfo = createSelector(
  [selectNotifications],
  (allNotifications) => {
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
