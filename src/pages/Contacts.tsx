import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ContactCard } from "@/components/ContactCard";
import { AddContactDialog } from "@/components/AddContactDialog";
import { AuthForm } from "@/components/AuthForm";
import { useContacts } from "@/hooks/useContacts";
import { supabase } from "@/integrations/supabase/client";

const Contacts = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { contacts, loading: contactsLoading, addContact, deleteContact, setPrimaryContact } = useContacts(user?.id);

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
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Emergency Contacts</h1>
              <p className="text-xs text-muted-foreground">{contacts.length} contact(s)</p>
            </div>
          </div>
          
          <Button
            onClick={() => setIsDialogOpen(true)}
            size="icon"
            className="rounded-full"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-6 py-6 max-w-md mx-auto">
        {contactsLoading ? (
          <div className="flex justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : contacts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <UserPlus className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">No contacts yet</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-[250px]">
              Add your trusted contacts who will be notified in an emergency
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Contact
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {contacts.map((contact, index) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onDelete={deleteContact}
                  onSetPrimary={setPrimaryContact}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <AddContactDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAdd={addContact}
      />

      <Navigation />
    </div>
  );
};

export default Contacts;
