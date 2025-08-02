import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import MyTickets from "./pages/MyTickets";
import ITManagement from "./pages/ITManagement";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import { useState } from "react";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

function AppContent() {
  const { user, profile } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const location = useLocation();

  if (!user || !profile) {
    if (location.pathname !== "/") {
      return showRegister ? (
        <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
      ) : (
        <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
      );
    }
    return showRegister ? (
      <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/it-management" element={<ITManagement />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;