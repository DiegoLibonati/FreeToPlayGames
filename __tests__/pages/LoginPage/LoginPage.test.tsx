import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import Swal from "sweetalert2";

import type { RenderResult } from "@testing-library/react";
import type { RootState, store } from "@/app/store";

import LoginPage from "@/pages/LoginPage/LoginPage";

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

jest.mock("sweetalert2", () => ({
  __esModule: true,
  default: { fire: jest.fn() },
}));

jest.mock("react-wavify", () => ({
  __esModule: true,
  default: (): null => null,
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

const renderPage = (preloadedState?: Partial<RootState>): RenderResult => {
  const store = createTestStore(preloadedState);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </Provider>
  );
};

describe("LoginPage", () => {
  describe("rendering", () => {
    beforeEach(() => {
      mockGameServiceGetAll(mockGames);
    });

    it("should render the login form inputs", async () => {
      renderPage();

      expect(screen.getByPlaceholderText("Your email")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Your password")).toBeInTheDocument();
      await waitFor(() => {
        // Empty fn
      });
    });

    it("should render Loader when images are loading", async () => {
      const { container } = renderPage({
        auth: {
          images: { images: [], isLoadingImages: true },
          auth: { isChecking: false, status: "not-authenticated", errorMessage: "" },
          user: { uid: "", email: "", displayName: "", photoURL: "" },
        },
      });

      expect(container.querySelector<HTMLDivElement>(".loader-all-wrapper")).toBeInTheDocument();
      await waitFor(() => {
        // Empty fn
      });
    });

    it("should render slide presentation when images are loaded", async () => {
      const { container } = renderPage({
        auth: {
          images: { images: ["url1", "url2", "url3"], isLoadingImages: false },
          auth: { isChecking: false, status: "not-authenticated", errorMessage: "" },
          user: { uid: "", email: "", displayName: "", photoURL: "" },
        },
      });

      await waitFor(() => {
        expect(
          container.querySelector<HTMLImageElement>(".login-wrapper__img")
        ).toBeInTheDocument();
        expect(screen.getByText("The best free games wiki")).toBeInTheDocument();
      });
    });

    it("should render the Login and Google buttons", async () => {
      renderPage();

      expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sign in with Google" })).toBeInTheDocument();
      await waitFor(() => {
        // Empty fn
      });
    });

    it("should render the Register link", async () => {
      renderPage();

      expect(screen.getByRole("link", { name: "Go to register page" })).toBeInTheDocument();
      await waitFor(() => {
        // Empty fn
      });
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      mockGameServiceGetAll(mockGames);
      (Swal.fire as jest.Mock).mockResolvedValue({
        isConfirmed: false,
        isDenied: false,
        isDismissed: true,
      });
      const { loginWithEmailPassword } = jest.requireMock("@/firebase/providers");
      (loginWithEmailPassword as jest.Mock).mockResolvedValue({
        ok: false,
        errorMessage: "Test error",
      });
    });

    it("should call Swal.fire when submitting with empty fields", async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole("button", { name: "Sign in" }));

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: "error",
        title: "Oops...",
        text: "Invalid email or password",
      });
    });

    it("should call handleLoginWithEmailAndPassword when submitting with valid credentials", async () => {
      const user = userEvent.setup();
      const { loginWithEmailPassword } = jest.requireMock("@/firebase/providers");
      renderPage();

      await user.type(screen.getByPlaceholderText("Your email"), "test@test.com");
      await user.type(screen.getByPlaceholderText("Your password"), "password123");
      await user.click(screen.getByRole("button", { name: "Sign in" }));

      await waitFor(() => {
        expect(loginWithEmailPassword).toHaveBeenCalledWith("test@test.com", "password123");
      });
    });

    it("should call handleLoginWithGoogle when clicking Google button", async () => {
      const user = userEvent.setup();
      const { signInWithGoogle } = jest.requireMock("@/firebase/providers");
      (signInWithGoogle as jest.Mock).mockResolvedValue({ ok: false, errorMessage: "Test error" });
      renderPage();

      await user.click(screen.getByRole("button", { name: "Sign in with Google" }));

      await waitFor(() => {
        expect(signInWithGoogle).toHaveBeenCalled();
      });
    });
  });
});
