import { useState, useEffect } from "react";
import { Search, Filter, ChevronDown, X, Terminal, Shield, Server, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type LogCategory = "command" | "permission" | "system";
type LogStatus = "success" | "failed";

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  target: string;
  category: LogCategory;
  status: LogStatus;
  timestamp: Date;
  rawCommand?: string;
  details?: string;
}

const MOCK_LOGS: ActivityLog[] = [
  { id: "1", user: "ShreeAdmin", action: "Server Started", target: "Server", category: "system", status: "success", timestamp: new Date(Date.now() - 120000), details: "Server started with 2GB RAM allocation" },
  { id: "2", user: "ShreeAdmin", action: "Executed Command", target: "Server", category: "command", status: "success", timestamp: new Date(Date.now() - 300000), rawCommand: "/whitelist on", details: "Whitelist mode enabled" },
  { id: "3", user: "ShreeAdmin", action: "Gave OP", target: "Player: Steve", category: "permission", status: "success", timestamp: new Date(Date.now() - 600000), rawCommand: "/op Steve", details: "Operator status granted to Steve" },
  { id: "4", user: "Console", action: "Plugin Installed", target: "EssentialsX v2.20.1", category: "system", status: "success", timestamp: new Date(Date.now() - 900000), details: "Plugin downloaded from Modrinth and installed" },
  { id: "5", user: "ShreeAdmin", action: "Banned Player", target: "Player: Griefer123", category: "permission", status: "success", timestamp: new Date(Date.now() - 1200000), rawCommand: "/ban Griefer123 Griefing", details: "Player banned permanently for griefing" },
  { id: "6", user: "ShreeAdmin", action: "Executed Command", target: "Server", category: "command", status: "failed", timestamp: new Date(Date.now() - 1500000), rawCommand: "/reload confirm", details: "Reload failed: plugin conflict detected" },
  { id: "7", user: "Console", action: "Server Restarted", target: "Server", category: "system", status: "success", timestamp: new Date(Date.now() - 1800000), details: "Scheduled restart completed" },
  { id: "8", user: "ShreeAdmin", action: "Removed OP", target: "Player: Alex", category: "permission", status: "success", timestamp: new Date(Date.now() - 2100000), rawCommand: "/deop Alex", details: "Operator status removed from Alex" },
  { id: "9", user: "ShreeAdmin", action: "Executed Command", target: "Server", category: "command", status: "success", timestamp: new Date(Date.now() - 2400000), rawCommand: "/gamerule keepInventory true", details: "Game rule updated" },
  { id: "10", user: "Console", action: "File Modified", target: "server.properties", category: "system", status: "success", timestamp: new Date(Date.now() - 3000000), details: "max-players changed from 20 to 50" },
  { id: "11", user: "ShreeAdmin", action: "Whitelisted Player", target: "Player: Notch", category: "permission", status: "success", timestamp: new Date(Date.now() - 3600000), rawCommand: "/whitelist add Notch", details: "Player added to whitelist" },
  { id: "12", user: "Console", action: "Server Stopped", target: "Server", category: "system", status: "success", timestamp: new Date(Date.now() - 7200000), details: "Graceful shutdown completed" },
  { id: "13", user: "ShreeAdmin", action: "Executed Command", target: "Server", category: "command", status: "failed", timestamp: new Date(Date.now() - 7500000), rawCommand: "/tp @a 0 100 0", details: "No players online to teleport" },
  { id: "14", user: "Console", action: "Backup Created", target: "world_backup_03-19", category: "system", status: "success", timestamp: new Date(Date.now() - 10800000), details: "Full world backup completed (1.2 GB)" },
  { id: "15", user: "ShreeAdmin", action: "Unbanned Player", target: "Player: Builder42", category: "permission", status: "success", timestamp: new Date(Date.now() - 14400000), rawCommand: "/pardon Builder42", details: "Player unbanned after appeal" },
];

const CATEGORY_FILTERS = [
  { label: "All", value: "all" },
  { label: "Commands", value: "command" },
  { label: "Permissions", value: "permission" },
  { label: "System", value: "system" },
];

const categoryConfig: Record<LogCategory, { color: string; bg: string; icon: React.ElementType }> = {
  command: { color: "text-primary", bg: "bg-primary/10 border-primary/20", icon: Terminal },
  permission: { color: "text-warning", bg: "bg-warning/10 border-warning/20", icon: Shield },
  system: { color: "text-muted-foreground", bg: "bg-muted/50 border-border", icon: Server },
};

