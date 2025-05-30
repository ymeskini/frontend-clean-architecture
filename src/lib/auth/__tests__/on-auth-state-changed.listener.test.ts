import { userAuthenticated } from "../reducer";
import { createTestStore } from "@/lib/create-store";
import { FakeAuthGateway } from "../infra/fake-auth.gateway";

describe("On auth state changed listener", () => {
  it("should dispatch an userAuthenticated action when auth gateway notifies the user is authenticated", () => {
    const authGateway = new FakeAuthGateway();
    const store = createTestStore({
      authGateway,
    });

    // simulation de l'authentification
    authGateway.simulateAuthStateChanged({ id: "alice-id", username: "Alice" });

    expect(store.getActions()).toContainEqual(
      userAuthenticated({ authUser: { id: "alice-id", username: "Alice" } })
    );
  });
});
