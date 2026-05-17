import { http, HttpResponse } from "msw";

import { mockGames } from "@tests/__mocks__/games.mock";

export const mockMswHandlers = [
  http.get("*/api/games", ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");

    if (category) {
      const filtered = mockGames.filter((game) => game.genre === category);
      return HttpResponse.json(filtered);
    }

    return HttpResponse.json(mockGames);
  }),
];
