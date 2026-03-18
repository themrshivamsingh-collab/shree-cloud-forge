import { useNavigate } from "react-router-dom";
import { Cloud, Terminal, FolderOpen, Puzzle, Archive, Rocket, Users, Settings, Clock, UserPlus, Database, FileText, Activity, GitBranch, Home, User, LogOut, Globe, ChevronDown } from "lucide-react";
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

  return (
    <TooltipProvider delayDuration={200}>
      <aside className={`${collapsed ? "w-[68px]" : "w-[220px]"} min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border shrink-0 transition-all duration-200`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-sidebar-border">
          <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <Cloud className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-bold text-foreground text-sm tracking-tight">ShreeCloud</span>
            </div>
          )}
        </div>

        {/* Server selector */}
        {!collapsed && (
          <button className="mx-3 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/60 border border-border/50 text-sm hover:bg-accent transition-colors">
            <div className="h-2 w-2 rounded-full bg-success shrink-0" />
            <span className="text-foreground font-medium truncate text-xs">Survival SMP</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
          </button>
        )}

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-3 pt-4 pb-2 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <span className="text-[10px] font-semibold tracking-widest text-muted-foreground/70 uppercase px-3 mb-1.5 block">
                  {group.label}
                </span>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = activePage === item.label;
                  const btn = (
                    <button
                      key={item.label}
                      onClick={() => handleNav(item.label)}
                      className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
                        ${active
                          ? "bg-primary/15 text-primary font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                        }
                        ${collapsed ? "justify-center" : ""}
                      `}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                      )}
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.label}>
                        <TooltipTrigger asChild>{btn}</TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
                      </Tooltip>
                    );
                  }
                  return btn;
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Separator */}
        <div className="mx-4 border-t border-sidebar-border" />

        {/* Bottom nav */}
        <nav className="px-3 py-3 space-y-0.5">
          {bottomNav.map((item) => {
            const active = activePage === item.label;
            const btn = (
              <button
                key={item.label}
                onClick={() => handleNav(item.label)}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
                  ${active
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                )}
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return btn;
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
