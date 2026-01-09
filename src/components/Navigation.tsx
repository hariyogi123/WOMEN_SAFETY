import { motion } from "framer-motion";
import { Shield, Users, MapPin, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Shield, label: "SOS", path: "/" },
  { icon: Users, label: "Contacts", path: "/contacts" },
  { icon: MapPin, label: "Safe Zones", path: "/zones" },
  { icon: User, label: "Profile", path: "/profile" },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border px-4 pb-safe z-30">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-1 py-2 px-4"
            >
              <motion.div
                className={`p-2 rounded-xl transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
