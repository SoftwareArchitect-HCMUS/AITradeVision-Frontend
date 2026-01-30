import { useState, useEffect } from "react";
import { User, Mail, Lock, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfileModalStore } from "@/store/useProfileModalStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProfileModal() {
  const { isOpen, closeModal } = useProfileModalStore();
  const { updateProfile } = useAuth();
  const { user } = useAuthStore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user, isOpen]);

  const handleUpdateBasicInfo = () => {
    const updates: { username?: string; email?: string } = {};
    
    if (username !== user?.username) {
      updates.username = username;
    }
    if (email !== user?.email) {
      updates.email = email;
    }

    if (Object.keys(updates).length === 0) {
      return;
    }

    updateProfile.mutate(updates, {
      onSuccess: () => {
        closeModal();
      }
    });
  };

  const handleUpdatePassword = () => {
    if (newPassword !== confirmPassword) {
      return;
    }

    updateProfile.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          closeModal();
        }
      }
    );
  };

  const handleClose = () => {
    closeModal();
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const isBasicInfoChanged = username !== user?.username || email !== user?.email;
  const isPasswordValid = currentPassword && newPassword && newPassword === confirmPassword && newPassword.length >= 6;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-gradient-to-b from-card to-background">
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-6 border-b border-primary/20">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-full bg-primary">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <DialogTitle className="text-2xl font-bold">
                Profile Settings
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground">
              Update your account information
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="basic" className="gap-2">
                <User className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="password" className="gap-2">
                <Lock className="h-4 w-4" />
                Password
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="bg-background/50"
                />
              </div>

              <Button
                onClick={handleUpdateBasicInfo}
                disabled={!isBasicInfoChanged || updateProfile.isPending}
                className="w-full mt-4 gap-2"
              >
                {updateProfile.isPending ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </TabsContent>

            <TabsContent value="password" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="bg-background/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    className="bg-background/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className={`bg-background/50 pr-10 ${
                      confirmPassword && newPassword !== confirmPassword
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>

              <Button
                onClick={handleUpdatePassword}
                disabled={!isPasswordValid || updateProfile.isPending}
                className="w-full mt-4 gap-2"
              >
                {updateProfile.isPending ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                Update Password
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
