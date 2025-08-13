import { useState } from "react";
import { AlertTriangle, Phone, MapPin, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEmergency } from "@/hooks/use-emergency";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function EmergencyModal() {
  const { isEmergencyModalOpen, closeEmergencyModal } = useEmergency();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [includeLocation, setIncludeLocation] = useState(false);
  const [contactNumber, setContactNumber] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendAlert = async () => {
    if (!contactNumber.trim()) {
      toast({
        title: "Contact Required",
        description: "Please provide an emergency contact number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let location = null;
      if (includeLocation && navigator.geolocation) {
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

      const response = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintId: null, // Can be set if emergency is related to existing complaint
          contactNumbers: [contactNumber],
          location,
          message: description || "Emergency alert sent from SpeakSecure platform",
        }),
      });

      if (response.ok) {
        toast({
          title: "Emergency Alert Sent",
          description: "Your emergency alert has been sent successfully. Help is on the way.",
        });
        closeEmergencyModal();
        setContactNumber("");
        setDescription("");
        setIncludeLocation(false);
      } else {
        throw new Error("Failed to send emergency alert");
      }
    } catch (error) {
      console.error("Emergency alert error:", error);
      toast({
        title: "Alert Failed",
        description: "Failed to send emergency alert. Please try again or call emergency services directly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isEmergencyModalOpen} onOpenChange={closeEmergencyModal}>
      <DialogContent className="sm:max-w-md border-red-500">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <span>{t('emergency.title')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-red-700 dark:text-red-300 text-sm">
            {t('emergency.description')}
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <Checkbox
                id="includeLocation"
                checked={includeLocation}
                onCheckedChange={setIncludeLocation}
              />
              <label htmlFor="includeLocation" className="text-sm font-medium text-red-900 dark:text-red-200">
                <div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>Share my location</span>
                  </div>
                  <p className="text-xs text-red-700 dark:text-red-300">Help responders find you quickly</p>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Emergency Contact Number *
              </label>
              <Input
                type="tel"
                placeholder="+91 9876543210"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="border-red-300 dark:border-red-600 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brief Description (Optional)
              </label>
              <Textarea
                placeholder="Describe your emergency situation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="border-red-300 dark:border-red-600 focus:ring-red-500 resize-none"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={closeEmergencyModal}
              className="flex-1"
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSendAlert}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? "Sending..." : "Send Alert"}
            </Button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            🔒 All emergency data is encrypted and stored securely
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}