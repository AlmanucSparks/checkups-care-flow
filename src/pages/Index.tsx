import { useState } from "react";
import Layout from "@/components/Layout";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleRegister = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return showRegister ? (
      <RegisterForm 
        onRegister={handleRegister}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <LoginForm 
        onLogin={handleLogin}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      <Dashboard user={user} />
    </Layout>
  );
};

export default Index;
