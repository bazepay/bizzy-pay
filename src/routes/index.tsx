import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const session = useSession();
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: session ? "/dashboard" : "/login", replace: true });
  }, [session, navigate]);
  return null;
}
