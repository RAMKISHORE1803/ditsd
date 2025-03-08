// Type definitions
export type UserRole = 'admin' | 'editor' | 'viewer';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface District {
  id: string;
  name: string;
  code: string;
  region?: string;
  population?: number;
  area_sqkm?: number;
  geometry?: any; // PostGIS geometry
  created_at?: string;
  updated_at?: string;
}

export interface Tower {
  id: string;
  name: string;
  operator: string;
  type: string;
  status: string;
  height?: number;
  coverage_radius: number;
  location?: any; // PostGIS point
  district_id?: string;
  installation_date?: string;
  last_maintenance?: string;
  has_internet?: boolean;
  connection_type?: string;
  connection_speed?: string;
  power_source?: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  // Additional properties for UI only (not in DB)
  latitude?: number;
  longitude?: number;
}

export interface School {
  id: string;
  name: string;
  level: string;
  type: string;
  student_count?: number;
  has_internet?: boolean;
  connection_type?: string;
  connection_speed?: string;
  location?: any; // PostGIS point
  district_id?: string;
  established_date?: string;
  principal_name?: string;
  contact_phone?: string;
  contact_email?: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  // Additional properties for UI only (not in DB)
  latitude?: number;
  longitude?: number;
}

export interface Hospital {
  id: string;
  name: string;
  type: string;
  beds?: number;
  has_internet?: boolean;
  connection_type?: string;
  connection_speed?: string;
  location?: any; // PostGIS point
  district_id?: string;
  established_date?: string;
  director_name?: string;
  contact_phone?: string;
  contact_email?: string;
  emergency_services?: boolean;
  services?: any; // JSON field
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  // Additional properties for UI only (not in DB)
  latitude?: number;
  longitude?: number;
}

export interface WaterBody {
  id: string;
  name: string;
  type: string;
  location?: any; // Add this property
  geometry?: any; // Add this property
  longitude?: number;
  latitude?: number;
  area_sqkm?: number;
  length_km?: number;
  is_protected?: boolean;
  district_id?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name?: string;
  record_id?: string;
  details: string;
  created_at: string;
}

export interface CoverageAnalysis {
  id: string;
  district_id?: string;
  coverage_level: string;
  coverage_area?: any; // PostGIS geometry
  population_covered?: number;
  percentage_covered?: number;
  last_calculated?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SummaryStats {
  totalTowers: number;
  activeTowers: number;
  totalSchools: number;
  schoolsWithInternet: number;
  totalHospitals: number;
  hospitalsWithInternet: number;
  totalWaterBodies: number;
  totalDistricts: number;
  populationCovered: number;
  populationTotal: number;
}

export type ActiveTab = 'overview' | 'towers' | 'schools' | 'hospitals' | 'waterBodies' | 'users' | 'coverage';