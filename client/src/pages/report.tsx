import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Shield, Mic, Upload, MapPin, AlertTriangle, Send, Check, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useZkIdentity } from "@/hooks/use-zk-identity";
import { useVoice } from "@/hooks/use-voice";
import { encryptData } from "@/lib/encryption";
import { uploadToIpfs } from "@/lib/ipfs";
import { generateHash, logComplaintToBlockchain } from "@/lib/blockchain";
import { getAuthoritiesForCategory, getAuthorityDetails } from "@/config/authorityMap";
import { apiRequest } from "@/lib/queryClient";

const complaintFormSchema = z.object({
  topic: z.string().min(1, "Please select a topic"),
  complaint: z.string().min(10, "Complaint must be at least 10 characters"),
  tags: z.array(z.string()).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  isPublic: z.boolean().default(false),
  isEmergency: z.boolean().default(false),
  includeLocation: z.boolean().default(false),
  emergencyContact: z.string().optional(),
  selectedAuthorities: z.array(z.string()).min(1, "Please select at least one authority"),
});

type ComplaintFormData = z.infer<typeof complaintFormSchema>;

const complaintCategories = [
  { value: "harassment", label: "Workplace Harassment" },
  { value: "abuse", label: "Physical/Mental Abuse" },
  { value: "discrimination", label: "Discrimination" },
  { value: "corruption", label: "Corruption" },
  { value: "safety", label: "Public Safety" },
  { value: "legal", label: "Legal Issues" },
  { value: "other", label: "Other" },
];

