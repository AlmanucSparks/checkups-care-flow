import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Search, Settings, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { Activity, Ticket, BarChart3, Zap, TrendingUp } from "lucide-react";
import CreateUserDialog from "@/components/CreateUserDialog";
import EditUserDialog from "@/components/EditUserDialog";
import ResetPasswordDialog from "@/components/ResetPasswordDialog";
import UserActivityDialog from "@/components/UserActivityDialog";
import BulkActionsDialog from "@/components/BulkActionsDialog";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import QuickActionsPanel from "@/components/QuickActionsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: string;
  user_id: string;
  name: string;
  email: string;
  designation: string;
  branch: string;
  created_at: string;
  roles?: string[];
}

interface TicketItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  created_by: string;
  assigned_to: string | null;
  creator_name?: string;
  assignee_name?: string;
}

export default function ITManagement() {
  const { profile, isAdmin, isITStaff } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showUserActivityDialog, setShowUserActivityDialog] = useState(false);
  const [showBulkActionsDialog, setShowBulkActionsDialog] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterDesignation, setFilterDesignation] = useState("all");
  const [ticketSearchTerm, setTicketSearchTerm] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("all");

  const BRANCHES = ["LUSAKA", "GA", "JKIA", "EPZ"];
  const DESIGNATIONS = [
    "Doctor", "Nurse", "Pharmacist", "Lab", "Dispatch", "Accounts", 
    "Customer Care", "Claims", "CDM", "IT", "Intern", "Management", 
    "Sales", "Procurement", "Inventory"
  ];

  useEffect(() => {
    if (isITStaff || isAdmin) {
      fetchProfiles();
      fetchUsers();
      fetchTickets();
    }
  }, [isITStaff, isAdmin]);

  const fetchProfiles = async () => {
    const { data } = await supabase.from("profiles").select("user_id, name");
    if (data) {
      const profileMap: Record<string, string> = {};
      data.forEach(p => { profileMap[p.user_id] = p.name; });
      setProfiles(profileMap);
    }
  };

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
      // Fetch roles for all users
      const { data: rolesData } = await supabase.from("user_roles").select("user_id, role");
      const userRoles: Record<string, string[]> = {};
      rolesData?.forEach(r => {
        if (!userRoles[r.user_id]) userRoles[r.user_id] = [];
        userRoles[r.user_id].push(r.role);
      });

      const usersWithRoles = (data || []).map(user => ({
        ...user,
        roles: userRoles[user.user_id] || []
      }));
      setUsers(usersWithRoles);
    }
  };

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tickets",
        variant: "destructive",
      });
    } else {
      setTickets(data || []);
    }
  };

  const handleAssignTicket = async (ticketId: string, userId: string) => {
    const { error } = await supabase
      .from("tickets")
      .update({ assigned_to: userId === "unassigned" ? null : userId })
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

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setShowResetPasswordDialog(true);
  };

  const handleViewActivity = (user: User) => {
    setSelectedUser(user);
    setShowUserActivityDialog(true);
  };

  const handleExportData = () => {
    const csvData = [
      ['Name', 'Email', 'Designation', 'Branch', 'Roles', 'Created'],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.designation,
        user.branch,
        user.roles?.join(', ') || 'user',
        new Date(user.created_at).toLocaleDateString()
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "User data has been exported successfully.",
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = filterBranch === "all" || user.branch === filterBranch;
    const matchesDesignation = filterDesignation === "all" || user.designation === filterDesignation;
    
    return matchesSearch && matchesBranch && matchesDesignation;
  });

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(ticketSearchTerm.toLowerCase()) ||
                         (ticket.description?.toLowerCase().includes(ticketSearchTerm.toLowerCase()) || false);
    const matchesStatus = ticketStatusFilter === "all" || ticket.status === ticketStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <AlertCircle className="h-4 w-4" />;
      case "in_progress": return <Clock className="h-4 w-4" />;
      case "resolved": return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "destructive";
      case "in_progress": return "default";
      case "resolved": return "secondary";
      default: return "outline";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
      case "urgent": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!isITStaff && !isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Access denied. This page is only available to IT staff and administrators.</p>
      </div>
    );
  }

  const itUsers = users.filter(u => u.designation === "IT" || u.roles?.includes('admin') || u.roles?.includes('it_staff'));

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            IT Management Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive system administration and analytics dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={() => setShowCreateUserDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Main Dashboard with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Tickets
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AnalyticsDashboard />
            </div>
            <div className="space-y-6">
              <QuickActionsPanel
                onCreateTicket={() => {}}
                onCreateUser={() => setShowCreateUserDialog(true)}
                onBulkActions={() => setShowBulkActionsDialog(true)}
                onExportData={handleExportData}
                onSystemSettings={() => {}}
              />
              <LiveActivityFeed />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
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
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{user.name}</h3>
                        {user.roles?.includes('admin') && <Badge variant="destructive">Admin</Badge>}
                        {user.roles?.includes('it_staff') && <Badge variant="default">IT Staff</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline">{user.designation}</Badge>
                        <Badge variant="secondary">{user.branch}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewActivity(user)}
                      >
                        Activity
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetPassword(user)}
                      >
                        Reset Password
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Ticket Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-2">
                        <h3 className="font-medium">{ticket.title}</h3>
                        <p className="text-sm text-muted-foreground">{ticket.description}</p>
                        <div className="flex gap-2">
                          <Badge variant={getStatusColor(ticket.status)}>
                            {getStatusIcon(ticket.status)}
                            <span className="ml-1">{formatStatus(ticket.status)}</span>
                          </Badge>
                          <Badge variant={getPriorityColor(ticket.priority)}>
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Created by: {profiles[ticket.created_by] || 'Unknown'}</p>
                          {ticket.assigned_to && <p>Assigned to: {profiles[ticket.assigned_to] || 'Unknown'}</p>}
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
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={ticket.assigned_to || "unassigned"}
                          onValueChange={(userId) => handleAssignTicket(ticket.id, userId)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Assign to..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {itUsers.map(user => (
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateUserDialog
        open={showCreateUserDialog}
        onClose={() => setShowCreateUserDialog(false)}
        onSuccess={fetchUsers}
      />

      {selectedUser && (
        <>
          <EditUserDialog
            open={showEditUserDialog}
            onClose={() => setShowEditUserDialog(false)}
            user={selectedUser}
            onSuccess={() => {
              setShowEditUserDialog(false);
              fetchUsers();
            }}
          />

          <ResetPasswordDialog
            open={showResetPasswordDialog}
            onClose={() => setShowResetPasswordDialog(false)}
            userEmail={selectedUser.email}
          />

          <UserActivityDialog
            open={showUserActivityDialog}
            onClose={() => setShowUserActivityDialog(false)}
            userId={selectedUser.user_id}
            userName={selectedUser.name}
          />
        </>
      )}

      <BulkActionsDialog
        open={showBulkActionsDialog}
        onClose={() => setShowBulkActionsDialog(false)}
        selectedTickets={selectedTickets}
        onSuccess={() => {
          setShowBulkActionsDialog(false);
          setSelectedTickets([]);
          fetchTickets();
        }}
      />
    </div>
  );
}
