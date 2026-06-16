// ════════════════════════════════════════════════════════════════
// EMERGENCY DIRECTORY — CENTRALIZED CONFIGURATION
// ════════════════════════════════════════════════════════════════
// Edit this list to adapt PANIK to another city or country.
// Each contact requires: name, phone, desc.
// The "phone" field should include the visible format (with spaces);
// the tel: link is generated automatically by removing spaces.
// ════════════════════════════════════════════════════════════════

export interface EmergencyContact {
  name: string;
  phone: string;
  desc: string;
}

export interface DirectoryConfig {
  region: string;          // Region/city name shown in UI
  contacts: EmergencyContact[];
}

export const EMERGENCY_DIRECTORY: DirectoryConfig = {
  region: "USA",
  contacts: [
    {
      name: "ASPCA Animal Poison Control",
      phone: "888 426 4435",
      desc: "24/7 animal poison & emergency hotline."
    },
    {
      name: "Pet Poison Helpline",
      phone: "855 764 7661",
      desc: "24/7 veterinary toxicology support."
    },
    {
      name: "VCA Animal Hospitals",
      phone: "800 822 7387",
      desc: "Nationwide 24-hour emergency veterinary care."
    },
    {
      name: "BluePearl Pet Hospital",
      phone: "844 728 3223",
      desc: "Emergency & specialty vet care, multiple locations."
    },
    {
      name: "Banfield Pet Hospital",
      phone: "888 649 2716",
      desc: "Urgent care and wellness — nationwide locations."
    },
    {
      name: "Emergency Services",
      phone: "911",
      desc: "General emergency line — fire, police, EMS."
    }
  ]
};

// Helper to generate tel: href from visible phone number
export const toTelHref = (phone: string): string => `tel:${phone.replace(/\s/g, "")}`;