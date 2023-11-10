import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../create-store";
import { AuthUser } from "./model/auth.gateway";
import { authenticateWithGoogle } from "./usecases/authenticate-with-google.usecase";
import { authenticateWithGithub } from "./usecases/authenticate-with-github.usecase";
import { uploadProfilePicture } from "../users/usecases/upload-profile-picture.usecase";
import { userLoggedOut } from "./usecases/logout.usecase";

export type AuthState = {
  authUser?: AuthUser;
};

const initialState: AuthState = {
  authUser: undefined,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userAuthenticated: (
      state,
      action: PayloadAction<{ authUser: AuthUser }>
    ) => {
      state.authUser = action.payload.authUser;
    },
    profilePictureUploading: (
      state,
      action: PayloadAction<{ preview: string }>
    ) => {
      if (state.authUser) {
        state.authUser.profilePicture = action.payload.preview;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(authenticateWithGoogle.fulfilled, (state, action) => {
        state.authUser = action.payload;
      })
      .addCase(authenticateWithGithub.fulfilled, (state, action) => {
        state.authUser = action.payload;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        if (state.authUser) {
          state.authUser.profilePicture = action.payload.profilePictureUrl;
        }
      })
      .addCase(userLoggedOut.fulfilled, (state) => {
        state.authUser = undefined;
      });
  },
});

export const { userAuthenticated, profilePictureUploading } = authSlice.actions;

export const { reducer } = authSlice;

export const selectIsUserAuthenticated = (rootState: RootState) =>
  rootState.auth.authUser !== undefined;

export const selectAuthUser = (rootState: RootState) => rootState.auth.authUser;

export const selectAuthUserId = (rootState: RootState) =>
  selectAuthUser(rootState)?.id ?? "";
