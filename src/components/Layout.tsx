import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Ticket, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { profile, signOut, isAdmin, isITStaff } = useAuth();
  const location = useLocation();

  if (!profile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/6abc0cf4-df84-477f-b938-a4dcb3e4fddc.png" 
                alt="Checkups Medical Hub" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-primary">IT Support Center</h1>
                <p className="text-sm text-muted-foreground">Checkups Medical Hub</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{profile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {profile.designation} • {profile.branch}
                  {isAdmin && " • Admin"}
                  {isITStaff && !isAdmin && " • IT Staff"}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex space-x-6">
            <Button 
              variant={location.pathname === "/" ? "secondary" : "ghost"} 
              size="sm" 
              className="flex items-center space-x-2 py-4"
              asChild
            >
              <Link to="/">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
            <Button 
              variant={location.pathname === "/my-tickets" ? "secondary" : "ghost"} 
              size="sm" 
              className="flex items-center space-x-2 py-4"
              asChild
            >
              <Link to="/my-tickets">
                <Ticket className="h-4 w-4" />
                <span>My Tickets</span>
              </Link>
            </Button>
            {isITStaff && (
              <Button 
                variant={location.pathname === "/it-management" ? "secondary" : "ghost"} 
                size="sm" 
                className="flex items-center space-x-2 py-4"
                asChild
              >
                <Link to="/it-management">
                  <Settings className="h-4 w-4" />
                  <span>IT Management</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
