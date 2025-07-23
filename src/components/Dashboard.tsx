import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Ticket, Clock, AlertCircle, CheckCircle } from "lucide-react";
import CreateTicketDialog from "./CreateTicketDialog";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Urgent";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo?: string;
}

interface DashboardProps {
  user: {
    id: string;
    name: string;
    designation: string;
    branch: string;
  };
}

const mockTickets: Ticket[] = [
  {
    id: "1",
    title: "Computer won't start",
    description: "My workstation won't boot up this morning",
    status: "Open",
    priority: "High",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
    createdBy: "Dr. Sarah Johnson"
  },
  {
    id: "2",
    title: "Printer not working",
    description: "The printer in the pharmacy is not responding",
    status: "In Progress",
    priority: "Medium",
    createdAt: "2024-01-14T14:30:00Z",
    updatedAt: "2024-01-15T09:15:00Z",
    createdBy: "John Pharmacist",
    assignedTo: "Vincent IT"
  }
];

export default function Dashboard({ user }: DashboardProps) {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open": return <Clock className="h-4 w-4" />;
      case "In Progress": return <AlertCircle className="h-4 w-4" />;
      case "Resolved": return <CheckCircle className="h-4 w-4" />;
      case "Closed": return <CheckCircle className="h-4 w-4" />;
      default: return <Ticket className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "secondary";
      case "In Progress": return "default";
      case "Resolved": return "outline";
      case "Closed": return "outline";
      default: return "secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low": return "outline";
      case "Medium": return "secondary";
      case "High": return "destructive";
      case "Urgent": return "destructive";
      default: return "secondary";
    }
  };

  const handleCreateTicket = (ticketData: any) => {
    const newTicket: Ticket = {
      id: Date.now().toString(),
      ...ticketData,
      status: "Open" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.name
    };
    setTickets([newTicket, ...tickets]);
    setShowCreateDialog(false);
  };

  const userTickets = tickets.filter(ticket => ticket.createdBy === user.name);
  const allTickets = user.designation === 'IT' ? tickets : userTickets;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {user.designation === 'IT' ? 'IT Dashboard' : 'My Support Tickets'}
          </h1>
          <p className="text-muted-foreground">
            {user.designation === 'IT' 
              ? 'Manage all support requests across the organization'
              : 'View and manage your IT support requests'
            }
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Ticket</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allTickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allTickets.filter(t => t.status === "Open").length}
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
              {allTickets.filter(t => t.status === "In Progress").length}
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
              {allTickets.filter(t => t.status === "Resolved").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
          <CardDescription>
            {user.designation === 'IT' 
              ? 'All support tickets in the system'
              : 'Your support ticket history'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allTickets.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No tickets yet</h3>
                <p className="text-muted-foreground">Create your first support ticket to get started.</p>
              </div>
            ) : (
              allTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(ticket.status)}
                    <div>
                      <h4 className="font-medium">{ticket.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Created by {ticket.createdBy} • {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                    <Badge variant={getStatusColor(ticket.status)}>
                      {ticket.status}
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
    </div>
  );
}