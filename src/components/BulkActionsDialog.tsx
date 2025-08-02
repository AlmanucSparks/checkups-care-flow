import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BulkActionsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedTickets: string[];
  onSuccess: () => void;
}

export default function BulkActionsDialog({ open, onClose, selectedTickets, onSuccess }: BulkActionsDialogProps) {
  const [action, setAction] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useState(() => {
    if (open) {
      fetchITUsers();
    }
  }, [open]);

  const fetchITUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, name')
      .or('designation.eq.IT,is_admin.eq.true');

    if (!error) {
      setUsers(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!action || selectedTickets.length === 0) {
      toast({
        title: "Invalid action",
        description: "Please select an action and tickets.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let updateData: any = {};

      switch (action) {
        case "status":
          if (!newStatus) throw new Error("Please select a status");
          updateData.status = newStatus;
          break;
        case "priority":
          if (!newPriority) throw new Error("Please select a priority");
          updateData.priority = newPriority;
          break;
        case "assign":
          if (!assignTo) throw new Error("Please select a user to assign to");
          updateData.assigned_to = assignTo;
          break;
        default:
          throw new Error("Invalid action");
      }

      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .in('id', selectedTickets);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Updated ${selectedTickets.length} tickets successfully`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update tickets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Actions</DialogTitle>
          <DialogDescription>
            Apply actions to {selectedTickets.length} selected tickets
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Action</label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Update Status</SelectItem>
                <SelectItem value="priority">Update Priority</SelectItem>
                <SelectItem value="assign">Assign to User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {action === "status" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {action === "priority" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">New Priority</label>
              <Select value={newPriority} onValueChange={setNewPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {action === "assign" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign to</label>
              <Select value={assignTo} onValueChange={setAssignTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !action}>
              {isLoading ? "Updating..." : "Apply Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}