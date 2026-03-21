import { useState, useEffect, useMemo, useCallback } from "react";
import { Check, Download, Search, Server, Box, Layers, Network, Cuboid, Loader2, AlertTriangle, ArrowUpDown, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────

interface ServerType {
  id: string;
  name: string;
  icon: typeof Server;
  color: string;
  description: string;
}

interface VersionInfo {
  version: string;
  build?: number;
  releaseDate?: string;
  tag: "latest" | "stable" | "old";
}

const SERVER_TYPES: ServerType[] = [
  { id: "paper", name: "Paper", icon: Layers, color: "text-red-400", description: "High performance fork of Spigot" },
  { id: "vanilla", name: "Vanilla", icon: Cuboid, color: "text-emerald-400", description: "Official Minecraft server" },
  { id: "spigot", name: "Spigot", icon: Server, color: "text-amber-400", description: "Modified server with plugin support" },
  { id: "bukkit", name: "Bukkit", icon: Box, color: "text-orange-400", description: "Classic server mod with plugin API" },
  { id: "bungeecord", name: "BungeeCord", icon: Network, color: "text-sky-400", description: "Proxy for connecting servers" },
];

const TAG_STYLES: Record<string, string> = {
  latest: "bg-primary/15 text-primary",
  stable: "bg-accent text-accent-foreground",
  old: "bg-muted text-muted-foreground",
};

// ── API Fetchers ───────────────────────────────────────

async function fetchPaperVersions(): Promise<VersionInfo[]> {
  const res = await fetch("https://api.papermc.io/v2/projects/paper");
  if (!res.ok) throw new Error("Failed to fetch Paper versions");
  const data = await res.json();
  const versions: string[] = (data.versions || []).reverse();

  // Fetch latest build for the most recent version
  const results: VersionInfo[] = [];
  for (let i = 0; i < versions.length; i++) {
    const v = versions[i];
    let build: number | undefined;
    if (i < 3) {
      try {
        const buildRes = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${v}`);
        if (buildRes.ok) {
          const buildData = await buildRes.json();
          const builds = buildData.builds || [];
          build = builds[builds.length - 1];
        }
      } catch {}
    }
    results.push({
      version: v,
      build,
      tag: i === 0 ? "latest" : i < 5 ? "stable" : "old",
    });
  }
  return results;
}

async function fetchVanillaVersions(): Promise<VersionInfo[]> {
  const res = await fetch("https://launchermeta.mojang.com/mc/game/version_manifest_v2.json");
  if (!res.ok) throw new Error("Failed to fetch Vanilla versions");
  const data = await res.json();
  const releases = (data.versions || []).filter((v: any) => v.type === "release");
  return releases.map((v: any, i: number) => ({
    version: v.id,
    releaseDate: v.releaseTime,
    tag: i === 0 ? "latest" as const : i < 5 ? "stable" as const : "old" as const,
  }));
}

async function fetchWaterfallVersions(): Promise<VersionInfo[]> {
  const res = await fetch("https://api.papermc.io/v2/projects/waterfall");
  if (!res.ok) throw new Error("Failed to fetch Waterfall versions");
  const data = await res.json();
  const versions: string[] = (data.versions || []).reverse();
  return versions.map((v, i) => ({
    version: v,
    tag: i === 0 ? "latest" as const : i < 3 ? "stable" as const : "old" as const,
  }));
}

// Spigot/Bukkit/BungeeCord don't have clean public APIs - use Vanilla versions as reference
function deriveVersions(vanillaVersions: VersionInfo[], type: string): VersionInfo[] {
  const supported = vanillaVersions.filter(v => {
    const parts = v.version.split(".").map(Number);
    if (type === "bungeecord") return parts[1] >= 8;
    return parts[1] >= 8; // Spigot/Bukkit support 1.8+
  });
  return supported.map((v, i) => ({
    version: v.version,
    releaseDate: v.releaseDate,
    tag: i === 0 ? "latest" as const : i < 5 ? "stable" as const : "old" as const,
  }));
}

// ── Component ──────────────────────────────────────────

export function VersionPage() {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [installedVersion, setInstalledVersion] = useState<string | null>(null);
  const [versionSearch, setVersionSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vanillaCache, setVanillaCache] = useState<VersionInfo[] | null>(null);

  const fetchVersions = useCallback(async (typeId: string) => {
    setLoading(true);
    setError(null);
    setVersions([]);
    try {
      let result: VersionInfo[];
      if (typeId === "paper") {
        result = await fetchPaperVersions();
      } else if (typeId === "vanilla") {
        if (vanillaCache) {
          result = vanillaCache;
        } else {
          result = await fetchVanillaVersions();
          setVanillaCache(result);
        }
      } else if (typeId === "bungeecord") {
        result = await fetchWaterfallVersions();
      } else {
        // Spigot/Bukkit - derive from vanilla
        let vanilla = vanillaCache;
        if (!vanilla) {
          vanilla = await fetchVanillaVersions();
          setVanillaCache(vanilla);
        }
        result = deriveVersions(vanilla, typeId);
      }
      setVersions(result);
    } catch (err: any) {
      setError(err.message || "Failed to load versions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [vanillaCache]);

  useEffect(() => {
    if (selectedType) {
      fetchVersions(selectedType);
    }
  }, [selectedType, fetchVersions]);

  const activeType = SERVER_TYPES.find(t => t.id === selectedType);

  const filteredVersions = useMemo(() => {
    let filtered = versions;
    if (versionSearch.trim()) {
      const q = versionSearch.toLowerCase();
      filtered = filtered.filter(v => v.version.includes(q));
    }
    if (sortOrder === "oldest") {
      filtered = [...filtered].reverse();
    }
    return filtered;
  }, [versions, versionSearch, sortOrder]);

  const handleInstall = (version: string) => {
    const installId = `${selectedType}-${version}`;
    setInstalledVersion(installId);
    toast({ title: "Version installed", description: `${activeType?.name} ${version} has been installed.` });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Server Version</h1>
        <p className="text-sm text-muted-foreground mt-1">Select your server software and version — fetched in real time</p>
      </div>

      {/* Server Type Selection */}
      <div className="space-y-3">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Server Software</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {SERVER_TYPES.map((type) => {
            const active = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedType(type.id);
                  setInstalledVersion(null);
                  setVersionSearch("");
                }}
                className={`relative flex flex-col items-center gap-2 p-5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                  active
                    ? "bg-primary/10 border-primary text-foreground ring-1 ring-primary/30 shadow-lg shadow-primary/5"
                    : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <type.icon className={`h-8 w-8 ${active ? "text-primary" : type.color}`} />
                <span className="text-sm font-bold">{type.name}</span>
                <span className="text-[10px] text-muted-foreground text-center leading-tight">{type.description}</span>
                {active && (
                  <span className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-primary" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching {activeType?.name} versions...
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <p className="text-sm">{error}</p>
          <Button size="sm" variant="outline" onClick={() => selectedType && fetchVersions(selectedType)}>
            Try Again
          </Button>
        </div>
      )}

      {/* Version List */}
      {activeType && !loading && !error && versions.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Search + controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={versionSearch}
                onChange={(e) => setVersionSearch(e.target.value)}
                placeholder="Search versions..."
                className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setSortOrder(s => s === "latest" ? "oldest" : "latest")}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md border border-border bg-card"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                {sortOrder === "latest" ? "Latest first" : "Oldest first"}
              </button>
              <span className="text-xs text-muted-foreground">
                {filteredVersions.length} of {versions.length} versions
              </span>
            </div>
          </div>

          {/* Version Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredVersions.map((v) => {
              const installId = `${activeType.id}-${v.version}`;
              const isInstalled = installedVersion === installId;
              return (
                <div
                  key={v.version}
                  className={`relative bg-card border rounded-xl p-4 flex flex-col gap-3 transition-all duration-200 ${
                    isInstalled
                      ? "border-primary ring-1 ring-primary/30 shadow-lg shadow-primary/5"
                      : "border-border hover:border-primary/40 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <activeType.icon className={`h-5 w-5 shrink-0 mt-0.5 ${isInstalled ? "text-primary" : activeType.color}`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-foreground block">{v.version}</span>
                      <span className="text-[10px] text-muted-foreground">{activeType.name}</span>
                      {v.build && (
                        <span className="text-[10px] text-muted-foreground block">Build #{v.build}</span>
                      )}
                    </div>
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0.5 shrink-0 ${TAG_STYLES[v.tag]}`}>
                      {v.tag}
                    </Badge>
                  </div>

                  {v.releaseDate && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(v.releaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  )}

                  <button
                    onClick={() => handleInstall(v.version)}
                    className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      isInstalled
                        ? "bg-primary/15 text-primary border border-primary/30 cursor-default"
                        : "bg-primary text-primary-foreground hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                    disabled={isInstalled}
                  >
                    {isInstalled ? (
                      <><Check className="h-3.5 w-3.5" /> Installed</>
                    ) : (
                      <><Download className="h-3.5 w-3.5" /> Install</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {filteredVersions.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No versions match "{versionSearch}"
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!selectedType && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Server className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm">Select a server software above to view available versions</p>
        </div>
      )}
    </div>
  );
}
