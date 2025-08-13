import { useState } from "react";
import { Heart, ExternalLink, Clock, MapPin, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getBlockchainExplorerUrl } from "@/lib/blockchain";

interface ComplaintCardProps {
  complaint: {
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
  };
  onUpvote: (complaintId: string) => void;
  isUpvoting: boolean;
}

export function ComplaintCard({ complaint, onUpvote, isUpvoting }: ComplaintCardProps) {
  const { toast } = useToast();
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': 
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'review': 
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'progress': 
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'resolved': 
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: 
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': 
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'high': 
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium': 
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': 
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: 
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleUpvote = () => {
    if (hasUpvoted) {
      toast({
        title: "Already Upvoted",
        description: "You have already upvoted this complaint",
        variant: "destructive",
      });
      return;
    }

    onUpvote(complaint.id);
    setHasUpvoted(true);
  };

  const viewOnBlockchain = () => {
    if (complaint.blockchainHash) {
      const explorerUrl = getBlockchainExplorerUrl(complaint.blockchainHash);
      window.open(explorerUrl, '_blank');
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group hover:-translate-y-1">
      <CardHeader className="pb-3">
        {/* Header with badges and timestamp */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <Badge className={getPriorityColor(complaint.priority)}>
              {complaint.priority.toUpperCase()}
            </Badge>
            <Badge className={getStatusColor(complaint.status)}>
              {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {complaint.topic}
            </Badge>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            <Clock className="w-3 h-3 inline mr-1" />
            {getTimeAgo(complaint.submittedAt)}
          </span>
        </div>

        <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
          Anonymous Report #{complaint.referenceId.split('-').pop()}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Content Preview */}
        <div className="mb-4">
          {complaint.preview ? (
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
              {complaint.preview}
            </p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm italic">
              Encrypted content available to authorized NGO partners
            </p>
          )}
        </div>

        {/* Tags */}
        {complaint.tags && complaint.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {complaint.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-md text-xs"
              >
                {tag}
              </span>
            ))}
            {complaint.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs">
                +{complaint.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Verification Info */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-400">Blockchain Hash:</span>
            <span className="font-mono text-gray-900 dark:text-white">
              {complaint.blockchainHash ? 
                `${complaint.blockchainHash.substring(0, 8)}...${complaint.blockchainHash.substring(complaint.blockchainHash.length - 6)}` :
                'Pending verification'
              }
            </span>
          </div>
          <div className="flex items-center">
            <Shield className="w-3 h-3 text-green-500 mr-1" />
            <span className="text-green-600 dark:text-green-400 text-xs">
              {complaint.blockchainHash ? 'Cryptographically Verified' : 'Processing verification...'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant={hasUpvoted ? "default" : "outline"}
            size="sm"
            onClick={handleUpvote}
            disabled={isUpvoting || hasUpvoted}
            className={`flex items-center space-x-2 transition-all duration-200 ${
              hasUpvoted 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300"
            }`}
          >
            <Heart className={`w-4 h-4 ${hasUpvoted ? "fill-current" : ""}`} />
            <span className="font-medium">{complaint.upvotes}</span>
          </Button>

          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={viewOnBlockchain}
              disabled={!complaint.blockchainHash}
              className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            
            {complaint.priority === 'urgent' && (
              <div className="flex items-center text-red-500">
                <AlertTriangle className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Public indicator */}
        {complaint.isPublic && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Shield className="w-3 h-3 mr-1" />
              <span>Public complaint • Identity protected</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