const statusConfig: Record<LogStatus, { color: string; bg: string; label: string }> = {
  success: { color: "text-success", bg: "bg-success/10 border-success/20", label: "Success" },
  failed: { color: "text-destructive", bg: "bg-destructive/10 border-destructive/20", label: "Failed" },
};

function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ActivityPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  // Simulate real-time log arrival
  useEffect(() => {
    const actions = [
      { action: "Executed Command", target: "Server", category: "command" as LogCategory, rawCommand: "/list", details: "Listed online players" },
      { action: "Player Joined", target: "Player: Alex", category: "system" as LogCategory, details: "Player connected from 192.168.1.1" },
      { action: "Whitelist Check", target: "Player: Herobrine", category: "permission" as LogCategory, details: "Player rejected — not on whitelist" },
    ];

    const interval = setInterval(() => {
      const template = actions[Math.floor(Math.random() * actions.length)];
      const newLog: ActivityLog = {
        id: crypto.randomUUID(),
        user: Math.random() > 0.5 ? "ShreeAdmin" : "Console",
        ...template,
        status: Math.random() > 0.2 ? "success" : "failed",
        timestamp: new Date(),
      };
      setNewIds((prev) => new Set(prev).add(newLog.id));
      setLogs((prev) => [newLog, ...prev]);
      setTimeout(() => setNewIds((prev) => { const n = new Set(prev); n.delete(newLog.id); return n; }), 1500);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const filtered = logs.filter((log) => {
    const matchesSearch =
      !search ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">Track all server and user actions in real time</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity..."
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setCategoryFilter(f.value)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                categoryFilter === f.value
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Events", value: logs.length, color: "text-foreground" },
          { label: "Commands", value: logs.filter((l) => l.category === "command").length, color: "text-primary" },
          { label: "Permissions", value: logs.filter((l) => l.category === "permission").length, color: "text-warning" },
          { label: "Failed", value: logs.filter((l) => l.status === "failed").length, color: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-3.5">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
            <p className={cn("text-xl font-bold mt-1", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_1.5fr_1fr_0.7fr_1fr] gap-4 px-4 py-3 border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
          <span>User</span>
          <span>Action</span>
          <span>Target</span>
          <span>Status</span>
          <span>Time</span>
        </div>

        {/* Table body */}
        <div className="max-h-[500px] overflow-y-auto terminal-scroll">
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-muted-foreground text-sm">No activity logs found</div>
          ) : (
            filtered.map((log) => {
              const cat = categoryConfig[log.category];
              const status = statusConfig[log.status];
              const CatIcon = cat.icon;
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={cn(
                    "grid grid-cols-[1fr_1.5fr_1fr_0.7fr_1fr] gap-4 px-4 py-3 border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-all",
                    newIds.has(log.id) && "animate-in slide-in-from-top-2 fade-in duration-500 bg-primary/5"
                  )}
                >
                  {/* User */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-primary">{log.user[0]}</span>
                    </div>
                    <span className="text-sm text-foreground truncate">{log.user}</span>
                  </div>

                  {/* Action */}
                  <div className="flex items-center gap-2 min-w-0">
                    <CatIcon className={cn("h-3.5 w-3.5 shrink-0", cat.color)} />
                    <span className="text-sm text-foreground truncate">{log.action}</span>
                  </div>

                  {/* Target */}
                  <span className="text-sm text-muted-foreground truncate self-center">{log.target}</span>

                  {/* Status */}
                  <div className="self-center">
                    <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", status.bg, status.color)}>
                      {status.label}
                    </span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-1.5 self-center">
                    <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">{timeAgo(log.timestamp)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setSelectedLog(null)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-lg mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Activity Detail</h2>
              <button onClick={() => setSelectedLog(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "User", value: selectedLog.user },
                { label: "Action", value: selectedLog.action },
                { label: "Target", value: selectedLog.target },
                { label: "Category", value: selectedLog.category.charAt(0).toUpperCase() + selectedLog.category.slice(1) },
                { label: "Status", value: statusConfig[selectedLog.status].label },
                { label: "Timestamp", value: formatTimestamp(selectedLog.timestamp) },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className={cn(
                    "text-sm font-medium",
                    row.label === "Status" ? statusConfig[selectedLog.status].color : "text-foreground"
                  )}>{row.value}</span>
                </div>
              ))}
              {selectedLog.rawCommand && (
                <div className="mt-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Raw Command</span>
                  <div className="mt-1 bg-background border border-border rounded-lg px-3 py-2 font-mono text-sm text-primary">
                    {selectedLog.rawCommand}
                  </div>
                </div>
              )}
              {selectedLog.details && (
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Details</span>
                  <p className="mt-1 text-sm text-foreground/80">{selectedLog.details}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
