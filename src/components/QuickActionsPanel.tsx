import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Users, Settings, BarChart3, Download, Upload,
  Zap, Shield, Bell, RefreshCw, Filter, Search
} from "lucide-react";

interface QuickActionsProps {
  onCreateTicket: () => void;
  onCreateUser: () => void;
  onBulkActions: () => void;
  onExportData: () => void;
  onSystemSettings: () => void;
}

export default function QuickActionsPanel({
  onCreateTicket,
  onCreateUser,
  onBulkActions,
  onExportData,
  onSystemSettings
}: QuickActionsProps) {
  const [notifications] = useState(3);

  const quickActions = [
    {
      title: "New Ticket",
      description: "Create a support ticket",
      icon: <Plus className="h-5 w-5" />,
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: onCreateTicket
    },
    {
      title: "Add User",
      description: "Create new user account",
      icon: <Users className="h-5 w-5" />,
      color: "bg-green-500 hover:bg-green-600",
      onClick: onCreateUser
    },
    {
      title: "Bulk Actions",
      description: "Manage multiple tickets",
      icon: <Zap className="h-5 w-5" />,
      color: "bg-purple-500 hover:bg-purple-600",
      onClick: onBulkActions
    },
    {
      title: "Export Data",
      description: "Download reports",
      icon: <Download className="h-5 w-5" />,
      color: "bg-orange-500 hover:bg-orange-600",
      onClick: onExportData
    }
  ];

  const systemActions = [
    {
      title: "System Health",
      status: "Excellent",
      color: "text-green-600",
      icon: <Shield className="h-4 w-4 text-green-600" />
    },
    {
      title: "Active Users",
      status: "24 online",
      color: "text-blue-600",
      icon: <Users className="h-4 w-4 text-blue-600" />
    },
    {
      title: "Notifications",
      status: `${notifications} new`,
      color: "text-orange-600",
      icon: <Bell className="h-4 w-4 text-orange-600" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className={`h-20 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-all duration-200 ${action.color} text-white border-none`}
                onClick={action.onClick}
              >
                {action.icon}
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemActions.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
                <Badge variant="outline" className={item.color}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-green-600" />
            Recent Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Filter className="h-4 w-4 mr-2" />
              Filter by High Priority
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Search className="h-4 w-4 mr-2" />
              Search IT Department
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Upload className="h-4 w-4 mr-2" />
              Import User Data
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              System Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}