import { useState, useMemo } from "react";
import {
  Search, Plus, Trash2, Edit3, Download, Eye, FolderOpen, FileText, X,
  Tag, User, Server, ChevronRight, Check, Loader2, Copy, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────

interface TemplateFile {
  name: string;
  type: "file" | "folder";
  size?: number;
  children?: TemplateFile[];
}

interface Template {
  id: string;
  name: string;
  description: string;
  version: string;
  serverType: string;
  tags: string[];
  creator: string;
  createdAt: string;
  isOwn: boolean;
  files: TemplateFile[];
}

// ── Mock Data ──────────────────────────────────────────

const MOCK_TEMPLATES: Template[] = [
  {
    id: "1", name: "Survival Starter Kit", description: "Pre-configured survival server with essential plugins, optimized settings, and spawn protection.",
    version: "1.21.4", serverType: "Paper", tags: ["survival", "starter", "optimized"],
    creator: "ShreeCloud", createdAt: "2026-03-10T08:00:00Z", isOwn: false,
    files: [
      { name: "plugins", type: "folder", children: [
        { name: "EssentialsX.jar", type: "file", size: 1200000 },
        { name: "WorldGuard.jar", type: "file", size: 800000 },
        { name: "Vault.jar", type: "file", size: 200000 },
      ]},
      { name: "server.properties", type: "file", size: 1200 },
      { name: "bukkit.yml", type: "file", size: 800 },
      { name: "spigot.yml", type: "file", size: 2400 },
      { name: "paper.yml", type: "file", size: 3200 },
    ],
  },
  {
    id: "2", name: "PvP Arena Setup", description: "Complete PvP arena server with kits, arenas, and scoreboards. Ready to play.",
    version: "1.20.4", serverType: "Paper", tags: ["pvp", "arena", "competitive"],
    creator: "MCBuilder99", createdAt: "2026-02-20T14:00:00Z", isOwn: false,
    files: [
      { name: "plugins", type: "folder", children: [
        { name: "BattleArena.jar", type: "file", size: 900000 },
        { name: "KitPvP.jar", type: "file", size: 600000 },
      ]},
      { name: "server.properties", type: "file", size: 1100 },
    ],
  },
  {
    id: "3", name: "My Custom SMP", description: "My personalized SMP setup with custom configs and hand-picked plugins.",
    version: "1.21.4", serverType: "Paper", tags: ["smp", "custom"],
    creator: "You", createdAt: "2026-03-18T10:00:00Z", isOwn: true,
    files: [
      { name: "plugins", type: "folder", children: [
        { name: "EssentialsX.jar", type: "file", size: 1200000 },
        { name: "LuckPerms.jar", type: "file", size: 1800000 },
        { name: "TAB.jar", type: "file", size: 500000 },
      ]},
      { name: "server.properties", type: "file", size: 1300 },
      { name: "paper.yml", type: "file", size: 3000 },
    ],
  },
  {
    id: "4", name: "Skyblock Economy", description: "Full skyblock server template with economy, island system, and challenges.",
    version: "1.20.6", serverType: "Spigot", tags: ["skyblock", "economy", "islands"],
    creator: "SkyMaster", createdAt: "2026-01-15T09:00:00Z", isOwn: false,
    files: [
      { name: "plugins", type: "folder", children: [
        { name: "ASkyBlock.jar", type: "file", size: 1500000 },
        { name: "Vault.jar", type: "file", size: 200000 },
        { name: "EssentialsX.jar", type: "file", size: 1200000 },
      ]},
      { name: "server.properties", type: "file", size: 1100 },
    ],
  },
  {
    id: "5", name: "Proxy Network Base", description: "BungeeCord proxy template for multi-server networks with lobby configuration.",
    version: "1.21", serverType: "BungeeCord", tags: ["proxy", "network", "lobby"],
    creator: "NetAdmin", createdAt: "2026-02-01T12:00:00Z", isOwn: false,
    files: [
      { name: "plugins", type: "folder", children: [
        { name: "BungeeGuard.jar", type: "file", size: 400000 },
        { name: "LuckPerms-Bungee.jar", type: "file", size: 1600000 },
      ]},
      { name: "config.yml", type: "file", size: 2800 },
    ],
  },
];

const MOCK_SERVER_FILES: TemplateFile[] = [
  { name: "plugins", type: "folder", children: [
    { name: "EssentialsX.jar", type: "file", size: 1200000 },
    { name: "WorldGuard.jar", type: "file", size: 800000 },
    { name: "LuckPerms.jar", type: "file", size: 1800000 },
    { name: "EssentialsX", type: "folder", children: [
      { name: "config.yml", type: "file", size: 4500 },
      { name: "worth.yml", type: "file", size: 12000 },
    ]},
  ]},
  { name: "world", type: "folder", children: [
    { name: "region", type: "folder" },
    { name: "level.dat", type: "file", size: 4096 },
  ]},
  { name: "server.properties", type: "file", size: 1200 },
  { name: "bukkit.yml", type: "file", size: 800 },
  { name: "spigot.yml", type: "file", size: 2400 },
  { name: "paper.yml", type: "file", size: 3200 },
  { name: "server.jar", type: "file", size: 45000000 },
];

const ALL_TAGS = ["survival", "starter", "optimized", "pvp", "arena", "competitive", "smp", "custom", "skyblock", "economy", "islands", "proxy", "network", "lobby"];
const SERVER_OPTIONS = ["Paper", "Spigot", "Vanilla", "BungeeCord", "Bukkit"];

// ── Helpers ────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + " MB";
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(0) + " KB";
  return bytes + " B";
}

