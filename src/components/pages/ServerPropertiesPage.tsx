import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Save, RotateCcw, Info, FileText, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type PropertyType = "boolean" | "number" | "text" | "select";

interface PropertyDef {
  key: string;
  label: string;
  type: PropertyType;
  default: string | number | boolean;
  description: string;
  group: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

const PROPERTIES: PropertyDef[] = [
  { key: "motd", label: "MOTD", type: "text", default: "A Minecraft Server", description: "Message displayed in the server list", group: "General" },
  { key: "server-port", label: "Server Port", type: "number", default: 25565, description: "Port the server listens on", group: "General", min: 1, max: 65535 },
  { key: "max-players", label: "Max Players", type: "number", default: 20, description: "Maximum number of players allowed", group: "General", min: 1, max: 1000 },
  { key: "enable-status", label: "Enable Status", type: "boolean", default: true, description: "Show server in the server list", group: "General" },
  { key: "server-ip", label: "Server IP", type: "text", default: "", description: "IP address to bind to (leave blank for all)", group: "General" },
  { key: "enable-query", label: "Enable Query", type: "boolean", default: false, description: "Enable GameSpy4 protocol query listener", group: "General" },
  { key: "query.port", label: "Query Port", type: "number", default: 25565, description: "Port for the query listener", group: "General", min: 1, max: 65535 },
  { key: "gamemode", label: "Gamemode", type: "select", default: "survival", description: "Default game mode for new players", group: "Gameplay", options: [
    { value: "survival", label: "Survival" }, { value: "creative", label: "Creative" }, { value: "adventure", label: "Adventure" }, { value: "spectator", label: "Spectator" }
  ]},
  { key: "difficulty", label: "Difficulty", type: "select", default: "easy", description: "Server difficulty level", group: "Gameplay", options: [
    { value: "peaceful", label: "Peaceful" }, { value: "easy", label: "Easy" }, { value: "normal", label: "Normal" }, { value: "hard", label: "Hard" }
  ]},
  { key: "hardcore", label: "Hardcore", type: "boolean", default: false, description: "Players are set to spectator mode on death", group: "Gameplay" },
  { key: "pvp", label: "PvP", type: "boolean", default: true, description: "Allow players to fight each other", group: "Gameplay" },
  { key: "allow-flight", label: "Allow Flight", type: "boolean", default: false, description: "Allow survival players to fly (with mods)", group: "Gameplay" },
  { key: "force-gamemode", label: "Force Gamemode", type: "boolean", default: false, description: "Force players to join in the default game mode", group: "Gameplay" },
  { key: "allow-nether", label: "Allow Nether", type: "boolean", default: true, description: "Allow players to travel to the Nether", group: "Gameplay" },
  { key: "enable-command-block", label: "Enable Command Blocks", type: "boolean", default: false, description: "Allow command blocks to be used", group: "Gameplay" },
  { key: "player-idle-timeout", label: "Player Idle Timeout", type: "number", default: 0, description: "Minutes before idle players are kicked (0 = disabled)", group: "Gameplay", min: 0, max: 9999 },
  { key: "spawn-protection", label: "Spawn Protection", type: "number", default: 16, description: "Radius of spawn area protection in blocks", group: "Gameplay", min: 0, max: 256 },
  { key: "level-name", label: "Level Name", type: "text", default: "world", description: "Name of the world folder", group: "World" },
  { key: "level-seed", label: "Level Seed", type: "text", default: "", description: "Seed for world generation", group: "World" },
  { key: "level-type", label: "Level Type", type: "select", default: "minecraft:normal", description: "World generation type", group: "World", options: [
    { value: "minecraft:normal", label: "Normal" }, { value: "minecraft:flat", label: "Flat" }, { value: "minecraft:large_biomes", label: "Large Biomes" }, { value: "minecraft:amplified", label: "Amplified" }, { value: "minecraft:single_biome_surface", label: "Single Biome" }
  ]},
  { key: "generate-structures", label: "Generate Structures", type: "boolean", default: true, description: "Generate villages, temples, etc.", group: "World" },
  { key: "max-world-size", label: "Max World Size", type: "number", default: 29999984, description: "Maximum world border radius in blocks", group: "World", min: 1, max: 29999984 },
  { key: "spawn-monsters", label: "Spawn Monsters", type: "boolean", default: true, description: "Allow hostile mobs to spawn", group: "World" },
  { key: "spawn-npcs", label: "Spawn NPCs", type: "boolean", default: true, description: "Allow villagers to spawn", group: "World" },
  { key: "spawn-animals", label: "Spawn Animals", type: "boolean", default: true, description: "Allow animals to spawn", group: "World" },
  { key: "generator-settings", label: "Generator Settings", type: "text", default: "{}", description: "JSON settings for flat world generation", group: "World" },
  { key: "view-distance", label: "View Distance", type: "number", default: 10, description: "Render distance in chunks", group: "Performance", min: 2, max: 32 },
  { key: "simulation-distance", label: "Simulation Distance", type: "number", default: 10, description: "Distance in chunks for entity ticking", group: "Performance", min: 2, max: 32 },
  { key: "max-tick-time", label: "Max Tick Time", type: "number", default: 60000, description: "Max ms per tick before watchdog kills server (-1 = disabled)", group: "Performance", min: -1, max: 999999 },
  { key: "network-compression-threshold", label: "Network Compression", type: "number", default: 256, description: "Packet size threshold for compression (-1 = disabled)", group: "Performance", min: -1, max: 99999 },
  { key: "rate-limit", label: "Rate Limit", type: "number", default: 0, description: "Max packets/sec before disconnect (0 = disabled)", group: "Performance", min: 0, max: 99999 },
  { key: "entity-broadcast-range-percentage", label: "Entity Broadcast Range %", type: "number", default: 100, description: "Percentage of default entity tracking range", group: "Performance", min: 10, max: 1000 },
  { key: "online-mode", label: "Online Mode", type: "boolean", default: true, description: "Verify player accounts with Mojang", group: "Security" },
  { key: "white-list", label: "Whitelist", type: "boolean", default: false, description: "Only allow listed players to join", group: "Security" },
  { key: "enforce-whitelist", label: "Enforce Whitelist", type: "boolean", default: false, description: "Kick non-whitelisted players when whitelist is reloaded", group: "Security" },
  { key: "enforce-secure-profile", label: "Enforce Secure Profile", type: "boolean", default: true, description: "Require players to have Mojang-signed public key", group: "Security" },
  { key: "prevent-proxy-connections", label: "Prevent Proxy Connections", type: "boolean", default: false, description: "Block connections from known proxies/VPNs", group: "Security" },
  { key: "op-permission-level", label: "OP Permission Level", type: "select", default: "4", description: "Default permission level for operators", group: "Security", options: [
    { value: "1", label: "Level 1 - Bypass spawn protection" }, { value: "2", label: "Level 2 - Cheat commands" }, { value: "3", label: "Level 3 - Player management" }, { value: "4", label: "Level 4 - Full control" },
  ]},
  { key: "function-permission-level", label: "Function Permission Level", type: "number", default: 2, description: "Permission level for function commands", group: "Security", min: 1, max: 4 },
  { key: "enable-rcon", label: "Enable RCON", type: "boolean", default: false, description: "Enable remote console access", group: "Advanced" },
  { key: "rcon.port", label: "RCON Port", type: "number", default: 25575, description: "Port for RCON connections", group: "Advanced", min: 1, max: 65535 },
  { key: "rcon.password", label: "RCON Password", type: "text", default: "", description: "Password for RCON access", group: "Advanced" },
  { key: "broadcast-rcon-to-ops", label: "Broadcast RCON to OPs", type: "boolean", default: true, description: "Show RCON command output to operators", group: "Advanced" },
  { key: "broadcast-console-to-ops", label: "Broadcast Console to OPs", type: "boolean", default: true, description: "Show console command output to operators", group: "Advanced" },
  { key: "resource-pack", label: "Resource Pack URL", type: "text", default: "", description: "URL to a resource pack for clients", group: "Advanced" },
  { key: "resource-pack-sha1", label: "Resource Pack SHA-1", type: "text", default: "", description: "SHA-1 hash of the resource pack", group: "Advanced" },
  { key: "resource-pack-prompt", label: "Resource Pack Prompt", type: "text", default: "", description: "Custom message shown when prompting resource pack", group: "Advanced" },
  { key: "require-resource-pack", label: "Require Resource Pack", type: "boolean", default: false, description: "Kick players who decline the resource pack", group: "Advanced" },
  { key: "enable-jmx-monitoring", label: "Enable JMX Monitoring", type: "boolean", default: false, description: "Enable JMX monitoring beans", group: "Advanced" },
  { key: "sync-chunk-writes", label: "Sync Chunk Writes", type: "boolean", default: true, description: "Synchronous chunk writes for data integrity", group: "Advanced" },
  { key: "text-filtering-config", label: "Text Filtering Config", type: "text", default: "", description: "Text filtering configuration", group: "Advanced" },
  { key: "log-ips", label: "Log IPs", type: "boolean", default: true, description: "Log player IP addresses", group: "Advanced" },
  { key: "hide-online-players", label: "Hide Online Players", type: "boolean", default: false, description: "Hide player list from status response", group: "Advanced" },
];

const GROUPS = ["General", "Gameplay", "World", "Performance", "Security", "Advanced"];

function getDefaultValues(): Record<string, string | number | boolean> {
  const values: Record<string, string | number | boolean> = {};
  PROPERTIES.forEach((p) => { values[p.key] = p.default; });
  return values;
}

function PropertyRow({ prop, value, isChanged, onUpdate }: {
  prop: PropertyDef;
  value: string | number | boolean;
  isChanged: boolean;
  onUpdate: (key: string, value: string | number | boolean) => void;
}) {
  return (
    <div className={`flex items-center gap-4 px-4 py-3 border-b border-border/50 last:border-b-0 transition-colors hover:bg-muted/30 ${isChanged ? "bg-primary/5" : ""}`}>
      {/* Label + description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-foreground truncate">{prop.label}</span>
          {isChanged && (
            <span className="text-[9px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm">changed</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <code className="text-[11px] text-muted-foreground/70 font-mono">{prop.key}</code>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground/50 shrink-0 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">{prop.description}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Control */}
      <div className="shrink-0 w-48">
        {prop.type === "boolean" && (
          <div className="flex justify-end">
            <Switch checked={value as boolean} onCheckedChange={(c) => onUpdate(prop.key, c)} />
          </div>
        )}
        {prop.type === "select" && (
          <Select value={String(value)} onValueChange={(v) => onUpdate(prop.key, v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {prop.options?.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {prop.type === "number" && (
          <Input
            type="number"
            className="h-8 text-xs font-mono"
            value={value as number}
            min={prop.min}
            max={prop.max}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (prop.min !== undefined && n < prop.min) return;
              if (prop.max !== undefined && n > prop.max) return;
              onUpdate(prop.key, n);
            }}
          />
        )}
        {prop.type === "text" && (
          <Input
            type="text"
            className="h-8 text-xs"
            value={value as string}
            placeholder={prop.label}
            onChange={(e) => onUpdate(prop.key, e.target.value)}
          />
        )}
      </div>
    </div>
  );
}

export function ServerPropertiesPage() {
  const [values, setValues] = useState<Record<string, string | number | boolean>>(getDefaultValues);
  const [savedValues, setSavedValues] = useState<Record<string, string | number | boolean>>(getDefaultValues);
  const [search, setSearch] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    () => Object.fromEntries(GROUPS.map((g) => [g, true]))
  );

  const hasChanges = useMemo(() => PROPERTIES.some((p) => values[p.key] !== savedValues[p.key]), [values, savedValues]);

  const changedKeys = useMemo(() => {
    const set = new Set<string>();
    PROPERTIES.forEach((p) => { if (values[p.key] !== savedValues[p.key]) set.add(p.key); });
    return set;
  }, [values, savedValues]);

  const filteredProperties = useMemo(() => {
    if (!search.trim()) return PROPERTIES;
    const q = search.toLowerCase();
    return PROPERTIES.filter((p) =>
      p.key.toLowerCase().includes(q) || p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [search]);

  const filteredGroups = useMemo(() => GROUPS.filter((g) => filteredProperties.some((p) => p.group === g)), [filteredProperties]);

  const updateValue = (key: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const handleSave = () => {
    setSavedValues({ ...values });
    toast.success("Server properties saved successfully!");
  };

  const handleReset = () => {
    setValues(getDefaultValues());
    setSavedValues(getDefaultValues());
    toast.info("Properties reset to defaults.");
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">server.properties</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges} className="h-8 text-xs gap-1.5">
            <Save className="h-3.5 w-3.5" />
            Save
            {hasChanges && <span className="ml-1 bg-primary-foreground/20 text-[10px] px-1.5 rounded-full">{changedKeys.size}</span>}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Filter properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm bg-muted/30 border-border/50"
        />
      </div>

      {/* Property sections */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {filteredGroups.map((group, gi) => {
          const groupProps = filteredProperties.filter((p) => p.group === group);
          const groupChanges = groupProps.filter((p) => changedKeys.has(p.key)).length;
          const isOpen = openGroups[group] !== false;

          return (
            <Collapsible key={group} open={isOpen} onOpenChange={() => toggleGroup(group)}>
              <CollapsibleTrigger asChild>
                <button
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-muted/40 transition-colors ${gi > 0 ? "border-t border-border" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group}</span>
                    <span className="text-[10px] text-muted-foreground/60">{groupProps.length}</span>
                    {groupChanges > 0 && (
                      <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm">
                        {groupChanges} modified
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {groupProps.map((prop) => (
                  <PropertyRow
                    key={prop.key}
                    prop={prop}
                    value={values[prop.key]}
                    isChanged={changedKeys.has(prop.key)}
                    onUpdate={updateValue}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-6 w-6 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No properties match "{search}"</p>
        </div>
      )}
    </div>
  );
}
