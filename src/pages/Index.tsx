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
import { ActivityPage } from "@/components/pages/ActivityPage";

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
        <main className="flex-1 p-6 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Index;
