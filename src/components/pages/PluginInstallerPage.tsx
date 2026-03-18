import { useState, useEffect, useCallback } from "react";
import { Search, Download, Star, Loader2, CheckCircle2, PackageOpen, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

const SOURCES = ["Modrinth", "Spigot"] as const;
const MODRINTH_CATEGORIES = ["All", "economy", "admin-tools", "pvp", "performance", "utility", "fun"] as const;
const SORT_OPTIONS = ["relevance", "downloads", "newest"] as const;
const PAGE_SIZE = 12;

interface PluginResult {
  id: string;
  name: string;
  description: string;
  source: string;
  downloads: number;
  rating: number;
  iconUrl?: string;
  url?: string;
  latestVersion?: string;
  oldestVersion?: string;
}

function formatDownloads(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

async function fetchModrinth(query: string, category: string, sort: string, page: number): Promise<{ results: PluginResult[]; totalPages: number }> {
  const offset = (page - 1) * PAGE_SIZE;
  const facets: string[][] = [["project_type:plugin"]];
  if (category !== "All") {
    facets.push([`categories:${category}`]);
  }

  const sortMap: Record<string, string> = {
    relevance: "relevance",
    downloads: "downloads",
    newest: "newest",
  };

  const params = new URLSearchParams({
    query: query,
    limit: String(PAGE_SIZE),
    offset: String(offset),
    index: sortMap[sort] || "relevance",
    facets: JSON.stringify(facets),
  });

  const res = await fetch(`https://api.modrinth.com/v2/search?${params}`);
  if (!res.ok) throw new Error("Modrinth API error");
  const data = await res.json();

  const results: PluginResult[] = (data.hits || []).map((hit: any) => {
    const gameVersions = (hit.versions || hit.game_versions || [])
      .filter((v: string) => /^\d+\.\d+/.test(v))
      .sort((a: string, b: string) => {
        const pa = a.split(".").map(Number);
        const pb = b.split(".").map(Number);
        for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
          if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
        }
        return 0;
      });
    return {
      id: hit.project_id || hit.slug,
      name: hit.title,
      description: hit.description || "",
      source: "Modrinth",
      downloads: hit.downloads || 0,
      rating: 0,
      iconUrl: hit.icon_url,
      url: `https://modrinth.com/plugin/${hit.slug}`,
      oldestVersion: gameVersions[0] || undefined,
      latestVersion: gameVersions.length > 1 ? gameVersions[gameVersions.length - 1] : gameVersions[0] || undefined,
    };
  });

  const totalPages = Math.ceil((data.total_hits || 0) / PAGE_SIZE);
  return { results, totalPages };
}

async function fetchSpiget(query: string, sort: string, page: number): Promise<{ results: PluginResult[]; totalPages: number }> {
  const sortMap: Record<string, string> = {
    relevance: "-rating",
    downloads: "-downloads",
    newest: "-updateDate",
  };

  let url: string;
  if (query.trim()) {
    url = `https://api.spiget.org/v2/search/resources/${encodeURIComponent(query)}?size=${PAGE_SIZE}&page=${page}&sort=${sortMap[sort] || "-downloads"}`;
  } else {
    url = `https://api.spiget.org/v2/resources?size=${PAGE_SIZE}&page=${page}&sort=${sortMap[sort] || "-downloads"}`;
  }

  const res = await fetch(url, {
    headers: { "User-Agent": "ShreeCloudPanel/1.0" },
  });
  if (!res.ok) throw new Error("Spiget API error");
  const data = await res.json();

  const items = Array.isArray(data) ? data : data.match ? data.match : [];

  const results: PluginResult[] = items.map((item: any) => {
    const tested = (item.testedVersions || [])
      .filter((v: string) => /^\d+\.\d+/.test(v))
      .sort((a: string, b: string) => {
        const pa = a.split(".").map(Number);
        const pb = b.split(".").map(Number);
        for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
          if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
        }
        return 0;
      });
    return {
      id: String(item.id),
      name: item.name,
      description: item.tag || "",
      source: "Spigot",
      downloads: item.downloads || 0,
      rating: item.rating?.average || 0,
      iconUrl: item.icon?.url ? `https://api.spiget.org/v2/resources/${item.id}/icon` : undefined,
      url: `https://www.spigotmc.org/resources/${item.id}`,
      oldestVersion: tested[0] || undefined,
      latestVersion: tested.length > 1 ? tested[tested.length - 1] : tested[0] || undefined,
    };
  });

  // Spiget doesn't return total count easily; if we got a full page, assume more exist
  const totalPages = results.length === PAGE_SIZE ? page + 1 : page;
  return { results, totalPages };
}

