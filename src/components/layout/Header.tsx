
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  User, 
  Bell, 
  HelpCircle,
  PlayCircle
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useMobileScreen } from "@/hooks/use-mobile";

export function Header() {
  // Use the mobile hook to handle responsive behavior
  const isMobile = useMobileScreen();

  return (
    <header className="border-b border-border h-14 bg-background/95 backdrop-blur-sm flex items-center justify-between px-4">
      <div className="flex items-center">
        <div className={`relative ${isMobile ? 'w-52' : 'w-72'}`}>
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search projects..." 
            className="pl-9 bg-muted/50 border-muted"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2 hidden sm:inline-flex">
          <PlayCircle size={16} />
          <span>Test Run</span>
        </Button>
        <Button variant="ghost" size="icon">
          <HelpCircle size={20} />
        </Button>
        <Button variant="ghost" size="icon">
          <Bell size={20} />
        </Button>
        
        {/* Fix for dropdown context issue */}
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>AI Models</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