// ── Component ──────────────────────────────────────────

export function TemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "mine" | "community">("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [filterVersion, setFilterVersion] = useState<string>("all");

  // Detail view
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createVersion, setCreateVersion] = useState("1.21.4");
  const [createServer, setCreateServer] = useState("Paper");
  const [createTags, setCreateTags] = useState<string[]>([]);
  const [createTagInput, setCreateTagInput] = useState("");
  const [showServerFiles, setShowServerFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Edit modal
  const [editTarget, setEditTarget] = useState<Template | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);

  // Applying
  const [applying, setApplying] = useState<string | null>(null);

  // ── Filtered templates ──
  const filtered = useMemo(() => {
    return templates.filter(t => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.tags.some(tag => tag.includes(search.toLowerCase()))) return false;
      if (filterTab === "mine" && !t.isOwn) return false;
      if (filterTab === "community" && t.isOwn) return false;
      if (filterTag !== "all" && !t.tags.includes(filterTag)) return false;
      if (filterVersion !== "all" && t.version !== filterVersion) return false;
      return true;
    });
  }, [templates, search, filterTab, filterTag, filterVersion]);

  const versions = useMemo(() => [...new Set(templates.map(t => t.version))].sort().reverse(), [templates]);

  // ── Actions ──
  const handleCreate = () => {
    if (!createName.trim()) return;
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: createName.trim(),
      description: createDesc.trim() || "No description",
      version: createVersion,
      serverType: createServer,
      tags: createTags,
      creator: "You",
      createdAt: new Date().toISOString(),
      isOwn: true,
      files: MOCK_SERVER_FILES.filter(f => selectedFiles.has(f.name)),
    };
    setTemplates(prev => [newTemplate, ...prev]);
    toast({ title: "Template created", description: `"${newTemplate.name}" has been created.` });
    resetCreateForm();
  };

  const resetCreateForm = () => {
    setShowCreate(false);
    setCreateName("");
    setCreateDesc("");
    setCreateTags([]);
    setCreateTagInput("");
    setShowServerFiles(false);
    setSelectedFiles(new Set());
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setTemplates(prev => prev.filter(t => t.id !== deleteTarget.id));
    if (selectedTemplate?.id === deleteTarget.id) setSelectedTemplate(null);
    toast({ title: "Template deleted", description: `"${deleteTarget.name}" has been deleted.` });
    setDeleteTarget(null);
  };

  const handleApply = (template: Template) => {
    setApplying(template.id);
    setTimeout(() => {
      setApplying(null);
      toast({ title: "Template applied", description: `"${template.name}" has been applied to your server.` });
    }, 2000);
  };

  const handleEdit = () => {
    if (!editTarget || !editName.trim()) return;
    setTemplates(prev => prev.map(t => t.id === editTarget.id ? { ...t, name: editName.trim(), description: editDesc.trim() } : t));
    toast({ title: "Template updated", description: `"${editName.trim()}" has been updated.` });
    setEditTarget(null);
  };

  const addCreateTag = () => {
    const tag = createTagInput.trim().toLowerCase();
    if (tag && !createTags.includes(tag)) {
      setCreateTags(prev => [...prev, tag]);
    }
    setCreateTagInput("");
  };

  const toggleFileSelect = (name: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const selectClass = "bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer";

  // ── File tree renderer ──
  const renderFileTree = (files: TemplateFile[], depth = 0, selectable = false) => (
    <div className={depth > 0 ? "ml-5 border-l border-border/50 pl-3" : ""}>
      {files.map(f => (
        <div key={f.name}>
          <div
            className={`flex items-center gap-2 py-1.5 px-2 rounded-md text-sm hover:bg-accent/50 transition-colors ${
              selectable ? "cursor-pointer" : ""
            }`}
            onClick={() => selectable && depth === 0 && toggleFileSelect(f.name)}
          >
            {selectable && depth === 0 && (
              <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                selectedFiles.has(f.name) ? "bg-primary border-primary" : "border-border"
              }`}>
                {selectedFiles.has(f.name) && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
            )}
            {f.type === "folder" ? (
              <FolderOpen className="h-4 w-4 text-primary shrink-0" />
            ) : (
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className="text-foreground truncate">{f.name}</span>
            {f.size && <span className="text-[10px] text-muted-foreground ml-auto">{formatSize(f.size)}</span>}
          </div>
          {f.children && renderFileTree(f.children, depth + 1, selectable)}
        </div>
      ))}
    </div>
  );

  // ── Detail view ──
  if (selectedTemplate) {
    return (
      <div className="space-y-6 max-w-4xl">
        <button onClick={() => setSelectedTemplate(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight className="h-4 w-4 rotate-180" /> Back to Templates
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{selectedTemplate.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{selectedTemplate.description}</p>
          </div>
          <Badge variant="secondary" className="shrink-0">{selectedTemplate.isOwn ? "My Template" : "Community"}</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Server, label: "Server", value: selectedTemplate.serverType },
            { icon: Tag, label: "Version", value: selectedTemplate.version },
            { icon: User, label: "Creator", value: selectedTemplate.creator },
            { icon: Globe, label: "Created", value: new Date(selectedTemplate.createdAt).toLocaleDateString() },
          ].map(item => (
            <div key={item.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <item.icon className="h-3.5 w-3.5" />{item.label}
              </div>
              <p className="text-sm font-medium text-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {selectedTemplate.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">File Structure</h3>
          <div className="bg-card border border-border rounded-xl p-4">
            {renderFileTree(selectedTemplate.files)}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => handleApply(selectedTemplate)} disabled={applying === selectedTemplate.id}>
            {applying === selectedTemplate.id ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Applying...</> : <><Download className="h-4 w-4 mr-1.5" /> Apply Template</>}
          </Button>
          {selectedTemplate.isOwn && (
            <>
              <Button variant="outline" onClick={() => { setEditTarget(selectedTemplate); setEditName(selectedTemplate.name); setEditDesc(selectedTemplate.description); }}>
                <Edit3 className="h-4 w-4 mr-1.5" /> Edit
              </Button>
              <Button variant="destructive" onClick={() => setDeleteTarget(selectedTemplate)}>
                <Trash2 className="h-4 w-4 mr-1.5" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Main view ──
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Create, share, and apply server templates</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> Create Template
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-lg p-1 w-fit">
        {(["all", "mine", "community"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              filterTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "all" ? "All Templates" : tab === "mine" ? "My Templates" : "Community"}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
        <select value={filterTag} onChange={e => setFilterTag(e.target.value)} className={selectClass}>
          <option value="all">All Tags</option>
          {ALL_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterVersion} onChange={e => setFilterVersion(e.target.value)} className={selectClass}>
          <option value="all">All Versions</option>
          {versions.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(template => (
          <div
            key={template.id}
            className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group"
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{template.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{template.description}</p>
              </div>
              <Badge variant="secondary" className="text-[10px] shrink-0 ml-2">
                {template.isOwn ? "Mine" : "Community"}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Server className="h-3 w-3" />{template.serverType}</span>
              <span>{template.version}</span>
              <span className="flex items-center gap-1"><User className="h-3 w-3" />{template.creator}</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
              ))}
              {template.tags.length > 3 && <span className="text-[10px] text-muted-foreground">+{template.tags.length - 3}</span>}
            </div>

            <div className="flex gap-2 mt-auto pt-1">
              <Button
                size="sm"
                className="flex-1 text-xs"
                onClick={(e) => { e.stopPropagation(); handleApply(template); }}
                disabled={applying === template.id}
              >
                {applying === template.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Download className="h-3 w-3 mr-1" /> Apply</>}
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={(e) => { e.stopPropagation(); setSelectedTemplate(template); }}>
                <Eye className="h-3 w-3" />
              </Button>
              {template.isOwn && (
                <Button size="sm" variant="outline" className="text-xs" onClick={(e) => { e.stopPropagation(); setDeleteTarget(template); }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Copy className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No templates found</p>
        </div>
      )}

      {/* Create Template Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) resetCreateForm(); else setShowCreate(true); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Template</DialogTitle>
            <DialogDescription>Save your server setup as a reusable template</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Template Name</label>
              <Input value={createName} onChange={e => setCreateName(e.target.value)} placeholder="My Server Template" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
              <textarea
                value={createDesc}
                onChange={e => setCreateDesc(e.target.value)}
                placeholder="Describe your template..."
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none h-20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Version</label>
                <Input value={createVersion} onChange={e => setCreateVersion(e.target.value)} placeholder="1.21.4" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Server Type</label>
                <select value={createServer} onChange={e => { setCreateServer(e.target.value); setShowServerFiles(true); }} className={`${selectClass} w-full`}>
                  {SERVER_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tags</label>
              <div className="flex gap-2">
                <Input
                  value={createTagInput}
                  onChange={e => setCreateTagInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCreateTag())}
                  placeholder="Add a tag..."
                  className="flex-1"
                />
                <Button size="sm" variant="outline" onClick={addCreateTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {createTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setCreateTags(prev => prev.filter(t => t !== tag))} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Server files selection */}
            {showServerFiles && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Select Files to Include</label>
                <div className="bg-background border border-border rounded-xl p-3 max-h-60 overflow-y-auto">
                  {renderFileTree(MOCK_SERVER_FILES, 0, true)}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{selectedFiles.size} items selected</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetCreateForm}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!createName.trim()}>Create Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>Update template details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none h-20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={!editName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
