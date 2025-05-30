import { Circle, Divider, Flex, Stack, Text } from "@chakra-ui/react";
import {
  FiBell,
  FiHome,
  FiInstagram,
  FiLinkedin,
  FiPower,
  FiTwitter,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { UserProfile } from "./UserProfile";
import { NavButton } from "./NavButton";
import { createSidebarViewModel } from "./sidebar.viewmodel";

export const Sidebar = () => {
  const viewModel = useSelector(createSidebarViewModel);
  return (
    <Flex
      flex="1"
      bg="bg-accent"
      color="on-accent"
      overflowY="auto"
      maxW={{ base: "full", sm: "xs" }}
      py={{ base: "6", sm: "8" }}
      px={{ base: "4", sm: "6" }}
      sx={{
        position: "sticky",
        top: "0",
      }}
    >
      <Stack justify="space-between" spacing="1" width="full">
        <Stack spacing="8" shouldWrapChildren>
          <Stack spacing="1">
            <NavButton label="Home" icon={FiHome} to="/home" />
            <NavButton
              label={viewModel.notificationLabel}
              icon={FiBell}
              endElement={
                viewModel.unreadNotifications && (
                  <Circle size="2" bg="blue.400"></Circle>
                )
              }
              to="/notifications"
            />
          </Stack>
          <Stack>
            <Text fontSize="sm" color="on-accent-muted" fontWeight="medium">
              Social
            </Text>
            <Stack spacing="1">
              <NavButton label="Twitter" icon={FiTwitter} to="/home" />
              <NavButton label="Instagram" icon={FiInstagram} to="/home" />
              <NavButton label="Linkedin" icon={FiLinkedin} to="/home" />
            </Stack>
          </Stack>
          <Stack>
            <NavButton label="Sign Out" icon={FiPower} to="/signout" />
          </Stack>
          <Divider borderColor="bg-accent-subtle" />
          <Link to={viewModel.authUser.profileUrl}>
            <UserProfile
              username={viewModel.authUser.username}
              profilePicture={viewModel.authUser.profilePicture}
            />
          </Link>
        </Stack>
      </Stack>
    </Flex>
  );
};
