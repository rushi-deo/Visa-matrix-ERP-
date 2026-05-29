import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, isHydrated } = useAuth();

  if (!isHydrated) {
    return null;
  }

  return <Navigate to={user ? "/dashboard" : "/login"} />;
}
