import { render, screen, waitFor } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";

import type { RenderResult } from "@testing-library/react";
import type { RootState, store } from "@/app/store";

import GamesPage from "@/pages/GamesPage/GamesPage";

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

jest.mock("@/services/gameService", () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(),
    getByCategory: jest.fn(),
  },
}));

const createTestStore = (preloadedState?: Partial<RootState>): typeof store =>
  configureStore({
    reducer: { auth: authReducer, games: gamesReducer, ui: uiReducer },
    preloadedState,
  });

const mockGameServiceGetAll = (data: unknown): void => {
  const gameService = jest.requireMock("@/services/gameService").default;
  (gameService.getAll as jest.Mock).mockResolvedValue(data);
};

const mockGameServicePending = (): void => {
  const gameService = jest.requireMock("@/services/gameService").default;
  (gameService.getAll as jest.Mock).mockImplementation(
    () =>
      new Promise(() => {
        // Empty fn
      })
  );
  (gameService.getByCategory as jest.Mock).mockImplementation(
    () =>
      new Promise(() => {
        // Empty fn
      })
  );
};

const renderPage = (preloadedState?: Partial<RootState>): RenderResult => {
  const store = createTestStore(preloadedState);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <GamesPage />
      </MemoryRouter>
    </Provider>
  );
};

describe("GamesPage", () => {
  describe("rendering", () => {
    it("should render the filters section with Filters heading", () => {
      mockGameServicePending();

      renderPage();

      expect(screen.getByRole("heading", { name: /filters/i })).toBeInTheDocument();
    });

    it("should render Loader when isLoadingGames is true", () => {
      mockGameServicePending();

      const { container } = renderPage({
        games: {
          games: { isLoading: true, games: [] },
          categories: { isLoading: false, categories: [] },
          favorites: { isLoading: false, games: [] },
          activeGame: null,
        },
      });

      expect(container.querySelector<HTMLDivElement>(".loader-all-wrapper")).toBeInTheDocument();
    });

    it("should render That category does not exists when games list is empty and not loading", async () => {
      mockGameServiceGetAll([]);

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /that category does not exists/i })
        ).toBeInTheDocument();
      });
    });

    it("should render game cards when games are available", async () => {
      mockGameServiceGetAll(mockGames);

      const { container } = renderPage();

      await waitFor(() => {
        expect(container.querySelectorAll<HTMLElement>(".card-game-games")).toHaveLength(
          mockGames.length
        );
      });
    });

    it("should render NavBar and Footer", () => {
      mockGameServicePending();

      const { container } = renderPage();

      expect(container.querySelector<HTMLElement>(".header-wrapper")).toBeInTheDocument();
      expect(container.querySelector<HTMLElement>(".footer-wrapper")).toBeInTheDocument();
    });
  });
});
