import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  phone_number: string;
  relationship: string | null;
  is_primary: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useContacts = (userId: string | undefined) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("user_id", userId)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = async (contact: { name: string; phone_number: string; relationship: string }) => {
    if (!userId) return;

    try {
      const { error } = await supabase.from("emergency_contacts").insert({
        user_id: userId,
        name: contact.name,
        phone_number: contact.phone_number,
        relationship: contact.relationship || null,
        is_primary: contacts.length === 0,
      });

      if (error) throw error;
      toast.success("Contact added successfully");
      fetchContacts();
    } catch (error: any) {
      toast.error(error.message || "Failed to add contact");
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from("emergency_contacts")
        .delete()
        .eq("id", contactId);

      if (error) throw error;
      toast.success("Contact deleted");
      fetchContacts();
    } catch (error: any) {
      toast.error("Failed to delete contact");
    }
  };

  const setPrimaryContact = async (contactId: string) => {
    if (!userId) return;

    try {
      // First, unset all primary contacts
      await supabase
        .from("emergency_contacts")
        .update({ is_primary: false })
        .eq("user_id", userId);

      // Then set the new primary
      const { error } = await supabase
        .from("emergency_contacts")
        .update({ is_primary: true })
        .eq("id", contactId);

      if (error) throw error;
      toast.success("Primary contact updated");
      fetchContacts();
    } catch (error: any) {
      toast.error("Failed to update primary contact");
    }
  };

  return {
    contacts,
    loading,
    addContact,
    deleteContact,
    setPrimaryContact,
    refetch: fetchContacts,
  };
};
