import { createAddPostFormViewModel } from "../add-post-form.viewmodel";
import { RootState } from "@/lib/create-store";
import { stateBuilder } from "@/lib/state-builder";

const createTestAddPostFormViewModel = ({
  charactersCount = 42,
  state = stateBuilder().build(),
}: {
  charactersCount?: number;
  state?: RootState;
} = {}) =>
  createAddPostFormViewModel({
    charactersCount,
  })(state);

describe("AddPostForm view model", () => {
  test("cannot post a message if text is empty", () => {
    const { canSubmit } = createTestAddPostFormViewModel({
      charactersCount: 0,
    });

    expect(canSubmit).toBe(false);
  });

  test("can post a message if text is not empty", () => {
    const { canSubmit } = createTestAddPostFormViewModel({
      charactersCount: 1,
    });

    expect(canSubmit).toBe(true);
  });

  test("can post a message if text size is inferior to max characters allowed", () => {
    const { canSubmit } = createTestAddPostFormViewModel({
      charactersCount: 99,
    });

    expect(canSubmit).toBe(true);
  });

  test("can post a message if text size is equal to max characters allowed", () => {
    const { canSubmit } = createTestAddPostFormViewModel({
      charactersCount: 100,
    });

    expect(canSubmit).toBe(true);
  });

  test("returns the remaining characters", () => {
    expect(
      createTestAddPostFormViewModel({
        charactersCount: 0,
      }).remaining
    ).toEqual(100);

    expect(
      createTestAddPostFormViewModel({
        charactersCount: 91,
      }).remaining
    ).toEqual(9);

    expect(
      createTestAddPostFormViewModel({
        charactersCount: 110,
      }).remaining
    ).toEqual(-10);
  });

  test("should notify visually about maximum characters being reached if current count is over max count", () => {
    const { inputBackroundColor, charCounterColor } =
      createTestAddPostFormViewModel({
        charactersCount: 101,
      });

    expect(inputBackroundColor).toEqual("red.300");
    expect(charCounterColor).toEqual("red.300");
  });

  test("should not notify visually about maximum characters being reached if current count is inferior to max count", () => {
    const { inputBackroundColor, charCounterColor } =
      createTestAddPostFormViewModel({
        charactersCount: 99,
      });

    expect(inputBackroundColor).toEqual("white");
    expect(charCounterColor).toEqual("muted");
  });

  test("should not notify about maximum characters being reached if current count is equal to max count", () => {
    const { inputBackroundColor, charCounterColor } =
      createTestAddPostFormViewModel({
        charactersCount: 100,
      });

    expect(inputBackroundColor).toEqual("white");
    expect(charCounterColor).toEqual("muted");
  });

  test("should return the auth user profile picture and profile url", () => {
    const state = stateBuilder()
      .withAuthUser({
        authUser: {
          id: "alice-id",
          profilePicture: "alice.png",
          username: "Alice",
        },
      })
      .build();

    const viewModel = createTestAddPostFormViewModel({ state });

    expect(viewModel.authUser).toEqual({
      profilePicture: "alice.png",
      profileUrl: "/u/alice-id",
    });
  });
});
