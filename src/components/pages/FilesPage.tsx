import { useState, useMemo, useCallback, useRef } from "react";
import {
  Folder,
  File,
  FileText,
  FileCode,
  FileImage,
  FileArchive,
  ChevronLeft,
  Search,
  Plus,
  Upload,
  RefreshCw,
  MoreVertical,
  Pencil,
  Download,
  Trash2,
  FolderPlus,
  FilePlus,
  X,
  Save,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

// ── Types ──────────────────────────────────────────────────

interface FSEntry {
  name: string;
  type: "file" | "folder";
  size: number;
  modified: string;
  content?: string;
}

// ── Mock filesystem ────────────────────────────────────────

const MOCK_FS: Record<string, FSEntry[]> = {
  "/home/server": [
    { name: "plugins", type: "folder", size: 0, modified: "2024-06-10 14:22" },
    { name: "world", type: "folder", size: 0, modified: "2024-06-12 09:15" },
    { name: "world_nether", type: "folder", size: 0, modified: "2024-06-12 09:15" },
    { name: "world_the_end", type: "folder", size: 0, modified: "2024-06-12 09:15" },
    { name: "logs", type: "folder", size: 0, modified: "2024-06-14 18:00" },
    { name: "config", type: "folder", size: 0, modified: "2024-06-08 11:30" },
    { name: "server.properties", type: "file", size: 1245, modified: "2024-06-14 17:45", content: "# Minecraft server properties\nserver-port=25565\nmax-players=20\ndifficulty=hard\nmotd=A ShreeCloud Minecraft Server\nview-distance=10\nonline-mode=true\nspawn-protection=16\nmax-world-size=29999984\nlevel-name=world\ngamemode=survival\nwhite-list=false\nenforce-whitelist=false\nspawn-npcs=true\nspawn-animals=true\nspawn-monsters=true\ngenerate-structures=true\nlevel-seed=\nlevel-type=minecraft\\:normal\n" },
    { name: "spigot.yml", type: "file", size: 3456, modified: "2024-06-14 17:30", content: "# This is the main configuration file for Spigot.\nsettings:\n  debug: false\n  bungeecord: false\n  timeout-time: 60\n  restart-on-crash: true\n  restart-script: ./start.sh\n  save-user-cache-on-stop-only: false\n" },
    { name: "bukkit.yml", type: "file", size: 2100, modified: "2024-06-13 12:00", content: "settings:\n  allow-end: true\n  warn-on-overload: true\n  permissions-file: permissions.yml\n  update-folder: update\n  plugin-profiling: false\n  connection-throttle: 4000\n  query-plugins: true\n  deprecated-verbose: default\n  shutdown-message: Server closed\n" },
    { name: "paper.yml", type: "file", size: 4200, modified: "2024-06-13 11:45", content: "# Paper configuration\nverbose: false\nconfig-version: 27\nsettings:\n  max-joins-per-tick: 3\n  fix-entity-position-desync: true\n  track-plugin-scoring: false\n  use-alternative-luck-formula: false\n  lag-compensate-block-breaking: true\n  send-full-pos-for-hard-colliding-entities: true\n" },
    { name: "eula.txt", type: "file", size: 158, modified: "2024-06-01 10:00", content: "#By changing the setting below to TRUE you agree to the EULA\n#https://account.mojang.com/documents/minecraft_eula\neula=true\n" },
    { name: "start.sh", type: "file", size: 89, modified: "2024-06-01 10:00", content: "#!/bin/bash\njava -Xms1G -Xmx4G -jar paper.jar --nogui\n" },
    { name: "paper.jar", type: "file", size: 42567890, modified: "2024-06-14 17:00" },
    { name: "server-icon.png", type: "file", size: 4096, modified: "2024-06-02 14:00" },
    { name: "whitelist.json", type: "file", size: 245, modified: "2024-06-10 09:00", content: "[\n  {\n    \"uuid\": \"a1b2c3d4-e5f6-7890-abcd-ef1234567890\",\n    \"name\": \"ShreePlayer\"\n  }\n]\n" },
    { name: "banned-players.json", type: "file", size: 2, modified: "2024-06-10 09:00", content: "[]" },
    { name: "ops.json", type: "file", size: 180, modified: "2024-06-10 09:00", content: "[\n  {\n    \"uuid\": \"a1b2c3d4-e5f6-7890-abcd-ef1234567890\",\n    \"name\": \"ShreePlayer\",\n    \"level\": 4\n  }\n]\n" },
  ],
  "/home/server/plugins": [
    { name: "EssentialsX", type: "folder", size: 0, modified: "2024-06-10 14:22" },
    { name: "WorldEdit", type: "folder", size: 0, modified: "2024-06-09 16:30" },
    { name: "Vault", type: "folder", size: 0, modified: "2024-06-08 11:00" },
    { name: "LuckPerms", type: "folder", size: 0, modified: "2024-06-11 13:15" },
    { name: "EssentialsX.jar", type: "file", size: 1234567, modified: "2024-06-10 14:22" },
    { name: "WorldEdit.jar", type: "file", size: 2345678, modified: "2024-06-09 16:30" },
    { name: "Vault.jar", type: "file", size: 567890, modified: "2024-06-08 11:00" },
    { name: "LuckPerms.jar", type: "file", size: 3456789, modified: "2024-06-11 13:15" },
    { name: "PluginMetrics", type: "folder", size: 0, modified: "2024-06-07 10:00" },
  ],
  "/home/server/world": [
    { name: "region", type: "folder", size: 0, modified: "2024-06-12 09:15" },
    { name: "data", type: "folder", size: 0, modified: "2024-06-12 09:15" },
    { name: "playerdata", type: "folder", size: 0, modified: "2024-06-14 17:45" },
    { name: "level.dat", type: "file", size: 8192, modified: "2024-06-14 17:45" },
    { name: "level.dat_old", type: "file", size: 8192, modified: "2024-06-14 17:40" },
    { name: "session.lock", type: "file", size: 4, modified: "2024-06-14 17:45" },
  ],
  "/home/server/logs": [
    { name: "latest.log", type: "file", size: 245678, modified: "2024-06-14 18:00", content: "[14:00:01 INFO]: Starting minecraft server version 1.20.4\n[14:00:02 INFO]: Loading properties\n[14:00:02 INFO]: Default game type: SURVIVAL\n[14:00:03 INFO]: Preparing level \"world\"\n[14:00:08 INFO]: Done (5.234s)! For help, type \"help\"\n[14:15:22 INFO]: ShreePlayer joined the game\n[14:30:01 INFO]: CraftMaster99 joined the game\n[15:00:00 INFO]: RedstonePro joined the game\n" },
    { name: "2024-06-13.log.gz", type: "file", size: 45678, modified: "2024-06-13 23:59" },
    { name: "2024-06-12.log.gz", type: "file", size: 34567, modified: "2024-06-12 23:59" },
    { name: "2024-06-11.log.gz", type: "file", size: 56789, modified: "2024-06-11 23:59" },
  ],
  "/home/server/config": [
    { name: "paper-global.yml", type: "file", size: 5200, modified: "2024-06-08 11:30", content: "# Paper Global Configuration\n_version: 28\nasync-chunks:\n  threads: -1\ncollisions:\n  enable-player-collisions: true\n  send-full-pos-for-hard-colliding-entities: true\nchunk-loading:\n  autoconfig-send-distance: true\n  enable-frustum-priority: false\n  global-max-chunk-load-rate: -1.0\n  global-max-chunk-send-rate: -1.0\n" },
    { name: "paper-world-defaults.yml", type: "file", size: 3800, modified: "2024-06-08 11:30", content: "# Paper World Defaults\n_version: 30\nanticheat:\n  anti-xray:\n    enabled: false\n  obfuscation: false\nenvironment:\n  disable-thunder: false\n  disable-ice-and-snow: false\n  optimize-explosions: false\nmax-growth-height:\n  cactus: 3\n  reeds: 3\n  bamboo:\n    max: 16\n    min: 11\n" },
  ],
};

// ── Helpers ────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function getFileIcon(name: string, type: "file" | "folder") {
  if (type === "folder") return Folder;
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["yml", "yaml", "json", "properties", "txt", "log", "sh", "bat"].includes(ext)) return FileText;
  if (["js", "ts", "java", "py", "css", "html", "xml"].includes(ext)) return FileCode;
  if (["png", "jpg", "jpeg", "gif", "svg", "ico", "webp"].includes(ext)) return FileImage;
  if (["jar", "zip", "tar", "gz", "rar", "7z"].includes(ext)) return FileArchive;
  return File;
}

