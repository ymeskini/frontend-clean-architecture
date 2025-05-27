import { http, HttpResponse } from "msw";
import { GetUserTimelineResponse } from "../../model/timeline.gateway";
import { HttpTimelineGateway } from "../http-timeline.gateway";
import { server } from "./mockServer";

describe("HttpTimelineGateway", () => {
  beforeAll(() => {
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  test("getUserTimeline", async () => {
    const fakeResponse: GetUserTimelineResponse = {
      timeline: {
        id: "alice-timeline-id",
        user: {
          id: "alice-id",
          followersCount: 12,
          followingCount: 20,
          isFollowedByAuthUser: true,
          profilePicture: "http://picture.com/alice.png",
          username: "Alice",
        },
        messages: [
          {
            id: "m1",
            author: {
              id: "alice-id",
              followersCount: 12,
              followingCount: 20,
              isFollowedByAuthUser: true,
              profilePicture: "http://picture.com/alice.png",
              username: "Alice",
            },
            likes: [
              {
                id: "alice-like-id",
                messageId: "m1",
                userId: "alice-id",
              },
            ],
            text: "alice message",
            publishedAt: "2023-06-12T20:44:00.000Z",
          },
        ],
      },
    };

    server.use(
      http.get("http://localhost:3000/timelines?userId=alice-id", () => {
        return HttpResponse.json(fakeResponse, {
          status: 200,
        });
      })
    );
    const timelineGateway = new HttpTimelineGateway();

    const response = await timelineGateway.getUserTimeline({
      userId: "alice-id",
    });

    expect(response).toEqual(fakeResponse);
  });
});
