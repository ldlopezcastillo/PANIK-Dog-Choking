// ════════════════════════════════════════════════════════════════
// DIRECTORIO DE EMERGENCIAS — CONFIGURACIÓN CENTRALIZADA
// ════════════════════════════════════════════════════════════════
// Edita esta lista para adaptar PANIK a otra ciudad o país.
// Cada contacto requiere: name, phone, desc.
// El campo "phone" debe incluir el formato visible (con espacios);
// el enlace tel: se genera automáticamente removiendo espacios.
// ════════════════════════════════════════════════════════════════

export interface EmergencyContact {
  name: string;
  phone: string;
  desc: string;
}

export interface DirectoryConfig {
  region: string;          // Nombre de la región/ciudad mostrado en UI
  contacts: EmergencyContact[];
}

export const EMERGENCY_DIRECTORY: DirectoryConfig = {
  region: "CDMX",
  contacts: [
    {
      name: "VetEmergencias (Lomas)",
      phone: "55 5540 0757",
      desc: "Atención crítica 24 horas."
    },
    {
      name: "Hospital Veterinario UNAM",
      phone: "55 5622 5860",
      desc: "Especialistas y urgencias CDMX."
    },
    {
      name: "Animal House (Del Valle)",
      phone: "55 5543 5050",
      desc: "Hospital veterinario 24/7."
    },
    {
      name: "VCA Vetcare (Polanco)",
      phone: "55 5280 0200",
      desc: "Urgencias y cuidados intensivos."
    },
    {
      name: "Clínica Veterinaria Pedregal",
      phone: "55 5611 3535",
      desc: "Urgencias generales y hospitalización."
    },
    {
      name: "Locatel CDMX",
      phone: "800 727 4770",
      desc: "Directorio veterinario y apoyo de emergencias."
    },
    {
      name: "Emergencias Nacionales",
      phone: "911",
      desc: "Línea de auxilio general."
    }
  ]
};

// Helper para generar el href tel: a partir del teléfono visible
export const toTelHref = (phone: string): string => `tel:${phone.replace(/\s/g, "")}`;
