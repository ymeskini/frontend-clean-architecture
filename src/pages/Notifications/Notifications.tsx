import { keyframes } from "@emotion/react";
import {
  Box,
  Button,
  Center,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Notification } from "@/components/Notification";
import { exhaustiveGuard } from "@/lib/common/utils/exhaustive-guard";
import { AppDispatch } from "@/lib/create-store";
import {
  NotificationsViewModelType,
  createNotificationsViewModel,
} from "./notifications.viewmodel";
import { markAllNotificationsAsRead } from "@/lib/notifications/usecases/mark-all-notifications-as-read.usecase";

const fade = keyframes`
    from { background-color: rgba(200, 233, 251, 1); }
    to { background-color: rgba(200, 233, 251, 0) }
`;

export const Notifications = () => {
  const [lastSeenNotificationId, setLastSeenNotificationId] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const viewModel = useSelector(
    createNotificationsViewModel({
      now: new Date(),
      lastSeenNotificationId,
      setLastSeenNotificationId,
    })
  );

  switch (viewModel.type) {
    case NotificationsViewModelType.NotificationsLoading:
      return <Text>Loading...</Text>;
    case NotificationsViewModelType.NoNotifications:
      return (
        <Center>
          <Text>{viewModel.message}</Text>
        </Center>
      );
    case NotificationsViewModelType.NotificationsLoaded:
      return (
        <Center mx="auto" py={{ base: "4", md: "8" }}>
          <Box bg="bg-surface" py="4" width="full">
            <Stack divider={<StackDivider />} spacing={0}>
              {viewModel.newNotifications !== "" && (
                <Center>
                  <Button
                    variant="link"
                    onClick={async () => {
                      await dispatch(markAllNotificationsAsRead());
                      setLastSeenNotificationId(viewModel.notifications[0].id);
                    }}
                  >
                    {viewModel.newNotifications}
                  </Button>
                </Center>
              )}
              {viewModel.notifications.map((n) => {
                const animation = n.read ? "" : `${fade} 2s linear forwards`;
                return (
                  <Notification
                    key={n.id}
                    boxShadow="none"
                    borderRadius="none"
                    color="blackAlpha.700"
                    bgColor="white"
                    profilePicture={n.imageUrl}
                    title={n.title}
                    text={n.text}
                    url={n.url}
                    occuredAt={n.occuredAt}
                    animation={animation}
                  />
                );
              })}
            </Stack>
          </Box>
        </Center>
      );
    default:
      exhaustiveGuard(viewModel);
  }

  return null;
};
