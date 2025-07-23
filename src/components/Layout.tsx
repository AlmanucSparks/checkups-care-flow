import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User, Home, Ticket, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth();
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
            
            {profile && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{profile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {profile.designation} • {profile.branch}
                    {profile.is_admin && " • Admin"}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      {profile && (
        <nav className="border-b bg-card">
          <div className="container mx-auto px-4">
            <div className="flex space-x-6">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 py-4">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 py-4">
                <Ticket className="h-4 w-4" />
                <span>My Tickets</span>
              </Button>
              {(profile.designation === 'IT' || profile.is_admin) && (
                <Button variant="ghost" size="sm" className="flex items-center space-x-2 py-4">
                  <Settings className="h-4 w-4" />
                  <span>IT Management</span>
                </Button>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}