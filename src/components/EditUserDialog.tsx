import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const DESIGNATIONS = [
  "Intern", "Junior Developer", "Senior Developer", "IT Manager",
  "System Administrator", "Help Desk", "Network Engineer", "IT", "Data Scientist"
];

const BRANCHES = ["Lusaka", "Kitwe", "Ndola", "Livingstone", "Chipata"];

interface User {
  id: string;
  user_id: string;
  name: string;
  email: string;
  designation: string[];
  branch: string;
  is_admin: boolean;
}

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
  onSuccess: () => void;
}

export default function EditUserDialog({ open, onClose, user, onSuccess }: EditUserDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    designation: user.designation,
    branch: user.branch,
    is_admin: user.is_admin,
  });

  const handleDesignationChange = (designation: string) => {
    setFormData(prev => {
      const newDesignations = prev.designation.includes(designation)
        ? prev.designation.filter(d => d !== designation)
        : [...prev.designation, designation];
      return { ...prev, designation: newDesignations };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || formData.designation.length === 0 || !formData.branch) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          email: formData.email,
          designation: formData.designation,
          branch: formData.branch,
          is_admin: formData.is_admin,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error", 
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: user.name,
      email: user.email,
      designation: user.designation,
      branch: user.branch,
      is_admin: user.is_admin,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Designation</Label>
            <div className="grid grid-cols-2 gap-2">
              {DESIGNATIONS.map((designation) => (
                <div key={designation} className="flex items-center space-x-2">
                  <Checkbox
                    id={designation}
                    checked={formData.designation.includes(designation)}
                    onCheckedChange={() => handleDesignationChange(designation)}
                  />
                  <Label htmlFor={designation}>{designation}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_admin"
              checked={formData.is_admin}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, is_admin: !!checked })
              }
            />
            <Label htmlFor="is_admin">Administrator privileges</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}