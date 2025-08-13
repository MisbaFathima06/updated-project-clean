import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Unlock, MessageSquare, BarChart3, Shield, AlertTriangle, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { encryptData } from "@/lib/encryption";
import { apiRequest } from "@/lib/queryClient";

interface PriorityComplaint {
  id: string;
  referenceId: string;
  topic: string;
  priority: string;
  status: string;
  submittedAt: string;
  isEmergency: boolean;
  emergencyContact?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  encryptedContent: string;
}

interface NgoStats {
  totalAssigned: number;
  pendingReview: number;
  inProgress: number;
  resolved: number;
  avgResponseTime: string;
}

export default function NgoPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedComplaint, setSelectedComplaint] = useState<PriorityComplaint | null>(null);
  const [response, setResponse] = useState("");
  const [responseType, setResponseType] = useState("advice");

  // Mock NGO stats - in real app, fetch from API
  const stats: NgoStats = {
    totalAssigned: 47,
    pendingReview: 12,
    inProgress: 23,
    resolved: 156,
    avgResponseTime: "2.4h"
  };

  // Fetch priority complaints
  const { data: priorityComplaints, isLoading } = useQuery({
    queryKey: ['/api/complaints', { priority: 'urgent,high', status: 'pending,review' }],
    queryFn: async () => {
      const response = await fetch('/api/complaints?priority=urgent&status=pending');
      if (!response.ok) throw new Error('Failed to fetch priority complaints');
      const data = await response.json();
      return data.complaints || [];
    },
  });

  // Send NGO response mutation
  const sendResponseMutation = useMutation({
    mutationFn: async ({ complaintId, responseText, type }: { 
      complaintId: string; 
      responseText: string; 
      type: string; 
    }) => {
      const encryptedResponse = encryptData(responseText);
      
      const response = await apiRequest("POST", "/api/ngo/responses", {
        complaintId,
        ngoId: "ngo-user-id", // In real app, get from auth context
        encryptedResponse: encryptedResponse.encryptedData,
        responseType: type,
        isUrgent: type === "emergency_response",
      });
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/complaints'] });
      toast({
        title: "Response Sent",
        description: "Your encrypted response has been sent to the complainant",
      });
      setResponse("");
      setSelectedComplaint(null);
    },
    onError: (error) => {
      toast({
        title: "Response Failed",
        description: error.message || "Failed to send response",
        variant: "destructive",
      });
    },
  });

  const handleSendResponse = () => {
    if (!selectedComplaint || !response.trim()) return;
    
    sendResponseMutation.mutate({
      complaintId: selectedComplaint.id,
      responseText: response,
      type: responseType,
    });
  };

  const initiateEmergencyResponse = (complaint: PriorityComplaint) => {
    // In real app, this would trigger emergency protocols
    toast({
      title: "Emergency Response Initiated",
      description: "Emergency protocols have been activated for this complaint",
    });
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const submitted = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const formatLocation = (lat: number, lng: number) => {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  const complaints = priorityComplaints || [];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 gradient-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            NGO Partner Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Decrypt and respond to complaints with specialized expertise
          </p>
          
          {/* NGO Authentication Status */}
          <div className="inline-flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg mt-4">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-green-700 dark:text-green-400 font-medium">
              Verified NGO Partner: Women's Rights Foundation
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stats.totalAssigned}
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">Total Assigned</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                {stats.pendingReview}
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">Pending Review</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {stats.inProgress}
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">In Progress</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                {stats.resolved}
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">Resolved</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                {stats.avgResponseTime}
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">Avg Response</div>
            </CardContent>
          </Card>
        </div>

        {/* NGO Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 security-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <Unlock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Decrypt Complaints
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Access encrypted complaint content with your NGO key
              </p>
              <Button className="w-full security-gradient">
                Access Encrypted Data
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 success-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Respond Securely
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Send encrypted responses back to complaint submitters
              </p>
              <Button className="w-full success-gradient">
                Send Response
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Impact Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Track resolution statistics and community impact
              </p>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                View Impact Data
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Priority Complaints */}
        <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Priority Complaints Requiring Attention</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 animate-pulse">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Priority Complaints
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All urgent complaints have been addressed. Great work!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint: PriorityComplaint) => (
                  <div key={complaint.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge className={complaint.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'}>
                          {complaint.priority.toUpperCase()}
                        </Badge>
                        <code className="text-sm font-mono text-gray-900 dark:text-white">
                          {complaint.referenceId}
                        </code>
                        <Badge variant="outline" className="capitalize">
                          {complaint.topic}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getTimeAgo(complaint.submittedAt)}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Unlock className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Encrypted Content Available
                          </span>
                        </div>
                        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                          This complaint contains encrypted details that require NGO decryption key to access.
                        </p>
                      </div>
                    </div>

                    {/* Emergency Contact Information */}
                    {complaint.isEmergency && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Emergency Contact Information:
                        </h4>
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                          {complaint.emergencyContact && (
                            <div className="flex items-center space-x-2 mb-2">
                              <Phone className="w-4 h-4 text-red-600" />
                              <span className="text-red-700 dark:text-red-300 font-mono text-sm">
                                {complaint.emergencyContact}
                              </span>
                            </div>
                          )}
                          {complaint.location && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-red-600" />
                              <span className="text-red-700 dark:text-red-300 text-sm">
                                {formatLocation(complaint.location.latitude, complaint.location.longitude)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="flex-1 security-gradient"
                            onClick={() => setSelectedComplaint(complaint)}
                          >
                            <Unlock className="w-4 h-4 mr-2" />
                            Decrypt & View Full Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Send Response</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Response Type
                              </label>
                              <Select value={responseType} onValueChange={setResponseType}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="advice">Advice & Guidance</SelectItem>
                                  <SelectItem value="referral">Service Referral</SelectItem>
                                  <SelectItem value="action_plan">Action Plan</SelectItem>
                                  <SelectItem value="emergency_response">Emergency Response</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Your Response
                              </label>
                              <Textarea
                                placeholder="Write your encrypted response to the complainant..."
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                rows={4}
                              />
                            </div>
                            
                            <div className="flex space-x-3">
                              <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => setSelectedComplaint(null)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                className="flex-1"
                                onClick={handleSendResponse}
                                disabled={!response.trim() || sendResponseMutation.isPending}
                              >
                                {sendResponseMutation.isPending ? "Sending..." : "Send Response"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {complaint.isEmergency && (
                        <Button
                          onClick={() => initiateEmergencyResponse(complaint)}
                          className="flex-1 emergency-gradient"
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Emergency Response
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <Clock className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
