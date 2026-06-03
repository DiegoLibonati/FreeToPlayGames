import { Fragment, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import queryString from "query-string";

import type { JSX } from "react";

import NavBar from "@/components/NavBar/NavBar";
import Footer from "@/components/Footer/Footer";
import Loader from "@/components/Loader/Loader";
import CardGame from "@/components/CardGame/CardGame";
import OptionFilter from "@/components/OptionFilter/OptionFilter";

import { useGamesStore } from "@/hooks/useGamesStore";
import { useUiStore } from "@/hooks/useUiStore";

import "@/pages/GamesPage/GamesPage.css";

const GamesPage = (): JSX.Element => {
  const { games, isLoadingGames, categories, handleGetGamesByCategory, handleSetToInitialState } =
    useGamesStore();
  const { isFilterCategoriesOpen, handleOpenFilterCategories, handleCloseFilterCategories } =
    useUiStore();

  const navigate = useNavigate();
  const location = useLocation();

  const { q = "" } = queryString.parse(location.search);

  const onDestroy = (): void => {
    handleSetToInitialState();
  };

  useEffect(() => {
    const category = q as string;

    handleGetGamesByCategory(category);
  }, [q]);

  useEffect(() => {
    return (): void => {
      onDestroy();
    };
  });

  const handleClickFilter = (value: string): void => {
    void navigate(`?q=${value}`);
  };

  return (
    <Fragment>
      <NavBar></NavBar>

      <main className="main-games-page">
        <section className="games-page-options">
          <h2 className="games-page-options__title">Filters</h2>
          <OptionFilter
            name="Categories"
            isOpen={isFilterCategoriesOpen}
            arr={categories}
            handleClickFilter={handleClickFilter}
            handleClickOpenAndClose={
              isFilterCategoriesOpen ? handleCloseFilterCategories : handleOpenFilterCategories
            }
          ></OptionFilter>
        </section>

        {isLoadingGames ? (
          <Loader></Loader>
        ) : games.length > 0 ? (
          <section className="all-games">
            <div className="all-games__title">
              <h2 className="all-games__title-text">Games</h2>
            </div>
            {games.map((game) => (
              <CardGame
                key={game.id}
                id={game.id}
                thumbnail={game.thumbnail}
                title={game.title}
              ></CardGame>
            ))}
          </section>
        ) : (
          <section className="all-games__not-games">
            <h2 className="all-games__not-games-label">¡That category does not exists!</h2>
          </section>
        )}
      </main>

      <Footer></Footer>
    </Fragment>
  );
};

export default GamesPage;
