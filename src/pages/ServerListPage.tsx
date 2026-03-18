import { useNavigate } from "react-router-dom";
import { Cloud, Server, LogOut, Circle, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const mockServers = [
  { id: "srv-1", name: "Survival SMP", status: "online" as const, ram: "2048 MB", version: "Paper 1.20.1", players: "12/50" },
  { id: "srv-2", name: "Creative Build", status: "online" as const, ram: "4096 MB", version: "Paper 1.20.1", players: "3/20" },
  { id: "srv-3", name: "Minigames Hub", status: "offline" as const, ram: "1024 MB", version: "Spigot 1.19.4", players: "0/30" },
  { id: "srv-4", name: "Testing Server", status: "offline" as const, ram: "512 MB", version: "Vanilla 1.20.1", players: "0/5" },
];

export default function ServerListPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");

  const filtered = mockServers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Cloud className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-foreground">ShreeCloud Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.username}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Your Servers</h1>
            <p className="text-muted-foreground text-sm mt-1">Select a server to manage</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search servers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-muted/50 border-border text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((server) => (
            <Card
              key={server.id}
              className="bg-card border-border hover:border-primary/40 transition-all duration-200 cursor-pointer group hover:shadow-lg hover:shadow-primary/5 arix-glow"
              onClick={() => navigate(`/server/${server.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
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
                        ? "border-success/30 text-success bg-success/10"
                        : "border-muted-foreground/30 text-muted-foreground bg-muted/50"
                    }
                  >
                    <Circle
                      className={`h-2 w-2 mr-1.5 fill-current ${server.status === "online" ? "text-success" : "text-muted-foreground"}`}
                    />
                    {server.status === "online" ? "Online" : "Offline"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>RAM: {server.ram}</span>
                  <span>Players: {server.players}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
