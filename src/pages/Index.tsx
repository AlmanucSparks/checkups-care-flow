import { useState } from "react";
import Dashboard from "@/pages/Dashboard";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";

const Index = () => {
  const [showRegister, setShowRegister] = useState(false);
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return showRegister ? (
      <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  return <Dashboard />;
};

export default Index;