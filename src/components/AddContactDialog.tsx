import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Phone, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (contact: { name: string; phone_number: string; relationship: string }) => void;
}

export const AddContactDialog = ({ isOpen, onClose, onAdd }: AddContactDialogProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone) {
      onAdd({ name, phone_number: phone, relationship });
      setName("");
      setPhone("");
      setRelationship("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 z-50 shadow-2xl max-h-[80vh] overflow-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Add Emergency Contact</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter contact name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship" className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-muted-foreground" />
                  Relationship (optional)
                </Label>
                <Input
                  id="relationship"
                  placeholder="e.g. Mother, Sister, Friend"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="h-12"
                />
              </div>

              <Button type="submit" className="w-full h-12 text-lg font-semibold mt-4">
                Add Contact
              </Button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
