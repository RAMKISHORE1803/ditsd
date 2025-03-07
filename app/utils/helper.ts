"use client";

// Helper to parse WKB/PostGIS point
export function parseWKBPoint(wkbPoint: string): [number, number] {
  try {
    // If it's a string that looks like POINT(lon lat)
    if (typeof wkbPoint === 'string' && wkbPoint.startsWith('POINT')) {
      const match = wkbPoint.match(/POINT\(([^ ]+) ([^ ]+)\)/);
      if (match) {
        return [parseFloat(match[1]), parseFloat(match[2])];
      }
    }
  } catch (e) {
    console.error('Error parsing WKB Point:', e);
  }
  
  // For binary WKB or other formats, return default coordinates for Kampala
  return [32.5811, 0.3136]; // Default to Kampala coordinates
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  
  // Convert to seconds, minutes, hours, days
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  } else if (diffHours > 0) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffMins > 0) {
    return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
  } else {
    return 'just now';
  }
}

// Selection options for forms
export const getSchoolLevelOptions = () => [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "university", label: "University" },
  { value: "vocational", label: "Vocational" }
];

export const getSchoolTypeOptions = () => [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "community", label: "Community" }
];

export const getHospitalTypeOptions = () => [
  { value: "national", label: "National Referral" },
  { value: "regional", label: "Regional Referral" },
  { value: "district", label: "District Hospital" },
  { value: "private", label: "Private Hospital" },
  { value: "clinic", label: "Clinic/Health Center" }
];

export const getTowerStatusOptions = () => [
  { value: "active", label: "Active" },
  { value: "maintenance", label: "Maintenance" },
  { value: "inactive", label: "Inactive" }
];

export const getTowerTypeOptions = () => [
  { value: "cellular", label: "Cellular" },
  { value: "microwave", label: "Microwave" },
  { value: "satellite", label: "Satellite" },
  { value: "fiber_node", label: "Fiber Node" }
];

export const getConnectionTypeOptions = () => [
  { value: "fiber", label: "Fiber" },
  { value: "4g", label: "4G" },
  { value: "5g", label: "5G" },
  { value: "satellite", label: "Satellite" },
  { value: "microwave", label: "Microwave" }
];

export const getPowerSourceOptions = () => [
  { value: "grid", label: "Power Grid" },
  { value: "solar", label: "Solar Power" },
  { value: "generator", label: "Generator" },
  { value: "hybrid", label: "Hybrid System" }
];

export const getWaterBodyTypeOptions = () => [
  { value: "lake", label: "Lake" },
  { value: "river", label: "River" },
  { value: "dam", label: "Dam" },
  { value: "wetland", label: "Wetland" }
];

export const getHospitalServicesOptions = () => [
  { value: "icu", label: "Intensive Care Unit (ICU)" },
  { value: "surgery", label: "Surgery" },
  { value: "oncology", label: "Oncology" },
  { value: "emergency", label: "Emergency Services" },
  { value: "neurology", label: "Neurology" },
  { value: "radiology", label: "Radiology" },
  { value: "cardiology", label: "Cardiology" },
  { value: "laboratory", label: "Laboratory" },
  { value: "obstetrics", label: "Obstetrics" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "orthopedics", label: "Orthopedics" }
];