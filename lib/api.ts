// lib/api.ts

// Define TypeScript interfaces
interface ApiResponse<T> {
  data: T;
  success?: boolean;
}

interface Bounds {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

interface InfrastructureSummary {
  towers: number;
  schools: number;
  hospitals: number;
  waterBodies: number;
}

interface SearchResult {
  id: string;
  type: 'district' | 'tower' | 'school' | 'hospital' | 'waterBody';
  name: string;
  description: string;
  coordinates: [number, number]; // [latitude, longitude]
}

// API Base URL - should be configured based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Development mode flag - set to true to use mock data
const USE_MOCK_DATA = true;

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API request failed with status ${response.status}`);
  }
  return response.json();
};

// Get auth token from local storage (implementation depends on your auth solution)
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Basic fetch with auth headers
const fetchWithAuth = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  }).then(response => handleResponse<T>(response));
};

// Simulate delay for mock data
const mockDelay = async (ms: number = 500): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, ms));
};

// ==== MOCK DATA =====

// Mock infrastructure summary
const mockInfrastructureSummary: InfrastructureSummary = {
  towers: 456,
  schools: 1283,
  hospitals: 245,
  waterBodies: 78
};

// Mock GeoJSON data for districts
const mockDistrictBoundaries: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'd1',
        name: 'Kampala',
        region: 'Central',
        population: 1650800,
        area_sqkm: 189.3
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[32.5, 0.3], [32.6, 0.3], [32.6, 0.4], [32.5, 0.4], [32.5, 0.3]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'd2',
        name: 'Entebbe',
        region: 'Central',
        population: 69958,
        area_sqkm: 56.2
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[32.4, 0.0], [32.5, 0.0], [32.5, 0.1], [32.4, 0.1], [32.4, 0.0]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'd3',
        name: 'Jinja',
        region: 'Eastern',
        population: 300000,
        area_sqkm: 87.6
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[33.15, 0.38], [33.25, 0.38], [33.25, 0.48], [33.15, 0.48], [33.15, 0.38]]]
      }
    }
  ]
};

// Mock infrastructure within bounds data
const mockInfrastructure = {
  towers: [
    {
      id: 't1',
      name: 'MTN Tower KLA-001',
      type: 'tower',
      properties: {
        operator: 'MTN',
        type: 'GSM',
        status: 'active',
        coverage_radius: 5,
        district: 'Kampala'
      },
      geometry: {
        type: 'Point',
        coordinates: [32.5814, 0.3157]
      }
    },
    {
      id: 't2',
      name: 'Airtel Tower KLA-045',
      type: 'tower',
      properties: {
        operator: 'Airtel',
        type: 'GSM/LTE',
        status: 'active',
        coverage_radius: 4.5,
        district: 'Kampala'
      },
      geometry: {
        type: 'Point',
        coordinates: [32.5923, 0.3289]
      }
    }
  ],
  schools: [
    {
      id: 's1',
      name: 'Makerere University',
      type: 'school',
      properties: {
        level: 'tertiary',
        type: 'public',
        has_internet: true,
        student_count: 35000,
        district: 'Kampala'
      },
      geometry: {
        type: 'Point',
        coordinates: [32.5686, 0.3349]
      }
    },
    {
      id: 's2',
      name: 'Kampala International School',
      type: 'school',
      properties: {
        level: 'secondary',
        type: 'private',
        has_internet: true,
        student_count: 1200,
        district: 'Kampala'
      },
      geometry: {
        type: 'Point',
        coordinates: [32.6012, 0.3421]
      }
    }
  ],
  hospitals: [
    {
      id: 'h1',
      name: 'Mulago Hospital',
      type: 'hospital',
      properties: {
        type: 'national',
        beds: 1800,
        has_internet: true,
        emergency_services: true,
        district: 'Kampala'
      },
      geometry: {
        type: 'Point',
        coordinates: [32.5760, 0.3356]
      }
    },
    {
      id: 'h2',
      name: 'Nsambya Hospital',
      type: 'hospital',
      properties: {
        type: 'private',
        beds: 361,
        has_internet: true,
        emergency_services: true,
        district: 'Kampala'
      },
      geometry: {
        type: 'Point',
        coordinates: [32.5903, 0.2994]
      }
    }
  ],
  water_bodies: [
    {
      id: 'w1',
      name: 'Lake Victoria',
      type: 'water_body',
      properties: {
        type: 'lake',
        area_sqkm: 68800,
        district: 'Multiple'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[32.5, 0.1], [32.8, 0.1], [32.8, -0.2], [32.5, -0.2], [32.5, 0.1]]]
      }
    }
  ]
};

// Mock coverage data
const mockCoverageData = {
  covered: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { coverage_level: 'covered' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[32.55, 0.28], [32.65, 0.28], [32.65, 0.38], [32.55, 0.38], [32.55, 0.28]]]
        }
      }
    ]
  },
  uncovered: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { coverage_level: 'uncovered' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[32.45, 0.28], [32.55, 0.28], [32.55, 0.38], [32.45, 0.38], [32.45, 0.28]]]
        }
      }
    ]
  },
  statistics: {
    totalArea: 500,
    coveredArea: 300,
    percentageCovered: 60
  }
};

// Mock infrastructure details
const mockInfrastructureDetails: { [key: string]: any } = {
  tower: {
    t1: {
      id: 't1',
      name: 'MTN Tower KLA-001',
      operator: 'MTN',
      type: 'GSM',
      height: 45.5,
      coverage_radius: 5,
      status: 'active',
      has_internet: true,
      connection_type: 'Fiber',
      connection_speed: '1 Gbps',
      power_source: 'Grid + Solar Backup',
      district: 'Kampala',
      installation_date: '2018-05-15',
      last_maintenance: '2023-11-10'
    },
    t2: {
      id: 't2',
      name: 'Airtel Tower KLA-045',
      operator: 'Airtel',
      type: 'GSM/LTE',
      height: 40.0,
      coverage_radius: 4.5,
      status: 'active',
      has_internet: true,
      connection_type: 'Fiber',
      connection_speed: '500 Mbps',
      power_source: 'Grid + Generator',
      district: 'Kampala',
      installation_date: '2019-03-22',
      last_maintenance: '2023-08-05'
    }
  },
  school: {
    s1: {
      id: 's1',
      name: 'Makerere University',
      level: 'tertiary',
      type: 'public',
      student_count: 35000,
      has_internet: true,
      connection_type: 'Fiber',
      connection_speed: '1 Gbps',
      district: 'Kampala',
      established_date: '1922-01-01',
      principal_name: 'Prof. Barnabas Nawangwe'
    },
    s2: {
      id: 's2',
      name: 'Kampala International School',
      level: 'secondary',
      type: 'private',
      student_count: 1200,
      has_internet: true,
      connection_type: 'Fiber',
      connection_speed: '200 Mbps',
      district: 'Kampala',
      established_date: '1993-01-01',
      principal_name: 'Dr. Terry Garbett'
    }
  },
  hospital: {
    h1: {
      id: 'h1',
      name: 'Mulago Hospital',
      type: 'national',
      beds: 1800,
      has_internet: true,
      connection_type: 'Fiber',
      connection_speed: '500 Mbps',
      emergency_services: true,
      district: 'Kampala',
      established_date: '1913-01-01',
      director_name: 'Dr. Byarugaba Baterana'
    },
    h2: {
      id: 'h2',
      name: 'Nsambya Hospital',
      type: 'private',
      beds: 361,
      has_internet: true,
      connection_type: 'Fiber',
      connection_speed: '200 Mbps',
      emergency_services: true,
      district: 'Kampala',
      established_date: '1903-01-01',
      director_name: 'Dr. Peter Lochoro'
    }
  },
  district: {
    d1: {
      id: 'd1',
      name: 'Kampala',
      region: 'Central',
      population: 1650800,
      area_sqkm: 189.3,
      tower_count: 156,
      school_count: 286,
      hospital_count: 28,
      coverage_percentage: 92.4
    },
    d2: {
      id: 'd2',
      name: 'Entebbe',
      region: 'Central',
      population: 69958,
      area_sqkm: 56.2,
      tower_count: 32,
      school_count: 45,
      hospital_count: 5,
      coverage_percentage: 88.6
    }
  }
};

// Mock district statistics
const mockDistrictStatistics = {
  d1: {
    district: 'Kampala',
    population: 1650800,
    area: 189.3,
    infrastructure: {
      towers: 156,
      schools: 286,
      hospitals: 28
    },
    coverage: {
      percentage: 92.4,
      populationCovered: 1525339,
      populationUncovered: 125461
    }
  },
  d2: {
    district: 'Entebbe',
    population: 69958,
    area: 56.2,
    infrastructure: {
      towers: 32,
      schools: 45,
      hospitals: 5
    },
    coverage: {
      percentage: 88.6,
      populationCovered: 61982,
      populationUncovered: 7976
    }
  }
};

// Mock underserved areas
const mockUnderservedAreas = {
  areas: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          district_id: 'd3',
          district_name: 'Buyende',
          coverage_percentage: 32.5,
          population: 323100,
          uncovered_population: 218092
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[[33.15, 1.18], [33.35, 1.18], [33.35, 1.38], [33.15, 1.38], [33.15, 1.18]]]
        }
      },
      {
        type: 'Feature',
        properties: {
          district_id: 'd4',
          district_name: 'Kalangala',
          coverage_percentage: 41.2,
          population: 67300,
          uncovered_population: 39572
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[[32.1, -0.3], [32.4, -0.3], [32.4, -0.1], [32.1, -0.1], [32.1, -0.3]]]
        }
      }
    ]
  },
  statistics: {
    underservedDistricts: 45,
    totalUncoveredPopulation: 7852400,
    percentageUncovered: 22.4
  }
};

// Mock search results
const mockSearchResults: SearchResult[] = [
  { 
    id: 'd1', 
    type: 'district', 
    name: 'Kampala', 
    description: 'Central Region, Uganda', 
    coordinates: [0.3476, 32.5825] 
  },
  { 
    id: 'd2', 
    type: 'district', 
    name: 'Entebbe', 
    description: 'Central Region, Uganda', 
    coordinates: [0.0611, 32.4777] 
  },
  { 
    id: 't1', 
    type: 'tower', 
    name: 'MTN Tower KLA-001', 
    description: 'Active, Kampala District', 
    coordinates: [0.3157, 32.5814] 
  },
  { 
    id: 's1', 
    type: 'school', 
    name: 'Makerere University', 
    description: 'Tertiary, Kampala District', 
    coordinates: [0.3349, 32.5686] 
  },
  { 
    id: 'h1', 
    type: 'hospital', 
    name: 'Mulago Hospital', 
    description: 'National Referral, Kampala District', 
    coordinates: [0.3356, 32.5760] 
  },
];

// ==== API FUNCTIONS =====

// Fetch infrastructure summary for dashboard
export const fetchInfrastructureSummary = async (): Promise<InfrastructureSummary> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return mockInfrastructureSummary;
  }
  return fetchWithAuth<InfrastructureSummary>('/reports/summary');
};

// Fetch district boundaries
export const fetchDistrictBoundaries = async (): Promise<GeoJSON.FeatureCollection> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return mockDistrictBoundaries;
  }
  return fetchWithAuth<GeoJSON.FeatureCollection>('/spatial/districts');
};

// Fetch infrastructure within map bounds
export const fetchInfrastructureWithinBounds = async (
  bounds: Bounds, 
  types: string[] = ['towers', 'schools', 'hospitals', 'water_bodies']
): Promise<{[key: string]: any[]}> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    // Filter mock data based on requested types
    const result: {[key: string]: any[]} = {};
    types.forEach(type => {
      const key = type === 'water_bodies' ? 'water_bodies' : type;
      result[key] = mockInfrastructure[key as keyof typeof mockInfrastructure] || [];
    });
    return result;
  }
  
  const boundsParam = `${bounds.minLat},${bounds.minLng},${bounds.maxLat},${bounds.maxLng}`;
  const typesParam = types.join(',');
  
  return fetchWithAuth<{[key: string]: any[]}>(`/spatial/within-bounds?bounds=${boundsParam}&types=${typesParam}`);
};

// Fetch coverage analysis
export const fetchCoverageAnalysis = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return mockCoverageData;
  }
  
  return fetchWithAuth<{
    covered: GeoJSON.FeatureCollection,
    uncovered: GeoJSON.FeatureCollection,
    statistics: {
      totalArea: number,
      coveredArea: number,
      percentageCovered: number
    }
  }>('/spatial/coverage');
};

// Fetch detailed information for specific infrastructure
export const fetchInfrastructureDetails = async (type: string, id: string) => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    const typeCollection = mockInfrastructureDetails[type];
    if (typeCollection && typeCollection[id]) {
      return typeCollection[id];
    }
    // Return null if not found
    return null;
  }
  
  // Map frontend type names to API endpoint type names
  const typeMapping: {[key: string]: string} = {
    tower: 'towers',
    school: 'schools',
    hospital: 'hospitals',
    district: 'districts',
    waterBody: 'water-bodies'
  };
  
  const apiType = typeMapping[type] || type;
  
  return fetchWithAuth<any>(`/infrastructure/${apiType}/${id}`);
};

// Fetch district statistics
export const fetchDistrictStatistics = async (districtId: string) => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return mockDistrictStatistics[districtId as keyof typeof mockDistrictStatistics] || null;
  }
  
  return fetchWithAuth<any>(`/spatial/district/${districtId}/statistics`);
};

// Fetch underserved areas
export const fetchUnderservedAreas = async (coverageThreshold: number = 50) => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return mockUnderservedAreas;
  }
  
  return fetchWithAuth<any>(`/spatial/underserved?threshold=${coverageThreshold}`);
};

// Search locations (districts, infrastructure)
export const searchLocations = async (query: string): Promise<SearchResult[]> => {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    
    // Filter based on query
    const lowerQuery = query.toLowerCase();
    return mockSearchResults.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) || 
      item.description.toLowerCase().includes(lowerQuery)
    );
  }
  
  return fetchWithAuth<SearchResult[]>(`/search?q=${encodeURIComponent(query)}`);
};