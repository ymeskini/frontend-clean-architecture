import { stateBuilder } from "@/lib/state-builder";
import {
  NotificationsViewModelType,
  createNotificationsViewModel,
} from "../notifications.viewmodel";
import { RootState } from "@/lib/create-store";
import { AppDispatch } from "@/lib/create-store";

const createTestNotificationsViewModel =
  ({
    now = new Date(),
    lastSeenNotificationId = "",
    setLastSeenNotificationId = vitest.fn(),
  }: {
    now?: Date;
    lastSeenNotificationId?: string;
    setLastSeenNotificationId?: (notificationId: string) => void;
    dispatch?: AppDispatch;
  } = {}) =>
  (rootState: RootState) =>
    createNotificationsViewModel({
      now,
      lastSeenNotificationId,
      setLastSeenNotificationId,
    })(rootState);

describe("Notifications view model", () => {
  it("should return a loading state when notifications are loading", () => {
    const state = stateBuilder().withNotificationsLoading(undefined).build();

    const viewModel = createTestNotificationsViewModel()(state);

    expect(viewModel).toEqual({
      type: NotificationsViewModelType.NotificationsLoading,
    });
  });

  it("should return 'no notifications' state when there is no notifications loaded", () => {
    const state = stateBuilder().build();

    const viewModel = createTestNotificationsViewModel()(state);

    expect(viewModel).toEqual({
      type: NotificationsViewModelType.NoNotifications,
      message: "Aucune notification",
    });
  });

  it("should return notifications when there are some notifications loaded", () => {
    const setLastSeenNotificationId = vitest.fn();
    const now = new Date("2023-06-05T12:21:00.000Z");
    const state = stateBuilder()
      .withNotifications([
        {
          id: "n1-id",
          title: "Title 1",
          text: "Text 1",
          occuredAt: "2023-06-05T12:19:00.000Z",
          url: "https://some1.url",
          read: true,
          imageUrl: "image1.png",
        },
        {
          id: "n2-id",
          title: "Title 2",
          text: "Text 2",
          occuredAt: "2023-06-05T12:20:00.000Z",
          url: "https://some2.url",
          read: false,
          imageUrl: "image2.png",
        },
      ])
      .build();

    const viewModel = createTestNotificationsViewModel({
      now,
      setLastSeenNotificationId,
      lastSeenNotificationId: "",
    })(state);

    expect(viewModel).toMatchObject({
      type: NotificationsViewModelType.NotificationsLoaded,
      notifications: [
        {
          id: "n2-id",
          title: "Title 2",
          text: "Text 2",
          occuredAt: "1 minute ago",
          url: "https://some2.url",
          read: false,
          imageUrl: "image2.png",
        },
        {
          id: "n1-id",
          title: "Title 1",
          text: "Text 1",
          occuredAt: "2 minutes ago",
          url: "https://some1.url",
          read: true,
          imageUrl: "image1.png",
        },
      ],
      newNotifications: "",
    });
    expect(setLastSeenNotificationId).toHaveBeenCalledWith("n2-id");
  });

  it("should not display notifications received after the last one seen", () => {
    const state = stateBuilder()
      .withNotifications([
        {
          id: "n1-id",
          title: "Title 1",
          text: "Text 1",
          occuredAt: "2023-06-05T12:19:00.000Z",
          url: "https://some1.url",
          read: true,
          imageUrl: "image1.png",
        },
        {
          id: "n2-id",
          title: "Title 2",
          text: "Text 2",
          occuredAt: "2023-06-05T12:20:00.000Z",
          url: "https://some2.url",
          read: false,
          imageUrl: "image2.png",
        },
      ])
      .build();

    const viewModel = createTestNotificationsViewModel({
      lastSeenNotificationId: "n1-id",
    })(state);

    expect(viewModel).toMatchObject({
      type: NotificationsViewModelType.NotificationsLoaded,
      notifications: [
        expect.objectContaining({
          id: "n1-id",
          title: "Title 1",
        }),
      ],
      newNotifications: "1 nouvelle(s) notification(s)",
    });
  });

});
