import { useState, useRef, useEffect } from "react";
import { Play, RotateCcw, Square, Cpu, HardDrive, Clock, Wifi, MemoryStick, CircleDot, Copy, Check } from "lucide-react";
import { useTheme, THEME_NAMES } from "@/contexts/ThemeContext";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

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

// Generate mock time-series data for graphs
const generateGraphData = (baseValue: number, variance: number, count = 20) =>
  Array.from({ length: count }, (_, i) => ({
    time: `${i}m`,
    value: Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * variance)),
  }));

const cpuData = generateGraphData(24, 20);
const ramData = generateGraphData(60, 15);
const diskData = generateGraphData(31, 5);

const stats = [
  { label: "RAM", value: "1.2 / 2 GB", icon: MemoryStick, color: "text-primary" },
  { label: "CPU", value: "24%", icon: Cpu, color: "text-success" },
  { label: "Uptime", value: "2h 14m", icon: Clock, color: "text-warning" },
  { label: "Disk", value: "3.1 / 10 GB", icon: HardDrive, color: "text-muted-foreground" },
  { label: "IP Address", value: "play.shreecloud.net:25565", icon: Wifi, color: "text-primary" },
];

interface MiniGraphProps {
  data: { time: string; value: number }[];
  color: string;
  label: string;
  currentValue: string;
  icon: React.ElementType;
  maxLabel?: string;
}

function MiniGraph({ data, color, label, currentValue, icon: Icon, maxLabel }: MiniGraphProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-sm font-semibold text-foreground">{currentValue}</span>
      </div>
      {maxLabel && (
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${data[data.length - 1]?.value ?? 0}%` }}
          />
        </div>
      )}
      <div className="h-[80px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`hsl(var(--primary))`} stopOpacity={0.3} />
                <stop offset="100%" stopColor={`hsl(var(--primary))`} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(var(--foreground))",
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, label]}
              labelFormatter={(l) => `${l} ago`}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill={`url(#gradient-${label})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

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
      if (id >= 0 && id <= 7) {
        setTheme(id);
        setLogs((prev) => [...prev, `> ${command}`, `[ShreeCloud] Theme changed to: ${THEME_NAMES[id]}`]);
      } else {
        setLogs((prev) => [...prev, `> ${command}`, `[ShreeCloud] Invalid theme. Use "theme 0" to "theme 7".`]);
      }
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

      {/* Resource Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MiniGraph data={cpuData} color="text-success" label="CPU" currentValue="24%" icon={Cpu} maxLabel="100%" />
        <MiniGraph data={ramData} color="text-primary" label="RAM" currentValue="1.2 / 2 GB" icon={MemoryStick} maxLabel="2 GB" />
        <MiniGraph data={diskData} color="text-warning" label="Disk" currentValue="3.1 / 10 GB" icon={HardDrive} maxLabel="10 GB" />
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
