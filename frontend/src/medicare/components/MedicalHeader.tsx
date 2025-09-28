import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Stethoscope, 
  Bell, 
  Settings, 
  User,
  LogOut,
  Menu
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

interface MedicalHeaderProps {
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
  clinicName?: string;
  notifications?: number;
}

const MedicalHeader = ({ user, clinicName, notifications = 0 }: MedicalHeaderProps) => {
  return (
    <header className="border-b bg-white sticky top-0 z-50 shadow-card">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Clinic */}
          <div className="flex items-center space-x-4">
            <Link to="/medicare" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-medical rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-foreground">MediSyn</span>
                {clinicName && (
                  <div className="text-xs text-muted-foreground">{clinicName}</div>
                )}
              </div>
            </Link>
          </div>

          {/* Center Navigation (Desktop) */}
          {user.role !== "patient" && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/medicare/doctor-dashboard" 
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Dashboard
              </Link>
              <Link 
                to="/medicare/patients" 
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Patients
              </Link>
              <Link 
                to="/medicare/schedule" 
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Schedule
              </Link>
              <Link 
                to="/medicare/analytics" 
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Analytics
              </Link>
            </nav>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              {notifications > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground p-0 flex items-center justify-center text-xs"
                >
                  {notifications > 9 ? '9+' : notifications}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-medical rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-foreground">{user.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MedicalHeader;