import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Search, Settings, AlertCircle, Clock, CheckCircle, BarChart2 } from "lucide-react";
import CreateUserDialog from "@/components/CreateUserDialog";
import EditUserDialog from "@/components/EditUserDialog";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface User {
  id: string;
  user_id: string;
  name: string;
  email: string;
  designation: string[];
  branch: string;
  is_admin: boolean;
  created_at: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  created_by: string;
  assigned_to: string | null;
  creator?: {
    name: string;
  };
  assignee?: {
    name: string;
  };
}


export default function ITManagement() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketStats, setTicketStats] = useState({ open: 0, inProgress: 0, resolved: 0 });
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterDesignation, setFilterDesignation] = useState("all");

  const COLORS = ['#FF8042', '#0088FE', '#00C49F'];

  const BRANCHES = ["Lusaka", "Kitwe", "Ndola", "Livingstone", "Chipata"];
  const DESIGNATIONS = ["Intern", "Junior Developer", "Senior Developer", "IT Manager", "System Administrator", "Help Desk", "Network Engineer", "Data Scientist"];

  useEffect(() => {
    if (profile?.designation.includes("IT") || profile?.is_admin) {
      fetchUsers();
      fetchTickets();
    }
  }, [profile]);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } else {
      setUsers(data || []);
    }
  };

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from("tickets")
      .select(`*, creator:profiles!tickets_created_by_fkey(name), assignee:profiles!tickets_assigned_to_fkey(name)`)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to fetch tickets", variant: "destructive" });
    } else {
      const ticketData = data || [];
      setTickets(ticketData);
      const stats = {
        open: ticketData.filter(t => t.status === 'Open').length,
        inProgress: ticketData.filter(t => t.status === 'In Progress').length,
        resolved: ticketData.filter(t => t.status === 'Resolved').length
      };
      setTicketStats(stats);
    }
  };

  const handleAssignTicket = async (ticketId: string, userId: string) => {
    const { error } = await supabase
      .from("tickets")
      .update({ assigned_to: userId })
      .eq("id", ticketId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to assign ticket",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Ticket assigned successfully",
      });
      fetchTickets();
    }
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    const { error } = await supabase
      .from("tickets")
      .update({ status })
      .eq("id", ticketId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Ticket status updated successfully",
      });
      fetchTickets();
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditUserDialog(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = filterBranch === "all" || user.branch === filterBranch;
    const matchesDesignation = filterDesignation === "all" || user.designation.includes(filterDesignation);
    
    return matchesSearch && matchesBranch && matchesDesignation;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open": return <AlertCircle className="h-4 w-4" />;
      case "In Progress": return <Clock className="h-4 w-4" />;
      case "Resolved": return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "destructive";
      case "In Progress": return "default";
      case "Resolved": return "secondary";
      default: return "outline";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "destructive";
      case "Medium": return "default";
      case "Low": return "secondary";
      default: return "outline";
    }
  };

  const ticketData = [
    { name: 'Open', value: ticketStats.open },
    { name: 'In Progress', value: ticketStats.inProgress },
    { name: 'Resolved', value: ticketStats.resolved },
  ];

  if (!profile?.designation.includes("IT") && !profile?.is_admin) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Access denied. This page is only available to IT staff and administrators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">IT Management</h1>
        {profile?.is_admin && (
          <Button onClick={() => setShowCreateUserDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        )}
      </div>

      {/* Visionary Feature: Ticket Status Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5" />Ticket Status Overview</CardTitle>
          <CardDescription>A visual breakdown of current ticket statuses.</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={ticketData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {ticketData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* User Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterBranch} onValueChange={setFilterBranch}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {BRANCHES.map(branch => (
                  <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDesignation} onValueChange={setFilterDesignation}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Designation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Designations</SelectItem>
                {DESIGNATIONS.map(designation => (
                  <SelectItem key={designation} value={designation}>{designation}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Users List */}
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{user.name}</h3>
                    {user.is_admin && <Badge variant="destructive">Admin</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex gap-2">
                    {user.designation.map(d => <Badge key={d} variant="outline">{d}</Badge>)}
                    <Badge variant="secondary">{user.branch}</Badge>
                  </div>
                </div>
                {profile?.is_admin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ticket Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-2">
                    <h3 className="font-medium">{ticket.title}</h3>
                    <p className="text-sm text-muted-foreground">{ticket.description}</p>
                    <div className="flex gap-2">
                      <Badge variant={getStatusColor(ticket.status)}>
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1">{ticket.status}</span>
                      </Badge>
                      <Badge variant={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Created by: {ticket.creator?.name}</p>
                      {ticket.assignee && <p>Assigned to: {ticket.assignee.name}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={ticket.status}
                      onValueChange={(status) => handleStatusChange(ticket.id, status)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={ticket.assigned_to || "unassigned"}
                      onValueChange={(userId) => 
                        userId !== "unassigned" && handleAssignTicket(ticket.id, userId)
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Assign to..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {users
                          .filter(user => user.designation.includes("IT") || user.is_admin)
                          .map(user => (
                            <SelectItem key={user.user_id} value={user.user_id}>
                              {user.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CreateUserDialog
        open={showCreateUserDialog}
        onClose={() => setShowCreateUserDialog(false)}
        onSuccess={() => {
          setShowCreateUserDialog(false);
          fetchUsers();
        }}
      />

      {selectedUser && (
        <EditUserDialog
          open={showEditUserDialog}
          onClose={() => {
            setShowEditUserDialog(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={() => {
            setShowEditUserDialog(false);
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}