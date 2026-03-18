import { useState, useRef, useEffect } from "react";
import { Play, RotateCcw, Square, Cpu, HardDrive, Clock, Wifi, MemoryStick, CircleDot, Copy, Check } from "lucide-react";
import { useTheme, THEME_NAMES } from "@/contexts/ThemeContext";

const MOCK_LOGS = [
  "[15:32:01 INFO]: Starting minecraft server version 1.20.4",
  "[15:32:02 INFO]: Loading properties",
  "[15:32:02 INFO]: Default game type: SURVIVAL",
  "[15:32:03 INFO]: Generating keypair",
  "[15:32:04 INFO]: Starting Minecraft server on *:25565",
  "[15:32:05 INFO]: Using epoll channel type",
  "[15:32:06 INFO]: Preparing level \"world\"",
  "[15:32:08 INFO]: Preparing start region for dimension minecraft:overworld",
  "[15:32:12 INFO]: Preparing spawn area: 52%",
  "[15:32:14 INFO]: Preparing spawn area: 98%",
  "[15:32:14 INFO]: Time elapsed: 8412 ms",
  "[15:32:14 INFO]: Done (12.053s)! For help, type \"help\"",
  "[15:32:30 INFO]: ShreePlayer joined the game",
  "[15:33:01 INFO]: <ShreePlayer> Server is running smooth!",
  "[15:34:12 INFO]: ShreePlayer has made the advancement [Getting an Upgrade]",
];

const stats = [
  { label: "RAM", value: "1.2 / 2 GB", icon: MemoryStick, color: "text-primary" },
  { label: "CPU", value: "24%", icon: Cpu, color: "text-success" },
  { label: "Uptime", value: "2h 14m", icon: Clock, color: "text-warning" },
  { label: "Disk", value: "3.1 / 10 GB", icon: HardDrive, color: "text-muted-foreground" },
  { label: "IP Address", value: "play.shreecloud.net:25565", icon: Wifi, color: "text-primary" },
];

export function ConsolePage() {
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [command, setCommand] = useState("");
  const [copied, setCopied] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const { setTheme } = useTheme();

  const handleCommand = () => {
    if (!command.trim()) return;
    const themeMatch = command.trim().match(/^theme\s+(\d)$/i);
    if (themeMatch) {
      const id = parseInt(themeMatch[1], 10);
      if (id >= 1 && id <= 7) {
        setTheme(id);
        setLogs((prev) => [...prev, `> ${command}`, `[ShreeCloud] Theme changed to: ${THEME_NAMES[id]}`]);
      } else {
        setLogs((prev) => [...prev, `> ${command}`, `[ShreeCloud] Invalid theme. Use "theme 1" to "theme 7". Use "theme 0" for default.`]);
      }
    } else if (command.trim().match(/^theme\s+0$/i)) {
      setTheme(0);
      setLogs((prev) => [...prev, `> ${command}`, `[ShreeCloud] Theme reset to: Default (Blue)`]);
    } else {
      setLogs((prev) => [...prev, `> ${command}`, `[Server] Unknown command: ${command}`]);
    }
    setCommand("");
  };

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">ShreeCloud</h1>
        <p className="text-sm text-muted-foreground mt-1">Minecraft Server — Online</p>
      </div>

      {/* Control buttons */}
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success text-success-foreground font-medium text-sm hover:scale-[1.02] transition-transform duration-150">
          <Play className="h-4 w-4" /> Start
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning text-warning-foreground font-medium text-sm hover:scale-[1.02] transition-transform duration-150">
          <RotateCcw className="h-4 w-4" /> Restart
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium text-sm hover:scale-[1.02] transition-transform duration-150">
          <Square className="h-4 w-4" /> Stop
        </button>
      </div>

      {/* Terminal */}
      <div className="bg-background border border-border rounded-lg overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
          <div className="h-3 w-3 rounded-full bg-destructive" />
          <div className="h-3 w-3 rounded-full bg-warning" />
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="ml-2 text-xs text-muted-foreground font-mono">console</span>
        </div>
        <div
          ref={terminalRef}
          className="h-[400px] overflow-y-auto p-3 font-mono text-sm terminal-scroll"
        >
          {logs.map((line, i) => (
            <div key={i} className={`leading-relaxed ${line.startsWith(">") ? "text-primary" : "text-foreground/80"}`}>
              {line}
            </div>
          ))}
        </div>
        <div className="border-t border-border flex">
          <span className="px-3 py-2.5 text-primary font-mono text-sm select-none">$</span>
          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCommand()}
            placeholder="Write Command without /"
            className="flex-1 bg-transparent py-2.5 pr-4 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {/* Status card */}
        <div className="bg-card border border-border rounded-lg p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <CircleDot className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Status</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
            </span>
            <p className="text-sm font-semibold text-success">Online</p>
          </div>
        </div>
        {stats.map((s) => (
          <div
            key={s.label}
            className={`bg-card border border-border rounded-lg p-3.5 ${s.label === "IP Address" ? "cursor-pointer hover:border-primary/50 transition-colors" : ""}`}
            onClick={() => {
              if (s.label === "IP Address") {
                navigator.clipboard.writeText(s.value);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
              {s.label === "IP Address" && (
                copied
                  ? <Check className="h-3 w-3 text-success ml-auto" />
                  : <Copy className="h-3 w-3 text-muted-foreground ml-auto" />
              )}
            </div>
            <p className="text-sm font-semibold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
