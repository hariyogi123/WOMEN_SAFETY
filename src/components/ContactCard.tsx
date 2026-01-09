import { motion } from "framer-motion";
import { User, Phone, Heart, MoreVertical, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Contact {
  id: string;
  name: string;
  phone_number: string;
  relationship: string | null;
  is_primary: boolean;
}

interface ContactCardProps {
  contact: Contact;
  onDelete: (id: string) => void;
  onSetPrimary: (id: string) => void;
  index: number;
}

export const ContactCard = ({ contact, onDelete, onSetPrimary, index }: ContactCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card rounded-xl p-4 shadow-sm border border-border flex items-center gap-4 relative"
    >
      {contact.is_primary && (
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
          <Star className="w-3 h-3 fill-current" />
        </div>
      )}
      
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <User className="w-6 h-6 text-primary" />
      </div>
      
      <div className="flex-grow min-w-0">
        <h3 className="font-semibold text-foreground truncate">{contact.name}</h3>
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <Phone className="w-3 h-3" />
          <span>{contact.phone_number}</span>
        </div>
        {contact.relationship && (
          <div className="flex items-center gap-1 text-primary text-xs mt-1">
            <Heart className="w-3 h-3" />
            <span>{contact.relationship}</span>
          </div>
        )}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!contact.is_primary && (
            <DropdownMenuItem onClick={() => onSetPrimary(contact.id)}>
              <Star className="w-4 h-4 mr-2" />
              Set as Primary
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            onClick={() => onDelete(contact.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
};
