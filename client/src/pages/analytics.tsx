import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { TrendingUp, Users, Clock, Shield, Filter, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsData {
  stats: {
    total: number;
    byStatus: Record<string, number>;
    byTopic: Record<string, number>;
    byPriority: Record<string, number>;
    resolutionRate: number;
  };
}

const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4'
};

export default function AnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState("30d");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics/stats', timePeriod, categoryFilter, statusFilter],
    queryFn: async () => {
      const response = await fetch('/api/analytics/stats');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return await response.json();
    },
  });

  const stats = analyticsData?.stats;

  // Prepare chart data
  const statusData = stats?.byStatus ? Object.entries(stats.byStatus).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    fill: status === 'resolved' ? COLORS.success : 
          status === 'progress' ? COLORS.secondary :
          status === 'review' ? COLORS.primary : COLORS.warning
  })) : [];

  const topicData = stats?.byTopic ? Object.entries(stats.byTopic).map(([topic, count]) => ({
    name: topic.charAt(0).toUpperCase() + topic.slice(1),
    value: count
  })) : [];

  const priorityData = stats?.byPriority ? Object.entries(stats.byPriority).map(([priority, count]) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    count: count,
    fill: priority === 'urgent' ? COLORS.danger :
          priority === 'high' ? COLORS.warning :
          priority === 'medium' ? COLORS.primary : COLORS.success
  })) : [];

  // Mock timeline data for trends
  const timelineData = [
    { month: 'Nov', submitted: 67, resolved: 45 },
    { month: 'Dec', submitted: 84, resolved: 62 },
    { month: 'Jan', submitted: 73, resolved: 58 },
    { month: 'Feb', submitted: 91, resolved: 71 },
  ];

  const keyMetrics = [
    {
      title: "Avg Resolution Time",
      value: "4.2 hours",
      icon: Clock,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Resolution Rate",
      value: `${stats?.resolutionRate?.toFixed(1) || 0}%`,
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "User Satisfaction",
      value: "4.7/5",
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "Active NGO Partners",
      value: "15",
      icon: Shield,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20"
    },
    {
      title: "Platform Trust Score",
      value: "97%",
      icon: Shield,
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-900/20"
    }
  ];

  const exportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      timePeriod,
      filters: { categoryFilter, statusFilter },
      analytics: stats
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${timePeriod}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 gradient-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Analytics & Insights
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Track community impact and platform effectiveness
          </p>
        </div>

        {/* Filters */}
        <Card className="shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Time Period
                </label>
                <Select value={timePeriod} onValueChange={setTimePeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 3 Months</SelectItem>
                    <SelectItem value="1y">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Category Filter
                </label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="discrimination">Discrimination</SelectItem>
                    <SelectItem value="safety">Public Safety</SelectItem>
                    <SelectItem value="corruption">Corruption</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status Filter
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="resolved">Resolved Only</SelectItem>
                    <SelectItem value="pending">Pending Only</SelectItem>
                    <SelectItem value="progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button onClick={exportData} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {keyMetrics.map((metric, index) => (
            <Card key={index} className="shadow-lg border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 ${metric.bg} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div className={`text-2xl font-bold ${metric.color} mb-2`}>
                  {metric.value}
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">
                  {metric.title}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Status Distribution Pie Chart */}
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Complaints by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Topic Distribution Bar Chart */}
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Complaints by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topicData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priorityData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Monthly Submission Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="submitted" stackId="1" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.6} />
                  <Area type="monotone" dataKey="resolved" stackId="1" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.8} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Resolution Timeline */}
        <Card className="shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <CardHeader>
            <CardTitle>Resolution Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="submitted" stroke={COLORS.primary} strokeWidth={3} dot={{ fill: COLORS.primary, strokeWidth: 2, r: 6 }} />
                <Line type="monotone" dataKey="resolved" stroke={COLORS.success} strokeWidth={3} dot={{ fill: COLORS.success, strokeWidth: 2, r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {stats && (
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {stats.total.toLocaleString()}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">Total Complaints</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {stats.resolutionRate.toFixed(1)}%
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">Resolution Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {(stats.byStatus.resolved || 0).toLocaleString()}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">Cases Resolved</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                    {(stats.byPriority.urgent || 0).toLocaleString()}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">Urgent Cases</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
