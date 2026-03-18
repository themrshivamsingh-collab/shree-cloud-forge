import { useState, useEffect, useCallback } from "react";
import {
  Globe, Search, Upload, Download, Trash2, Edit3, RefreshCw,
  Star, ChevronLeft, ChevronRight, FolderOpen, HardDrive, Calendar, Clock,
  Shield, X, ExternalLink, ArrowUpDown, Check,
  Loader2, AlertTriangle, CheckCircle2, PackageOpen
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────
interface World {
  id: string;
  name: string;
  size: number;
  lastModified: string;
  created: string;
  active: boolean;
  isDefault: boolean;
  hasBackup: boolean;
  seed: string;
  gameMode: string;
  difficulty: string;
  files: { name: string; type: "file" | "folder"; size: number }[];
}

interface BrowseWorldResult {
  id: string;
  name: string;
  description: string;
  source: string;
  downloads: number;
  iconUrl?: string;
  url?: string;
  latestVersion?: string;
  oldestVersion?: string;
  author?: string;
}

// ── Constants ──────────────────────────────────────────
const SORT_OPTIONS = ["relevance", "downloads", "newest"] as const;
const CATEGORIES = ["All", "adventure", "creation", "survival", "puzzle", "minigame"] as const;
const PAGE_SIZE = 12;

// ── Mock Data ──────────────────────────────────────────
const MOCK_WORLDS: World[] = [
  {
    id: "1", name: "world", size: 524288000, lastModified: "2026-03-18T10:30:00Z",
    created: "2025-11-01T08:00:00Z", active: true, isDefault: true, hasBackup: true,
    seed: "-1234567890", gameMode: "survival", difficulty: "hard",
    files: [
      { name: "region", type: "folder", size: 412000000 },
      { name: "data", type: "folder", size: 8200000 },
      { name: "level.dat", type: "file", size: 4096 },
      { name: "level.dat_old", type: "file", size: 4096 },
      { name: "session.lock", type: "file", size: 8 },
    ],
  },
  {
    id: "2", name: "world_nether", size: 128000000, lastModified: "2026-03-18T10:30:00Z",
    created: "2025-11-01T08:00:00Z", active: true, isDefault: false, hasBackup: false,
    seed: "-1234567890", gameMode: "survival", difficulty: "hard",
    files: [
      { name: "region", type: "folder", size: 120000000 },
      { name: "data", type: "folder", size: 2000000 },
      { name: "level.dat", type: "file", size: 4096 },
    ],
  },
  {
    id: "3", name: "world_the_end", size: 64000000, lastModified: "2026-03-17T22:15:00Z",
    created: "2025-11-01T08:00:00Z", active: true, isDefault: false, hasBackup: false,
    seed: "-1234567890", gameMode: "survival", difficulty: "hard",
    files: [
      { name: "region", type: "folder", size: 58000000 },
      { name: "level.dat", type: "file", size: 4096 },
    ],
  },
  {
    id: "4", name: "creative_build", size: 256000000, lastModified: "2026-03-15T14:00:00Z",
    created: "2026-01-10T09:00:00Z", active: false, isDefault: false, hasBackup: true,
    seed: "987654321", gameMode: "creative", difficulty: "peaceful",
    files: [
      { name: "region", type: "folder", size: 240000000 },
      { name: "data", type: "folder", size: 5000000 },
      { name: "level.dat", type: "file", size: 4096 },
    ],
  },
];

// ── Helpers ─────────────────────────────────────────────
function formatSize(bytes: number): string {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + " GB";
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + " MB";
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + " KB";
  return bytes + " B";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatDownloads(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

// ── Modrinth API ────────────────────────────────────────
async function fetchModrinthWorlds(
  query: string, category: string, sort: string, page: number
): Promise<{ results: BrowseWorldResult[]; totalPages: number }> {
  const offset = (page - 1) * PAGE_SIZE;
  const facets: string[][] = [['project_type:modpack']];
  // Modrinth doesn't have a dedicated "world" type, so we search modpacks/datapacks
  // and also try with "map" category
  const categoryFacets: string[][] = [['project_type:mod'], ['project_type:modpack']];
  
  // For worlds/maps we search across project types
  const searchFacets: string[][] = [];
  if (category !== "All") {
    searchFacets.push([`categories:${category}`]);
  }

  const sortMap: Record<string, string> = {
    relevance: "relevance",
    downloads: "downloads",
    newest: "newest",
  };

  // Search for maps/worlds specifically
  const searchQuery = query.trim() ? query : "map world";
  
  const params = new URLSearchParams({
    query: searchQuery,
    limit: String(PAGE_SIZE),
    offset: String(offset),
    index: sortMap[sort] || "relevance",
    facets: JSON.stringify([
      ["project_type:datapack", "project_type:mod", "project_type:modpack"],
      ...searchFacets
    ]),
  });

  const res = await fetch(`https://api.modrinth.com/v2/search?${params}`);
  if (!res.ok) throw new Error("Modrinth API error");
  const data = await res.json();

  const results: BrowseWorldResult[] = (data.hits || []).map((hit: any) => {
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
      iconUrl: hit.icon_url,
      url: `https://modrinth.com/project/${hit.slug}`,
      author: hit.author,
      oldestVersion: gameVersions[0] || undefined,
      latestVersion: gameVersions.length > 1 ? gameVersions[gameVersions.length - 1] : gameVersions[0] || undefined,
    };
  });

  const totalPages = Math.ceil((data.total_hits || 0) / PAGE_SIZE);
  return { results, totalPages };
}

// ── Component ───────────────────────────────────────────
export function WorldsPage() {
  const { toast } = useToast();

  // ── My Worlds state ──
  const [worlds, setWorlds] = useState<World[]>(MOCK_WORLDS);
  const [localSearch, setLocalSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [localSort, setLocalSort] = useState<string>("name");
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);

  // Dialogs
  const [deleteTarget, setDeleteTarget] = useState<World | null>(null);
  const [regenTarget, setRegenTarget] = useState<World | null>(null);
  const [renameTarget, setRenameTarget] = useState<World | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Upload
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  // ── Browse tab state (like Plugin Installer) ──
  const [activeTab, setActiveTab] = useState<"my" | "browse">("my");
  const [browseSearch, setBrowseSearch] = useState("");
  const [browseCategory, setBrowseCategory] = useState<string>("All");
  const [browseSortBy, setBrowseSortBy] = useState<string>("downloads");
  const [browsePage, setBrowsePage] = useState(1);
  const [browseTotalPages, setBrowseTotalPages] = useState(1);
  const [browseResults, setBrowseResults] = useState<BrowseWorldResult[]>([]);
  const [browseLoading, setBrowseLoading] = useState(true);
  const [browseError, setBrowseError] = useState<string | null>(null);
  const [installing, setInstalling] = useState<string | null>(null);
  const [installed, setInstalled] = useState<Set<string>>(new Set());

  // ── My Worlds filtering ──
  const filtered = worlds
    .filter((w) => {
      if (localSearch && !w.name.toLowerCase().includes(localSearch.toLowerCase())) return false;
      if (filterStatus === "active" && !w.active) return false;
      if (filterStatus === "inactive" && w.active) return false;
      return true;
    })
    .sort((a, b) => {
      if (localSort === "name") return a.name.localeCompare(b.name);
      if (localSort === "size") return b.size - a.size;
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    });

  // ── Browse fetch (same pattern as Plugin Installer) ──
  const fetchWorlds = useCallback(async () => {
    setBrowseLoading(true);
    setBrowseError(null);
    try {
      const result = await fetchModrinthWorlds(browseSearch, browseCategory, browseSortBy, browsePage);
      setBrowseResults(result.results);
      setBrowseTotalPages(result.totalPages);
    } catch (err: any) {
      setBrowseError(err.message || "Failed to fetch worlds");
      setBrowseResults([]);
    } finally {
      setBrowseLoading(false);
    }
  }, [browseSearch, browseCategory, browseSortBy, browsePage]);

  useEffect(() => {
    if (activeTab !== "browse") return;
    const timer = setTimeout(() => { fetchWorlds(); }, 400);
    return () => clearTimeout(timer);
  }, [fetchWorlds, activeTab]);

  useEffect(() => {
    setBrowsePage(1);
  }, [browseSearch, browseCategory, browseSortBy]);

  // ── Actions ───────────────────────────────────────────
  const simulateUpload = useCallback((fileName: string) => {
    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setUploading(false);
          const newWorld: World = {
            id: Date.now().toString(), name: fileName.replace(/\.zip$/i, ""),
            size: Math.floor(Math.random() * 500000000), lastModified: new Date().toISOString(),
            created: new Date().toISOString(), active: false, isDefault: false, hasBackup: false,
            seed: "unknown", gameMode: "survival", difficulty: "normal",
            files: [{ name: "region", type: "folder", size: 100000000 }, { name: "level.dat", type: "file", size: 4096 }],
          };
          setWorlds((prev) => [...prev, newWorld]);
          toast({ title: "World uploaded", description: `${fileName} has been uploaded successfully.` });
          return 0;
        }
        return p + 5;
      });
    }, 80);
  }, [toast]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) simulateUpload(file.name);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setWorlds((prev) => prev.filter((w) => w.id !== deleteTarget.id));
    if (selectedWorld?.id === deleteTarget.id) setSelectedWorld(null);
    toast({ title: "World deleted", description: `${deleteTarget.name} has been permanently deleted.` });
    setDeleteTarget(null);
  };

  const handleRegen = () => {
    if (!regenTarget) return;
    toast({ title: "World regenerating", description: `${regenTarget.name} is being regenerated...` });
    setRegenTarget(null);
  };

  const handleRename = () => {
    if (!renameTarget || !renameValue.trim()) return;
    setWorlds((prev) => prev.map((w) => w.id === renameTarget.id ? { ...w, name: renameValue.trim() } : w));
    if (selectedWorld?.id === renameTarget.id) setSelectedWorld({ ...selectedWorld, name: renameValue.trim() });
    toast({ title: "World renamed", description: `Renamed to "${renameValue.trim()}"` });
    setRenameTarget(null); setRenameValue("");
  };

  const handleSetMain = (world: World) => {
    setWorlds((prev) => prev.map((w) => ({ ...w, isDefault: w.id === world.id })));
    toast({ title: "Default world updated", description: `${world.name} is now the default world.` });
  };

  const handleBackup = (world: World) => {
    setWorlds((prev) => prev.map((w) => w.id === world.id ? { ...w, hasBackup: true } : w));
    toast({ title: "Backup created", description: `Backup of ${world.name} created successfully.` });
  };

  const handleInstall = (id: string) => {
    setInstalling(id);
    setTimeout(() => {
      setInstalling(null);
      setInstalled((prev) => new Set(prev).add(id));
    }, 1500);
  };

  const selectClass =
    "bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer";

  // ── Detail View ───────────────────────────────────────
  if (selectedWorld) {
    return (
      <div className="space-y-6 max-w-6xl">
        <button onClick={() => setSelectedWorld(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to Worlds
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{selectedWorld.name}</h1>
              {selectedWorld.isDefault && <span className="bg-primary/15 text-primary px-1.5 py-0.5 rounded text-[10px] font-medium">Default</span>}
              {selectedWorld.hasBackup && <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">Backup</span>}
            </div>
            <p className="text-muted-foreground text-sm mt-1">Detailed world management and information</p>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${selectedWorld.active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
            {selectedWorld.active ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: HardDrive, label: "Size", value: formatSize(selectedWorld.size) },
            { icon: Calendar, label: "Created", value: formatDate(selectedWorld.created) },
            { icon: Clock, label: "Last Modified", value: formatDate(selectedWorld.lastModified) },
            { icon: Shield, label: "Seed", value: selectedWorld.seed },
          ].map((item) => (
            <div key={item.label} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <item.icon className="h-3.5 w-3.5" />{item.label}
              </div>
              <p className="text-sm font-medium text-foreground truncate">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => handleSetMain(selectedWorld)} disabled={selectedWorld.isDefault}>
            <Star className="h-3.5 w-3.5 mr-1.5" />Set as Default
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBackup(selectedWorld)}>
            <Shield className="h-3.5 w-3.5 mr-1.5" />Backup
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast({ title: "Downloading...", description: `${selectedWorld.name} download started.` })}>
            <Download className="h-3.5 w-3.5 mr-1.5" />Download
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setRenameTarget(selectedWorld); setRenameValue(selectedWorld.name); }}>
            <Edit3 className="h-3.5 w-3.5 mr-1.5" />Rename
          </Button>
          <Button size="sm" variant="outline" onClick={() => setRegenTarget(selectedWorld)}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Regenerate
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(selectedWorld)}>
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete
          </Button>
        </div>

        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">World Files</h3>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {selectedWorld.files.map((f, i) => (
              <div key={f.name} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-border" : ""} hover:bg-accent/50 transition-colors`}>
                <div className="flex items-center gap-3">
                  {f.type === "folder" ? <FolderOpen className="h-4 w-4 text-primary" /> : <Globe className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm text-foreground">{f.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatSize(f.size)}</span>
              </div>
            ))}
          </div>
        </div>

        {renderDialogs()}
      </div>
    );
  }

  // ── Dialogs ───────────────────────────────────────────
  function renderDialogs() {
    return (
      <>
        <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" />Delete World</AlertDialogTitle>
              <AlertDialogDescription>Are you sure you want to permanently delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!regenTarget} onOpenChange={(o) => !o && setRegenTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2"><RefreshCw className="h-5 w-5 text-primary" />Regenerate World</AlertDialogTitle>
              <AlertDialogDescription>This will delete all data in <strong>{regenTarget?.name}</strong> and generate a new world. This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRegen}>Regenerate</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={!!renameTarget} onOpenChange={(o) => { if (!o) { setRenameTarget(null); setRenameValue(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename World</DialogTitle>
              <DialogDescription>Enter a new name for this world.</DialogDescription>
            </DialogHeader>
            <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} placeholder="World name" />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setRenameTarget(null); setRenameValue(""); }}>Cancel</Button>
              <Button onClick={handleRename} disabled={!renameValue.trim()}>Rename</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // ── Main View ─────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Worlds</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage, upload, download, and install server worlds</p>
      </div>

      {/* Tab Switcher (same style as Plugin Installer filters) */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "my" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-accent"
            }`}
          >
            My Worlds
          </button>
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "browse" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-accent"
            }`}
          >
            Browse & Install
          </button>
        </div>

        {activeTab === "my" ? (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search your worlds..."
                className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Status</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Sort By</label>
                <select value={localSort} onChange={(e) => setLocalSort(e.target.value)} className={selectClass}>
                  <option value="name">Name</option>
                  <option value="size">Size</option>
                  <option value="modified">Modified</option>
                </select>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={browseSearch}
                onChange={(e) => setBrowseSearch(e.target.value)}
                placeholder="Search worlds on Modrinth..."
                className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Category</label>
                <select value={browseCategory} onChange={(e) => setBrowseCategory(e.target.value)} className={selectClass}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c === "All" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Sort By</label>
                <select value={browseSortBy} onChange={(e) => setBrowseSortBy(e.target.value)} className={selectClass}>
                  {SORT_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── MY WORLDS TAB ────────────────────────────── */}
      {activeTab === "my" && (
        <>
          {/* Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative rounded-lg border-2 border-dashed transition-colors p-6 text-center ${
              dragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"
            }`}
          >
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Drag & drop world files here, or</p>
            <label className="inline-block mt-2">
              <input
                type="file" accept=".zip,.tar.gz" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) simulateUpload(f.name); e.target.value = ""; }}
              />
              <span className="text-sm text-primary hover:underline cursor-pointer">browse files</span>
            </label>
            {uploading && (
              <div className="mt-4 max-w-xs mx-auto">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{uploadProgress}% uploaded</p>
              </div>
            )}
          </div>

          {/* World List */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Globe className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm font-medium">No worlds found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((world) => (
                <div
                  key={world.id}
                  onClick={() => setSelectedWorld(world)}
                  className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 hover:border-primary/40 transition-colors duration-150 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-md flex items-center justify-center shrink-0 ${
                      world.active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                    }`}>
                      <Globe className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground truncate">{world.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{world.gameMode} · {world.difficulty}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><HardDrive className="h-3 w-3" />{formatSize(world.size)}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(world.lastModified)}</span>
                      {world.isDefault && (
                        <span className="bg-primary/15 text-primary px-1.5 py-0.5 rounded text-[10px] font-medium">Default</span>
                      )}
                      {world.hasBackup && (
                        <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">Backup</span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      world.active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                    }`}>
                      {world.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── BROWSE TAB (like Plugin Installer) ───────── */}
      {activeTab === "browse" && (
        <>
          {browseLoading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span className="text-sm">Fetching worlds from Modrinth...</span>
            </div>
          )}

          {!browseLoading && browseError && (
            <div className="flex flex-col items-center justify-center py-16 text-destructive">
              <p className="text-sm font-medium">{browseError}</p>
              <button onClick={fetchWorlds} className="mt-3 text-xs text-primary underline">Retry</button>
            </div>
          )}

          {!browseLoading && !browseError && browseResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <PackageOpen className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm font-medium">No worlds found for selected filters</p>
            </div>
          )}

          {!browseLoading && !browseError && browseResults.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {browseResults.map((world) => {
                  const isInstalling = installing === world.id;
                  const isInstalled = installed.has(world.id);

                  return (
                    <div
                      key={`${world.source}-${world.id}`}
                      className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 hover:border-primary/40 transition-colors duration-150"
                    >
                      <div className="flex items-start gap-3">
                        {world.iconUrl && (
                          <img
                            src={world.iconUrl}
                            alt=""
                            className="h-10 w-10 rounded-md object-cover shrink-0 bg-muted"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        )}
                        {!world.iconUrl && (
                          <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center shrink-0">
                            <Globe className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground truncate">{world.name}</h3>
                            {world.url && (
                              <a href={world.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary shrink-0">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{world.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {formatDownloads(world.downloads)}
                          </span>
                          <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
                            {world.source}
                          </span>
                          {world.author && (
                            <span className="text-[10px]">by {world.author}</span>
                          )}
                          {world.latestVersion && (
                            <span className="bg-primary/15 text-primary px-1.5 py-0.5 rounded text-[10px] font-medium">
                              {world.oldestVersion && world.oldestVersion !== world.latestVersion
                                ? `${world.oldestVersion} — ${world.latestVersion}`
                                : world.latestVersion}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => !isInstalled && !isInstalling && handleInstall(world.id)}
                          disabled={isInstalled || isInstalling}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150
                            ${isInstalled
                              ? "bg-primary/15 text-primary cursor-default"
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
                  onClick={() => setBrowsePage((p) => Math.max(1, p - 1))}
                  disabled={browsePage <= 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-card border border-border text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <span className="text-sm text-muted-foreground">Page {browsePage}</span>
                <button
                  onClick={() => setBrowsePage((p) => p + 1)}
                  disabled={browsePage >= browseTotalPages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-card border border-border text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </>
      )}

      {renderDialogs()}
    </div>
  );
}
