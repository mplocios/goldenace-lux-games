import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Maximize, Minimize, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const Route = createFileRoute("/play/$gameId")({
  component: PlayGame,
});

function PlayGame() {
  const { gameId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    async function initGame() {
      try {
        const res = await fetch(`${API_URL}/api/v1/platform/games/init`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            game_uuid: gameId,
            player_id: String(user!.id),
            currency: "PHP",
            language: "en",
            return_url: window.location.origin,
          }),
        });

        const data = await res.json();

        if (data.url || data.launch_url) {
          setGameUrl(data.url || data.launch_url);
        } else if (data.error) {
          setError(data.error);
        } else {
          setError("Could not launch game");
        }
      } catch (e) {
        console.error("Game init failed:", e);
        setError("Failed to connect to game server");
      } finally {
        setLoading(false);
      }
    }

    initGame();
  }, [gameId, user, navigate]);

  if (!user) return null;

  return (
    <div className={`flex flex-col bg-background ${fullscreen ? "fixed inset-0 z-50" : "min-h-dvh"}`}>
      <header className="flex items-center justify-between border-b border-border/40 bg-card/80 px-4 py-2 backdrop-blur">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to lobby</span>
        </Link>
        <span className="truncate px-4 font-display text-sm text-foreground">{gameId}</span>
        <button
          onClick={() => setFullscreen((f) => !f)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-gold"
          aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </button>
      </header>

      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-gold" />
              <p className="mt-3 text-sm text-muted-foreground">Loading game...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="max-w-sm text-center">
              <p className="text-lg font-semibold text-foreground">Unable to load game</p>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <Link
                to="/"
                className="mt-5 inline-flex items-center justify-center rounded-md bg-gold-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)]"
              >
                Return to lobby
              </Link>
            </div>
          </div>
        )}

        {gameUrl && (
          <iframe
            src={gameUrl}
            title="Game"
            className="h-full w-full border-0"
            style={{ minHeight: fullscreen ? "100%" : "calc(100dvh - 49px)" }}
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        )}
      </div>
    </div>
  );
}
