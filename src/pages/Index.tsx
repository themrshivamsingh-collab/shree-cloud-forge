import { useState } from "react";
import { PanelSidebar } from "@/components/PanelSidebar";
import { ConsolePage } from "@/components/pages/ConsolePage";
import { PluginInstallerPage } from "@/components/pages/PluginInstallerPage";
import { AccountPage } from "@/components/pages/AccountPage";
import { PlayersPage } from "@/components/pages/PlayersPage";
import { VersionPage } from "@/components/pages/VersionPage";
import { PlaceholderPage } from "@/components/pages/PlaceholderPage";
import { FilesPage } from "@/components/pages/FilesPage";
import { SettingsPage } from "@/components/pages/SettingsPage";
import { StartupPage } from "@/components/pages/StartupPage";
import { ServerPropertiesPage } from "@/components/pages/ServerPropertiesPage";
import { WorldsPage } from "@/components/pages/WorldsPage";
import { Cpu, HardDrive, MemoryStick, Wifi } from "lucide-react";

const Index = () => {
  const [activePage, setActivePage] = useState("Console");

  const renderPage = () => {
    if (activePage === "Console") return <ConsolePage />;
    if (activePage === "Plugin Installer") return <PluginInstallerPage />;
    if (activePage === "Account") return <AccountPage />;
    if (activePage === "Players") return <PlayersPage />;
    if (activePage === "Version") return <VersionPage />;
    if (activePage === "Files") return <FilesPage />;
    if (activePage === "Settings") return <SettingsPage />;
    if (activePage === "Startup") return <StartupPage />;
    if (activePage === "Server Properties") return <ServerPropertiesPage />;
    if (activePage === "Worlds") return <WorldsPage />;
    return <PlaceholderPage title={activePage} />;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <PanelSidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderPage()}
        </main>

        {/* Arix-style bottom status bar */}
        <div className="status-bar flex items-center gap-6 px-6 py-2 text-xs">
          <div className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-success" />
            <span className="text-muted-foreground">CPU Usage</span>
            <span className="text-foreground font-medium">24%</span>
          </div>
          <div className="flex items-center gap-2">
            <MemoryStick className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Memory Usage</span>
            <span className="text-foreground font-medium">1.2 / 2 GB</span>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="h-3.5 w-3.5 text-warning" />
            <span className="text-muted-foreground">Disk Usage</span>
            <span className="text-foreground font-medium">3.1 / 10 GB</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Wifi className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">play.shreecloud.net:25565</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
