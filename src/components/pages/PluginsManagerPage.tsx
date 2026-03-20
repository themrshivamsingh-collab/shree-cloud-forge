import { useState } from "react";
import {
  Folder,
  FileArchive,
  Download,
  Trash2,
  Pencil,
  Power,
  Eye,
  ChevronDown,
  ChevronUp,
  HardDrive,
  Calendar,
  Package,
  Search,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// ── Types ──────────────────────────────────────────────────

interface PluginData {
  id: string;
  name: string;
  folderName: string;
  jarName: string;
  version: string;
  jarSize: number;
  folderSize: number;
  lastModified: string;
  enabled: boolean;
  description: string;
  author: string;
  apiVersion?: string;
  files: string[];
}

// ── Mock Data ──────────────────────────────────────────────

const MOCK_PLUGINS: PluginData[] = [
  {
    id: "1",
    name: "EssentialsX",
    folderName: "EssentialsX",
    jarName: "EssentialsX.jar",
    version: "2.20.1",
    jarSize: 1234567,
    folderSize: 524288,
    lastModified: "2024-06-10 14:22",
    enabled: true,
    description: "The essential plugin suite for Bukkit/Spigot servers.",
    author: "EssentialsX Team",
    apiVersion: "1.13",
    files: ["config.yml", "messages.properties", "items.csv", "userdata/", "worth.yml"],
  },
  {
    id: "2",
    name: "WorldEdit",
    folderName: "WorldEdit",
    jarName: "WorldEdit.jar",
    version: "7.3.0",
    jarSize: 2345678,
    folderSize: 131072,
    lastModified: "2024-06-09 16:30",
    enabled: true,
    description: "In-game world editing with selections, brushes, and advanced tools.",
    author: "EngineHub",
    apiVersion: "1.13",
    files: ["config.yml", "schematics/", "sessions/"],
  },
  {
    id: "3",
    name: "Vault",
    folderName: "Vault",
    jarName: "Vault.jar",
    version: "1.7.3",
    jarSize: 567890,
    folderSize: 8192,
    lastModified: "2024-06-08 11:00",
    enabled: true,
    description: "A permissions, chat, and economy API.",
    author: "MilkBowl",
    apiVersion: "1.13",
    files: ["config.yml"],
  },
  {
    id: "4",
    name: "LuckPerms",
    folderName: "LuckPerms",
    jarName: "LuckPerms.jar",
    version: "5.4.102",
    jarSize: 3456789,
    folderSize: 262144,
    lastModified: "2024-06-11 13:15",
    enabled: true,
    description: "An advanced permissions plugin for Minecraft servers.",
    author: "Luck",
    apiVersion: "1.13",
    files: ["config.yml", "luckperms-h2.mv.db", "translations/", "contexts.json"],
  },
  {
    id: "5",
    name: "WorldGuard",
    folderName: "WorldGuard",
    jarName: "WorldGuard.jar",
    version: "7.0.9",
    jarSize: 1890234,
    folderSize: 196608,
    lastModified: "2024-06-07 10:00",
    enabled: false,
    description: "Region protection and flag management for your worlds.",
    author: "EngineHub",
    apiVersion: "1.13",
    files: ["config.yml", "worlds/", "region/"],
  },
  {
    id: "6",
    name: "PlaceholderAPI",
    folderName: "PlaceholderAPI",
    jarName: "PlaceholderAPI.jar",
    version: "2.11.5",
    jarSize: 987654,
    folderSize: 65536,
    lastModified: "2024-06-12 08:45",
    enabled: true,
    description: "A resource/plugin that allows other plugins to use placeholders.",
    author: "HelpChat",
    apiVersion: "1.13",
    files: ["config.yml", "expansions/"],
  },
];

// ── Helpers ────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Component ──────────────────────────────────────────────

interface PluginsManagerPageProps {
  onViewFiles?: (folderName: string) => void;
}

export function PluginsManagerPage({ onViewFiles }: PluginsManagerPageProps) {
  const [plugins, setPlugins] = useState<PluginData[]>(MOCK_PLUGINS);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PluginData | null>(null);
  const [renameTarget, setRenameTarget] = useState<PluginData | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [filter, setFilter] = useState<"all" | "enabled" | "disabled">("all");

  const filtered = plugins.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.jarName.toLowerCase().includes(search.toLowerCase());
    if (filter === "enabled") return matchSearch && p.enabled;
    if (filter === "disabled") return matchSearch && !p.enabled;
    return matchSearch;
  });

  const toggleEnabled = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setPlugins((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
    if (expandedId === deleteTarget.id) setExpandedId(null);
  };

  const handleRename = () => {
    if (!renameTarget || !renameValue.trim()) return;
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === renameTarget.id
          ? {
              ...p,
              name: renameValue.trim(),
              folderName: renameValue.trim(),
              jarName: `${renameValue.trim()}.jar`,
            }
          : p
      )
    );
    setRenameTarget(null);
    setRenameValue("");
  };

  const enabledCount = plugins.filter((p) => p.enabled).length;
  const disabledCount = plugins.filter((p) => !p.enabled).length;
  const totalSize = plugins.reduce((s, p) => s + p.jarSize + p.folderSize, 0);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Plugins Manager</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage, configure, and control all installed plugins
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Package className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Total</span>
          </div>
          <p className="text-lg font-bold text-foreground">{plugins.length}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Check className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Enabled</span>
          </div>
          <p className="text-lg font-bold text-success">{enabledCount}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <X className="h-4 w-4 text-destructive" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Disabled</span>
          </div>
          <p className="text-lg font-bold text-destructive">{disabledCount}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <HardDrive className="h-4 w-4 text-warning" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Size</span>
          </div>
          <p className="text-lg font-bold text-foreground">{formatSize(totalSize)}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plugins..."
              className="w-full bg-background/60 border border-border/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none input-focus-glow transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "enabled", "disabled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  filter === f
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "bg-background/60 text-muted-foreground border border-border/50 hover:text-foreground hover:border-border"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plugin Cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No plugins found</p>
          </div>
        )}

        {filtered.map((plugin) => {
          const isExpanded = expandedId === plugin.id;
          return (
            <div
              key={plugin.id}
              className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
                !plugin.enabled ? "opacity-60" : ""
              }`}
            >
              {/* Main Card Row */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : plugin.id)}
              >
                <div className="flex items-center gap-4">
                  {/* Left: Folder Section */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Folder className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {plugin.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            plugin.enabled
                              ? "bg-success/15 text-success"
                              : "bg-destructive/15 text-destructive"
                          }`}
                        >
                          {plugin.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        <span className="text-muted-foreground/70">Folder:</span> /{plugin.folderName}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-10 w-px bg-border/50 hidden sm:block" />

                  {/* Right: JAR Section */}
                  <div className="flex items-center gap-3 flex-1 min-w-0 hidden sm:flex">
                    <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                      <FileArchive className="h-5 w-5 text-warning" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{plugin.jarName}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {formatSize(plugin.jarSize)}
                        </span>
                        <span>v{plugin.version}</span>
                      </div>
                    </div>
                  </div>

                  {/* Meta + Expand */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground hidden md:flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {plugin.lastModified}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t border-border/40 bg-background/30 p-4 space-y-4 animate-in slide-in-from-top-1 duration-200">
                  {/* Mobile JAR info */}
                  <div className="flex items-center gap-3 sm:hidden">
                    <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                      <FileArchive className="h-4 w-4 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{plugin.jarName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(plugin.jarSize)} · v{plugin.version}
                      </p>
                    </div>
                  </div>

                  {/* Description & Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Details
                      </h4>
                      <p className="text-sm text-foreground/80">{plugin.description}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          <span className="text-muted-foreground/60">Author:</span> {plugin.author}
                        </span>
                        <span>
                          <span className="text-muted-foreground/60">API:</span> {plugin.apiVersion || "Unknown"}
                        </span>
                        <span>
                          <span className="text-muted-foreground/60">Folder Size:</span>{" "}
                          {formatSize(plugin.folderSize)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Plugin Files
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {plugin.files.map((f) => (
                          <span
                            key={f}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 text-xs text-muted-foreground font-mono"
                          >
                            {f.endsWith("/") ? (
                              <Folder className="h-3 w-3 text-primary/60" />
                            ) : (
                              <FileArchive className="h-3 w-3 text-muted-foreground/60" />
                            )}
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEnabled(plugin.id);
                      }}
                      className={`btn-glow flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                        plugin.enabled
                          ? "bg-destructive/15 text-destructive hover:bg-destructive/25 border border-destructive/20"
                          : "bg-success/15 text-success hover:bg-success/25 border border-success/20"
                      }`}
                    >
                      <Power className="h-3.5 w-3.5" />
                      {plugin.enabled ? "Disable" : "Enable"}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewFiles) onViewFiles(plugin.folderName);
                      }}
                      className="btn-glow flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20 transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Files
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="btn-glow flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-accent text-foreground hover:bg-accent/80 border border-border/50 transition-all"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenameTarget(plugin);
                        setRenameValue(plugin.name);
                      }}
                      className="btn-glow flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-accent text-foreground hover:bg-accent/80 border border-border/50 transition-all"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Rename
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(plugin);
                      }}
                      className="btn-glow flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-destructive/15 text-destructive hover:bg-destructive/25 border border-destructive/20 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="glass-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Plugin
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span>? This will
              remove both the <code className="text-xs bg-muted px-1 py-0.5 rounded">{deleteTarget?.jarName}</code> file
              and the <code className="text-xs bg-muted px-1 py-0.5 rounded">{deleteTarget?.folderName}/</code> folder.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              Delete Plugin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={!!renameTarget} onOpenChange={() => setRenameTarget(null)}>
        <DialogContent className="glass-card border-border/50 sm:max-w-md">
          <DialogTitle className="text-foreground">Rename Plugin</DialogTitle>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              This will rename the folder and jar file for{" "}
              <span className="font-semibold text-foreground">{renameTarget?.name}</span>.
            </p>
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              placeholder="New plugin name"
              className="w-full bg-background/60 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none input-focus-glow transition-all"
              autoFocus
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setRenameTarget(null)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRename}
              disabled={!renameValue.trim()}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              Rename
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
