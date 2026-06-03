import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import type { RenderResult } from "@testing-library/react";
import type { RootState, store } from "@/app/store";

import ActiveGame from "@/components/ActiveGame/ActiveGame";

import authReducer from "@/features/auth/authSlice";
import gamesReducer from "@/features/games/gamesSlice";
import uiReducer from "@/features/ui/uiSlice";

import { mockGames } from "@tests/__mocks__/games.mock";

const mockActiveGame = mockGames[0]!;
const mockStateWithActiveGame = {
  games: {
    games: { isLoading: false, games: mockGames },
    categories: { isLoading: false, categories: [] },
    favorites: { isLoading: false, games: [] },
    activeGame: mockActiveGame,
  },
};

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
  doc: jest.fn().mockReturnValue({ id: "mock-doc-id" }),
  setDoc: jest.fn().mockResolvedValue(undefined),
  getDocs: jest.fn().mockResolvedValue({ docs: [] }),
  deleteDoc: jest.fn().mockResolvedValue(undefined),
}));

const createTestStore = (preloadedState?: Partial<RootState>): typeof store =>
  configureStore({
    reducer: { auth: authReducer, games: gamesReducer, ui: uiReducer },
    preloadedState,
  });

const renderComponent = (preloadedState?: Partial<RootState>, route = "/home"): RenderResult => {
  const store = createTestStore(preloadedState);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <ActiveGame />
      </MemoryRouter>
    </Provider>
  );
};

beforeEach(() => {
  const firestore = jest.requireMock("firebase/firestore/lite");
  firestore.collection.mockReturnValue({});
  firestore.doc.mockReturnValue({ id: "mock-doc-id" });
  firestore.setDoc.mockResolvedValue(undefined);
  firestore.getDocs.mockResolvedValue({ docs: [] });
  firestore.deleteDoc.mockResolvedValue(undefined);
});

describe("ActiveGame", () => {
  describe("rendering", () => {
    it("should render the active game wrapper", () => {
      const { container } = renderComponent(mockStateWithActiveGame);
      expect(container.querySelector<HTMLDivElement>(".active-game-wrapper")).toBeInTheDocument();
    });

    it("should render the game title", () => {
      renderComponent(mockStateWithActiveGame);
      expect(screen.getByRole("heading", { name: mockActiveGame.title })).toBeInTheDocument();
    });

    it("should render the game thumbnail image", () => {
      renderComponent(mockStateWithActiveGame);
      expect(screen.getByRole("img", { name: mockActiveGame.title })).toBeInTheDocument();
    });

    it("should render the game short description", () => {
      renderComponent(mockStateWithActiveGame);
      expect(screen.getByText(mockActiveGame.short_description)).toBeInTheDocument();
    });

    it("should render the official website link", () => {
      renderComponent(mockStateWithActiveGame);
      expect(screen.getByRole("link", { name: /official website/i })).toBeInTheDocument();
    });

    it("should render the official website link with correct href", () => {
      renderComponent(mockStateWithActiveGame);
      expect(screen.getByRole("link", { name: /official website/i })).toHaveAttribute(
        "href",
        mockActiveGame.game_url
      );
    });

    it("should render the close button", () => {
      renderComponent(mockStateWithActiveGame);
      expect(screen.getByRole("button", { name: /close game details/i })).toBeInTheDocument();
    });

    it("should render the trash button on the /favorite route", () => {
      renderComponent(mockStateWithActiveGame, "/favorite");
      expect(
        screen.getByRole("button", {
          name: new RegExp(`remove ${mockActiveGame.title} from favorites`, "i"),
        })
      ).toBeInTheDocument();
    });

    it("should render the favorite button on the /explore route", () => {
      renderComponent(mockStateWithActiveGame, "/explore");
      expect(
        screen.getByRole("button", {
          name: new RegExp(`add ${mockActiveGame.title} to favorites`, "i"),
        })
      ).toBeInTheDocument();
    });

    it("should not render the trash button when not on /favorite route", () => {
      renderComponent(mockStateWithActiveGame, "/home");
      expect(
        screen.queryByRole("button", {
          name: new RegExp(`remove ${mockActiveGame.title} from favorites`, "i"),
        })
      ).not.toBeInTheDocument();
    });

    it("should not render the favorite button when not on /explore route", () => {
      renderComponent(mockStateWithActiveGame, "/home");
      expect(
        screen.queryByRole("button", {
          name: new RegExp(`add ${mockActiveGame.title} to favorites`, "i"),
        })
      ).not.toBeInTheDocument();
    });
  });

  describe("behavior", () => {
    it("should clear activeGame in the store after clicking the close button", async () => {
      const user = userEvent.setup();
      const store = createTestStore(mockStateWithActiveGame);
      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/home"]}>
            <ActiveGame />
          </MemoryRouter>
        </Provider>
      );
      await user.click(screen.getByRole("button", { name: /close game details/i }));
      expect(store.getState().games.activeGame).toBeNull();
    });

    it("should clear activeGame after clicking the trash button on /favorite", async () => {
      const user = userEvent.setup();
      const store = createTestStore(mockStateWithActiveGame);
      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/favorite"]}>
            <ActiveGame />
          </MemoryRouter>
        </Provider>
      );
      await user.click(
        screen.getByRole("button", {
          name: new RegExp(`remove ${mockActiveGame.title} from favorites`, "i"),
        })
      );
      expect(store.getState().games.activeGame).toBeNull();
    });

    it("should clear activeGame after clicking the favorite button on /explore", async () => {
      const user = userEvent.setup();
      const store = createTestStore(mockStateWithActiveGame);
      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/explore"]}>
            <ActiveGame />
          </MemoryRouter>
        </Provider>
      );
      await user.click(
        screen.getByRole("button", {
          name: new RegExp(`add ${mockActiveGame.title} to favorites`, "i"),
        })
      );
      expect(store.getState().games.activeGame).toBeNull();
    });

    it("should dispatch openAlert after clicking the trash button on /favorite", async () => {
      const user = userEvent.setup();
      const store = createTestStore(mockStateWithActiveGame);
      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/favorite"]}>
            <ActiveGame />
          </MemoryRouter>
        </Provider>
      );
      await user.click(
        screen.getByRole("button", {
          name: new RegExp(`remove ${mockActiveGame.title} from favorites`, "i"),
        })
      );
      expect(store.getState().ui.alert.isOpen).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should only show close button on a route that is not /favorite or /explore", () => {
      renderComponent(mockStateWithActiveGame, "/home");
      expect(screen.getByRole("button", { name: /close game details/i })).toBeInTheDocument();
      expect(
        screen.queryByRole("button", {
          name: new RegExp(`remove ${mockActiveGame.title} from favorites`, "i"),
        })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", {
          name: new RegExp(`add ${mockActiveGame.title} to favorites`, "i"),
        })
      ).not.toBeInTheDocument();
    });

    it("should render the game genre", () => {
      renderComponent(mockStateWithActiveGame);
      expect(screen.getByText(mockActiveGame.genre)).toBeInTheDocument();
    });

    it("should render the game publisher", () => {
      renderComponent(mockStateWithActiveGame);
      expect(screen.getByText(mockActiveGame.publisher)).toBeInTheDocument();
    });
  });
});
