import { useState } from "react";
import { Copy, Check, Link, Unlink, Save, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SFTP_INFO = {
  host: "sftp.shreecloud.net",
  port: "2022",
  username: "shreecloud.abc123",
};

export function AccountPage() {
  const { toast } = useToast();
  const [username, setUsername] = useState("ShreePlayer");
  const [email, setEmail] = useState("player@shreecloud.net");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [discordLinked, setDiscordLinked] = useState(false);
  const [discordUser, setDiscordUser] = useState("ShreePlayer#1234");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveProfile = () => {
    toast({ title: "Profile updated", description: "Your profile settings have been saved." });
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Missing fields", description: "Please fill in all password fields.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Mismatch", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast({ title: "Password updated", description: "Your password has been changed successfully." });
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all";

  const labelClass = "block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5";

  const cardClass = "bg-card border border-border rounded-xl p-5 space-y-4";

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile and security settings</p>
      </div>

      {/* Profile Settings */}
      <div className={cardClass}>
        <h2 className="text-base font-semibold text-foreground">Profile Settings</h2>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inputClass} />
          </div>
        </div>
        <button
          onClick={handleSaveProfile}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:scale-[1.02] transition-transform duration-150"
        >
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>

      {/* Change Password */}
      <div className={cardClass}>
        <h2 className="text-base font-semibold text-foreground">Change Password</h2>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Current Password</label>
            <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" placeholder="••••••••" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>New Password</label>
            <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="••••••••" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Confirm Password</label>
            <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="••••••••" className={inputClass} />
          </div>
        </div>
        <button
          onClick={handleUpdatePassword}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:scale-[1.02] transition-transform duration-150"
        >
          <KeyRound className="h-4 w-4" /> Update Password
        </button>
      </div>

      {/* SFTP Access */}
      <div className={cardClass}>
        <h2 className="text-base font-semibold text-foreground">SFTP Access</h2>
        <div className="space-y-3">
          {Object.entries(SFTP_INFO).map(([key, value]) => (
            <div key={key}>
              <label className={labelClass}>{key === "host" ? "SFTP Host" : key === "port" ? "Port" : "Username"}</label>
              <div className="flex gap-2">
                <input value={value} readOnly className={`${inputClass} opacity-80 cursor-default`} />
                <button
                  onClick={() => handleCopy(value, key)}
                  className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {copiedField === key ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discord Integration */}
      <div className={cardClass}>
        <h2 className="text-base font-semibold text-foreground">Discord Integration</h2>
        {discordLinked ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground">
              Linked as <span className="font-semibold text-primary">{discordUser}</span>
            </p>
            <button
              onClick={() => setDiscordLinked(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium text-sm hover:scale-[1.02] transition-transform duration-150"
            >
              <Unlink className="h-4 w-4" /> Unlink Discord
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">No Discord account linked.</p>
            <button
              onClick={() => setDiscordLinked(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:scale-[1.02] transition-transform duration-150"
            >
              <Link className="h-4 w-4" /> Link Discord
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
