import { Link, useNavigate } from "@tanstack/react-router";
// import { AnimatedShinyText } from "@workspace/ui/components/animated-shimmet-text";
import { Button } from "@repo/ui/components/button";
import { ModeToggle } from "./mode-toggle";
import { signOut, useAuth } from "@/lib/auth";
import { useApolloClient } from "@apollo/client";
import { HeaderUser } from "./header-user";
import { Github } from "lucide-react";
// import { UserProfile } from "./user-profile";
// import { SyncAutosave } from "./sync-autosave";

export function Header() {
  const { isAuthenticated, user } = useAuth();
  const client = useApolloClient();
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Clear / wipe out the Apollo cache on sign out
    client.clearStore();
    // Sign out the user
    signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: "/sign-in" });
        },
      },
    });
  };

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 h-[56px] w-full border-b px-2 backdrop-blur">
      <div className="flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <Link
              to="/todos"
              search={{
                activeTab: "all",
              }}
              className="text-3xl font-normal text-primary transition-colors hover:text-primary/80 tracking-tighter"
            >
              <span>my</span>
              <span className="font-bold">TODO</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              to="/todos"
              className="text-normal font-bold text-primary transition-colors hover:text-primary/80"
            >
              Todos
            </Link>
          </nav>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              to="/categories"
              className="text-normal font-bold text-primary transition-colors hover:text-primary/80"
            >
              Edit Categories
            </Link>
          </nav>
        </div>

        <div className="flex grow-0 items-center gap-3">
          {" "}
          <Button size="sm" variant="ghost">
            <Github />
            Github
          </Button>
          <ModeToggle />{" "}
          {isAuthenticated && (
            <>
              <HeaderUser
                user={{
                  name: user?.name || "User",
                  email: user?.email || "n/a",
                }}
                signOut={handleSignOut}
              />
            </>
          )}
          {!isAuthenticated && (
            <div className="ml-auto flex gap-2">
              <Link to="/sign-in" className="[&.active]:font-bold">
                Login
              </Link>
              <Link to="/sign-up" className="[&.active]:font-bold">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
