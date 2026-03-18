import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, Server, Palette, Gamepad2, HardDrive, Shield, Upload } from "lucide-react";

export function SettingsPage() {
  const { toast } = useToast();

  // Server Customization
  const [serverName, setServerName] = useState("My Minecraft Server");
  const [description, setDescription] = useState("");
  const [motd, setMotd] = useState("A Minecraft Server");
  const [maxPlayers, setMaxPlayers] = useState("20");
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  // Appearance
  const [themeColor, setThemeColor] = useState("#3b82f6");
  const [showPublicly, setShowPublicly] = useState(false);
  const [showStatus, setShowStatus] = useState(true);

  // Gameplay
  const [difficulty, setDifficulty] = useState("normal");
  const [gamemode, setGamemode] = useState("survival");
  const [pvpEnabled, setPvpEnabled] = useState(true);
  const [whitelistEnabled, setWhitelistEnabled] = useState(false);

  // Backup
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const [maxBackups, setMaxBackups] = useState("5");

  // Security
  const [onlineMode, setOnlineMode] = useState(true);
  const [antiVpn, setAntiVpn] = useState(false);
  const [ipForwarding, setIpForwarding] = useState(false);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setIconPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your server settings have been updated successfully.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Customize your server appearance and behavior</p>
      </div>

      {/* Server Customization */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Server Customization</CardTitle>
          </div>
          <CardDescription>Configure your server's identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="server-name">Server Name</Label>
            <Input id="server-name" value={serverName} onChange={(e) => setServerName(e.target.value)} placeholder="My Minecraft Server" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your server..." rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motd">MOTD (Message of the Day)</Label>
            <Input id="motd" value={motd} onChange={(e) => setMotd(e.target.value)} placeholder="A Minecraft Server" />
          </div>
          <div className="space-y-2">
            <Label>Server Icon</Label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden">
                {iconPreview ? (
                  <img src={iconPreview} alt="Server icon" className="h-full w-full object-cover" />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <label htmlFor="icon-upload">
                  <Button variant="outline" size="sm" asChild>
                    <span className="cursor-pointer">Upload Icon</span>
                  </Button>
                </label>
                <input id="icon-upload" type="file" accept="image/*" className="hidden" onChange={handleIconUpload} />
                <p className="text-xs text-muted-foreground mt-1">64×64 PNG recommended</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-players">Max Players</Label>
            <Input id="max-players" type="number" value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)} min="1" max="1000" className="w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Appearance</CardTitle>
          </div>
          <CardDescription>Visual settings for your server listing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="theme-color">Theme Color</Label>
            <div className="flex items-center gap-3">
              <input type="color" id="theme-color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="h-10 w-14 rounded border border-border bg-transparent cursor-pointer" />
              <Input value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="w-32 font-mono text-sm" />
            </div>
          </div>
          <ToggleRow label="Show Server Publicly" description="Make your server visible in public listings" checked={showPublicly} onChange={setShowPublicly} />
          <ToggleRow label="Enable Server Status Display" description="Show online/offline status badge" checked={showStatus} onChange={setShowStatus} />
        </CardContent>
      </Card>

      {/* Gameplay Settings */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Gameplay Settings</CardTitle>
          </div>
          <CardDescription>Control how players experience your server</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="peaceful">Peaceful</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Gamemode</Label>
              <Select value={gamemode} onValueChange={setGamemode}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="survival">Survival</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="adventure">Adventure</SelectItem>
                  <SelectItem value="spectator">Spectator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ToggleRow label="PvP Enabled" description="Allow players to fight each other" checked={pvpEnabled} onChange={setPvpEnabled} />
          <ToggleRow label="Whitelist Enabled" description="Only whitelisted players can join" checked={whitelistEnabled} onChange={setWhitelistEnabled} />
        </CardContent>
      </Card>

      {/* Backup Settings */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Backup Settings</CardTitle>
          </div>
          <CardDescription>Manage automatic backups for your server</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <ToggleRow label="Auto Backup" description="Automatically create server backups" checked={autoBackup} onChange={setAutoBackup} />
          {autoBackup && (
            <>
              <div className="space-y-2">
                <Label>Backup Frequency</Label>
                <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="6hours">Every 6 Hours</SelectItem>
                    <SelectItem value="12hours">Every 12 Hours</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-backups">Max Backup Limit</Label>
                <Input id="max-backups" type="number" value={maxBackups} onChange={(e) => setMaxBackups(e.target.value)} min="1" max="50" className="w-32" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Security</CardTitle>
          </div>
          <CardDescription>Protect your server from threats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <ToggleRow label="Enable Online Mode" description="Verify player accounts through Mojang" checked={onlineMode} onChange={setOnlineMode} />
          <ToggleRow label="Anti-VPN" description="Block connections from VPN services" checked={antiVpn} onChange={setAntiVpn} />
          <ToggleRow label="IP Forwarding" description="Forward player IPs from proxy servers" checked={ipForwarding} onChange={setIpForwarding} />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} size="lg" className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
