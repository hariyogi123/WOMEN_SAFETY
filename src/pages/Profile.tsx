import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, LogOut, Shield, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/Navigation";
import { AuthForm } from "@/components/AuthForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchAlertCount(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      setProfile(data);
    } catch (error) {
      // Profile might not exist yet
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertCount = async (userId: string) => {
    try {
      const { count } = await supabase
        .from("sos_alerts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      
      setAlertCount(count || 0);
    } catch (error) {
      // Ignore
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 bg-background/95 backdrop-blur-lg border-b border-border px-6 py-4"
      >
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Profile</h1>
              <p className="text-xs text-muted-foreground">Manage your account</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-6 py-6 max-w-md mx-auto space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 border border-border"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {profile?.full_name || "User"}
              </h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                value={user.email}
                disabled
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                value={profile?.full_name || ""}
                disabled
                placeholder="Not set"
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                value={profile?.phone_number || ""}
                disabled
                placeholder="Not set"
                className="bg-muted/50"
              />
            </div>
          </div>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 border border-border"
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Activity
          </h3>
          
          <div className="flex items-center justify-between py-3 border-b border-border">
            <span className="text-muted-foreground">SOS Alerts Sent</span>
            <span className="font-bold text-foreground">{alertCount}</span>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <span className="text-muted-foreground">Account Created</span>
            <span className="text-sm text-foreground">
              {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
        </motion.div>

        {/* About Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-primary/5 rounded-2xl p-6 border border-primary/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">SafeGuard</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Your safety companion. We're here to help you stay safe and connected with your loved ones.
          </p>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full h-12 text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </main>

      <Navigation />
    </div>
  );
};

export default Profile;
