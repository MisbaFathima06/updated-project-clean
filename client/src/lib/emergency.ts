// Emergency alert system

export interface EmergencyAlert {
  id: string;
  contactNumbers: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  message: string;
  timestamp: number;
}

// Send emergency SMS using MSG91 API
export async function sendEmergencySMS(
  phoneNumbers: string[], 
  message: string, 
  location?: { latitude: number; longitude: number }
): Promise<void> {
  try {
    const MSG91_API_KEY = import.meta.env.VITE_MSG91_API_KEY || "your-msg91-api-key";
    const MSG91_SENDER_ID = import.meta.env.VITE_MSG91_SENDER_ID || "SPKSEC";

    let alertMessage = `🚨 EMERGENCY ALERT from SpeakSecure:\n${message}`;

    if (location) {
      alertMessage += `\n📍 Location: https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    }

    alertMessage += `\n\nThis is an automated emergency alert. Please respond immediately.`;

    for (const phoneNumber of phoneNumbers) {
      const smsData = {
        sender: MSG91_SENDER_ID,
        route: "4", // Transactional route
        country: "91", // India country code
        sms: [
          {
            message: alertMessage,
            to: [phoneNumber]
          }
        ]
      };

      const response = await fetch("https://api.msg91.com/api/v5/flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "authkey": MSG91_API_KEY,
        },
        body: JSON.stringify(smsData),
      });

      if (!response.ok) {
        console.error(`Failed to send SMS to ${phoneNumber}:`, await response.text());
      }
    }
  } catch (error) {
    console.error('Emergency SMS sending error:', error);
    throw new Error('Failed to send emergency SMS');
  }
}

// Get current location
export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

// Format emergency contact numbers
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Add country code if not present
  if (cleaned.length === 10 && !cleaned.startsWith('91')) {
    return '91' + cleaned;
  }

  return cleaned;
}

// Validate phone number
export function isValidPhoneNumber(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}