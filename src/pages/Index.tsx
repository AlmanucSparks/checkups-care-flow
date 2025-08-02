import { useState } from "react";
import Layout from "@/components/Layout";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import Dashboard from "@/pages/Dashboard";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

function AppContent() {
  const [showRegister, setShowRegister] = useState(false);
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return showRegister ? (
      <RegisterForm 
        onSwitchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <LoginForm 
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
