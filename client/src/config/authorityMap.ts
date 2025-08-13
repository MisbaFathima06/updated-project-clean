
export const authorityMap = {
  "sexual-assault": ["Police", "Women NGO", "Crisis Helpline"],
  "workplace-harassment": ["HR Department", "Labour Commission", "Women's Cell"],
  "bullying": ["School Principal", "Education Department", "Anti-Bullying Committee"],
  "domestic-abuse": ["Police", "Women Helpline 181", "Protection Officer"],
  "cyber-harassment": ["Cybercrime Cell", "Helpline 1930"],
  "public-safety": ["Municipal Corporation", "Local Police"],
  "discrimination": ["Human Rights Commission", "Social Justice Department"],
  "corruption": ["Anti-Corruption Bureau", "Vigilance Department"],
  "safety": ["Emergency Services", "Local Authority"],
  "harassment": ["Police", "Human Rights Commission"],
  "abuse": ["Child Protection Services", "Police"],
  "legal": ["Legal Aid Services", "District Court"]
};

export const supportDirectory = {
  "child-abuse": ["Childline 1098", "Child Welfare Committee", "Education Department"],
  "elder-abuse": ["Senior Helpline", "Social Welfare Department", "Elder Care NGO"],
  "domestic-violence": ["Police", "Women Helpline 181", "Protection Officer"],
  "mental-health": ["Mental Health NGO", "Suicide Prevention Helpline", "Crisis Counselor"],
  "discrimination": ["Human Rights Commission", "Social Justice Department", "Legal Aid"],
  "school-neglect": ["School Principal", "Education Department", "Parent-Teacher Committee"],
  "online-threats": ["Cybercrime Cell", "Helpline 1930", "Digital Safety NGO"],
  "workplace-exploitation": ["Labour Commission", "Trade Union", "Workers Rights NGO"],
  "caste-discrimination": ["Human Rights Commission", "Social Justice Department", "Dalit Rights NGO"],
  "religious-discrimination": ["Human Rights Commission", "Minority Affairs", "Secular NGO"],
  "lgbtq-harassment": ["LGBTQ+ Support NGO", "Human Rights Commission", "Pride Helpline"],
  "financial-fraud": ["Economic Offences Wing", "Consumer Forum", "Banking Ombudsman"]
};

export const authorityDetails = {
  "Police": {
    phone: "100",
    email: "police@gov.in",
    type: "law-enforcement",
    urgency: "high"
  },
  "Women NGO": {
    phone: "181",
    email: "help@womenngo.org",
    type: "support-organization",
    urgency: "high"
  },
  "Childline 1098": {
    phone: "1098",
    email: "help@childline.in",
    type: "helpline",
    urgency: "critical"
  },
  "Cybercrime Cell": {
    phone: "1930",
    email: "cybercrime@police.gov.in",
    type: "law-enforcement",
    urgency: "medium"
  },
  "HR Department": {
    phone: "N/A",
    email: "hr@company.com",
    type: "internal",
    urgency: "medium"
  },
  "Human Rights Commission": {
    phone: "1800-11-4000",
    email: "complaints@nhrc.nic.in",
    type: "government",
    urgency: "low"
  },
  "Emergency Services": {
    phone: "112",
    email: "emergency@gov.in",
    type: "emergency",
    urgency: "critical"
  }
};

export const getAuthoritiesForCategory = (category: string): string[] => {
  return authorityMap[category as keyof typeof authorityMap] || 
         supportDirectory[category as keyof typeof supportDirectory] || 
         ["General Support", "Police"];
};

export const getAuthorityDetails = (authorityName: string) => {
  return authorityDetails[authorityName as keyof typeof authorityDetails] || {
    phone: "N/A",
    email: "support@authority.gov.in",
    type: "general",
    urgency: "medium"
  };
};

export const getUrgentAuthorities = () => {
  return Object.entries(authorityDetails)
    .filter(([_, details]) => details.urgency === "critical" || details.urgency === "high")
    .map(([name, _]) => name);
};
