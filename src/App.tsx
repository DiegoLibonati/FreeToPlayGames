import { Provider } from "react-redux";
import { HashRouter } from "react-router";

import type { JSX } from "react";

import { GamesRouter } from "@/router/GamesRouter";

import { store } from "@/app/store";

function App(): JSX.Element {
  return (
    <Provider store={store}>
      <HashRouter>
        <GamesRouter></GamesRouter>
      </HashRouter>
    </Provider>
  );
}

export default App;
