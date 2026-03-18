import { useState, useMemo } from "react";
import { Check, Download, Search, Server, Box, Layers, Network, Cuboid } from "lucide-react";

// ── Egg definitions ────────────────────────────────────────

interface Egg {
  id: string;
  name: string;
  icon: typeof Server;
  color: string;
  description: string;
  versions: VersionInfo[];
}

interface VersionInfo {
  version: string;
  tag: "latest" | "stable" | "old";
}

function generateVersions(versions: string[]): VersionInfo[] {
  return versions.map((v, i) => ({
    version: v,
    tag: i === 0 ? "latest" as const : i < 4 ? "stable" as const : "old" as const,
  }));
}

const EGGS: Egg[] = [
  {
    id: "paper",
    name: "Paper",
    icon: Layers,
    color: "text-red-400",
    description: "High performance fork of Spigot",
    versions: generateVersions([
      "1.21.4", "1.21.3", "1.21.1", "1.21", "1.20.6", "1.20.4", "1.20.2", "1.20.1",
      "1.19.4", "1.19.3", "1.19.2", "1.19.1", "1.19", "1.18.2", "1.18.1",
      "1.17.1", "1.17", "1.16.5", "1.16.4", "1.16.3", "1.16.1",
      "1.15.2", "1.14.4", "1.13.2", "1.12.2",
    ]),
  },
  {
    id: "spigot",
    name: "Spigot",
    icon: Server,
    color: "text-amber-400",
    description: "Modified Minecraft server with plugin support",
    versions: generateVersions([
      "1.21.4", "1.21.3", "1.21.1", "1.21", "1.20.6", "1.20.4", "1.20.2", "1.20.1",
      "1.19.4", "1.19.3", "1.19.2", "1.19", "1.18.2", "1.18.1",
      "1.17.1", "1.16.5", "1.16.4", "1.16.1", "1.15.2", "1.14.4", "1.13.2", "1.12.2",
    ]),
  },
  {
    id: "bukkit",
    name: "Bukkit",
    icon: Box,
    color: "text-orange-400",
    description: "Classic server mod with plugin API",
    versions: generateVersions([
      "1.21.4", "1.21.1", "1.20.4", "1.20.1", "1.19.4", "1.19.2",
      "1.18.2", "1.17.1", "1.16.5", "1.16.1", "1.15.2", "1.14.4", "1.13.2", "1.12.2",
    ]),
  },
  {
    id: "bungeecord",
    name: "BungeeCord",
    icon: Network,
    color: "text-sky-400",
    description: "Proxy server for connecting multiple servers",
    versions: generateVersions([
      "1.21", "1.20", "1.19", "1.18", "1.17", "1.16", "1.15", "1.14", "1.13", "1.12",
    ]),
  },
  {
    id: "vanilla",
    name: "Vanilla",
    icon: Cuboid,
    color: "text-emerald-400",
    description: "Official Minecraft server",
    versions: generateVersions([
      "1.21.4", "1.21.3", "1.21.1", "1.21", "1.20.6", "1.20.4", "1.20.2", "1.20.1",
      "1.19.4", "1.19.3", "1.19.2", "1.19.1", "1.19", "1.18.2", "1.18.1",
      "1.17.1", "1.17", "1.16.5", "1.16.4", "1.16.3", "1.16.1",
      "1.15.2", "1.14.4", "1.13.2", "1.12.2", "1.11.2", "1.10.2",
    ]),
  },
];

const TAG_STYLES: Record<string, string> = {
  latest: "bg-success/15 text-success",
  stable: "bg-primary/15 text-primary",
  old: "bg-muted text-muted-foreground",
};

// ── Component ──────────────────────────────────────────────

export function VersionPage() {
  const [selectedEgg, setSelectedEgg] = useState<string | null>(null);
  const [installedVersion, setInstalledVersion] = useState<string | null>(null);
  const [versionSearch, setVersionSearch] = useState("");

  const activeEgg = EGGS.find((e) => e.id === selectedEgg);

  const filteredVersions = useMemo(() => {
    if (!activeEgg) return [];
    if (!versionSearch.trim()) return activeEgg.versions;
    const q = versionSearch.toLowerCase();
    return activeEgg.versions.filter((v) => v.version.includes(q));
  }, [activeEgg, versionSearch]);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Server Version</h1>
        <p className="text-sm text-muted-foreground mt-1">Select your server software and version</p>
      </div>

      {/* Egg Selection */}
      <div className="space-y-3">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Server Software</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {EGGS.map((egg) => {
            const active = selectedEgg === egg.id;
            return (
              <button
                key={egg.id}
                onClick={() => {
                  setSelectedEgg(egg.id);
                  setInstalledVersion(null);
                  setVersionSearch("");
                }}
                className={`relative flex flex-col items-center gap-2 p-5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                  active
                    ? "bg-primary/10 border-primary text-foreground ring-1 ring-primary/30 shadow-lg shadow-primary/5"
                    : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <egg.icon className={`h-8 w-8 ${active ? "text-primary" : egg.color}`} />
                <span className="text-sm font-bold">{egg.name}</span>
                <span className="text-[10px] text-muted-foreground text-center leading-tight">{egg.description}</span>
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

      {/* Version List */}
      {activeEgg && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Search + count */}
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
            <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
              <span>{filteredVersions.length} of {activeEgg.versions.length} versions</span>
            </div>
          </div>

          {/* Version Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredVersions.map((v) => {
              const installId = `${activeEgg.id}-${v.version}`;
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
                  {/* Top row */}
                  <div className="flex items-start gap-2.5">
                    <activeEgg.icon
                      className={`h-5 w-5 shrink-0 mt-0.5 ${isInstalled ? "text-primary" : activeEgg.color}`}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-foreground block">{v.version}</span>
                      <span className="text-[10px] text-muted-foreground">{activeEgg.name}</span>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${TAG_STYLES[v.tag]}`}
                    >
                      {v.tag}
                    </span>
                  </div>

                  {/* Install button */}
                  <button
                    onClick={() => setInstalledVersion(installId)}
                    className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      isInstalled
                        ? "bg-primary/15 text-primary border border-primary/30 cursor-default"
                        : "bg-primary text-primary-foreground hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                    disabled={isInstalled}
                  >
                    {isInstalled ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Installed
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" /> Install
                      </>
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
      {!activeEgg && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Server className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm">Select a server software above to view available versions</p>
        </div>
      )}
    </div>
  );
}
