import { Navigate, Outlet } from "react-router";

import type { JSX } from "react";

import { useCheckAuth } from "@/hooks/useCheckAuth";

export const PublicRoute = (): JSX.Element => {
  const { status } = useCheckAuth();

  return status !== "authenticated" ? <Outlet /> : <Navigate to="/home" replace />;
};
