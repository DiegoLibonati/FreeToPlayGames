import { Fragment } from "react/jsx-runtime";
import { Navigate, Outlet } from "react-router";
import { IoMdRocket } from "react-icons/io";

import type { JSX } from "react";

import ActiveGame from "@/components/ActiveGame/ActiveGame";

import { useCheckAuth } from "@/hooks/useCheckAuth";
import { useGamesStore } from "@/hooks/useGamesStore";

export const PrivateRoute = (): JSX.Element => {
  const { status } = useCheckAuth();
  const { activeGame } = useGamesStore();

  return status === "authenticated" ? (
    <Fragment>
      <Outlet />

      <IoMdRocket
        className="rocket-top"
        onClick={() => {
          window.scrollTo(0, 0);
        }}
      ></IoMdRocket>

      {activeGame && <ActiveGame></ActiveGame>}
    </Fragment>
  ) : (
    <Navigate to="/login" replace />
  );
};
