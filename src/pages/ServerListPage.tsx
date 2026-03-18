import { useNavigate } from "react-router-dom";
import { Cloud, Server, LogOut, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const mockServers = [
  { id: "srv-1", name: "Survival SMP", status: "online" as const, ram: "2048 MB", version: "Paper 1.20.1" },
  { id: "srv-2", name: "Creative Build", status: "online" as const, ram: "4096 MB", version: "Paper 1.20.1" },
  { id: "srv-3", name: "Minigames Hub", status: "offline" as const, ram: "1024 MB", version: "Spigot 1.19.4" },
  { id: "srv-4", name: "Testing Server", status: "offline" as const, ram: "512 MB", version: "Vanilla 1.20.1" },
];

export default function ServerListPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cloud className="h-6 w-6 text-primary" />
            <span className="font-semibold text-foreground">ShreeCloud Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.username}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Your Servers</h1>
          <p className="text-muted-foreground text-sm mt-1">Select a server to manage</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mockServers.map((server) => (
            <Card
              key={server.id}
              className="bg-card border-border hover:border-primary/40 transition-all duration-200 cursor-pointer group hover:shadow-lg hover:shadow-primary/5"
              onClick={() => navigate(`/server/${server.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Server className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{server.name}</h3>
                      <p className="text-xs text-muted-foreground">{server.version}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      server.status === "online"
                        ? "border-[hsl(var(--success))]/30 text-[hsl(var(--success))] bg-[hsl(var(--success))]/10"
                        : "border-muted-foreground/30 text-muted-foreground bg-muted/50"
                    }
                  >
                    <Circle
                      className={`h-2 w-2 mr-1.5 fill-current ${server.status === "online" ? "text-[hsl(var(--success))]" : "text-muted-foreground"}`}
                    />
                    {server.status === "online" ? "Online" : "Offline"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>RAM: {server.ram}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
