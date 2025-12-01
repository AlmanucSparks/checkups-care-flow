import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Ticket, Clock, AlertCircle, CheckCircle, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CreateTicketDialog from "./CreateTicketDialog";
import CreateUserDialog from "./CreateUserDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const { user, profile, isAdmin, isITStaff } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && profile) {
      fetchProfiles();
      fetchTickets();
      if (isAdmin || isITStaff) {
        fetchUsers();
      }
    }
  }, [user, profile, isAdmin, isITStaff]);

  const fetchProfiles = async () => {
    const { data } = await supabase.from("profiles").select("user_id, name");
    if (data) {
      const profileMap: Record<string, string> = {};
      data.forEach(p => { profileMap[p.user_id] = p.name; });
      setProfiles(profileMap);
    }
  };

  const fetchTickets = async () => {
    try {
      let query = supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isITStaff && !isAdmin) {
        query = query.eq('created_by', user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateTicket = async (ticketData: any) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .insert([{
          title: ticketData.title,
          description: ticketData.description,
          priority: ticketData.priority,
          created_by: user?.id
        }]);

      if (error) throw error;
      
      toast({
        title: "Ticket created",
        description: "Your support ticket has been submitted successfully.",
      });
      
      setShowCreateDialog(false);
      fetchTickets();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAssignTicket = async (ticketId: string, assigneeId: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ assigned_to: assigneeId })
        .eq('id', ticketId);

      if (error) throw error;
      
      toast({
        title: "Ticket assigned",
        description: "The ticket has been assigned successfully.",
      });
      
      fetchTickets();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: "The ticket status has been updated.",
      });
      
      fetchTickets();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <Clock className="h-4 w-4" />;
      case "in_progress": return <AlertCircle className="h-4 w-4" />;
      case "resolved": case "closed": return <CheckCircle className="h-4 w-4" />;
      default: return <Ticket className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "secondary";
      case "in_progress": return "default";
      case "resolved": case "closed": return "outline";
      default: return "secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "outline";
      case "medium": return "secondary";
      case "high": case "urgent": return "destructive";
      default: return "secondary";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredTickets = tickets.filter(ticket => {
    const creatorName = profiles[ticket.created_by] || '';
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creatorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {isITStaff ? 'IT Dashboard' : 'My Support Tickets'}
          </h1>
          <p className="text-muted-foreground">
            {isITStaff 
              ? 'Manage all support requests across the organization'
              : 'View and manage your IT support requests'
            }
          </p>
        </div>
        <div className="flex space-x-2">
          {isAdmin && (
            <Button 
              variant="outline" 
              onClick={() => setShowCreateUserDialog(true)}
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Add User</span>
            </Button>
          )}
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Ticket</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => t.status === "open").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => t.status === "in_progress").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => t.status === "resolved").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {isITStaff && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
          <CardDescription>
            {isITStaff 
              ? 'All support tickets in the system'
              : 'Your support ticket history'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No tickets found</h3>
                <p className="text-muted-foreground">
                  {tickets.length === 0 
                    ? "Create your first support ticket to get started."
                    : "Try adjusting your search criteria."
                  }
                </p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(ticket.status)}
                    <div>
                      <h4 className="font-medium">{ticket.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Created by {profiles[ticket.created_by] || 'Unknown'} • {new Date(ticket.created_at).toLocaleDateString()}
                        {ticket.assigned_to && ` • Assigned to ${profiles[ticket.assigned_to] || 'Unknown'}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isITStaff && (
                      <>
                        <Select onValueChange={(value) => handleStatusChange(ticket.id, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder={formatStatus(ticket.status)} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        {!ticket.assigned_to && (
                          <Select onValueChange={(value) => handleAssignTicket(ticket.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Assign" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.filter(u => u.designation === 'IT').map(itUser => (
                                <SelectItem key={itUser.user_id} value={itUser.user_id}>
                                  {itUser.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </>
                    )}
                    <Badge variant={getPriorityColor(ticket.priority)}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </Badge>
                    <Badge variant={getStatusColor(ticket.status)}>
                      {formatStatus(ticket.status)}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <CreateTicketDialog 
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateTicket}
      />

      {isAdmin && (
        <CreateUserDialog 
          open={showCreateUserDialog}
          onClose={() => setShowCreateUserDialog(false)}
          onSuccess={() => {
            setShowCreateUserDialog(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}
