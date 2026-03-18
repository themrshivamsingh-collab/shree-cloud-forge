import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Save, RotateCcw, Info, FileText } from "lucide-react";
import { toast } from "sonner";

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
  // General
  { key: "motd", label: "MOTD", type: "text", default: "A Minecraft Server", description: "Message displayed in the server list", group: "General" },
  { key: "server-port", label: "Server Port", type: "number", default: 25565, description: "Port the server listens on", group: "General", min: 1, max: 65535 },
  { key: "max-players", label: "Max Players", type: "number", default: 20, description: "Maximum number of players allowed", group: "General", min: 1, max: 1000 },
  { key: "enable-status", label: "Enable Status", type: "boolean", default: true, description: "Show server in the server list", group: "General" },
  { key: "server-ip", label: "Server IP", type: "text", default: "", description: "IP address to bind to (leave blank for all)", group: "General" },
  { key: "enable-query", label: "Enable Query", type: "boolean", default: false, description: "Enable GameSpy4 protocol query listener", group: "General" },
  { key: "query.port", label: "Query Port", type: "number", default: 25565, description: "Port for the query listener", group: "General", min: 1, max: 65535 },

  // Gameplay
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

  // World Settings
  { key: "level-name", label: "Level Name", type: "text", default: "world", description: "Name of the world folder", group: "World Settings" },
  { key: "level-seed", label: "Level Seed", type: "text", default: "", description: "Seed for world generation", group: "World Settings" },
  { key: "level-type", label: "Level Type", type: "select", default: "minecraft:normal", description: "World generation type", group: "World Settings", options: [
    { value: "minecraft:normal", label: "Normal" }, { value: "minecraft:flat", label: "Flat" }, { value: "minecraft:large_biomes", label: "Large Biomes" }, { value: "minecraft:amplified", label: "Amplified" }, { value: "minecraft:single_biome_surface", label: "Single Biome" }
  ]},
  { key: "generate-structures", label: "Generate Structures", type: "boolean", default: true, description: "Generate villages, temples, etc.", group: "World Settings" },
  { key: "max-world-size", label: "Max World Size", type: "number", default: 29999984, description: "Maximum world border radius in blocks", group: "World Settings", min: 1, max: 29999984 },
  { key: "spawn-monsters", label: "Spawn Monsters", type: "boolean", default: true, description: "Allow hostile mobs to spawn", group: "World Settings" },
  { key: "spawn-npcs", label: "Spawn NPCs", type: "boolean", default: true, description: "Allow villagers to spawn", group: "World Settings" },
  { key: "spawn-animals", label: "Spawn Animals", type: "boolean", default: true, description: "Allow animals to spawn", group: "World Settings" },
  { key: "generator-settings", label: "Generator Settings", type: "text", default: "{}", description: "JSON settings for flat world generation", group: "World Settings" },

  // Performance
  { key: "view-distance", label: "View Distance", type: "number", default: 10, description: "Render distance in chunks", group: "Performance", min: 2, max: 32 },
  { key: "simulation-distance", label: "Simulation Distance", type: "number", default: 10, description: "Distance in chunks for entity ticking", group: "Performance", min: 2, max: 32 },
  { key: "max-tick-time", label: "Max Tick Time", type: "number", default: 60000, description: "Max milliseconds per tick before watchdog kills server (-1 = disabled)", group: "Performance", min: -1, max: 999999 },
  { key: "network-compression-threshold", label: "Network Compression Threshold", type: "number", default: 256, description: "Packet size threshold for compression (-1 = disabled)", group: "Performance", min: -1, max: 99999 },
  { key: "rate-limit", label: "Rate Limit", type: "number", default: 0, description: "Max packets per second before disconnect (0 = disabled)", group: "Performance", min: 0, max: 99999 },
  { key: "entity-broadcast-range-percentage", label: "Entity Broadcast Range %", type: "number", default: 100, description: "Percentage of default entity tracking range", group: "Performance", min: 10, max: 1000 },

  // Security
  { key: "online-mode", label: "Online Mode", type: "boolean", default: true, description: "Verify player accounts with Mojang", group: "Security" },
  { key: "white-list", label: "Whitelist", type: "boolean", default: false, description: "Only allow listed players to join", group: "Security" },
  { key: "enforce-whitelist", label: "Enforce Whitelist", type: "boolean", default: false, description: "Kick non-whitelisted players when whitelist is reloaded", group: "Security" },
  { key: "enforce-secure-profile", label: "Enforce Secure Profile", type: "boolean", default: true, description: "Require players to have Mojang-signed public key", group: "Security" },
  { key: "prevent-proxy-connections", label: "Prevent Proxy Connections", type: "boolean", default: false, description: "Block connections from known proxies/VPNs", group: "Security" },
  { key: "op-permission-level", label: "OP Permission Level", type: "select", default: "4", description: "Default permission level for operators", group: "Security", options: [
    { value: "1", label: "Level 1 - Bypass spawn protection" },
    { value: "2", label: "Level 2 - Cheat commands" },
    { value: "3", label: "Level 3 - Player management" },
    { value: "4", label: "Level 4 - Full control" },
  ]},
  { key: "function-permission-level", label: "Function Permission Level", type: "number", default: 2, description: "Permission level for function commands", group: "Security", min: 1, max: 4 },

  // Advanced
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

