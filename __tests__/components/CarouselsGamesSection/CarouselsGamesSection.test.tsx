import { render, screen, waitFor } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

import type { RenderResult } from "@testing-library/react";
import type { RootState, store } from "@/app/store";

import CarouselsGamesSection from "@/components/CarouselsGamesSection/CarouselsGamesSection";

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

const mockGetByCategorySuccess = (data: unknown): void => {
  const gameService = jest.requireMock("@/services/gameService").default;
  (gameService.getByCategory as jest.Mock).mockResolvedValue(data);
};

const mockGetByCategoryError = (): void => {
  const gameService = jest.requireMock("@/services/gameService").default;
  (gameService.getByCategory as jest.Mock).mockRejectedValue(new Error("HTTP error! status: 500"));
};

const renderComponent = (preloadedState?: Partial<RootState>): RenderResult => {
  const store = createTestStore(preloadedState);
  return render(
    <Provider store={store}>
      <CarouselsGamesSection />
    </Provider>
  );
};

describe("CarouselsGamesSection", () => {
  describe("rendering", () => {
    it("should render the carousels section", () => {
      const { container } = renderComponent();
      expect(container.querySelector<HTMLElement>(".carousels")).toBeInTheDocument();
    });

    it("should render nothing in the carousels section when categories are empty", () => {
      const { container } = renderComponent();
      expect(container.querySelector<HTMLElement>(".carousels")?.children).toHaveLength(0);
    });
  });

  describe("behavior", () => {
    it("should render CarouselGames after fetching games by category", async () => {
      mockGetByCategorySuccess(mockGames);

      renderComponent({
        games: {
          games: { isLoading: false, games: [] },
          categories: { isLoading: false, categories: ["MMORPG"] },
          favorites: { isLoading: false, games: [] },
          activeGame: null,
        },
      });

      const carousel = await screen.findByRole("heading", { name: "MMORPG" });
      expect(carousel).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("should not render any CarouselGames when fetch fails", async () => {
      mockGetByCategoryError();

      const { container } = renderComponent({
        games: {
          games: { isLoading: false, games: [] },
          categories: { isLoading: false, categories: ["MMORPG"] },
          favorites: { isLoading: false, games: [] },
          activeGame: null,
        },
      });

      await waitFor(() => {
        expect(container.querySelectorAll<HTMLElement>(".carousel-games")).toHaveLength(0);
      });
    });
  });
});
