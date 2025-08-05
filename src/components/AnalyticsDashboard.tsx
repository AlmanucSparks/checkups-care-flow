import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from "recharts";
import { 
  TrendingUp, TrendingDown, Users, Clock, CheckCircle, AlertTriangle,
  Activity, Target, Zap, Award, Calendar, MapPin
} from "lucide-react";

interface AnalyticsData {
  ticketsByStatus: Array<{ name: string; value: number; color: string }>;
  ticketsByPriority: Array<{ name: string; value: number; color: string }>;
  ticketsByBranch: Array<{ name: string; value: number }>;
  ticketsByDesignation: Array<{ name: string; value: number }>;
  weeklyTrend: Array<{ day: string; tickets: number; resolved: number }>;
  responseMetrics: {
    avgResponseTime: number;
    resolutionRate: number;
    customerSatisfaction: number;
    activeTickets: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch tickets with related data
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          *,
          creator:profiles!tickets_created_by_fkey(designation, branch),
          assignee:profiles!tickets_assigned_to_fkey(designation, branch)
        `);

      if (error) throw error;

      // Process data for charts
      const statusData = [
        { name: 'Open', value: tickets?.filter(t => t.status === 'Open').length || 0, color: '#ef4444' },
        { name: 'In Progress', value: tickets?.filter(t => t.status === 'In Progress').length || 0, color: '#f59e0b' },
        { name: 'Resolved', value: tickets?.filter(t => t.status === 'Resolved').length || 0, color: '#10b981' },
        { name: 'Closed', value: tickets?.filter(t => t.status === 'Closed').length || 0, color: '#6b7280' }
      ];

      const priorityData = [
        { name: 'Low', value: tickets?.filter(t => t.priority === 'Low').length || 0, color: '#10b981' },
        { name: 'Medium', value: tickets?.filter(t => t.priority === 'Medium').length || 0, color: '#f59e0b' },
        { name: 'High', value: tickets?.filter(t => t.priority === 'High').length || 0, color: '#ef4444' },
        { name: 'Urgent', value: tickets?.filter(t => t.priority === 'Urgent').length || 0, color: '#dc2626' }
      ];

      // Branch distribution
      const branchCounts = tickets?.reduce((acc: any, ticket) => {
        const branch = ticket.creator?.branch || 'Unknown';
        acc[branch] = (acc[branch] || 0) + 1;
        return acc;
      }, {});

      const branchData = Object.entries(branchCounts || {}).map(([name, value]) => ({
        name,
        value: value as number
      }));

      // Designation distribution
      const designationCounts = tickets?.reduce((acc: any, ticket) => {
        const designation = ticket.creator?.designation || 'Unknown';
        acc[designation] = (acc[designation] || 0) + 1;
        return acc;
      }, {});

      const designationData = Object.entries(designationCounts || {}).map(([name, value]) => ({
        name,
        value: value as number
      })).slice(0, 8); // Top 8 designations

      // Weekly trend (mock data for now)
      const weeklyTrend = [
        { day: 'Mon', tickets: 12, resolved: 8 },
        { day: 'Tue', tickets: 19, resolved: 15 },
        { day: 'Wed', tickets: 15, resolved: 12 },
        { day: 'Thu', tickets: 22, resolved: 18 },
        { day: 'Fri', tickets: 18, resolved: 14 },
        { day: 'Sat', tickets: 8, resolved: 6 },
        { day: 'Sun', tickets: 5, resolved: 4 }
      ];

      const responseMetrics = {
        avgResponseTime: 2.4, // hours
        resolutionRate: 85,
        customerSatisfaction: 4.2,
        activeTickets: tickets?.filter(t => t.status !== 'Closed' && t.status !== 'Resolved').length || 0
      };

      setAnalytics({
        ticketsByStatus: statusData,
        ticketsByPriority: priorityData,
        ticketsByBranch: branchData,
        ticketsByDesignation: designationData,
        weeklyTrend,
        responseMetrics
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Active Tickets</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{analytics.responseMetrics.activeTickets}</div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+12% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Resolution Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{analytics.responseMetrics.resolutionRate}%</div>
            <Progress value={analytics.responseMetrics.resolutionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{analytics.responseMetrics.avgResponseTime}h</div>
            <div className="flex items-center text-xs text-orange-600 mt-1">
              <TrendingDown className="h-3 w-3 mr-1" />
              <span>-8% improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Satisfaction</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{analytics.responseMetrics.customerSatisfaction}/5</div>
            <div className="flex mt-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full mr-1 ${
                    i < Math.floor(analytics.responseMetrics.customerSatisfaction)
                      ? 'bg-purple-500'
                      : 'bg-purple-200'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Tickets by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.ticketsByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.ticketsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Priority Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.ticketsByPriority}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {analytics.ticketsByPriority.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Weekly Ticket Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analytics.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="tickets"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                    name="New Tickets"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stackId="2"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.6}
                    name="Resolved"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  Tickets by Branch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.ticketsByBranch} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Top Designations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.ticketsByDesignation.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <Badge variant="secondary">{item.value}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <CardHeader>
                <CardTitle className="text-indigo-700 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-indigo-600">First Response</span>
                  <Badge className="bg-indigo-200 text-indigo-800">1.2h avg</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-indigo-600">Resolution Time</span>
                  <Badge className="bg-indigo-200 text-indigo-800">4.8h avg</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-indigo-600">Reopened Rate</span>
                  <Badge className="bg-indigo-200 text-indigo-800">3.2%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
              <CardHeader>
                <CardTitle className="text-teal-700">Team Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-teal-600">IT Team Efficiency</span>
                    <span className="text-teal-800">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-teal-600">User Satisfaction</span>
                    <span className="text-teal-800">88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-teal-600">SLA Compliance</span>
                    <span className="text-teal-800">95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
              <CardHeader>
                <CardTitle className="text-rose-700">Alert Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-rose-600">3 High Priority Tickets</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-rose-600">5 Overdue Tickets</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-rose-600">2 Unassigned Tickets</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}