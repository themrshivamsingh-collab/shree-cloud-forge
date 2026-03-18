import { useState, useCallback } from "react";
import {
  Globe, Search, Upload, Download, Trash2, Edit3, RefreshCw,
  Star, ChevronLeft, FolderOpen, HardDrive, Calendar, Clock,
  Shield, Plus, Filter, X, ExternalLink, ArrowUpDown, Check,
  Loader2, AlertTriangle, Image as ImageIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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

interface CurseForgeWorld {
  id: string;
  name: string;
  author: string;
  downloads: number;
  versions: string[];
  thumbnailUrl: string;
  summary: string;
}

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

const MOCK_CURSEFORGE: CurseForgeWorld[] = [
  { id: "cf1", name: "SkyBlock Ultimate", author: "MapMaker99", downloads: 1284000, versions: ["1.20.4", "1.20.2"], thumbnailUrl: "", summary: "The ultimate skyblock experience with custom islands and challenges." },
  { id: "cf2", name: "Medieval Kingdom", author: "BuildTeamPro", downloads: 876500, versions: ["1.20.4", "1.19.4"], thumbnailUrl: "", summary: "A massive medieval kingdom with castles, villages, and dungeons." },
  { id: "cf3", name: "Parkour Paradise", author: "JumpMaster", downloads: 2100000, versions: ["1.20.4"], thumbnailUrl: "", summary: "500+ parkour levels from easy to impossible difficulty." },
  { id: "cf4", name: "Survival Islands", author: "OceanCraft", downloads: 543000, versions: ["1.20.4", "1.20.2", "1.19.4"], thumbnailUrl: "", summary: "Beautiful island chain survival map with hidden treasures." },
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

function formatDownloads(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

// ── Component ───────────────────────────────────────────
export function WorldsPage() {
  const { toast } = useToast();
  const [worlds, setWorlds] = useState<World[]>(MOCK_WORLDS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"name" | "size" | "modified">("name");

  // Detail view
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

  // CurseForge
  const [cfSearch, setCfSearch] = useState("");
  const [cfInstalling, setCfInstalling] = useState<string | null>(null);

  // ── Filtering & sorting ───────────────────────────────
  const filtered = worlds
    .filter((w) => {
      if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus === "active" && !w.active) return false;
      if (filterStatus === "inactive" && w.active) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size") return b.size - a.size;
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    });

  const filteredCF = MOCK_CURSEFORGE.filter((w) =>
    !cfSearch || w.name.toLowerCase().includes(cfSearch.toLowerCase()) || w.author.toLowerCase().includes(cfSearch.toLowerCase())
  );

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
    e.preventDefault();
    setDragOver(false);
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
    setRenameTarget(null);
    setRenameValue("");
  };

  const handleSetMain = (world: World) => {
    setWorlds((prev) => prev.map((w) => ({ ...w, isDefault: w.id === world.id })));
    toast({ title: "Default world updated", description: `${world.name} is now the default world.` });
  };

  const handleBackup = (world: World) => {
    setWorlds((prev) => prev.map((w) => w.id === world.id ? { ...w, hasBackup: true } : w));
    toast({ title: "Backup created", description: `Backup of ${world.name} created successfully.` });
  };

  const handleCfInstall = (cf: CurseForgeWorld) => {
    setCfInstalling(cf.id);
    setTimeout(() => {
      const newWorld: World = {
        id: Date.now().toString(), name: cf.name.toLowerCase().replace(/\s+/g, "_"),
        size: Math.floor(Math.random() * 300000000) + 50000000,
        lastModified: new Date().toISOString(), created: new Date().toISOString(),
        active: false, isDefault: false, hasBackup: false,
        seed: "curseforge", gameMode: "survival", difficulty: "normal",
        files: [{ name: "region", type: "folder", size: 100000000 }, { name: "level.dat", type: "file", size: 4096 }],
      };
      setWorlds((prev) => [...prev, newWorld]);
      setCfInstalling(null);
      toast({ title: "World installed", description: `${cf.name} installed from CurseForge.` });
    }, 2500);
  };

  // ── Detail View ───────────────────────────────────────
  if (selectedWorld) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedWorld(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Worlds
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{selectedWorld.name}</h1>
              {selectedWorld.isDefault && <Badge className="bg-primary/20 text-primary border-primary/30">Default</Badge>}
              {selectedWorld.hasBackup && <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">Backed Up</Badge>}
            </div>
            <p className="text-muted-foreground text-sm mt-1">Detailed world management and information</p>
          </div>
          <Badge variant={selectedWorld.active ? "default" : "secondary"} className={selectedWorld.active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : ""}>
            {selectedWorld.active ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: HardDrive, label: "Size", value: formatSize(selectedWorld.size) },
            { icon: Calendar, label: "Created", value: formatDate(selectedWorld.created) },
            { icon: Clock, label: "Last Modified", value: formatDate(selectedWorld.lastModified) },
            { icon: Shield, label: "Seed", value: selectedWorld.seed },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </div>
              <p className="text-sm font-medium text-foreground truncate">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
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
          <Button size="sm" variant="outline" className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10" onClick={() => setRegenTarget(selectedWorld)}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Regenerate
          </Button>
          <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setDeleteTarget(selectedWorld)}>
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete
          </Button>
        </div>

        {/* Files */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">World Files</h3>
          <div className="rounded-lg border border-border overflow-hidden">
            {selectedWorld.files.map((f, i) => (
              <div key={f.name} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-border" : ""} hover:bg-muted/30 transition-colors`}>
                <div className="flex items-center gap-3">
                  {f.type === "folder" ? <FolderOpen className="h-4 w-4 text-primary" /> : <Globe className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm text-foreground">{f.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatSize(f.size)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reuse dialogs */}
        {renderDialogs()}
      </div>
    );
  }

  // ── Dialogs ───────────────────────────────────────────
  function renderDialogs() {
    return (
      <>
        {/* Delete */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" />Delete World</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Regenerate */}
        <AlertDialog open={!!regenTarget} onOpenChange={(o) => !o && setRegenTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2"><RefreshCw className="h-5 w-5 text-amber-400" />Regenerate World</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete all data in <strong>{regenTarget?.name}</strong> and generate a new world. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRegen} className="bg-amber-500 text-foreground hover:bg-amber-600">Regenerate</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Rename */}
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

  // ── Main List View ────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          Worlds
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage, upload, download, and customize your server worlds</p>
      </div>

      <Tabs defaultValue="worlds" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="worlds">My Worlds</TabsTrigger>
          <TabsTrigger value="curseforge">CurseForge</TabsTrigger>
        </TabsList>

        {/* ── My Worlds Tab ─────────────────────────────── */}
        <TabsContent value="worlds" className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search worlds..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-3.5 w-3.5 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[140px]">
                <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="size">Size</SelectItem>
                <SelectItem value="modified">Modified</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                type="file"
                accept=".zip,.tar.gz"
                className="hidden"
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
            <div className="text-center py-12 text-muted-foreground">
              <Globe className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No worlds found</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              {filtered.map((world, i) => (
                <div
                  key={world.id}
                  className={`flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                  onClick={() => setSelectedWorld(world)}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={`h-9 w-9 rounded-md flex items-center justify-center shrink-0 ${
                      world.active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      <Globe className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">{world.name}</span>
                        {world.isDefault && <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 py-0">Default</Badge>}
                        {world.hasBackup && <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] px-1.5 py-0">Backup</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{formatSize(world.size)}</span>
                        <span>·</span>
                        <span>{formatDate(world.lastModified)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toast({ title: "Downloading...", description: `${world.name} download started.` })}>
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setRenameTarget(world); setRenameValue(world.name); }}>
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Rename</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(world)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Badge variant={world.active ? "default" : "secondary"} className={`ml-2 text-[10px] ${world.active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : ""}`}>
                      {world.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── CurseForge Tab ────────────────────────────── */}
        <TabsContent value="curseforge" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search CurseForge worlds..."
              value={cfSearch}
              onChange={(e) => setCfSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredCF.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No CurseForge worlds found</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredCF.map((cf) => (
                <div key={cf.id} className="rounded-lg border border-border p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-foreground">{cf.name}</h3>
                          <p className="text-xs text-muted-foreground">by {cf.author} · {formatDownloads(cf.downloads)} downloads</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleCfInstall(cf)}
                          disabled={cfInstalling === cf.id}
                        >
                          {cfInstalling === cf.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
                          {cfInstalling === cf.id ? "Installing..." : "Install"}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{cf.summary}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {cf.versions.map((v) => (
                          <Badge key={v} variant="outline" className="text-[10px] px-1.5 py-0">{v}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {renderDialogs()}
    </div>
  );
}