export default function ReportPage() {
  const { toast } = useToast();
  const { identity, generateIdentity, generateProofForAction } = useZkIdentity();
  const { isRecording, transcript, startRecording, stopRecording, clearTranscript } = useVoice();
  const [files, setFiles] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [submittedComplaint, setSubmittedComplaint] = useState<{ referenceId: string; status: string } | null>(null);

  const form = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      topic: "",
      complaint: "",
      tags: [],
      priority: "medium",
      isPublic: false,
      isEmergency: false,
      includeLocation: false,
      emergencyContact: "",
      selectedAuthorities: [],
    },
  });

  const submitComplaintMutation = useMutation({
    mutationFn: async (data: ComplaintFormData) => {
      // Ensure ZK identity exists
      if (!identity) {
        await generateIdentity();
      }

      // Generate ZK proof for complaint submission
      const zkProof = await generateProofForAction("complaint_submission", data.topic);

      // Encrypt complaint content
      const complaintData = {
        complaint: data.complaint,
        tags: data.tags,
        attachments: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
        timestamp: new Date().toISOString(),
      };

      const encryptedContent = encryptData(JSON.stringify(complaintData));

      // Upload encrypted content to IPFS
      const ipfsResult = await uploadToIpfs(encryptedContent.encryptedData);

      // Generate hash for blockchain logging
      const complaintHash = generateHash(encryptedContent.encryptedData);

      // Get location if requested
      let location = null;
      if (data.includeLocation && navigator.geolocation) {
        location = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
            reject
          );
        });
      }

      // Submit to backend
      const response = await apiRequest("/complaints", {
        method: "POST",
        body: JSON.stringify({
        topic: data.topic,
        tags: tags,
        encryptedContent: encryptedContent.encryptedData,
        ipfsCid: ipfsResult.cid,
        nullifierHash: zkProof.nullifierHash,
        isPublic: data.isPublic,
        isEmergency: data.isEmergency,
        priority: data.isEmergency ? "urgent" : data.priority,
        emergencyContact: data.emergencyContact,
        location,
        selectedAuthorities: data.selectedAuthorities,
        })
      });

      const result = await response.json();

      // Log to blockchain
      const blockchainResult = await logComplaintToBlockchain(complaintHash);

      return {
        ...result,
        blockchainHash: complaintHash,
        transactionHash: blockchainResult,
      };
    },
    onSuccess: (data) => {
      setSubmittedComplaint({
        referenceId: data.complaint.referenceId,
        status: data.complaint.status,
      });
      toast({
        title: "Complaint Submitted Successfully",
        description: `Your complaint has been submitted with reference ID: ${data.complaint.referenceId}`,
      });
      form.reset();
      setFiles([]);
      setTags([]);
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit complaint. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = selectedFiles.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags(prev => [...prev, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const insertVoiceTranscript = () => {
    const currentValue = form.getValues("complaint");
    form.setValue("complaint", currentValue + " " + transcript);
    clearTranscript();
  };

  if (submittedComplaint) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border border-green-200 dark:border-green-800">
            <CardHeader className="text-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Check className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-green-800 dark:text-green-200">
                Complaint Submitted Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Your complaint has been encrypted, stored securely, and logged to the blockchain.
                </p>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reference ID:</span>
                    <code className="text-lg font-mono font-bold text-primary-600 dark:text-primary-400">
                      {submittedComplaint.referenceId}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => navigator.clipboard.writeText(submittedComplaint.referenceId)}
                  >
                    Copy Reference ID
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">Encrypted</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Mic className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-purple-800 dark:text-purple-200">IPFS Stored</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-green-800 dark:text-green-200">Blockchain Logged</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild className="flex-1">
                    <a href={`/status?ref=${submittedComplaint.referenceId}`}>
                      Track Status
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSubmittedComplaint(null)}
                  >
                    Submit Another
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 gradient-bg">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Submit Your Report
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Your identity remains completely anonymous. All data is encrypted before transmission.
          </p>

          <div className="inline-flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-green-700 dark:text-green-400 font-medium">
              Zero-Knowledge Identity Active
            </span>
          </div>
        </div>

        <Card className="shadow-2xl border border-gray-200 dark:border-gray-700">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => submitComplaintMutation.mutate(data))} className="space-y-6">

                {/* Category Selection */}
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Complaint Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {complaintCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags */}
                <div className="space-y-3">
                  <FormLabel className="text-base font-medium">Tags (helps categorize your complaint)</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {tag}
                        <button
                          type="button"
                          className="ml-2 text-gray-500 hover:text-gray-700"
                          onClick={() => removeTag(tag)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tags (e.g., hostel, teacher, mental, urgent)"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                </div>

                {/* Complaint Text */}
                <FormField
                  control={form.control}
                  name="complaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Your Complaint</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            placeholder="Describe your complaint in detail. Your identity is protected..."
                            className="min-h-32 resize-none"
                            {...field}
                          />
                          <div className="absolute bottom-3 right-3 flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant={isRecording ? "destructive" : "secondary"}
                              onClick={isRecording ? stopRecording : startRecording}
                            >
                              <Mic className="w-4 h-4 mr-1" />
                              {isRecording ? "Stop" : "Voice"}
                            </Button>
                            {transcript && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={insertVoiceTranscript}
                              >
                                Insert
                              </Button>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      {transcript && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Voice transcript: {transcript}
                          </p>
                        </div>
                      )}
                      <FormDescription>
                        Click the microphone to use voice input. All text is encrypted before submission.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File Attachments */}
                <div className="space-y-3">
                  <FormLabel className="text-base font-medium">Evidence (Optional)</FormLabel>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      Supports: Images, Documents, Audio (Max 10MB per file)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button type="button" variant="outline" asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Choose Files
                      </label>
                    </Button>
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Public Complaint Option */}
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="text-base font-medium">
                              Make this complaint public
                            </FormLabel>
                            <FormDescription>
                              Allow others to see this complaint (your identity remains anonymous)
                            </FormDescription>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Emergency Option */}
                  <FormField
                    control={form.control}
                    name="isEmergency"
                    render={({ field }) => (
                      <FormItem className="p-4 border border-red-200 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20">
                        <div className="flex items-start space-x-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="text-base font-medium text-red-900 dark:text-red-200">
                              <AlertTriangle className="w-4 h-4 inline mr-1" />
                              This is an emergency
                            </FormLabel>
                            <FormDescription className="text-red-700 dark:text-red-300">
                              Immediate assistance required
                            </FormDescription>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Emergency Contact */}
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-red-500" />
                        Emergency Contact (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Emergency contact number or email"
                          className="border-gray-300 dark:border-gray-600"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-500">
                        For urgent cases, provide emergency contact details
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {/* Authority Selection */}
                {form.watch("topic") && (
                  <FormField
                    control={form.control}
                    name="selectedAuthorities"
                    render={({ field }) => {
                      const availableAuthorities = getAuthoritiesForCategory(form.watch("topic"));
                      return (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-sm font-medium flex items-center">
                            <Shield className="w-4 h-4 mr-2 text-blue-500" />
                            Select Authorities to Notify
                          </FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {availableAuthorities.map((authority) => {
                              const details = getAuthorityDetails(authority);
                              return (
                                <div
                                  key={authority}
                                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                    field.value?.includes(authority)
                                      ? "border-primary bg-primary/5"
                                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                  }`}
                                  onClick={() => {
                                    const current = field.value || [];
                                    if (current.includes(authority)) {
                                      field.onChange(current.filter(a => a !== authority));
                                    } else {
                                      field.onChange([...current, authority]);
                                    }
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium text-sm">{authority}</p>
                                      <p className="text-xs text-gray-500">{details.phone}</p>
                                    </div>
                                    <div className="flex items-center">
                                      {details.urgency === "critical" && (
                                        <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                                      )}
                                      <input
                                        type="checkbox"
                                        checked={field.value?.includes(authority)}
                                        onChange={() => {}}
                                        className="rounded"
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <FormDescription className="text-xs text-gray-500">
                            Select the authorities who should receive and handle your complaint
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                )}

                {/* Location Option */}
                <FormField
                  control={form.control}
                  name="includeLocation"
                  render={({ field }) => (
                    <FormItem className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="flex-1">
                          <FormLabel className="text-base font-medium">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Include my current location
                          </FormLabel>
                          <FormDescription>
                            Help authorities understand the geographic context (location is encrypted)
                          </FormDescription>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                {/* ZK Proof Status */}
                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-primary-900 dark:text-primary-200 font-medium">
                        Zero-Knowledge Proof Ready
                      </span>
                    </div>
                    {identity && (
                      <span className="text-xs text-primary-600 dark:text-primary-400 font-mono">
                        commitment: {identity.commitment.substring(0, 8)}...
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-primary-700 dark:text-primary-300 mt-2">
                    Your anonymous identity is verified and ready for submission
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full py-4 security-gradient text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                    disabled={submitComplaintMutation.isPending}
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {submitComplaintMutation.isPending ? "Submitting..." : "Submit Secure Report"}
                  </Button>
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Your complaint will be encrypted, hashed, and stored on IPFS with blockchain verification
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}