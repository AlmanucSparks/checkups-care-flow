import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const DESIGNATIONS = [
  "Doctor",
  "Nurse",
  "Pharmacist",
  "Dispatch",
  "Xpresscheck",
  "Accounts",
  "Customer Care",
  "Claims",
  "CDM",
  "IT",
  "Intern"
];

const BRANCHES = [
  "Lusaka",
  "Ga",
  "JKIA",
  "Industrial Park"
];

interface RegisterFormProps {
  onRegister: (user: any) => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onRegister, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    designation: "",
    branch: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate registration
    setTimeout(() => {
      if (formData.name && formData.email && formData.password && formData.designation && formData.branch) {
        const newUser = {
          id: Date.now().toString(),
          ...formData
        };
        onRegister(newUser);
        toast({
          title: "Registration successful!",
          description: "Welcome to Checkups IT Support Center.",
        });
      } else {
        toast({
          title: "Registration failed",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img 
            src="/lovable-uploads/6abc0cf4-df84-477f-b938-a4dcb3e4fddc.png" 
            alt="Checkups Medical Hub" 
            className="h-20 w-auto mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold text-primary">Join IT Support</h2>
          <p className="text-muted-foreground mt-2">Create your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Create an account to access IT support services</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@checkups.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Select onValueChange={(value) => setFormData({...formData, designation: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGNATIONS.map((designation) => (
                      <SelectItem key={designation} value={designation}>
                        {designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select onValueChange={(value) => setFormData({...formData, branch: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button variant="link" onClick={onSwitchToLogin} className="p-0">
                  Sign in here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}