import { useNavigate } from "react-router-dom";
import { Cloud, Terminal, FolderOpen, Puzzle, Archive, Rocket, Users, Settings, Clock, UserPlus, Database, FileText, Activity, GitBranch, Home, User, LogOut, Globe, ChevronDown, LayoutTemplate } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

const navGroups = [
  {
    label: "GENERAL",
    items: [
      { label: "Console", icon: Terminal },
      { label: "Settings", icon: Settings },
      { label: "Activity", icon: Activity },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { label: "Files", icon: FolderOpen },
      { label: "Players", icon: Users },
      { label: "Worlds", icon: Globe },
      { label: "Database", icon: Database },
      { label: "Backups", icon: Archive },
    ],
  },
  {
    label: "CONFIGURATION",
    items: [
      { label: "Startup", icon: Rocket },
      { label: "Server Properties", icon: FileText },
      { label: "Version", icon: GitBranch },
      { label: "Schedule", icon: Clock },
    ],
  },
  {
    label: "ADDONS",
    items: [
      { label: "Plugin Installer", icon: Puzzle },
      { label: "Subuser", icon: UserPlus },
    ],
  },
];

const bottomNav = [
  { label: "Home", icon: Home },
  { label: "Account", icon: User },
  { label: "Logout", icon: LogOut },
];

interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
}

export function PanelSidebar({ activePage, onNavigate }: Props) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleNav = (label: string) => {
    if (label === "Home") {
      navigate("/servers");
      return;
    }
    if (label === "Logout") {
      localStorage.removeItem("shreecloud-user");
      navigate("/login");
      window.location.reload();
      return;
    }
    onNavigate(label);
  };

  const renderNavButton = (item: { label: string; icon: React.ElementType }, isBottom = false) => {
    const active = activePage === item.label;
    const btn = (
      <button
        key={item.label}
        onClick={() => handleNav(item.label)}
        className={`group relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 ease-out
          ${active
            ? "bg-primary/12 text-primary font-medium sidebar-active-glow"
            : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-foreground"
          }
          ${collapsed ? "justify-center" : ""}
        `}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
        )}
        <item.icon className={`h-4 w-4 shrink-0 transition-transform duration-200 ${!active ? "group-hover:scale-110" : ""}`} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.label}>
          <TooltipTrigger asChild>{btn}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs font-medium">{item.label}</TooltipContent>
        </Tooltip>
      );
    }
    return btn;
  };

  return (
    <TooltipProvider delayDuration={150}>
      <aside className={`${collapsed ? "w-[68px]" : "w-[230px]"} min-h-screen bg-sidebar/80 backdrop-blur-xl flex flex-col border-r border-sidebar-border/60 shrink-0 transition-all duration-300 ease-out`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border/50">
          <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 shadow-[0_0_12px_hsl(var(--primary)/0.2)]">
            <Cloud className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-bold text-foreground text-sm tracking-tight">ShreeCloud</span>
              <span className="block text-[10px] text-muted-foreground -mt-0.5">Game Panel</span>
            </div>
          )}
        </div>

        {/* Server selector */}
        {!collapsed && (
          <button className="mx-3 mt-3 flex items-center gap-2.5 px-3 py-2.5 rounded-xl glass-card text-sm hover:border-primary/30 transition-all duration-200">
            <div className="h-2 w-2 rounded-full bg-success shrink-0 shadow-[0_0_6px_hsl(var(--success)/0.5)]" />
            <span className="text-foreground font-medium truncate text-xs">Survival SMP</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
          </button>
        )}

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-3 pt-5 pb-2 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <span className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground/60 uppercase px-3 mb-2 block">
                  {group.label}
                </span>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => renderNavButton(item))}
              </div>
            </div>
          ))}
        </nav>

        {/* Separator */}
        <div className="mx-4 border-t border-sidebar-border/40" />

        {/* Bottom nav */}
        <nav className="px-3 py-3 space-y-0.5">
          {bottomNav.map((item) => renderNavButton(item, true))}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
