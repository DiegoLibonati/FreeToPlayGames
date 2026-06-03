import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";
import Swal from "sweetalert2";

import type { SweetAlertIcon } from "sweetalert2";
import type { JSX } from "react";

import CheckingAuth from "@/components/CheckingAuth/CheckingAuth";

import LoginPage from "@/pages/LoginPage/LoginPage";
import RegisterPage from "@/pages/RegisterPage/RegisterPage";
import HomePage from "@/pages/HomePage/HomePage";
import FavoritePage from "@/pages/FavoritePage/FavoritePage";
import GamesPage from "@/pages/GamesPage/GamesPage";

import { useCheckAuth } from "@/hooks/useCheckAuth";
import { useUiStore } from "@/hooks/useUiStore";

import { PrivateRoute } from "@/router/PrivateRoute";
import { PublicRoute } from "@/router/PublicRoute";
import { useAuthStore } from "@/hooks/useAuthStore";

export const GamesRouter = (): JSX.Element => {
  const { alert, handleCloseAlert } = useUiStore();
  const { errorMessage } = useAuthStore();
  const { status } = useCheckAuth();

  useEffect(() => {
    if (errorMessage) void Swal.fire("Error", errorMessage, "error");
  }, [errorMessage]);

  useEffect(() => {
    if (!alert.isOpen) return;

    void Swal.fire(alert.title, alert.message, alert.type as SweetAlertIcon);
    handleCloseAlert();
  }, [alert.isOpen]);

  if (status === "checking") return <CheckingAuth></CheckingAuth>;

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage></LoginPage>}></Route>
        <Route path="/register" element={<RegisterPage></RegisterPage>}></Route>
      </Route>

      <Route element={<PrivateRoute />}>
        <Route path="/home" element={<HomePage></HomePage>}></Route>

        <Route path="/favorite" element={<FavoritePage></FavoritePage>}></Route>

        <Route path="/explore" element={<GamesPage></GamesPage>}></Route>
      </Route>

      <Route path="/*" element={<Navigate to="/login"></Navigate>}></Route>
    </Routes>
  );
};
