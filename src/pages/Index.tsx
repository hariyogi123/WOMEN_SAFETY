import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, MapPin, Users, AlertCircle } from "lucide-react";
import { SOSButton } from "@/components/SOSButton";
import { Navigation } from "@/components/Navigation";
import { AuthForm } from "@/components/AuthForm";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useContacts } from "@/hooks/useContacts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSuccess, setSosSuccess] = useState(false);
  
  const { getLocation, generateMapsLink, latitude, longitude } = useGeolocation();
  const { contacts } = useContacts(user?.id);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch profile for user name
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", session.user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSOS = async () => {
    if (contacts.length === 0) {
      toast.error("Please add emergency contacts first", {
        action: {
          label: "Add",
          onClick: () => window.location.href = "/contacts",
        },
      });
      return;
    }

    setSosLoading(true);
    
    try {
      // Get current location
      const location = await getLocation();
      const mapsLink = generateMapsLink(location.latitude, location.longitude);
      
      // Call edge function to send SMS
      const { data, error } = await supabase.functions.invoke("send-sos-sms", {
        body: {
          latitude: location.latitude,
          longitude: location.longitude,
          mapsLink,
          contacts: contacts.map(c => ({ name: c.name, phone_number: c.phone_number })),
          userName: profile?.full_name || user?.email,
        },
      });

      if (error) throw error;

      // Log the SOS alert
      await supabase.from("sos_alerts").insert({
        user_id: user.id,
        latitude: location.latitude,
        longitude: location.longitude,
        maps_link: mapsLink,
        contacts_notified: data.sent || contacts.length,
        status: data.sent > 0 ? "sent" : "failed",
      });

      setSosLoading(false);
      setSosSuccess(true);
      
      toast.success(`Alert sent successfully with location!`, {
        description: `${data.sent} contact(s) notified via WhatsApp`,
        duration: 5000,
      });

      // Reset success state after 3 seconds
      setTimeout(() => {
        setSosSuccess(false);
      }, 3000);
      
    } catch (error: any) {
      setSosLoading(false);
      toast.error(error.message || "Failed to send SOS alert");
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
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">SafeGuard</h1>
              <p className="text-xs text-muted-foreground">Always protected</p>
            </div>
          </div>
          
          <AnimatePresence>
            {latitude && longitude && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 text-xs text-safe bg-safe/10 px-2 py-1 rounded-full"
              >
                <MapPin className="w-3 h-3" />
                <span>GPS Active</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-6 py-8 max-w-md mx-auto">
        {/* Status Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-12"
        >
          <Link
            to="/contacts"
            className="bg-card rounded-2xl p-4 border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Emergency Contacts</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{contacts.length}</p>
            {contacts.length === 0 && (
              <p className="text-xs text-warning mt-1">Add contacts →</p>
            )}
          </Link>

          <Link
            to="/zones"
            className="bg-card rounded-2xl p-4 border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-safe" />
              <span className="text-xs text-muted-foreground">Safe Zones</span>
            </div>
            <p className="text-2xl font-bold text-foreground">0</p>
            <p className="text-xs text-muted-foreground mt-1">Set up zones →</p>
          </Link>
        </motion.div>

        {/* Warning if no contacts */}
        <AnimatePresence>
          {contacts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-8 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">No emergency contacts</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add at least one contact to enable SOS alerts.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SOS Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex justify-center py-8"
        >
          <SOSButton
            onActivate={handleSOS}
            isLoading={sosLoading}
            isSuccess={sosSuccess}
          />
        </motion.div>

        {/* Instructions */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-muted-foreground text-sm mt-8"
        >
          Tap the SOS button to instantly share your location with your emergency contacts
        </motion.p>
      </main>

      <Navigation />
    </div>
  );
};

export default Index;
