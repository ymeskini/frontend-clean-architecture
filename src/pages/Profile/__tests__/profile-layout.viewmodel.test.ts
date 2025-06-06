import { createProfileLayoutViewModel } from "../profile-layout.viewmodel";
import { stateBuilder } from "@/lib/state-builder";
import { buildUser } from "@/lib/users/__tests__/user.builder";
import { AppDispatch } from "@/lib/create-store";

const createTestProfileLayoutViewModel = ({
  userId,
}: {
  userId: string;
  dispatch?: AppDispatch;
}) => createProfileLayoutViewModel({ userId });

describe("Profile layout view model", () => {
  it("returns the user information", () => {
    const state = stateBuilder()
      .withUsers([
        buildUser({
          id: "alice-id",
          username: "Alice",
          profilePicture: "alice.png",
        }),
      ])
      .build();

    const viewModel = createTestProfileLayoutViewModel({ userId: "alice-id" })(
      state
    );

    expect(viewModel).toMatchObject({
      username: "Alice",
      profilePicture: "alice.png",
    });
  });

  it("indicates that we are on the authenticated user profile", () => {
    {
      const state = stateBuilder()
        .withAuthUser({
          authUser: {
            id: "alice-id",
            username: "Alice",
            profilePicture: "alice.png",
          },
        })
        .build();

      const viewModel = createTestProfileLayoutViewModel({
        userId: "alice-id",
      })(state);

      expect(viewModel.isAuthUserProfile).toBe(true);
    }

    {
      const state = stateBuilder().build();

      const viewModel = createTestProfileLayoutViewModel({
        userId: "alice-id",
      })(state);

      expect(viewModel.isAuthUserProfile).toBe(false);
    }
  });

  it("returns the correct profile links", () => {
    const state = stateBuilder().build();

    const viewModel = createTestProfileLayoutViewModel({ userId: "alice-id" })(
      state
    );

    expect(viewModel).toMatchObject({
      timelineLink: "/u/alice-id",
      followingLink: "/u/alice-id/following",
      followersLink: "/u/alice-id/followers",
    });
  });

  it("returns the correct tabs label", () => {
    const state = stateBuilder()
      .withUsers([
        buildUser({
          id: "alice-id",
          followersCount: 5,
          followingCount: 10,
        }),
      ])
      .build();

    const viewModel = createTestProfileLayoutViewModel({ userId: "alice-id" })(
      state
    );

    expect(viewModel.tabs).toEqual({
      following: "Following (10)",
      followers: "Followers (5)",
    });
  });

  it("should indicate that the picture is loading when on auth user profile and the pictures is indeed loading", () => {
    {
      const state = stateBuilder()
        .withAuthUser({
          authUser: "alice-id",
        })
        .withProfilePictureUploading(undefined)
        .build();

      const viewModel = createTestProfileLayoutViewModel({
        userId: "alice-id",
      })(state);

      expect(viewModel.profilePictureUploading).toBe(true);
    }

    {
      const state = stateBuilder()
        .withAuthUser({
          authUser: "alice-id",
        })
        .withProfilePictureNotUploading(undefined)
        .build();

      const viewModel = createTestProfileLayoutViewModel({
        userId: "alice-id",
      })(state);

      expect(viewModel.profilePictureUploading).toBe(false);
    }

    {
      const state = stateBuilder()
        .withAuthUser({
          authUser: "alice-id",
        })
        .withProfilePictureUploading(undefined)
        .build();

      const viewModel = createTestProfileLayoutViewModel({ userId: "bob-id" })(
        state
      );

      expect(viewModel.profilePictureUploading).toBe(false);
    }
  });
});
