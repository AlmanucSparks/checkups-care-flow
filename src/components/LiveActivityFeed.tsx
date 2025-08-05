import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { 
  MessageCircle, Ticket, UserPlus, Settings, Clock, 
  CheckCircle, AlertCircle, TrendingUp 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: 'ticket_created' | 'ticket_updated' | 'comment_added' | 'user_created';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  priority?: string;
  status?: string;
}

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
    
    // Set up real-time subscriptions
    const ticketsSubscription = supabase
      .channel('tickets-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tickets' },
        (payload) => {
          console.log('Ticket change:', payload);
          fetchRecentActivities();
        }
      )
      .subscribe();

    const commentsSubscription = supabase
      .channel('comments-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        (payload) => {
          console.log('Comment change:', payload);
          fetchRecentActivities();
        }
      )
      .subscribe();

    return () => {
      ticketsSubscription.unsubscribe();
      commentsSubscription.unsubscribe();
    };
  }, []);

  const fetchRecentActivities = async () => {
    try {
      const activities: ActivityItem[] = [];

      // Fetch recent tickets
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          id, title, status, priority, created_at, updated_at,
          creator:profiles!tickets_created_by_fkey(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!ticketsError && tickets) {
        tickets.forEach(ticket => {
          activities.push({
            id: `ticket-${ticket.id}`,
            type: 'ticket_created',
            title: 'New Ticket Created',
            description: ticket.title,
            user: ticket.creator?.name || 'Unknown User',
            timestamp: ticket.created_at,
            priority: ticket.priority,
            status: ticket.status
          });
        });
      }

      // Fetch recent comments
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id, message, created_at,
          author:profiles!comments_author_id_fkey(name),
          ticket:tickets(title)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!commentsError && comments) {
        comments.forEach(comment => {
          activities.push({
            id: `comment-${comment.id}`,
            type: 'comment_added',
            title: 'Comment Added',
            description: `"${comment.message.substring(0, 50)}..." on "${comment.ticket?.title}"`,
            user: comment.author?.name || 'Unknown User',
            timestamp: comment.created_at
          });
        });
      }

      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setActivities(activities.slice(0, 20));
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ticket_created':
        return <Ticket className="h-4 w-4 text-blue-600" />;
      case 'ticket_updated':
        return <Settings className="h-4 w-4 text-orange-600" />;
      case 'comment_added':
        return <MessageCircle className="h-4 w-4 text-green-600" />;
      case 'user_created':
        return <UserPlus className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Open': return 'destructive';
      case 'In Progress': return 'default';
      case 'Resolved': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Live Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Live Activity Feed
          <div className="ml-auto flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">
                        {activity.user.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{activity.user}</span>
                    {activity.status && (
                      <Badge variant={getStatusColor(activity.status)} className="text-xs">
                        {activity.status}
                      </Badge>
                    )}
                    {activity.priority && (
                      <Badge variant={getPriorityColor(activity.priority)} className="text-xs">
                        {activity.priority}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {activities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}