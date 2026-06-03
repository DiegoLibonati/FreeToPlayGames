import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import type { RenderResult } from "@testing-library/react";
import type { RootState, store } from "@/app/store";

import NavBar from "@/components/NavBar/NavBar";

import authReducer from "@/features/auth/authSlice";
import gamesReducer from "@/features/games/gamesSlice";
import uiReducer from "@/features/ui/uiSlice";

const mockAuthenticatedUser = {
  auth: {
    images: { images: [], isLoadingImages: false },
    auth: { isChecking: false, status: "authenticated" as const, errorMessage: "" },
    user: { uid: "test-uid", email: "test@test.com", displayName: "Test User", photoURL: "" },
  },
};
const mockAuthenticatedUserWithPhoto = {
  auth: {
    images: { images: [], isLoadingImages: false },
    auth: { isChecking: false, status: "authenticated" as const, errorMessage: "" },
    user: {
      uid: "test-uid",
      email: "test@test.com",
      displayName: "Test User",
      photoURL: "https://example.com/avatar.jpg",
    },
  },
};
const mockNavBarOpenState = {
  ui: {
    navBar: { isOpen: true },
    filters: { categories: { isOpen: false } },
    alert: { isOpen: false, type: "" as const, title: "", message: "" },
  },
};
const mockNavBarClosedState = {
  ui: {
    navBar: { isOpen: false },
    filters: { categories: { isOpen: false } },
    alert: { isOpen: false, type: "" as const, title: "", message: "" },
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

const renderComponent = (preloadedState?: Partial<RootState>): RenderResult => {
  const store = createTestStore(preloadedState);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    </Provider>
  );
};

beforeEach(() => {
  const firestore = jest.requireMock("firebase/firestore/lite");
  const providers = jest.requireMock("@/firebase/providers");
  firestore.collection.mockReturnValue({});
  firestore.doc.mockReturnValue({ id: "mock-doc-id" });
  firestore.setDoc.mockResolvedValue(undefined);
  firestore.getDocs.mockResolvedValue({ docs: [] });
  firestore.deleteDoc.mockResolvedValue(undefined);
  providers.logoutFirebase.mockResolvedValue(undefined);
});

describe("NavBar", () => {
  describe("rendering", () => {
    it("should render the header wrapper element", () => {
      const { container } = renderComponent();
      expect(container.querySelector<HTMLElement>(".header-wrapper")).toBeInTheDocument();
    });

    it("should render the logo image", () => {
      renderComponent();
      expect(screen.getByRole("img", { name: /logo/i })).toBeInTheDocument();
    });

    it("should render the Home navigation link", () => {
      renderComponent();
      expect(screen.getByRole("link", { name: /navigate to home page/i })).toBeInTheDocument();
    });

    it("should render the Favorite navigation link", () => {
      renderComponent();
      expect(screen.getByRole("link", { name: /navigate to favorites page/i })).toBeInTheDocument();
    });

    it("should render the Games navigation link", () => {
      renderComponent();
      expect(screen.getByRole("link", { name: /navigate to games page/i })).toBeInTheDocument();
    });

    it("should render the LogOut button", () => {
      renderComponent();
      expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
    });

    it("should render the displayName when provided in store", () => {
      renderComponent(mockAuthenticatedUser);
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    it("should render the generic avatar when photoURL is empty", () => {
      renderComponent(mockAuthenticatedUser);
      expect(screen.getByRole("img", { name: "photoURL" })).toBeInTheDocument();
    });

    it("should render the user avatar with displayName alt when photoURL is provided", () => {
      renderComponent(mockAuthenticatedUserWithPhoto);
      expect(screen.getByRole("img", { name: "Test User" })).toBeInTheDocument();
    });

    it("should render the user avatar with correct src when photoURL is provided", () => {
      renderComponent(mockAuthenticatedUserWithPhoto);
      expect(screen.getByRole("img", { name: "Test User" })).toHaveAttribute(
        "src",
        "https://example.com/avatar.jpg"
      );
    });

    it("should render nav with header-wrapper__nav--open class when navBar is open", () => {
      const { container } = renderComponent(mockNavBarOpenState);
      expect(
        container.querySelector<HTMLElement>(".header-wrapper__nav.header-wrapper__nav--open")
      ).toBeInTheDocument();
    });

    it("should not render nav with header-wrapper__nav--open class when navBar is closed", () => {
      const { container } = renderComponent(mockNavBarClosedState);
      expect(
        container.querySelector<HTMLElement>(".header-wrapper__nav--open")
      ).not.toBeInTheDocument();
    });
  });

  describe("behavior", () => {
    it("should call logoutFirebase after clicking the LogOut button", async () => {
      const { logoutFirebase } = jest.requireMock("@/firebase/providers");
      const user = userEvent.setup();
      renderComponent(mockAuthenticatedUser);
      await user.click(screen.getByRole("button", { name: /log out/i }));
      expect(logoutFirebase).toHaveBeenCalled();
    });

    it("should dispatch logout action and clear user state after clicking LogOut", async () => {
      const user = userEvent.setup();
      const store = createTestStore(mockAuthenticatedUser);
      render(
        <Provider store={store}>
          <MemoryRouter>
            <NavBar />
          </MemoryRouter>
        </Provider>
      );
      await user.click(screen.getByRole("button", { name: /log out/i }));
      expect(store.getState().auth.user.uid).toBe("");
    });
  });

  describe("edge cases", () => {
    it("should render the generic avatar with fallback src when photoURL is empty", () => {
      renderComponent(mockAuthenticatedUser);
      const genericAvatar = screen.getByRole("img", { name: "photoURL" });
      expect(genericAvatar).toHaveAttribute("src", "http://i.imgur.com/AtBE7.png");
    });

    it("should render nav element with base class regardless of navBar state", () => {
      const { container } = renderComponent(mockNavBarClosedState);
      expect(container.querySelector<HTMLElement>(".header-wrapper__nav")).toBeInTheDocument();
    });

    it("should render three navigation links", () => {
      renderComponent();
      const navLinks = screen.getAllByRole("link");
      expect(navLinks.length).toBeGreaterThanOrEqual(3);
    });
  });
});
