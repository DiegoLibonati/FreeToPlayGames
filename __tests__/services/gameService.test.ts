import { http, HttpResponse } from "msw";

import gameService from "@/services/gameService";

import { mockGames } from "@tests/__mocks__/games.mock";
import { mockMswServer } from "@tests/__mocks__/mswServer.mock";

jest.mock("@/constants/envs", () => ({
  __esModule: true,
  default: {
    xRapid: { apiKey: "test-key", apiHost: "test-host", apiUrl: "test-url" },
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

describe("gameService", () => {
  describe("getAll", () => {
    it("should return the array of games on a successful response", async () => {
      const result = await gameService.getAll();

      expect(result).toEqual(mockGames);
    });

    it("should throw an error when the response is not ok", async () => {
      mockMswServer.use(
        http.get("*/api/games", () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      await expect(gameService.getAll()).rejects.toThrow("HTTP error! status: 500");
    });

    it("should throw an error on a network failure", async () => {
      mockMswServer.use(
        http.get("*/api/games", () => {
          return HttpResponse.error();
        })
      );

      await expect(gameService.getAll()).rejects.toThrow();
    });

    it("should send the RapidAPI headers", async () => {
      let receivedHeaders: Headers | null = null;

      mockMswServer.use(
        http.get("*/api/games", ({ request }) => {
          receivedHeaders = request.headers;
          return HttpResponse.json(mockGames);
        })
      );

      await gameService.getAll();

      expect(receivedHeaders!.get("x-rapidapi-key")).toBe("test-key");
      expect(receivedHeaders!.get("x-rapidapi-host")).toBe("test-host");
    });
  });

  describe("getByCategory", () => {
    it("should return only games matching the requested category", async () => {
      const result = await gameService.getByCategory("MMORPG");

      expect(result).toEqual(mockGames.filter((game) => game.genre === "MMORPG"));
    });

    it("should send the category as a query parameter", async () => {
      let receivedUrl = "";

      mockMswServer.use(
        http.get("*/api/games", ({ request }) => {
          receivedUrl = request.url;
          return HttpResponse.json(mockGames);
        })
      );

      await gameService.getByCategory("Strategy");

      expect(receivedUrl).toContain("category=Strategy");
    });

    it("should throw an error when the response is not ok", async () => {
      mockMswServer.use(
        http.get("*/api/games", () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      await expect(gameService.getByCategory("MMORPG")).rejects.toThrow("HTTP error! status: 404");
    });

    it("should throw an error on a network failure", async () => {
      mockMswServer.use(
        http.get("*/api/games", () => {
          return HttpResponse.error();
        })
      );

      await expect(gameService.getByCategory("MMORPG")).rejects.toThrow();
    });

    it("should send the RapidAPI headers", async () => {
      let receivedHeaders: Headers | null = null;

      mockMswServer.use(
        http.get("*/api/games", ({ request }) => {
          receivedHeaders = request.headers;
          return HttpResponse.json(mockGames);
        })
      );

      await gameService.getByCategory("MMORPG");

      expect(receivedHeaders!.get("x-rapidapi-key")).toBe("test-key");
      expect(receivedHeaders!.get("x-rapidapi-host")).toBe("test-host");
    });
  });
});
