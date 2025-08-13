import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Copy, Download, ExternalLink, CheckCircle, Clock, Eye, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusTracker } from "@/components/status-tracker";
import { useToast } from "@/hooks/use-toast";
import { getBlockchainExplorerUrl } from "@/lib/blockchain";

interface ComplaintStatus {
  complaint: {
    referenceId: string;
    topic: string;
    status: string;
    priority: string;
    submittedAt: string;
    updatedAt: string;
    blockchainHash?: string;
    upvotes: number;
  };
  updates: Array<{
    message: string;
    updateType: string;
    createdAt: string;
  }>;
}

export default function StatusPage() {
  const { toast } = useToast();
  const [referenceId, setReferenceId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Get reference ID from URL params if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refFromUrl = urlParams.get('ref');
    if (refFromUrl) {
      setReferenceId(refFromUrl);
      setSearchQuery(refFromUrl);
    }
  }, []);

  const { data: complaintStatus, isLoading, error, refetch } = useQuery<ComplaintStatus>({
    queryKey: ['/api/complaints', searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/complaints/${searchQuery}`);
      if (!response.ok) {
        throw new Error('Complaint not found');
      }
      const result = await response.json();
      return result.data;
    },
    enabled: !!searchQuery,
    retry: false,
  });

  const handleSearch = () => {
    if (referenceId.trim()) {
      setSearchQuery(referenceId.trim());
    }
  };

  const copyReferenceId = () => {
    if (complaintStatus?.complaint.referenceId) {
      navigator.clipboard.writeText(complaintStatus.complaint.referenceId);
      toast({
        title: "Copied!",
        description: "Reference ID copied to clipboard",
      });
    }
  };

  const downloadReport = () => {
    if (complaintStatus) {
      const reportData = {
        referenceId: complaintStatus.complaint.referenceId,
        status: complaintStatus.complaint.status,
        submittedAt: complaintStatus.complaint.submittedAt,
        updates: complaintStatus.updates,
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `complaint-${complaintStatus.complaint.referenceId}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Report Downloaded",
        description: "Complaint report has been downloaded",
      });
    }
  };

  const viewOnBlockchain = () => {
    if (complaintStatus?.complaint.blockchainHash) {
      const explorerUrl = getBlockchainExplorerUrl(complaintStatus.complaint.blockchainHash);
      window.open(explorerUrl, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'review': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 gradient-bg">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Track Your Complaint Status
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Enter your complaint reference ID to check the current status and any updates
          </p>
        </div>

        <Card className="shadow-xl border border-gray-200 dark:border-gray-700 mb-8">
          <CardContent className="p-8">
            {/* Search Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Search className="w-4 h-4 inline mr-2" />
                Complaint Reference ID
              </label>
              <div className="flex space-x-3">
                <Input
                  type="text"
                  placeholder="Enter your complaint ID (e.g., SPK-2024-001234)"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="flex-1 font-mono"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isLoading}>
                  <Search className="w-4 h-4 mr-2" />
                  {isLoading ? "Searching..." : "Check Status"}
                </Button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                You received this ID when you submitted your complaint
              </p>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-800 dark:text-red-200">
                  Complaint not found. Please check your reference ID and try again.
                </p>
              </div>
            )}

            {/* Status Display */}
            {complaintStatus && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Complaint #{complaintStatus.complaint.referenceId}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Submitted on {new Date(complaintStatus.complaint.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={copyReferenceId}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy ID
                  </Button>
                </div>

                {/* Status Progress */}
                <StatusTracker status={complaintStatus.complaint.status} />

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Complaint Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Category:</span>
                        <span className="text-gray-900 dark:text-white capitalize">
                          {complaintStatus.complaint.topic}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Status:</span>
                        <Badge className={getStatusColor(complaintStatus.complaint.status)}>
                          {complaintStatus.complaint.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Priority:</span>
                        <Badge className={getPriorityColor(complaintStatus.complaint.priority)}>
                          {complaintStatus.complaint.priority}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Upvotes:</span>
                        <span className="text-gray-900 dark:text-white">
                          {complaintStatus.complaint.upvotes}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Verification Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Submitted:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(complaintStatus.complaint.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Last Updated:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(complaintStatus.complaint.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {complaintStatus.complaint.blockchainHash && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Blockchain Hash:</span>
                          <span className="text-gray-900 dark:text-white font-mono text-xs">
                            {complaintStatus.complaint.blockchainHash.substring(0, 10)}...
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 dark:text-green-400 text-xs">
                          Cryptographically Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Updates Timeline */}
                {complaintStatus.updates.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Recent Updates</h4>
                    <div className="space-y-4">
                      {complaintStatus.updates.map((update, index) => (
                        <div key={index} className="flex space-x-3">
                          <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {update.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(update.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blockchain Verification */}
                {complaintStatus.complaint.blockchainHash && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-300">
                            Blockchain Verified
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-400 font-mono">
                            Hash: {complaintStatus.complaint.blockchainHash.substring(0, 16)}...
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={viewOnBlockchain}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Chain
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={copyReferenceId}
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Reference ID
                  </Button>
                  <Button
                    variant="outline"
                    onClick={downloadReport}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                  {complaintStatus.complaint.blockchainHash && (
                    <Button
                      onClick={viewOnBlockchain}
                      className="flex-1 security-gradient"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Blockchain
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
