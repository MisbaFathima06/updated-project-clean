
export interface AuthorityDetails {
  name: string;
  contact: string;
  categories: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export const authorityDetails: Record<string, AuthorityDetails> = {
  'women_helpline': {
    name: 'Women Helpline',
    contact: '1091',
    categories: ['harassment', 'domestic_violence', 'sexual_assault'],
    urgency: 'critical',
    description: '24/7 helpline for women in distress'
  },
  'child_helpline': {
    name: 'Child Helpline',
    contact: '1098',
    categories: ['child_abuse', 'trafficking'],
    urgency: 'critical',
    description: 'Emergency helpline for children'
  },
  'police': {
    name: 'Police Emergency',
    contact: '100',
    categories: ['violence', 'theft', 'emergency'],
    urgency: 'critical',
    description: 'Police emergency services'
  },
  'anti_corruption': {
    name: 'Anti-Corruption Bureau',
    contact: '1031',
    categories: ['corruption', 'bribery'],
    urgency: 'high',
    description: 'Report corruption and bribery'
  },
  'cybercrime': {
    name: 'Cyber Crime Helpline',
    contact: '1930',
    categories: ['cybercrime', 'fraud'],
    urgency: 'high',
    description: 'Report cyber crimes and fraud'
  },
  'human_trafficking': {
    name: 'Anti-Human Trafficking Unit',
    contact: '1097',
    categories: ['trafficking', 'forced_labor'],
    urgency: 'critical',
    description: 'Report human trafficking cases'
  }
};

export const getAuthoritiesForCategory = (category: string) => {
  return Object.entries(authorityDetails)
    .filter(([_, details]) => details.categories.includes(category))
    .map(([name, details]) => ({ name, ...details }));
};

export const getUrgentAuthorities = () => {
  return Object.entries(authorityDetails)
    .filter(([_, details]) => details.urgency === 'critical' || details.urgency === 'high')
    .map(([name, details]) => ({ name, ...details }));
};