function isEditable(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return ["yml", "yaml", "json", "properties", "txt", "log", "sh", "bat", "cfg", "conf", "ini", "toml", "xml", "html", "css", "js", "ts", "java", "py", "md"].includes(ext);
}

// ── Component ──────────────────────────────────────────────

export function FilesPage() {
  const [currentPath, setCurrentPath] = useState("/home/server");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<FSEntry | null>(null);
  const [editFile, setEditFile] = useState<{ entry: FSEntry; content: string } | null>(null);
  const [editSaved, setEditSaved] = useState(false);
  const [renameTarget, setRenameTarget] = useState<FSEntry | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [createMode, setCreateMode] = useState<"file" | "folder" | null>(null);
  const [createName, setCreateName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fs, setFs] = useState(MOCK_FS);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const entries = fs[currentPath] || [];

  const sorted = useMemo(() => {
    let list = [...entries];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q));
    }
    // folders first, then files, alphabetical
    return list.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [entries, search]);

  const pathParts = currentPath.split("/").filter(Boolean);

  const navigateTo = useCallback((path: string) => {
    setCurrentPath(path);
    setSearch("");
  }, []);

  const goBack = useCallback(() => {
    const parts = currentPath.split("/").filter(Boolean);
    if (parts.length > 2) {
      parts.pop();
      navigateTo("/" + parts.join("/"));
    }
  }, [currentPath, navigateTo]);

  const openFolder = useCallback(
    (name: string) => {
      const newPath = `${currentPath}/${name}`;
      navigateTo(newPath);
    },
    [currentPath, navigateTo]
  );

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    setFs((prev) => {
      const updated = { ...prev };
      updated[currentPath] = (updated[currentPath] || []).filter(
        (e) => e.name !== deleteTarget.name
      );
      // Also remove subfolder entries if it's a folder
      if (deleteTarget.type === "folder") {
        const prefix = `${currentPath}/${deleteTarget.name}`;
        Object.keys(updated).forEach((key) => {
          if (key.startsWith(prefix)) delete updated[key];
        });
      }
      return updated;
    });
    setDeleteTarget(null);
  }, [deleteTarget, currentPath]);

  const handleRename = useCallback(() => {
    if (!renameTarget || !renameValue.trim()) return;
    setFs((prev) => {
      const updated = { ...prev };
      updated[currentPath] = (updated[currentPath] || []).map((e) =>
        e.name === renameTarget.name ? { ...e, name: renameValue.trim() } : e
      );
      return updated;
    });
    setRenameTarget(null);
    setRenameValue("");
  }, [renameTarget, renameValue, currentPath]);

  const handleCreate = useCallback(() => {
    if (!createMode || !createName.trim()) return;
    const newEntry: FSEntry = {
      name: createName.trim(),
      type: createMode,
      size: 0,
      modified: new Date().toISOString().slice(0, 16).replace("T", " "),
      content: createMode === "file" ? "" : undefined,
    };
    setFs((prev) => {
      const updated = { ...prev };
      updated[currentPath] = [...(updated[currentPath] || []), newEntry];
      if (createMode === "folder") {
        updated[`${currentPath}/${createName.trim()}`] = [];
      }
      return updated;
    });
    setCreateMode(null);
    setCreateName("");
  }, [createMode, createName, currentPath]);

  const handleSaveEdit = useCallback(() => {
    if (!editFile) return;
    setFs((prev) => {
      const updated = { ...prev };
      updated[currentPath] = (updated[currentPath] || []).map((e) =>
        e.name === editFile.entry.name ? { ...e, content: editFile.content } : e
      );
      return updated;
    });
    setEditSaved(true);
    setTimeout(() => setEditSaved(false), 2000);
  }, [editFile, currentPath]);

  const simulateUpload = useCallback(
    (fileName: string) => {
      setUploading(true);
      setUploadFileName(fileName);
      setUploadProgress(0);
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          const newEntry: FSEntry = {
            name: fileName,
            type: "file",
            size: Math.floor(Math.random() * 50000) + 1000,
            modified: new Date().toISOString().slice(0, 16).replace("T", " "),
          };
          setFs((prev) => {
            const updated = { ...prev };
            updated[currentPath] = [...(updated[currentPath] || []), newEntry];
            return updated;
          });
          setTimeout(() => {
            setUploading(false);
            setUploadProgress(0);
            setUploadFileName("");
          }, 600);
        }
        setUploadProgress(Math.min(progress, 100));
      }, 300);
    },
    [currentPath]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        simulateUpload(files[0].name);
      }
    },
    [simulateUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        simulateUpload(files[0].name);
      }
      e.target.value = "";
    },
    [simulateUpload]
  );

  const canGoBack = pathParts.length > 2;

  // ── Editor View ──────────────────────────────────────────
  if (editFile) {
    return (
      <div className="space-y-4 max-w-6xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditFile(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground truncate">{editFile.entry.name}</h1>
            <p className="text-xs text-muted-foreground font-mono truncate">{currentPath}/{editFile.entry.name}</p>
          </div>
          <button
            onClick={handleSaveEdit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:brightness-110 transition-all"
          >
            {editSaved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {editSaved ? "Saved" : "Save"}
          </button>
        </div>
        <textarea
          value={editFile.content}
          onChange={(e) => setEditFile({ ...editFile, content: e.target.value })}
          className="w-full h-[calc(100vh-200px)] rounded-xl border border-border bg-background p-4 text-sm text-foreground font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-all terminal-scroll"
          spellCheck={false}
        />
      </div>
    );
  }

  // ── Main File Browser ────────────────────────────────────
  return (
    <div
      className="space-y-4 max-w-6xl relative"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-xl flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <Upload className="h-10 w-10 text-primary mx-auto mb-2" />
            <p className="text-sm font-semibold text-primary">Drop files here to upload</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Files</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your server files</p>
      </div>

      {/* Path + Back */}
      <div className="flex items-center gap-2 flex-wrap">
        {canGoBack && (
          <button
            onClick={goBack}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-card border border-border text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back
          </button>
        )}
        <div className="flex items-center gap-1 text-sm font-mono text-muted-foreground overflow-x-auto">
          {pathParts.map((part, i) => {
            const pathUpTo = "/" + pathParts.slice(0, i + 1).join("/");
            const isLast = i === pathParts.length - 1;
            return (
              <span key={i} className="flex items-center gap-1 shrink-0">
                {i > 0 && <span className="text-border">/</span>}
                <button
                  onClick={() => !isLast && navigateTo(pathUpTo)}
                  className={`hover:text-foreground transition-colors ${
                    isLast ? "text-foreground font-semibold" : ""
                  }`}
                  disabled={isLast}
                >
                  {part}
                </button>
              </span>
            );
          })}
        </div>
      </div>

      {/* Action Bar + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap shrink-0">
          <button
            onClick={() => { setCreateMode("folder"); setCreateName(""); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            <FolderPlus className="h-3.5 w-3.5" /> Folder
          </button>
          <button
            onClick={() => { setCreateMode("file"); setCreateName(""); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            <FilePlus className="h-3.5 w-3.5" /> File
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:brightness-110 transition-all"
          >
            <Upload className="h-3.5 w-3.5" /> Upload
          </button>
          <button
            onClick={() => setFs({ ...MOCK_FS })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Upload className="h-4 w-4 text-primary" />
              <span className="font-medium truncate">{uploadFileName}</span>
            </div>
            <span className="text-muted-foreground text-xs">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-1.5" />
        </div>
      )}

      {/* File list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_80px_140px_40px] gap-2 px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border bg-accent/30">
          <span>Name</span>
          <span className="text-right">Size</span>
          <span className="text-right">Modified</span>
          <span />
        </div>

        {/* Entries */}
        {sorted.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            {search ? `No files match "${search}"` : "This folder is empty"}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sorted.map((entry) => {
              const Icon = getFileIcon(entry.name, entry.type);
              const editable = entry.type === "file" && isEditable(entry.name);
              return (
                <div
                  key={entry.name}
                  className="grid grid-cols-[1fr_80px_140px_40px] gap-2 px-4 py-3 items-center hover:bg-accent/40 transition-colors group cursor-default"
                >
                  {/* Name */}
                  <button
                    onClick={() => entry.type === "folder" ? openFolder(entry.name) : undefined}
                    className={`flex items-center gap-3 min-w-0 text-left ${
                      entry.type === "folder" ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        entry.type === "folder"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`text-sm truncate ${
                        entry.type === "folder"
                          ? "text-foreground font-medium hover:text-primary transition-colors"
                          : "text-foreground"
                      }`}
                    >
                      {entry.name}
                    </span>
                  </button>

                  {/* Size */}
                  <span className="text-xs text-muted-foreground text-right">
                    {entry.type === "folder" ? "—" : formatSize(entry.size)}
                  </span>

                  {/* Modified */}
                  <span className="text-xs text-muted-foreground text-right">
                    {entry.modified}
                  </span>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border min-w-[160px]">
                      {editable && (
                        <DropdownMenuItem
                          onClick={() =>
                            setEditFile({
                              entry,
                              content: entry.content || "",
                            })
                          }
                          className="gap-2 text-xs"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => {
                          setRenameTarget(entry);
                          setRenameValue(entry.name);
                        }}
                        className="gap-2 text-xs"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Rename
                      </DropdownMenuItem>
                      {entry.type === "file" && (
                        <DropdownMenuItem className="gap-2 text-xs">
                          <Download className="h-3.5 w-3.5" /> Download
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(entry)}
                        className="gap-2 text-xs text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete {deleteTarget?.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{deleteTarget?.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-card border-border text-foreground hover:bg-accent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogTitle className="text-foreground">Rename {renameTarget?.type}</DialogTitle>
          <input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
          <DialogFooter>
            <button
              onClick={() => setRenameTarget(null)}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRename}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:brightness-110 transition-all"
            >
              Rename
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={!!createMode} onOpenChange={(open) => !open && setCreateMode(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogTitle className="text-foreground">
            Create {createMode === "folder" ? "Folder" : "File"}
          </DialogTitle>
          <input
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder={createMode === "folder" ? "Folder name..." : "File name..."}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <DialogFooter>
            <button
              onClick={() => setCreateMode(null)}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:brightness-110 transition-all"
            >
              Create
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