export function PluginInstallerPage() {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState<string>("Modrinth");
  const [category, setCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("downloads");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [plugins, setPlugins] = useState<PluginResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installing, setInstalling] = useState<string | null>(null);
  const [installed, setInstalled] = useState<Set<string>>(new Set());

  const fetchPlugins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let result: { results: PluginResult[]; totalPages: number };
      if (source === "Modrinth") {
        result = await fetchModrinth(search, category, sortBy, page);
      } else {
        result = await fetchSpiget(search, sortBy, page);
      }
      setPlugins(result.results);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message || "Failed to fetch plugins");
      setPlugins([]);
    } finally {
      setLoading(false);
    }
  }, [search, source, category, sortBy, page]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlugins();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchPlugins]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, source, category, sortBy]);

  const handleInstall = (id: string) => {
    setInstalling(id);
    setTimeout(() => {
      setInstalling(null);
      setInstalled((prev) => new Set(prev).add(id));
    }, 1500);
  };

  const selectClass =
    "bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer";

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Plugin Installer</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse and install plugins from real sources</p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plugins..."
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Source</label>
            <select value={source} onChange={(e) => setSource(e.target.value)} className={selectClass}>
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {source === "Modrinth" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
                {MODRINTH_CATEGORIES.map((c) => <option key={c} value={c}>{c === "All" ? "All" : c.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectClass}>
              {SORT_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span className="text-sm">Fetching plugins from {source}...</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 text-destructive">
          <p className="text-sm font-medium">{error}</p>
          <button onClick={fetchPlugins} className="mt-3 text-xs text-primary underline">Retry</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && plugins.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <PackageOpen className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-sm font-medium">No plugins found for selected filters</p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && plugins.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plugins.map((plugin) => {
              const isInstalling = installing === plugin.id;
              const isInstalled = installed.has(plugin.id);

              return (
                <div
                  key={`${plugin.source}-${plugin.id}`}
                  className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 hover:border-primary/40 transition-colors duration-150"
                >
                  <div className="flex items-start gap-3">
                    {plugin.iconUrl && (
                      <img
                        src={plugin.iconUrl}
                        alt=""
                        className="h-10 w-10 rounded-md object-cover shrink-0 bg-muted"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground truncate">{plugin.name}</h3>
                        {plugin.url && (
                          <a href={plugin.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary shrink-0">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{plugin.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {plugin.rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {plugin.rating.toFixed(1)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {formatDownloads(plugin.downloads)}
                      </span>
                      <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
                        {plugin.source}
                      </span>
                      {plugin.latestVersion && (
                        <span className="bg-primary/15 text-primary px-1.5 py-0.5 rounded text-[10px] font-medium">
                          {plugin.oldestVersion && plugin.oldestVersion !== plugin.latestVersion
                            ? `${plugin.oldestVersion} — ${plugin.latestVersion}`
                            : plugin.latestVersion}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => !isInstalled && !isInstalling && handleInstall(plugin.id)}
                      disabled={isInstalled || isInstalling}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150
                        ${isInstalled
                          ? "bg-green-500/15 text-green-500 cursor-default"
                          : isInstalling
                            ? "bg-primary/15 text-primary cursor-wait"
                            : "bg-primary text-primary-foreground hover:scale-[1.02]"
                        }
                      `}
                    >
                      {isInstalling ? (
                        <><Loader2 className="h-3 w-3 animate-spin" /> Installing...</>
                      ) : isInstalled ? (
                        <><CheckCircle2 className="h-3 w-3" /> Installed</>
                      ) : (
                        <><Download className="h-3 w-3" /> Install</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-card border border-border text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-card border border-border text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
