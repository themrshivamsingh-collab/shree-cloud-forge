import { useState, useMemo } from "react";
import {
  Search,
  Shield,
  ShieldCheck,
  ShieldBan,
  Crown,
  Heart,
  Drumstick,
  MapPin,
  Clock,
  Calendar,
  Skull,
  LogIn,
  Timer,
  Globe,
  Copy,
  Check,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ── Minecraft Item Texture Helper ──────────────────────────
// Uses mc-heads.net for skins and a static Minecraft texture source

const MC_ITEM_TEXTURES: Record<string, string> = {
  "Diamond Sword": "https://mc.nerothe.com/img/1.20.1/diamond_sword.png",
  "Diamond Pickaxe": "https://mc.nerothe.com/img/1.20.1/diamond_pickaxe.png",
  "Golden Apple": "https://mc.nerothe.com/img/1.20.1/golden_apple.png",
  "Ender Pearl": "https://mc.nerothe.com/img/1.20.1/ender_pearl.png",
  "Torch": "https://mc.nerothe.com/img/1.20.1/torch.png",
  "Totem of Undying": "https://mc.nerothe.com/img/1.20.1/totem_of_undying.png",
  "Oak Log": "https://mc.nerothe.com/img/1.20.1/oak_log.png",
  "Cobblestone": "https://mc.nerothe.com/img/1.20.1/cobblestone.png",
  "Iron Ingot": "https://mc.nerothe.com/img/1.20.1/iron_ingot.png",
  "Bread": "https://mc.nerothe.com/img/1.20.1/bread.png",
  "Arrow": "https://mc.nerothe.com/img/1.20.1/arrow.png",
  "Bow": "https://mc.nerothe.com/img/1.20.1/bow.png",
  "Diamond": "https://mc.nerothe.com/img/1.20.1/diamond.png",
  "Redstone": "https://mc.nerothe.com/img/1.20.1/redstone.png",
  "Lapis Lazuli": "https://mc.nerothe.com/img/1.20.1/lapis_lazuli.png",
  "Obsidian": "https://mc.nerothe.com/img/1.20.1/obsidian.png",
  "Diamond Helmet": "https://mc.nerothe.com/img/1.20.1/diamond_helmet.png",
  "Iron Chestplate": "https://mc.nerothe.com/img/1.20.1/iron_chestplate.png",
  "Diamond Leggings": "https://mc.nerothe.com/img/1.20.1/diamond_leggings.png",
  "Iron Boots": "https://mc.nerothe.com/img/1.20.1/iron_boots.png",
  "Shield": "https://mc.nerothe.com/img/1.20.1/shield.png",
  "Netherite Sword": "https://mc.nerothe.com/img/1.20.1/netherite_sword.png",
  "Wooden Sword": "https://mc.nerothe.com/img/1.20.1/wooden_sword.png",
  "Repeater": "https://mc.nerothe.com/img/1.20.1/repeater.png",
};

const ARMOR_SLOT_TEXTURES = [
  "https://mc.nerothe.com/img/1.20.1/diamond_helmet.png",
  "https://mc.nerothe.com/img/1.20.1/iron_chestplate.png",
  "https://mc.nerothe.com/img/1.20.1/diamond_leggings.png",
  "https://mc.nerothe.com/img/1.20.1/iron_boots.png",
];

// ── Mock Data ──────────────────────────────────────────────

interface Player {
  username: string;
  uuid: string;
  online: boolean;
  op: boolean;
  whitelisted: boolean;
  banned: boolean;
  firstJoin: string;
  lastSeen: string;
  playtime: string;
  deaths: number;
  joins: number;
  health: number;
  hunger: number;
  world: string;
  lastDeathLocation: string;
  inventory: (InventoryItem | null)[];
  hotbar: (InventoryItem | null)[];
  armor: (InventoryItem | null)[];
  offhand: InventoryItem | null;
}

interface InventoryItem {
  name: string;
  count: number;
}

const PLAYER_COMMANDS: Record<string, { cmd: string; desc: string }[]> = {
  default: [
    { cmd: "/kick {player}", desc: "Kick player from server" },
    { cmd: "/ban {player}", desc: "Ban player permanently" },
    { cmd: "/ban-ip {player}", desc: "Ban player's IP address" },
    { cmd: "/pardon {player}", desc: "Unban a player" },
    { cmd: "/op {player}", desc: "Give operator permissions" },
    { cmd: "/deop {player}", desc: "Remove operator permissions" },
    { cmd: "/whitelist add {player}", desc: "Add to whitelist" },
    { cmd: "/whitelist remove {player}", desc: "Remove from whitelist" },
    { cmd: "/gamemode survival {player}", desc: "Set survival mode" },
    { cmd: "/gamemode creative {player}", desc: "Set creative mode" },
    { cmd: "/gamemode spectator {player}", desc: "Set spectator mode" },
    { cmd: "/tp {player} ~ ~ ~", desc: "Teleport player" },
    { cmd: "/give {player} diamond 64", desc: "Give items to player" },
    { cmd: "/effect give {player} speed 60 2", desc: "Apply speed effect" },
    { cmd: "/effect clear {player}", desc: "Clear all effects" },
    { cmd: "/kill {player}", desc: "Kill the player" },
    { cmd: "/msg {player} Hello!", desc: "Send private message" },
    { cmd: "/xp set {player} 100 levels", desc: "Set XP levels" },
    { cmd: "/clear {player}", desc: "Clear player inventory" },
    { cmd: "/spawnpoint {player}", desc: "Set spawn point" },
  ],
};

const MOCK_PLAYERS: Player[] = [
  {
    username: "ShreePlayer",
    uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    online: true, op: true, whitelisted: true, banned: false,
    firstJoin: "2024-01-15", lastSeen: "Online now",
    playtime: "142h 30m", deaths: 23, joins: 312,
    health: 18, hunger: 20, world: "Overworld",
    lastDeathLocation: "-234, 64, 891 (Overworld)",
    hotbar: [
      { name: "Diamond Sword", count: 1 },
      { name: "Diamond Pickaxe", count: 1 },
      { name: "Golden Apple", count: 8 },
      { name: "Ender Pearl", count: 16 },
      { name: "Torch", count: 48 },
      null, null, null,
      { name: "Totem of Undying", count: 1 },
    ],
    inventory: [
      { name: "Oak Log", count: 64 },
      { name: "Cobblestone", count: 64 },
      { name: "Iron Ingot", count: 32 },
      { name: "Bread", count: 24 },
      { name: "Arrow", count: 64 },
      { name: "Bow", count: 1 },
      null, null, null,
      { name: "Diamond", count: 12 },
      { name: "Redstone", count: 48 },
      { name: "Lapis Lazuli", count: 32 },
      null, null, null, null, null, null,
      { name: "Obsidian", count: 10 },
      null, null, null, null, null, null, null, null,
    ],
    armor: [
      { name: "Diamond Helmet", count: 1 },
      { name: "Iron Chestplate", count: 1 },
      { name: "Diamond Leggings", count: 1 },
      { name: "Iron Boots", count: 1 },
    ],
    offhand: { name: "Shield", count: 1 },
  },
  {
    username: "CraftMaster99",
    uuid: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    online: true, op: false, whitelisted: true, banned: false,
    firstJoin: "2024-02-20", lastSeen: "Online now",
    playtime: "89h 12m", deaths: 45, joins: 178,
    health: 14, hunger: 16, world: "Nether",
    lastDeathLocation: "102, 34, -56 (Nether)",
    hotbar: [
      { name: "Netherite Sword", count: 1 },
      { name: "Bow", count: 1 },
      { name: "Golden Apple", count: 3 },
      null, null, null, null, null, null,
    ],
    inventory: [
      { name: "Arrow", count: 64 },
      { name: "Cobblestone", count: 64 },
      null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null,
    ],
    armor: [
      { name: "Diamond Helmet", count: 1 },
      { name: "Iron Chestplate", count: 1 },
      null,
      { name: "Iron Boots", count: 1 },
    ],
    offhand: null,
  },
  {
    username: "BlockBuilder",
    uuid: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    online: false, op: false, whitelisted: true, banned: false,
    firstJoin: "2024-03-05", lastSeen: "2 hours ago",
    playtime: "56h 45m", deaths: 12, joins: 95,
    health: 20, hunger: 20, world: "Overworld",
    lastDeathLocation: "500, 72, -200 (Overworld)",
    hotbar: [
      { name: "Diamond Pickaxe", count: 1 },
      { name: "Oak Log", count: 64 },
      { name: "Torch", count: 64 },
      null, null, null, null, null, null,
    ],
    inventory: [
      { name: "Cobblestone", count: 64 },
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null,
    ],
    armor: [null, { name: "Iron Chestplate", count: 1 }, null, null],
    offhand: null,
  },
  {
    username: "PvPKing",
    uuid: "d4e5f6a7-b8c9-0123-defa-234567890123",
    online: false, op: false, whitelisted: false, banned: true,
    firstJoin: "2024-01-28", lastSeen: "3 days ago",
    playtime: "201h 10m", deaths: 67, joins: 420,
    health: 0, hunger: 0, world: "End",
    lastDeathLocation: "0, 64, 0 (End)",
    hotbar: Array(9).fill(null),
    inventory: Array(27).fill(null),
    armor: [null, null, null, null],
    offhand: null,
  },
  {
    username: "RedstonePro",
    uuid: "e5f6a7b8-c9d0-1234-efab-345678901234",
    online: true, op: true, whitelisted: true, banned: false,
    firstJoin: "2024-01-10", lastSeen: "Online now",
    playtime: "310h 5m", deaths: 8, joins: 502,
    health: 20, hunger: 18, world: "Overworld",
    lastDeathLocation: "-1024, 11, 512 (Overworld)",
    hotbar: [
      { name: "Diamond Pickaxe", count: 1 },
      { name: "Redstone", count: 64 },
      { name: "Repeater", count: 32 },
      null, null, null, null, null, null,
    ],
    inventory: [
      { name: "Iron Ingot", count: 64 },
      { name: "Torch", count: 64 },
      { name: "Ender Pearl", count: 4 },
      { name: "Bread", count: 16 },
      null, null, null, null, null,
      null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null,
    ],
    armor: [
      { name: "Diamond Helmet", count: 1 },
      { name: "Iron Chestplate", count: 1 },
      { name: "Diamond Leggings", count: 1 },
      { name: "Iron Boots", count: 1 },
    ],
    offhand: { name: "Totem of Undying", count: 1 },
  },
  {
    username: "NoobSteve",
    uuid: "f6a7b8c9-d0e1-2345-fabc-456789012345",
    online: false, op: false, whitelisted: true, banned: false,
    firstJoin: "2024-06-01", lastSeen: "1 day ago",
    playtime: "4h 20m", deaths: 31, joins: 12,
    health: 6, hunger: 4, world: "Overworld",
    lastDeathLocation: "10, 63, -15 (Overworld)",
    hotbar: [
      { name: "Wooden Sword", count: 1 },
      { name: "Cobblestone", count: 12 },
      { name: "Bread", count: 2 },
      null, null, null, null, null, null,
    ],
    inventory: Array(27).fill(null),
    armor: [null, null, null, null],
    offhand: null,
  },
];

// ── Filter type ────────────────────────────────────────────

type FilterMode = "all" | "online" | "op" | "whitelisted";

const ARMOR_LABELS = ["Helmet", "Chest", "Legs", "Boots"];

// ── Inventory Slot (Minecraft style) ───────────────────────

function InventorySlot({ item, emptyIcon }: { item: InventoryItem | null; emptyIcon?: string }) {
  const texture = item ? MC_ITEM_TEXTURES[item.name] : undefined;

  const slot = (
    <div
      className={`
        relative flex items-center justify-center
        w-[44px] h-[44px] select-none
        border-2 transition-all duration-75
        ${item
          ? "border-[#373737] bg-[#8b8b8b]/20 hover:border-[#5a5a8a] hover:bg-[#8b8b8b]/30"
          : "border-[#373737]/60 bg-[#8b8b8b]/10"
        }
      `}
      style={{ imageRendering: "pixelated" }}
    >
      {item && texture && (
        <img
          src={texture}
          alt={item.name}
          className="w-8 h-8 object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]"
          style={{ imageRendering: "pixelated" }}
          loading="lazy"
        />
      )}
      {item && !texture && (
        <span className="text-xs text-muted-foreground font-mono truncate px-0.5">{item.name.slice(0, 3)}</span>
      )}
      {item && item.count > 1 && (
        <span className="absolute bottom-[1px] right-[3px] text-[11px] font-bold text-white leading-none font-mono"
          style={{ textShadow: "1px 1px 0 #3f3f3f, -1px -1px 0 #3f3f3f, 1px -1px 0 #3f3f3f, -1px 1px 0 #3f3f3f" }}>
          {item.count}
        </span>
      )}
      {!item && emptyIcon && (
        <img src={emptyIcon} alt="" className="w-6 h-6 object-contain opacity-20" style={{ imageRendering: "pixelated" }} loading="lazy" />
      )}
    </div>
  );

  if (!item) return slot;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>{slot}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-[#100010] border-[#2d0a4e] text-foreground px-3 py-2 rounded shadow-xl"
        >
          <p className="text-sm font-semibold text-[#a855f7]">{item.name}</p>
          {item.count > 1 && (
            <p className="text-xs text-muted-foreground mt-0.5">×{item.count}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ── Minecraft Inventory Layout ─────────────────────────────

function MinecraftInventory({ player }: { player: Player }) {
  const mainSlots = [...(player.inventory || [])];
  while (mainSlots.length < 27) mainSlots.push(null);
  const hotbarSlots = [...(player.hotbar || [])];
  while (hotbarSlots.length < 9) hotbarSlots.push(null);
  const armorSlots = [...(player.armor || [])];
  while (armorSlots.length < 4) armorSlots.push(null);

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Inventory
      </h3>

      <div className="bg-[#c6c6c6]/10 border-2 border-[#555555] rounded-lg p-4 space-y-4"
        style={{ backgroundImage: "linear-gradient(135deg, rgba(139,139,139,0.05) 0%, rgba(60,60,60,0.1) 100%)" }}>

        {/* Top section: Armor + Skin */}
        <div className="flex gap-4">
          {/* Armor column */}
          <div className="flex flex-col gap-[2px]">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1 text-center font-mono">Armor</span>
            {armorSlots.map((item, i) => (
              <InventorySlot key={`armor-${i}`} item={item} emptyIcon={ARMOR_SLOT_TEXTURES[i]} />
            ))}
          </div>

          {/* Offhand */}
          <div className="flex flex-col gap-[2px]">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1 text-center font-mono">Off</span>
            <InventorySlot item={player.offhand} emptyIcon="https://mc.nerothe.com/img/1.20.1/shield.png" />
          </div>

          {/* Player skin preview */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <img
                src={`https://mc-heads.net/body/${player.username}/90`}
                alt={player.username}
                className="h-[100px] object-contain"
                style={{ imageRendering: "pixelated" }}
              />
              <span className="text-[10px] text-muted-foreground font-mono">{player.username}</span>
            </div>
          </div>
        </div>

        {/* Separator — Minecraft style */}
        <div className="h-[2px] bg-[#555555]/60" />

        {/* Main inventory: 3 rows × 9 cols */}
        <div className="space-y-1">
          <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono">Inventory</span>
          <div className="grid grid-cols-9 gap-[2px]">
            {mainSlots.slice(0, 27).map((item, i) => (
              <InventorySlot key={`main-${i}`} item={item} />
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="h-[2px] bg-[#555555]/60" />

        {/* Hotbar */}
        <div className="space-y-1">
          <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono">Hotbar</span>
          <div className="grid grid-cols-9 gap-[2px]">
            {hotbarSlots.map((item, i) => (
              <InventorySlot key={`hotbar-${i}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Player Commands Section ────────────────────────────────

function PlayerCommands({ username }: { username: string }) {
  const [cmdSearch, setCmdSearch] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const commands = PLAYER_COMMANDS.default.map((c) => ({
    cmd: c.cmd.replace("{player}", username),
    desc: c.desc,
  }));

  const filtered = cmdSearch.trim()
    ? commands.filter(
        (c) =>
          c.cmd.toLowerCase().includes(cmdSearch.toLowerCase()) ||
          c.desc.toLowerCase().includes(cmdSearch.toLowerCase())
      )
    : commands;

  const copyCmd = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Player Commands
      </h3>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={cmdSearch}
          onChange={(e) => setCmdSearch(e.target.value)}
          placeholder="Search commands..."
          className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <div className="max-h-[200px] overflow-y-auto space-y-1 terminal-scroll">
        {filtered.map((c, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 group hover:border-primary/40 transition-colors"
          >
            <code className="flex-1 text-xs font-mono text-primary truncate">{c.cmd}</code>
            <span className="text-[10px] text-muted-foreground hidden sm:block shrink-0 max-w-[120px] truncate">{c.desc}</span>
            <button
              onClick={() => copyCmd(c.cmd, i)}
              className="shrink-0 p-1 rounded hover:bg-accent transition-colors"
              title="Copy command"
            >
              {copiedIdx === i ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
              )}
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No commands found.</p>
        )}
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────

export function PlayersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [players, setPlayers] = useState(MOCK_PLAYERS);

  const filtered = useMemo(() => {
    let list = players;
    if (filter === "online") list = list.filter((p) => p.online);
    if (filter === "op") list = list.filter((p) => p.op);
    if (filter === "whitelisted") list = list.filter((p) => p.whitelisted);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.username.toLowerCase().includes(q));
    }
    return list;
  }, [players, filter, search]);

  const togglePlayerProp = (uuid: string, prop: "op" | "whitelisted" | "banned") => {
    setPlayers((prev) =>
      prev.map((p) => (p.uuid === uuid ? { ...p, [prop]: !p[prop] } : p))
    );
    setSelectedPlayer((prev) =>
      prev && prev.uuid === uuid ? { ...prev, [prop]: !prev[prop] } : prev
    );
  };

  const filterBtn = (mode: FilterMode, label: string) => (
    <button
      onClick={() => setFilter(mode)}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        filter === mode
          ? "bg-primary text-primary-foreground"
          : "bg-card border border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  const StatBar = ({ value, max, icon: Icon, color }: { value: number; max: number; icon: typeof Heart; color: string }) => (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${color}`} />
      <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
        <div className={`h-full rounded-full ${color.replace("text-", "bg-")} transition-all`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="text-xs text-muted-foreground font-mono w-10 text-right">{value}/{max}</span>
    </div>
  );

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Players</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {players.filter((p) => p.online).length} online · {players.length} total
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search players..."
            className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filterBtn("all", "All")}
          {filterBtn("online", "Online")}
          {filterBtn("op", "OP")}
          {filterBtn("whitelisted", "Whitelisted")}
        </div>
      </div>

      {/* Player Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((player) => (
          <button
            key={player.uuid}
            onClick={() => setSelectedPlayer(player)}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-3.5 text-left hover:border-primary/50 hover:scale-[1.01] transition-all duration-150 group"
          >
            <div className="relative shrink-0">
              <img
                src={`https://mc-heads.net/avatar/${player.username}/40`}
                alt={player.username}
                className="w-10 h-10 rounded-lg"
                style={{ imageRendering: "pixelated" }}
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${
                  player.online ? "bg-[hsl(var(--success))]" : "bg-muted-foreground/40"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {player.username}
              </p>
              <p className="text-xs text-muted-foreground">
                {player.online ? "Online" : player.lastSeen}
              </p>
            </div>
            <div className="flex gap-1 flex-wrap justify-end">
              {player.op && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-warning/15 text-warning">OP</span>
              )}
              {player.whitelisted && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]">WL</span>
              )}
              {player.banned && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-destructive/15 text-destructive">BAN</span>
              )}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
            No players found.
          </div>
        )}
      </div>

      {/* Player Detail Modal */}
      <Dialog open={!!selectedPlayer} onOpenChange={(open) => !open && setSelectedPlayer(null)}>
        <DialogContent className="max-w-[540px] max-h-[90vh] overflow-y-auto bg-card border-border p-0 gap-0">
          {selectedPlayer && (
            <>
              {/* Header */}
              <div className="flex items-center gap-4 p-5 border-b border-border">
                <img
                  src={`https://mc-heads.net/avatar/${selectedPlayer.username}/48`}
                  alt={selectedPlayer.username}
                  className="w-12 h-12 rounded-lg"
                  style={{ imageRendering: "pixelated" }}
                />
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-lg font-bold text-foreground truncate">
                    {selectedPlayer.username}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground font-mono truncate">{selectedPlayer.uuid}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    selectedPlayer.online
                      ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {selectedPlayer.online ? "Online" : "Offline"}
                </span>
              </div>

              <div className="p-5 space-y-5">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" /> First join
                  </div>
                  <p className="text-foreground font-medium text-right">{selectedPlayer.firstJoin}</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> Last seen
                  </div>
                  <p className="text-foreground font-medium text-right">{selectedPlayer.lastSeen}</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" /> World
                  </div>
                  <p className="text-foreground font-medium text-right">{selectedPlayer.world}</p>
                </div>

                {/* Controls */}
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Controls</h3>
                  <div className="flex gap-2 flex-wrap">
                    <ToggleButton
                      active={selectedPlayer.whitelisted}
                      label="Whitelist"
                      icon={ShieldCheck}
                      activeColor="bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-[hsl(var(--success))]/30"
                      onClick={() => togglePlayerProp(selectedPlayer.uuid, "whitelisted")}
                    />
                    <ToggleButton
                      active={selectedPlayer.op}
                      label="OP"
                      icon={Crown}
                      activeColor="bg-warning/15 text-warning border-warning/30"
                      onClick={() => togglePlayerProp(selectedPlayer.uuid, "op")}
                    />
                    <ToggleButton
                      active={selectedPlayer.banned}
                      label="Ban"
                      icon={ShieldBan}
                      activeColor="bg-destructive/15 text-destructive border-destructive/30"
                      onClick={() => togglePlayerProp(selectedPlayer.uuid, "banned")}
                    />
                  </div>
                </div>

                {/* Health / Hunger */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vitals</h3>
                  <StatBar value={selectedPlayer.health} max={20} icon={Heart} color="text-destructive" />
                  <StatBar value={selectedPlayer.hunger} max={20} icon={Drumstick} color="text-warning" />
                </div>

                {/* Death location */}
                <div className="space-y-1">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Death</h3>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-destructive shrink-0" />
                    <span className="font-mono text-xs">{selectedPlayer.lastDeathLocation}</span>
                  </div>
                </div>

                {/* Activity */}
                <div className="grid grid-cols-3 gap-2">
                  <MiniStat icon={Timer} label="Playtime" value={selectedPlayer.playtime} />
                  <MiniStat icon={Skull} label="Deaths" value={String(selectedPlayer.deaths)} />
                  <MiniStat icon={LogIn} label="Joins" value={String(selectedPlayer.joins)} />
                </div>

                {/* Minecraft Inventory */}
                <MinecraftInventory player={selectedPlayer} />

                {/* Player Commands */}
                <PlayerCommands username={selectedPlayer.username} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Subcomponents ──────────────────────────────────────────

function ToggleButton({
  active,
  label,
  icon: Icon,
  activeColor,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: typeof Shield;
  activeColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
        active
          ? activeColor
          : "border-border text-muted-foreground hover:text-foreground bg-background"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      <span className="ml-1 text-[10px] opacity-60">{active ? "ON" : "OFF"}</span>
    </button>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Timer; label: string; value: string }) {
  return (
    <div className="bg-background border border-border rounded-lg p-2.5 text-center">
      <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
      <p className="text-xs font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
