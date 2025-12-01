import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, MessageCircle, Clock, CheckCircle, AlertCircle } from "lucide-react";
import CreateTicketDialog from "@/components/CreateTicketDialog";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  assigned_to: string | null;
  assignee?: {
    name: string;
  };
}

interface Comment {
  id: string;
  message: string;
  created_at: string;
  author_id: string;
  author?: {
    name: string;
  };
}

export default function MyTickets() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyTickets();
    }
  }, [user]);

  const fetchMyTickets = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("tickets")
      .select(`
        *,
        assignee:profiles!tickets_assigned_to_fkey(name)
      `)
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your tickets",
        variant: "destructive",
      });
    } else {
      setTickets(data || []);
    }
  };

  const fetchComments = async (ticketId: string) => {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        author:profiles!comments_author_id_fkey(name)
      `)
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch comments",
        variant: "destructive",
      });
    } else {
      setComments(prev => ({ ...prev, [ticketId]: data || [] }));
    }
  };

  const handleCreateTicket = async (ticketData: any) => {
    if (!user) return;

    const { error } = await supabase.from("tickets").insert({
      ...ticketData,
      created_by: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Ticket created successfully",
      });
      fetchMyTickets();
    }
  };

  const handleAddComment = async (ticketId: string) => {
    if (!user || !newComment.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("comments").insert({
      ticket_id: ticketId,
      message: newComment.trim(),
      author_id: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } else {
      setNewComment("");
      fetchComments(ticketId);
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    }
    setLoading(false);
  };

  const toggleComments = (ticketId: string) => {
    if (selectedTicket === ticketId) {
      setSelectedTicket(null);
    } else {
      setSelectedTicket(ticketId);
      if (!comments[ticketId]) {
        fetchComments(ticketId);
      }
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{ticket.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={getStatusColor(ticket.status)}>
                      {getStatusIcon(ticket.status)}
                      <span className="ml-1">{ticket.status}</span>
                    </Badge>
                    <Badge variant={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleComments(ticket.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Comments
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{ticket.description}</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Created: {new Date(ticket.created_at).toLocaleDateString()}</p>
                <p>Updated: {new Date(ticket.updated_at).toLocaleDateString()}</p>
                {ticket.assignee && (
                  <p>Assigned to: {ticket.assignee.name}</p>
                )}
              </div>

              {selectedTicket === ticket.id && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium mb-3">Comments</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {comments[ticket.id]?.map((comment) => (
                      <div key={comment.id} className="bg-muted p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">
                            {comment.author?.name || 'Unknown'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.message}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <Button 
                      onClick={() => handleAddComment(ticket.id)}
                      disabled={loading || !newComment.trim()}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {tickets.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">You haven't created any tickets yet.</p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="mt-4"
              >
                Create Your First Ticket
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateTicketDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}