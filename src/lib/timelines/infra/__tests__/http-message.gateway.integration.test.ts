import { http, HttpResponse } from "msw";

import { HttpMessageGateway } from "../http-message.gateway";
import { server } from "./mockServer";

describe("HttpMessageGateway", () => {
  beforeAll(() => {
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  test("postMessage", async () => {
    const message = {
      id: "m1",
      author: "alice-id",
      text: "alice message",
      publishedAt: "2023-06-12T20:58:00.000Z",
      timelineId: "alice-timeline-id",
    };
    server.use(
      http.post("http://localhost:3000/messages", () => {
        return HttpResponse.json(message, {
          status: 201,
        });
      })
    );
    const messageGateway = new HttpMessageGateway();

    await messageGateway.postMessage(message);
  });
});
