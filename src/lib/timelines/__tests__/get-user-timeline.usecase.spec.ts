import { TimelinesFixture, createTimelinesFixture } from "./timelines.fixture";
import { buildUser } from "@/lib/users/__tests__/user.builder";
import { buildMessage } from "./message.builder";

describe("Feature: Retrieving user's timeline", () => {
  let fixture: TimelinesFixture;

  beforeEach(() => {
    fixture = createTimelinesFixture();
  });

  it("Example: We are on Bob profile", async () => {
    //arrange (given)
    const alice = buildUser({
      id: "alice-id",
      username: "Alice",
      profilePicture: "alice.png",
    });
    const bob = buildUser({
      id: "bob-id",
      username: "Bob",
      profilePicture: "bob.png",
    });
    const bobMessage = buildMessage({
      id: "msg1-id",
      text: "Hello it's Bob",
      author: bob.id,
      publishedAt: "2023-05-16T12:06:00.000Z",
      likes: ["alice-like-id"],
    });
    const aliceMessage = buildMessage({
      id: "msg2-id",
      text: "Hello it's Alice",
      author: alice.id,
      publishedAt: "2023-05-16T12:05:00.000Z",
    });
    fixture.givenExistingRemoteTimeline({
      id: "bob-timeline-id",
      user: bob,
      messages: [
        {
          ...bobMessage,
          author: bob,
          likes: [
            {
              id: "alice-like-id",
              messageId: "msg1-id",
              userId: "alice-id",
            },
          ],
        },
        {
          ...aliceMessage,
          author: alice,
          likes: [],
        },
      ],
    });

    //act (when)
    const timelineRetrieving = fixture.whenRetrievingUserTimeline("bob-id");

    //assert (then)
    fixture.thenTheTimelineOfUserShouldBeLoading("bob-id");
    await timelineRetrieving;
    fixture.thenTheReceivedTimelineShouldBe({
      id: "bob-timeline-id",
      user: bob,
      messages: [
        {
          id: "msg1-id",
          text: "Hello it's Bob",
          author: bob,
          publishedAt: "2023-05-16T12:06:00.000Z",
          likes: [
            {
              id: "alice-like-id",
              messageId: "msg1-id",
              userId: "alice-id",
            },
          ],
        },
        {
          id: "msg2-id",
          text: "Hello it's Alice",
          author: alice,
          publishedAt: "2023-05-16T12:05:00.000Z",
          likes: [],
        },
      ],
    });
  });
});
