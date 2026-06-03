import { render, screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import type { RenderResult } from "@testing-library/react";
import type { RootState, store } from "@/app/store";

import HomePage from "@/pages/HomePage/HomePage";

import authReducer from "@/features/auth/authSlice";
import gamesReducer from "@/features/games/gamesSlice";
import uiReducer from "@/features/ui/uiSlice";

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

const renderPage = (preloadedState?: Partial<RootState>): RenderResult => {
  const store = createTestStore(preloadedState);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </Provider>
  );
};

describe("HomePage", () => {
  beforeEach(() => {
    jest.useFakeTimers();
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
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("rendering", () => {
    it("should render the main home page element", () => {
      const { container } = renderPage();

      expect(container.querySelector<HTMLElement>(".main-home-page")).toBeInTheDocument();
    });

    it("should render NavBar", () => {
      const { container } = renderPage();

      expect(container.querySelector<HTMLElement>(".header-wrapper")).toBeInTheDocument();
    });

    it("should render Footer", () => {
      const { container } = renderPage();

      expect(container.querySelector<HTMLElement>(".footer-wrapper")).toBeInTheDocument();
    });

    it("should render the Upcoming Games heading", () => {
      renderPage();

      expect(screen.getByRole("heading", { name: /upcoming games/i })).toBeInTheDocument();
    });

    it("should render the Other Games heading", () => {
      renderPage();

      expect(screen.getByRole("heading", { name: /other games/i })).toBeInTheDocument();
    });
  });
});
