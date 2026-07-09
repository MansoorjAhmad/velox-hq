import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

import {
  IconLayoutDashboard,
  IconNotebook,
  IconCreditCard,
  IconCoin,
  IconChartBar,
  IconTarget,
  IconBrain,
  IconMessageCircle,
  IconBell,
  IconSettings,
} from "@tabler/icons-react";

const navigateItems = [
  { label: "Dashboard", to: "/dashboard", icon: IconLayoutDashboard },
  { label: "Trading Journal", to: "/journal", icon: IconNotebook },
  { label: "Debt Tracker", to: "/debt", icon: IconCreditCard },
  { label: "Income Streams", to: "/income", icon: IconCoin },
  { label: "Analytics", to: "/analytics", icon: IconChartBar },
  { label: "Goals", to: "/goals", icon: IconTarget },
  { label: "Reflections", to: "/reflections", icon: IconBrain },
  { label: "AI Coach", to: "/coach", icon: IconMessageCircle },
  { label: "Notifications", to: "/notifications", icon: IconBell },
  { label: "Settings", to: "/settings", icon: IconSettings },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {navigateItems.map((item) => (
            <CommandItem
              key={item.to}
              onSelect={() => {
                onOpenChange(false);
                navigate({ to: item.to });
              }}
            >
              <item.icon className="mr-2 h-4 w-4" strokeWidth={1.5} />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              navigate({ to: "/journal" });
            }}
          >
            <span className="mr-2">+</span>
            Log a trade
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
