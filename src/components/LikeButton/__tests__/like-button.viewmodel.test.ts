import { AppDispatch, createTestStore } from "@/lib/create-store";
import { stateBuilder } from "@/lib/state-builder";
import { createLikeButtonViewModel } from "../like-button.viewmodel";

const createTestLikeButtonViewModel = ({
  messageId,
}: {
  messageId: string;
  dispatch?: AppDispatch;
  generateLikeId?: () => string;
}) => createLikeButtonViewModel({ messageId });

describe("Like Button view model", () => {
  it("should return the likes count for the post", () => {
    const store = createTestStore(
      {},
      stateBuilder()
        .withLikes([
          {
            id: "alice-like-id",
            messageId: "m1",
            userId: "alice-id",
          },
          {
            id: "bob-like-id",
            messageId: "m1",
            userId: "bob-id",
          },
          {
            id: "bob-like-id",
            messageId: "m2",
            userId: "bob-id",
          },
        ])
        .build()
    );

    const viewModel = createTestLikeButtonViewModel({ messageId: "m1" })(
      store.getState()
    );

    expect(viewModel.likesCount).toEqual(2);
  });

  it("should know if the message is liked by auth user or not", () => {
    const store = createTestStore(
      {},
      stateBuilder()
        .withAuthUser({ authUser: "bob-id" })
        .withLikes([
          {
            id: "alice-like-id",
            messageId: "m1",
            userId: "alice-id",
          },
          {
            id: "bob-like-id",
            messageId: "m1",
            userId: "bob-id",
          },
          {
            id: "bob-like-id",
            messageId: "m2",
            userId: "bob-id",
          },
        ])
        .build()
    );

    const viewModel = createTestLikeButtonViewModel({ messageId: "m1" })(
      store.getState()
    );

    expect(viewModel.authUserLike).toBeDefined();
  });

});
