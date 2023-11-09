import { createAppAsyncThunk } from "@/lib/create-app-thunk";

export const userLoggedOut = createAppAsyncThunk(
  "auth/userLoggedOut",
  async (_, { extra: { authGateway } }) => {
    await authGateway.logout();
    return;
  }
);
