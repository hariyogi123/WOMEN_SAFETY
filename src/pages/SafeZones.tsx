import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { AuthForm } from "@/components/AuthForm";
import { supabase } from "@/integrations/supabase/client";

const SafeZones = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
            <div className="w-10 h-10 rounded-full bg-safe/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-safe" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Safe Zones</h1>
              <p className="text-xs text-muted-foreground">Geofencing areas</p>
            </div>
          </div>
          
          <Button size="icon" className="rounded-full" disabled>
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-6 py-6 max-w-md mx-auto">
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-safe/5 border border-safe/20 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-safe/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-safe" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground mb-1">What are Safe Zones?</h2>
              <p className="text-sm text-muted-foreground">
                Define areas like your home, workplace, or school. When you leave these zones, your contacts can be automatically notified.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <MapPin className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">No safe zones yet</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-[250px]">
            This feature will be available soon. Stay tuned!
          </p>
          
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-3 max-w-sm">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-sm text-foreground font-medium">Coming Soon</p>
              <p className="text-xs text-muted-foreground mt-1">
                Geofencing requires SMS API integration. Add your SMS API key to enable this feature.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Navigation />
    </div>
  );
};

export default SafeZones;
