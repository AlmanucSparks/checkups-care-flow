import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Activity, Clock, MessageCircle, Ticket } from "lucide-react";

interface UserActivityDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

interface UserActivity {
  tickets_created: number;
  tickets_assigned: number;
  comments_made: number;
  last_activity: string | null;
  recent_tickets: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    created_at: string;
  }>;
}

export default function UserActivityDialog({ open, onClose, userId, userName }: UserActivityDialogProps) {
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && userId) {
      fetchUserActivity();
    }
  }, [open, userId]);

  const fetchUserActivity = async () => {
    setLoading(true);
    try {
      // Fetch tickets created by user
      const { data: createdTickets, error: createdError } = await supabase
        .from('tickets')
        .select('id, title, status, priority, created_at')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (createdError) throw createdError;

      // Fetch tickets assigned to user
      const { data: assignedTickets, error: assignedError } = await supabase
        .from('tickets')
        .select('id')
        .eq('assigned_to', userId);

      if (assignedError) throw assignedError;

      // Fetch comments made by user
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id, created_at')
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (commentsError) throw commentsError;

      // Count total comments
      const { count: commentsCount, error: commentsCountError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId);

      if (commentsCountError) throw commentsCountError;

      setActivity({
        tickets_created: createdTickets?.length || 0,
        tickets_assigned: assignedTickets?.length || 0,
        comments_made: commentsCount || 0,
        last_activity: comments?.[0]?.created_at || createdTickets?.[0]?.created_at || null,
        recent_tickets: createdTickets?.slice(0, 5) || [],
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch user activity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {userName}'s Activity
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : activity ? (
          <div className="space-y-6">
            {/* Activity Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    Created
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activity.tickets_created}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Assigned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activity.tickets_assigned}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Comments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activity.comments_made}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Last Active
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {activity.last_activity 
                      ? new Date(activity.last_activity).toLocaleDateString()
                      : "Never"
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Tickets */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activity.recent_tickets.length > 0 ? (
                    activity.recent_tickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm">{ticket.title}</h4>
                          <div className="flex gap-2">
                            <Badge variant={getStatusColor(ticket.status)} className="text-xs">
                              {ticket.status}
                            </Badge>
                            <Badge variant={getPriorityColor(ticket.priority)} className="text-xs">
                              {ticket.priority}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No tickets created yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">No activity data available</div>
        )}
      </DialogContent>
    </Dialog>
  );
}