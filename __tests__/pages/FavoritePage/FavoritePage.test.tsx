import { render, screen, waitFor } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import * as firestoreLite from "firebase/firestore/lite";

import type { RenderResult } from "@testing-library/react";
import type { RootState, store } from "@/app/store";
import type { Game } from "@/types/app";

import FavoritePage from "@/pages/FavoritePage/FavoritePage";

import authReducer from "@/features/auth/authSlice";
import gamesReducer from "@/features/games/gamesSlice";
import uiReducer from "@/features/ui/uiSlice";

import { mockGames } from "@tests/__mocks__/games.mock";

jest.mock("@/constants/envs", () => ({
  __esModule: true,
  default: {
    xRapid: { apiKey: "test", apiHost: "test", apiUrl: "test" },
    firebase: {
      apiKey: "test",
      authDomain: "test",
      projectId: "test",
      storageBucket: "test",
      messagingSenderId: "test",
      appId: "test",
    },
  },
}));

jest.mock("@/firebase/config", () => ({
  FirebaseAuth: {},
  FirebaseDB: {},
}));

jest.mock("firebase/firestore/lite", () => ({
  collection: jest.fn().mockReturnValue({}),
  doc: jest.fn().mockReturnValue({}),
  setDoc: jest.fn().mockResolvedValue(undefined),
  getDocs: jest.fn().mockResolvedValue({ docs: [] }),
  deleteDoc: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/firebase/providers", () => ({
  logoutFirebase: jest.fn().mockResolvedValue(undefined),
  loginWithEmailPassword: jest.fn(),
  registerUserWithEmail: jest.fn(),
  signInWithGoogle: jest.fn(),
}));

const createTestStore = (preloadedState?: Partial<RootState>): typeof store =>
  configureStore({
    reducer: { auth: authReducer, games: gamesReducer, ui: uiReducer },
    preloadedState,
  });

const renderPage = (preloadedState?: Partial<RootState>): RenderResult => {
  const store = createTestStore(preloadedState);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <FavoritePage />
      </MemoryRouter>
    </Provider>
  );
};

describe("FavoritePage", () => {
  beforeEach(() => {
    jest
      .spyOn(firestoreLite, "collection")
      .mockReturnValue({} as ReturnType<typeof firestoreLite.collection>);
    jest
      .spyOn(firestoreLite, "getDocs")
      .mockResolvedValue({ docs: [] } as unknown as Awaited<
        ReturnType<typeof firestoreLite.getDocs>
      >);
  });

  describe("rendering", () => {
    it("should render Loader when isLoadingFavoritesGames is true", () => {
      jest.spyOn(firestoreLite, "getDocs").mockImplementation(
        () =>
          new Promise(() => {
            // Empty fn
          })
      );

      const { container } = renderPage({
        games: {
          games: { isLoading: false, games: [] },
          categories: { isLoading: false, categories: [] },
          favorites: { isLoading: true, games: [] },
          activeGame: null,
        },
      });

      expect(container.querySelector<HTMLDivElement>(".loader-all-wrapper")).toBeInTheDocument();
    });

    it("should render empty message when there are no favorites", async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /add a game to your favorites list/i })
        ).toBeInTheDocument();
      });
    });

    it("should render favorite game cards when favorites exist", async () => {
      jest.spyOn(firestoreLite, "getDocs").mockResolvedValue({
        docs: mockGames.map((game) => ({
          id: String(game.id),
          data: (): Game => game,
        })),
      } as unknown as Awaited<ReturnType<typeof firestoreLite.getDocs>>);

      const { container } = renderPage();

      await waitFor(() => {
        expect(container.querySelectorAll<HTMLElement>(".card-favorite-game")).toHaveLength(
          mockGames.length
        );
      });
    });

    it("should render NavBar and Footer", async () => {
      const { container } = renderPage();

      await waitFor(() => {
        expect(container.querySelector<HTMLElement>(".header-wrapper")).toBeInTheDocument();
        expect(container.querySelector<HTMLElement>(".footer-wrapper")).toBeInTheDocument();
      });
    });
  });
});