const GROUPS = ["General", "Gameplay", "World Settings", "Performance", "Security", "Advanced"];

function getDefaultValues(): Record<string, string | number | boolean> {
  const values: Record<string, string | number | boolean> = {};
  PROPERTIES.forEach((p) => { values[p.key] = p.default; });
  return values;
}

export function ServerPropertiesPage() {
  const [values, setValues] = useState<Record<string, string | number | boolean>>(getDefaultValues);
  const [savedValues, setSavedValues] = useState<Record<string, string | number | boolean>>(getDefaultValues);
  const [search, setSearch] = useState("");

  const hasChanges = useMemo(() => {
    return PROPERTIES.some((p) => values[p.key] !== savedValues[p.key]);
  }, [values, savedValues]);

  const changedKeys = useMemo(() => {
    const set = new Set<string>();
    PROPERTIES.forEach((p) => { if (values[p.key] !== savedValues[p.key]) set.add(p.key); });
    return set;
  }, [values, savedValues]);

  const filteredProperties = useMemo(() => {
    if (!search.trim()) return PROPERTIES;
    const q = search.toLowerCase();
    return PROPERTIES.filter((p) =>
      p.key.toLowerCase().includes(q) ||
      p.label.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }, [search]);

  const filteredGroups = useMemo(() => {
    return GROUPS.filter((g) => filteredProperties.some((p) => p.group === g));
  }, [filteredProperties]);

  const updateValue = (key: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
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

  const renderInput = (prop: PropertyDef) => {
    const val = values[prop.key];
    const isChanged = changedKeys.has(prop.key);

    if (prop.type === "boolean") {
      return (
        <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${isChanged ? "bg-primary/5 ring-1 ring-primary/20" : ""}`}>
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-2">
              <Label htmlFor={prop.key} className="text-sm font-medium text-foreground cursor-pointer">{prop.label}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">{prop.description}</TooltipContent>
              </Tooltip>
              {isChanged && <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">Modified</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{prop.key}</p>
          </div>
          <Switch id={prop.key} checked={val as boolean} onCheckedChange={(c) => updateValue(prop.key, c)} />
        </div>
      );
    }

    if (prop.type === "select") {
      return (
        <div className={`p-3 rounded-lg space-y-2 transition-colors ${isChanged ? "bg-primary/5 ring-1 ring-primary/20" : ""}`}>
          <div className="flex items-center gap-2">
            <Label htmlFor={prop.key} className="text-sm font-medium text-foreground">{prop.label}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">{prop.description}</TooltipContent>
            </Tooltip>
            {isChanged && <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">Modified</span>}
          </div>
          <p className="text-xs text-muted-foreground">{prop.key}</p>
          <Select value={String(val)} onValueChange={(v) => updateValue(prop.key, v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {prop.options?.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (prop.type === "number") {
      return (
        <div className={`p-3 rounded-lg space-y-2 transition-colors ${isChanged ? "bg-primary/5 ring-1 ring-primary/20" : ""}`}>
          <div className="flex items-center gap-2">
            <Label htmlFor={prop.key} className="text-sm font-medium text-foreground">{prop.label}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">{prop.description}</TooltipContent>
            </Tooltip>
            {isChanged && <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">Modified</span>}
          </div>
          <p className="text-xs text-muted-foreground">{prop.key}</p>
          <Input
            id={prop.key}
            type="number"
            value={val as number}
            min={prop.min}
            max={prop.max}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (prop.min !== undefined && n < prop.min) return;
              if (prop.max !== undefined && n > prop.max) return;
              updateValue(prop.key, n);
            }}
          />
          {prop.min !== undefined && prop.max !== undefined && (
            <p className="text-[10px] text-muted-foreground">Range: {prop.min} – {prop.max}</p>
          )}
        </div>
      );
    }

    // text
    return (
      <div className={`p-3 rounded-lg space-y-2 transition-colors ${isChanged ? "bg-primary/5 ring-1 ring-primary/20" : ""}`}>
        <div className="flex items-center gap-2">
          <Label htmlFor={prop.key} className="text-sm font-medium text-foreground">{prop.label}</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">{prop.description}</TooltipContent>
          </Tooltip>
          {isChanged && <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">Modified</span>}
        </div>
        <p className="text-xs text-muted-foreground">{prop.key}</p>
        <Input
          id={prop.key}
          type="text"
          value={val as string}
          onChange={(e) => updateValue(prop.key, e.target.value)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Server Properties</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-9">Easily configure your server settings</p>
      </div>

      {/* Search + Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            Save Changes
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="text-xs text-primary bg-primary/10 border border-primary/20 rounded-md px-3 py-2">
          You have unsaved changes ({changedKeys.size} {changedKeys.size === 1 ? "property" : "properties"} modified)
        </div>
      )}

      {/* Property Groups */}
      {filteredGroups.map((group) => {
        const groupProps = filteredProperties.filter((p) => p.group === group);
        return (
          <Card key={group}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{group}</CardTitle>
              <CardDescription>{groupProps.length} {groupProps.length === 1 ? "property" : "properties"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {groupProps.map((prop) => (
                <div key={prop.key}>{renderInput(prop)}</div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {filteredProperties.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No properties match "{search}"</p>
        </div>
      )}
    </div>
  );
}
