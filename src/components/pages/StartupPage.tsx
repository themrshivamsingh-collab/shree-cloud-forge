import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Save, Info, Terminal, Coffee, Wrench, Plus, Trash2 } from "lucide-react";

export function StartupPage() {
  const { toast } = useToast();

  // Startup config
  const [startupCommand, setStartupCommand] = useState("java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}");
  const [serverJar, setServerJar] = useState("paper-1.20.1.jar");
  const [dockerImage, setDockerImage] = useState("ghcr.io/pterodactyl/yolks:java_17");
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([
    { key: "SERVER_JARFILE", value: "paper-1.20.1.jar" },
    { key: "SERVER_MEMORY", value: "2048" },
  ]);


  // Java
  const [javaVersion, setJavaVersion] = useState("17");
  const [jvmFlags, setJvmFlags] = useState("-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200");

  // Advanced
  const [autoStart, setAutoStart] = useState(true);
  const [crashDetection, setCrashDetection] = useState(true);
  const [debugMode, setDebugMode] = useState(false);

  const addEnvVar = () => setEnvVars([...envVars, { key: "", value: "" }]);
  const removeEnvVar = (i: number) => setEnvVars(envVars.filter((_, idx) => idx !== i));
  const updateEnvVar = (i: number, field: "key" | "value", val: string) => {
    const updated = [...envVars];
    updated[i][field] = val;
    setEnvVars(updated);
  };

  const handleSave = () => {
    toast({
      title: "⚠️ Settings saved",
      description: "Startup configuration updated. A server restart is required for changes to take effect.",
      variant: "destructive",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Startup</h1>
        <p className="text-muted-foreground mt-1">Advanced configuration (changing these may affect server behavior)</p>
      </div>

      {/* Warning Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-[hsl(38,92%,50%,0.3)] bg-[hsl(38,92%,50%,0.08)] p-4">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-warning">Proceed with caution</p>
          <p className="text-xs text-muted-foreground mt-0.5">Modifying startup settings incorrectly can prevent your server from starting. Only change values if you know what you're doing.</p>
        </div>
      </div>

      {/* Server Info */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Server Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <InfoTile label="Server Version" value="Paper 1.20.1" />
            <InfoTile label="Server Type" value="Paper" />
            <InfoTile label="Status" value="Online" badge="success" />
            <InfoTile label="Node Location" value="IN-1 (Mumbai)" />
          </div>
        </CardContent>
      </Card>

      {/* Startup Configuration */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Startup Configuration</CardTitle>
          </div>
          <CardDescription>Define how your server starts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="startup-cmd">Startup Command</Label>
            <Input id="startup-cmd" value={startupCommand} onChange={(e) => setStartupCommand(e.target.value)} className="font-mono text-xs" />
            <p className="text-xs text-muted-foreground">Use {"{{VARIABLE}}"} syntax for environment variables</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Server Jar File</Label>
              <Select value={serverJar} onValueChange={setServerJar}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paper-1.20.1.jar">paper-1.20.1.jar</SelectItem>
                  <SelectItem value="paper-1.19.4.jar">paper-1.19.4.jar</SelectItem>
                  <SelectItem value="spigot-1.20.1.jar">spigot-1.20.1.jar</SelectItem>
                  <SelectItem value="purpur-1.20.1.jar">purpur-1.20.1.jar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="docker-image">Docker Image</Label>
              <Input id="docker-image" value={dockerImage} onChange={(e) => setDockerImage(e.target.value)} className="font-mono text-xs" />
            </div>
          </div>

          {/* Environment Variables */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Environment Variables</Label>
              <Button variant="outline" size="sm" onClick={addEnvVar} className="gap-1 text-xs">
                <Plus className="h-3 w-3" /> Add Variable
              </Button>
            </div>
            <div className="space-y-2">
              {envVars.map((env, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={env.key} onChange={(e) => updateEnvVar(i, "key", e.target.value)} placeholder="KEY" className="font-mono text-xs flex-1" />
                  <span className="text-muted-foreground text-xs">=</span>
                  <Input value={env.value} onChange={(e) => updateEnvVar(i, "value", e.target.value)} placeholder="value" className="font-mono text-xs flex-1" />
                  <Button variant="ghost" size="icon" onClick={() => removeEnvVar(i)} className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Java Settings */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Java Settings</CardTitle>
          </div>
          <CardDescription>Configure Java runtime options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Java Version</Label>
            <Select value={javaVersion} onValueChange={setJavaVersion}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="8">Java 8</SelectItem>
                <SelectItem value="11">Java 11</SelectItem>
                <SelectItem value="16">Java 16</SelectItem>
                <SelectItem value="17">Java 17 (Recommended)</SelectItem>
                <SelectItem value="21">Java 21</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="jvm-flags">JVM Flags</Label>
            <Textarea id="jvm-flags" value={jvmFlags} onChange={(e) => setJvmFlags(e.target.value)} rows={3} className="font-mono text-xs" placeholder="-XX:+UseG1GC ..." />
            <p className="text-xs text-muted-foreground">Additional JVM arguments passed at startup</p>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Advanced Options</CardTitle>
          </div>
          <CardDescription>Runtime behavior toggles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow label="Enable Auto Start" description="Automatically start the server when the node boots" checked={autoStart} onChange={setAutoStart} />
          <ToggleRow label="Enable Crash Detection" description="Automatically restart the server if it crashes" checked={crashDetection} onChange={setCrashDetection} />
          <ToggleRow label="Debug Mode" description="Enable verbose logging for troubleshooting" checked={debugMode} onChange={setDebugMode} warning />
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center justify-between pb-8">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-warning" />
          Changing startup settings may break your server
        </p>
        <Button onClick={handleSave} size="lg" className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function InfoTile({ label, value, badge }: { label: string; value: string; badge?: "success" | "destructive" }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {badge ? (
        <Badge variant={badge === "success" ? "default" : "destructive"} className={badge === "success" ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]" : ""}>
          {value}
        </Badge>
      ) : (
        <p className="text-sm font-medium text-foreground">{value}</p>
      )}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange, warning }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void; warning?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-lg border p-4 ${warning && checked ? "border-[hsl(38,92%,50%,0.3)] bg-[hsl(38,92%,50%,0.05)]" : "border-border"}`}>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
