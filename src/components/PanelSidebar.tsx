import { useNavigate } from "react-router-dom";
import { Cloud, Terminal, FolderOpen, Puzzle, Archive, Rocket, Users, Settings, Clock, UserPlus, Database, FileText, Activity, GitBranch, Home, User, LogOut, Globe } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const mainNav = [
  { label: "Console", icon: Terminal },
  { label: "Files", icon: FolderOpen },
  { label: "Plugin Installer", icon: Puzzle },
  { label: "Backups", icon: Archive },
  { label: "Startup", icon: Rocket },
  { label: "Players", icon: Users },
  { label: "Settings", icon: Settings },
  { label: "Schedule", icon: Clock },
  { label: "Subuser", icon: UserPlus },
  { label: "Database", icon: Database },
  { label: "Server Properties", icon: FileText },
  { label: "Activity", icon: Activity },
  { label: "Worlds", icon: Globe },
  { label: "Version", icon: GitBranch },
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
      <aside className="w-[75px] min-h-screen bg-card flex flex-col items-center border-r border-border shrink-0">
        {/* Logo */}
        <div className="flex items-center justify-center py-4">
          <Cloud className="h-7 w-7 text-primary" />
        </div>

        {/* Main nav */}
        <nav className="flex-1 w-full px-2 space-y-1">
          {mainNav.map((item) => {
            const active = activePage === item.label;
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleNav(item.label)}
                    className={`relative w-full flex items-center justify-center p-2 rounded-md transition-all duration-150
                      ${active
                        ? "bg-sidebar-accent text-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                      }
                    `}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                    )}
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Separator */}
        <div className="mx-3 my-2 w-8 border-t border-border" />

        {/* Bottom nav */}
        <nav className="w-full px-2 pb-4 space-y-1">
          {bottomNav.map((item) => {
            const active = activePage === item.label;
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleNav(item.label)}
                    className={`relative w-full flex items-center justify-center p-2 rounded-md transition-all duration-150
                      ${active
                        ? "bg-sidebar-accent text-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                      }
                    `}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                    )}
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
}