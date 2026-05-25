import { Navigate } from "react-router-dom";

import { isAuthenticatedUser } from "../../config/rbac";
import { useAuth } from "../../hooks/useAuth";
import LoadingState from "./LoadingState";

export default function RootRedirect() {
  const { user, token, isBootstrapping } = useAuth();
  const isAuthenticated = isAuthenticatedUser(user, token);

  if (isBootstrapping) {
    return <LoadingState label="Loading..." />;
  }

  return (
    <Navigate
      to={isAuthenticated ? "/dashboard" : "/login"}
      replace
    />
  );
}
