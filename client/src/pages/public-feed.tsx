import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Filter, TrendingUp, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComplaintCard } from "@/components/complaint-card";
import { useToast } from "@/hooks/use-toast";
import { useZkIdentity } from "@/hooks/use-zk-identity";
import { apiRequest } from "@/lib/queryClient";

interface PublicComplaint {
  id: string;
  referenceId: string;
  topic: string;
  tags?: string[];
  priority: string;
  status: string;
  upvotes: number;
  submittedAt: string;
  blockchainHash?: string;
  isPublic: boolean;
  preview?: string;
}

const categoryFilters = [
  { value: "", label: "All Categories" },
  { value: "harassment", label: "Harassment" },
  { value: "discrimination", label: "Discrimination" },
  { value: "safety", label: "Public Safety" },
  { value: "corruption", label: "Corruption" },
  { value: "abuse", label: "Abuse" },
  { value: "legal", label: "Legal Issues" },
];

const statusFilters = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "review", label: "Under Review" },
  { value: "progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

const sortOptions = [
  { value: "recent", label: "Most Recent" },
  { value: "upvotes", label: "Most Upvoted" },
  { value: "urgent", label: "Most Urgent" },
];

export default function PublicFeedPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { generateProofForAction } = useZkIdentity();

  const [filters, setFilters] = useState({
    category: "",
    status: "",
    sort: "recent",
  });
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  const { data: complaintsData, isLoading } = useQuery({
    queryKey: ['/api/complaints', {
      isPublic: true,
      topic: filters.category,
      status: filters.status,
      limit,
      offset
    }],
    queryFn: async () => {
      const params = new URLSearchParams({
        isPublic: 'true',
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (filters.category) params.append('topic', filters.category);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/complaints?${params}`);
      if (!response.ok) throw new Error('Failed to fetch complaints');
      return await response.json();
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: async ({ complaintId }: { complaintId: string }) => {
      // Generate ZK proof for upvoting
      const zkProof = await generateProofForAction("upvote", complaintId);

      const response = await apiRequest("POST", `/api/complaints/${complaintId}/upvote`, {
        nullifierHash: zkProof.nullifierHash,
      });

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/complaints'] });
      toast({
        title: "Upvote Recorded",
        description: "Your support has been recorded anonymously",
      });
    },
    onError: (error) => {
      toast({
        title: "Upvote Failed",
        description: error.message || "You may have already upvoted this complaint",
        variant: "destructive",
      });
    },
  });

  const handleUpvote = (complaintId: string) => {
    upvoteMutation.mutate({ complaintId });
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setOffset(0); // Reset to first page when filtering
  };

  const loadMore = () => {
    setOffset(prev => prev + limit);
  };

  const complaints = complaintsData?.complaints || [];

  // Sort complaints based on selected option
  const sortedComplaints = [...complaints].sort((a, b) => {
    switch (filters.sort) {
      case 'upvotes':
        return b.upvotes - a.upvotes;
      case 'urgent':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
               (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      case 'recent':
      default:
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    }
  });

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 gradient-bg">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Community Voice
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Support others by viewing and upvoting public complaints. Every voice matters in building a safer community.
          </p>
        </div>

        {/* Filter Controls */}
        <Card className="shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Category
                </label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryFilters.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Status
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusFilters.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <Select
                  value={filters.sort}
                  onValueChange={(value) => handleFilterChange("sort", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complaints Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500 dark:text-gray-400">
                <Filter className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No complaints found</h3>
                <p>Try adjusting your filters to see more results.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onUpvote={handleUpvote}
                isUpvoting={upvoteMutation.isPending}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {complaints.length >= limit && (
          <div className="text-center mt-12">
            <Button
              onClick={loadMore}
              variant="outline"
              size="lg"
            >
              Load More Complaints
            </Button>
          </div>
        )}

        {/* Stats Summary */}
        {complaints.length > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {complaints.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Public Complaints
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {complaints.filter(c => c.status === 'resolved').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Resolved
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {complaints.reduce((sum, c) => sum + c.upvotes, 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Total Upvotes
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {complaints.filter(c => c.priority === 'urgent').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Urgent Cases
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}