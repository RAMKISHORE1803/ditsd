// app/map/page.tsx
"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createClient } from '@supabase/supabase-js';
import { parseWKBPoint, getTowerStatusColor, getConnectionTypeColor } from '@/lib/wkb-helper';
import { 
  Search, Layers, Filter, MapPin, Radio, School, Hospital, Droplet,
  ChevronDown, ChevronRight, X, Info, Download, Share2, Settings, Map
} from 'lucide-react';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Custom icon options
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
        <span style="color: white; font-size: 14px;">${icon}</span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

export default function MapPage() {
  // References
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{[key: string]: L.LayerGroup | null}>({
    districts: null,
    towers: null,
    schools: null,
    hospitals: null,
    waterBodies: null
  });
  
  // State for layer control and feature selection
  const [activeLayers, setActiveLayers] = useState({
    districts: true,
    towers: true,
    schools: false,
    hospitals: false,
    waterBodies: false
  });
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [isLayerControlOpen, setIsLayerControlOpen] = useState(true);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    towers: 0,
    schools: 0,
    hospitals: 0,
    waterBodies: 0,
    districtsCount: 0
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    towerStatus: [] as string[],
    towerOperator: [] as string[],
    towerType: [] as string[],
    schoolLevel: [] as string[],
    schoolType: [] as string[],
    hospitalType: [] as string[],
    hasInternet: null as boolean | null
  });
  
  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    towerStatus: [] as string[],
    towerOperator: [] as string[],
    towerType: [] as string[],
    schoolLevel: [] as string[],
    schoolType: [] as string[],
    hospitalType: [] as string[]
  });
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [mapMode, setMapMode] = useState<'standard' | 'coverage' | 'satellite'>('standard');
  
  // Debug state to show parsed coordinates
  const [debug, setDebug] = useState<{[key: string]: any}>({});
  
  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    // Fix Leaflet icon issues
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
    
    // Create map
    const map = L.map(mapContainerRef.current).setView([1.37, 32.29], 7); // Uganda center
    
    // Add base map layer
    const standardLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    
    // Create layer groups
    layerGroupsRef.current = {
      districts: L.layerGroup().addTo(map),
      towers: L.layerGroup().addTo(map),
      schools: L.layerGroup().addTo(map),
      hospitals: L.layerGroup().addTo(map),
      waterBodies: L.layerGroup().addTo(map)
    };
    
    // Store map reference
    mapRef.current = map;
    
    // Add scale control
    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);
    
    // Clean up on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerGroupsRef.current = {
          districts: null,
          towers: null,
          schools: null,
          hospitals: null,
          waterBodies: null
        };
      }
    };
  }, []);
  
  // Handle map mode change
  useEffect(() => {
    if (!mapRef.current) return;
    
    if (mapMode === 'standard') {
      // Remove satellite layer if exists
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer && layer.options.attribution?.includes('Esri')) {
          mapRef.current?.removeLayer(layer);
        }
      });
      
      // Add standard OSM layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    } else if (mapMode === 'satellite') {
      // Remove standard layer if exists
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer && layer.options.attribution?.includes('OpenStreetMap')) {
          mapRef.current?.removeLayer(layer);
        }
      });
      
      // Add satellite layer
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }).addTo(mapRef.current);
    }
  }, [mapMode]);
  
  // Fetch summary data
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        // Get counts for each infrastructure type
        const [towersRes, schoolsRes, hospitalsRes, waterBodiesRes, districtsRes] = await Promise.all([
          supabase.from('telecom_towers').select('id', { count: 'exact', head: true }),
          supabase.from('schools').select('id', { count: 'exact', head: true }),
          supabase.from('hospitals').select('id', { count: 'exact', head: true }),
          supabase.from('water_bodies').select('id', { count: 'exact', head: true }),
          supabase.from('districts').select('id', { count: 'exact', head: true })
        ]);
        
        setSummary({
          towers: towersRes.count || 0,
          schools: schoolsRes.count || 0,
          hospitals: hospitalsRes.count || 0,
          waterBodies: waterBodiesRes.count || 0,
          districtsCount: districtsRes.count || 0
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching summary counts:', error);
        setIsLoading(false);
      }
    };
    
    fetchSummary();
  }, []);
  
  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [towerStatusRes, towerOperatorRes, towerTypeRes, schoolLevelRes, schoolTypeRes, hospitalTypeRes] = await Promise.all([
          supabase.from('telecom_towers').select('status').distinct(),
          supabase.from('telecom_towers').select('operator').distinct(),
          supabase.from('telecom_towers').select('type').distinct(),
          supabase.from('schools').select('level').distinct(),
          supabase.from('schools').select('type').distinct(),
          supabase.from('hospitals').select('type').distinct()
        ]);
        
        setFilterOptions({
          towerStatus: towerStatusRes.data?.map(item => item.status) || [],
          towerOperator: towerOperatorRes.data?.map(item => item.operator) || [],
          towerType: towerTypeRes.data?.map(item => item.type) || [],
          schoolLevel: schoolLevelRes.data?.map(item => item.level) || [],
          schoolType: schoolTypeRes.data?.map(item => item.type) || [],
          hospitalType: hospitalTypeRes.data?.map(item => item.type) || []
        });
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };
    
    fetchFilterOptions();
  }, []);
  
  // Fetch and display districts
  useEffect(() => {
    if (!mapRef.current || !layerGroupsRef.current.districts) return;
    
    const fetchDistricts = async () => {
      // Clear layer if not active
      if (!activeLayers.districts) {
        layerGroupsRef.current.districts?.clearLayers();
        return;
      }
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('districts')
          .select('*');
        
        if (error) throw error;
        
        // Clear existing features
        layerGroupsRef.current.districts?.clearLayers();
        
        if (data && data.length > 0) {
          console.log(`Loaded ${data.length} districts`);
          
          data.forEach(district => {
            // Add district boundary to the map
            // This is simplified since we don't have the actual geometry parsing
            // In a real app, you would parse the geometry and create proper polygons
            
            // Create a simple marker for district center (placeholder)
            try {
              const coordinates = parseWKBPoint(district.geometry);
              
              const marker = L.circleMarker([coordinates[1], coordinates[0]], {
                radius: 4,
                fillColor: '#9E9E9E',
                color: '#000',
                weight: 1,
                opacity: 0.7,
                fillOpacity: 0.5
              });
              
              marker.bindTooltip(district.name, {
                permanent: false,
                direction: 'center',
                className: 'district-tooltip'
              });
              
              marker.addTo(layerGroupsRef.current.districts!);
            } catch (e) {
              console.error('Error adding district to map:', e);
            }
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching districts:', error);
        setIsLoading(false);
      }
    };
    
    fetchDistricts();
  }, [activeLayers.districts]);
  
  // Fetch and display towers
  useEffect(() => {
    if (!mapRef.current || !layerGroupsRef.current.towers) return;
    
    const fetchTowers = async () => {
      // Clear layer if not active
      if (!activeLayers.towers) {
        layerGroupsRef.current.towers?.clearLayers();
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Build query with filters
        let query = supabase.from('telecom_towers').select('*');
        
        if (filters.towerStatus.length > 0) {
          query = query.in('status', filters.towerStatus);
        }
        
        if (filters.towerOperator.length > 0) {
          query = query.in('operator', filters.towerOperator);
        }
        
        if (filters.towerType.length > 0) {
          query = query.in('type', filters.towerType);
        }
        
        if (filters.hasInternet !== null) {
          query = query.eq('has_internet', filters.hasInternet);
        }
        
        const { data, error } = await query.limit(300); // Increased limit for better data density
        
        if (error) throw error;
        
        // Clear existing markers
        layerGroupsRef.current.towers?.clearLayers();
        
        if (data && data.length > 0) {
          console.log(`Loaded ${data.length} telecom towers`);
          
          // Log the first item for debugging
          console.log('First tower data:', data[0]);
          
          // Store first 5 parsed coordinates for debugging
          const debugCoords: {[key: string]: any} = {};
          
          // Add towers to the map
          data.forEach((tower, index) => {
            try {
              // Parse WKB to get coordinates
              const coordinates = parseWKBPoint(tower.location);
              
              // Store first 5 for debugging
              if (index < 5) {
                debugCoords[`tower_${index}`] = {
                  name: tower.name,
                  wkb: tower.location,
                  coords: coordinates
                };
              }
              
              // Create custom icon based on tower status
              const towerIcon = createCustomIcon(getTowerStatusColor(tower.status), "📡");
              
              // Create marker with custom icon
              const marker = L.marker([coordinates[1], coordinates[0]], {
                icon: towerIcon,
                title: tower.name
              });
              
              // Add popup with enhanced styling
              marker.bindPopup(`
                <div class="popup-content">
                  <h3 class="popup-title">${tower.name}</h3>
                  <div class="popup-details">
                    <p><strong>Operator:</strong> ${tower.operator}</p>
                    <p><strong>Type:</strong> ${tower.type}</p>
                    <p><strong>Status:</strong> <span class="status-badge" style="background-color: ${getTowerStatusColor(tower.status)};">${tower.status}</span></p>
                    <p><strong>Coverage:</strong> ${tower.coverage_radius} km</p>
                    ${tower.connection_type ? `<p><strong>Connection:</strong> ${tower.connection_type}</p>` : ''}
                    ${tower.connection_speed ? `<p><strong>Speed:</strong> ${tower.connection_speed}</p>` : ''}
                    ${tower.installation_date ? `<p><strong>Installed:</strong> ${new Date(tower.installation_date).toLocaleDateString()}</p>` : ''}
                    ${tower.last_maintenance ? `<p><strong>Last Maintenance:</strong> ${new Date(tower.last_maintenance).toLocaleDateString()}</p>` : ''}
                  </div>
                </div>
              `);
              
              // Add click handler
              marker.on('click', () => {
                setSelectedFeature({
                  type: 'tower',
                  id: tower.id,
                  name: tower.name,
                  properties: tower
                });
              });
              
              // Add to layer group
              marker.addTo(layerGroupsRef.current.towers!);
              
              // Add coverage circle if available
              if (tower.coverage_radius && (mapMode === 'coverage' || mapMode === 'standard')) {
                const circle = L.circle([coordinates[1], coordinates[0]], {
                  radius: tower.coverage_radius * 1000, // Convert km to meters
                  color: getConnectionTypeColor(tower.connection_type),
                  fillColor: getConnectionTypeColor(tower.connection_type),
                  fillOpacity: 0.1,
                  weight: 1
                });
                
                // Add to layer group
                circle.addTo(layerGroupsRef.current.towers!);
              }
            } catch (e) {
              console.error('Error adding tower to map:', e);
            }
          });
          
          // Update debug state
          setDebug(prev => ({...prev, ...debugCoords}));
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching towers:', error);
        setIsLoading(false);
      }
    };
    
    fetchTowers();
  }, [activeLayers.towers, filters.towerStatus, filters.towerOperator, filters.towerType, filters.hasInternet, mapMode]);
  
  // Fetch and display schools
  useEffect(() => {
    if (!mapRef.current || !layerGroupsRef.current.schools) return;
    
    const fetchSchools = async () => {
      // Clear layer if not active
      if (!activeLayers.schools) {
        layerGroupsRef.current.schools?.clearLayers();
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Build query with filters
        let query = supabase.from('schools').select('*');
        
        if (filters.schoolLevel.length > 0) {
          query = query.in('level', filters.schoolLevel);
        }
        
        if (filters.schoolType.length > 0) {
          query = query.in('type', filters.schoolType);
        }
        
        if (filters.hasInternet !== null) {
          query = query.eq('has_internet', filters.hasInternet);
        }
        
        const { data, error } = await query.limit(300);
        
        if (error) throw error;
        
        // Clear existing markers
        layerGroupsRef.current.schools?.clearLayers();
        
        if (data && data.length > 0) {
          console.log(`Loaded ${data.length} schools`);
          
          // Log the first item for debugging
          console.log('First school data:', data[0]);
          
          // Add schools to the map
          data.forEach(school => {
            try {
              // Parse WKB to get coordinates
              const coordinates = parseWKBPoint(school.location);
              
              // Create custom icon
              const schoolIcon = createCustomIcon('#2196F3', "🏫");
              
              // Create marker with custom icon
              const marker = L.marker([coordinates[1], coordinates[0]], {
                icon: schoolIcon,
                title: school.name
              });
              
              // Add popup
              marker.bindPopup(`
                <div class="popup-content">
                  <h3 class="popup-title">${school.name}</h3>
                  <div class="popup-details">
                    <p><strong>Level:</strong> ${school.level}</p>
                    <p><strong>Type:</strong> ${school.type}</p>
                    <p><strong>Internet:</strong> ${school.has_internet ? '✅ Yes' : '❌ No'}</p>
                    ${school.student_count ? `<p><strong>Students:</strong> ${school.student_count.toLocaleString()}</p>` : ''}
                    ${school.principal_name ? `<p><strong>Principal:</strong> ${school.principal_name}</p>` : ''}
                    ${school.established_date ? `<p><strong>Established:</strong> ${new Date(school.established_date).toLocaleDateString()}</p>` : ''}
                    ${school.contact_phone ? `<p><strong>Contact:</strong> ${school.contact_phone}</p>` : ''}
                  </div>
                </div>
              `);
              
              // Add click handler
              marker.on('click', () => {
                setSelectedFeature({
                  type: 'school',
                  id: school.id,
                  name: school.name,
                  properties: school
                });
              });
              
              // Add to layer group
              marker.addTo(layerGroupsRef.current.schools!);
            } catch (e) {
              console.error('Error adding school to map:', e);
            }
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching schools:', error);
        setIsLoading(false);
      }
    };
    
    fetchSchools();
  }, [activeLayers.schools, filters.schoolLevel, filters.schoolType, filters.hasInternet]);
  
  // Fetch and display hospitals
  useEffect(() => {
    if (!mapRef.current || !layerGroupsRef.current.hospitals) return;
    
    const fetchHospitals = async () => {
      // Clear layer if not active
      if (!activeLayers.hospitals) {
        layerGroupsRef.current.hospitals?.clearLayers();
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Build query with filters
        let query = supabase.from('hospitals').select('*');
        
        if (filters.hospitalType.length > 0) {
          query = query.in('type', filters.hospitalType);
        }
        
        if (filters.hasInternet !== null) {
          query = query.eq('has_internet', filters.hasInternet);
        }
        
        const { data, error } = await query.limit(300);
        
        if (error) throw error;
        
        // Clear existing markers
        layerGroupsRef.current.hospitals?.clearLayers();
        
        if (data && data.length > 0) {
          console.log(`Loaded ${data.length} hospitals`);
          
          // Log the first item for debugging
          console.log('First hospital data:', data[0]);
          
          // Add hospitals to the map
          data.forEach(hospital => {
            try {
              // Parse WKB to get coordinates
              const coordinates = parseWKBPoint(hospital.location);
              
              // Create custom icon
              const hospitalIcon = createCustomIcon('#F44336', "🏥");
              
              // Create marker with custom icon
              const marker = L.marker([coordinates[1], coordinates[0]], {
                icon: hospitalIcon,
                title: hospital.name
              });
              
              // Add popup
              marker.bindPopup(`
                <div class="popup-content">
                  <h3 class="popup-title">${hospital.name}</h3>
                  <div class="popup-details">
                    <p><strong>Type:</strong> ${hospital.type}</p>
                    <p><strong>Beds:</strong> ${hospital.beds || 'N/A'}</p>
                    <p><strong>Emergency:</strong> ${hospital.emergency_services ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>Internet:</strong> ${hospital.has_internet ? '✅ Yes' : '❌ No'}</p>
                    ${hospital.director_name ? `<p><strong>Director:</strong> ${hospital.director_name}</p>` : ''}
                    ${hospital.established_date ? `<p><strong>Established:</strong> ${new Date(hospital.established_date).toLocaleDateString()}</p>` : ''}
                    ${hospital.contact_phone ? `<p><strong>Contact:</strong> ${hospital.contact_phone}</p>` : ''}
                  </div>
                </div>
              `);
              
              // Add click handler
              marker.on('click', () => {
                setSelectedFeature({
                  type: 'hospital',
                  id: hospital.id,
                  name: hospital.name,
                  properties: hospital
                });
              });
              
              // Add to layer group
              marker.addTo(layerGroupsRef.current.hospitals!);
            } catch (e) {
              console.error('Error adding hospital to map:', e);
            }
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        setIsLoading(false);
      }
    };
    
    fetchHospitals();
  }, [activeLayers.hospitals, filters.hospitalType, filters.hasInternet]);
  
  // Fetch and display water bodies
  useEffect(() => {
    if (!mapRef.current || !layerGroupsRef.current.waterBodies) return;
    
    const fetchWaterBodies = async () => {
      // Clear layer if not active
      if (!activeLayers.waterBodies) {
        layerGroupsRef.current.waterBodies?.clearLayers();
        return;
      }
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('water_bodies')
          .select('*')
          .limit(300);
        
        if (error) throw error;
        
        // Clear existing features
        layerGroupsRef.current.waterBodies?.clearLayers();
        
        if (data && data.length > 0) {
          console.log(`Loaded ${data.length} water bodies`);
          
          // Log the first item for debugging
          console.log('First water body data:', data[0]);
          
          // Add water bodies to the map
          data.forEach(waterBody => {
            try {
              // Parse WKB to get coordinates
              const coordinates = parseWKBPoint(waterBody.geometry);
              
              // Create custom icon
              const waterIcon = createCustomIcon('#2196F3', "💧");
              
              // Create marker
              const marker = L.marker([coordinates[1], coordinates[0]], {
                icon: waterIcon,
                title: waterBody.name
              });
              
              // Add popup
              marker.bindPopup(`
                <div class="popup-content">
                  <h3 class="popup-title">${waterBody.name}</h3>
                  <div class="popup-details">
                    <p><strong>Type:</strong> ${waterBody.type}</p>
                    ${waterBody.area_sqkm ? `<p><strong>Area:</strong> ${waterBody.area_sqkm} km²</p>` : ''}
                    ${waterBody.length_km ? `<p><strong>Length:</strong> ${waterBody.length_km} km</p>` : ''}
                    <p><strong>Protected:</strong> ${waterBody.is_protected ? '✅ Yes' : '❌ No'}</p>
                  </div>
                </div>
              `);
              
              // Add click handler
              marker.on('click', () => {
                setSelectedFeature({
                  type: 'waterBody',
                  id: waterBody.id,
                  name: waterBody.name,
                  properties: waterBody
                });
              });
              
              // Add to layer group
              marker.addTo(layerGroupsRef.current.waterBodies!);
            } catch (e) {
              console.error('Error adding water body to map:', e);
            }
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching water bodies:', error);
        setIsLoading(false);
      }
    };
    
    fetchWaterBodies();
  }, [activeLayers.waterBodies]);
  
  // Search functionality
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm || searchTerm.length < 3) {
        setSearchResults([]);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Search in all relevant tables
        const [towersRes, schoolsRes, hospitalsRes, waterBodiesRes] = await Promise.all([
          supabase.from('telecom_towers')
            .select('id, name, location, type, status, operator')
            .ilike('name', `%${searchTerm}%`)
            .limit(10),
          
          supabase.from('schools')
            .select('id, name, location, level, type')
            .ilike('name', `%${searchTerm}%`)
            .limit(10),
          
          supabase.from('hospitals')
            .select('id, name, location, type')
            .ilike('name', `%${searchTerm}%`)
            .limit(10),
          
          supabase.from('water_bodies')
            .select('id, name, geometry as location, type')
            .ilike('name', `%${searchTerm}%`)
            .limit(10)
        ]);
        
        // Format results
        const results = [
          ...(towersRes.data || []).map(item => ({ 
            ...item, 
            category: 'tower',
            icon: '📡',
            color: getTowerStatusColor(item.status)
          })),
          ...(schoolsRes.data || []).map(item => ({ 
            ...item, 
            category: 'school',
            icon: '🏫',
            color: '#2196F3'
          })),
          ...(hospitalsRes.data || []).map(item => ({ 
            ...item, 
            category: 'hospital',
            icon: '🏥',
            color: '#F44336'
          })),
          ...(waterBodiesRes.data || []).map(item => ({ 
            ...item, 
            category: 'waterBody',
            icon: '💧',
            color: '#2196F3'
          }))
        ];
        
        setSearchResults(results);
        setIsLoading(false);
      } catch (error) {
        console.error('Error performing search:', error);
        setIsLoading(false);
      }
    };
    
    performSearch();
  }, [searchTerm]);
  
  // Handle search result selection
  const handleSearchResultClick = (result: any) => {
    if (!mapRef.current) return;
    
    try {
      // Parse coordinates
      const coordinates = parseWKBPoint(result.location);
      
      // Center map on result
      mapRef.current.setView([coordinates[1], coordinates[0]], 14);
      
      // Activate appropriate layer
      if (result.category === 'tower' && !activeLayers.towers) {
        setActiveLayers(prev => ({ ...prev, towers: true }));
      } else if (result.category === 'school' && !activeLayers.schools) {
        setActiveLayers(prev => ({ ...prev, schools: true }));
      } else if (result.category === 'hospital' && !activeLayers.hospitals) {
        setActiveLayers(prev => ({ ...prev, hospitals: true }));
      } else if (result.category === 'waterBody' && !activeLayers.waterBodies) {
        setActiveLayers(prev => ({ ...prev, waterBodies: true }));
      }
      
      // Set selected feature
      setSelectedFeature({
        type: result.category,
        id: result.id,
        name: result.name,
        properties: result
      });
      
      // Close search panel
      setIsSearchPanelOpen(false);
    } catch (e) {
      console.error('Error handling search result click:', e);
    }
  };
  
  // Toggle layer visibility
  const toggleLayer = (layerName: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };
  
  // Toggle filter
  const toggleFilter = (filterType: string, value: string) => {
    setFilters(prev => {
      const currentFilters = prev[filterType as keyof typeof prev] as string[];
      if (currentFilters.includes(value)) {
        return {
          ...prev,
          [filterType]: currentFilters.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [filterType]: [...currentFilters, value]
        };
      }
    });
  };
  
  // Set boolean filter
  const setBooleanFilter = (value: boolean | null) => {
    setFilters(prev => ({
      ...prev,
      hasInternet: value
    }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      towerStatus: [],
      towerOperator: [],
      towerType: [],
      schoolLevel: [],
      schoolType: [],
      hospitalType: [],
      hasInternet: null
    });
  };
  
  // Export current view as image
  const exportMapImage = () => {
    if (!mapRef.current) return;
    
    // This is a placeholder - in a real implementation you would
    // use a library like html2canvas to capture the map view
    alert('Export functionality would capture the current map view as an image.');
  };
  
  // Share map link
  const shareMapLink = () => {
    if (!mapRef.current) return;
    
    const center = mapRef.current.getCenter();
    const zoom = mapRef.current.getZoom();
    
    // Create a shareable URL with current position and active layers
    const url = new URL(window.location.href);
    url.searchParams.set('lat', center.lat.toFixed(6));
    url.searchParams.set('lng', center.lng.toFixed(6));
    url.searchParams.set('zoom', zoom.toString());
    
    Object.entries(activeLayers).forEach(([key, value]) => {
      url.searchParams.set(`layer_${key}`, value ? '1' : '0');
    });
    
    // Copy to clipboard
    navigator.clipboard.writeText(url.toString())
      .then(() => {
        alert('Map link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        alert('Failed to copy link. Please try again.');
      });
  };
  
  return (
    <div className="h-screen w-full relative bg-slate-900 overflow-hidden">
      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0"></div>
      
      {/* Header/Navbar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-slate-800/90 backdrop-blur-sm shadow-lg border-b border-slate-700">
  <div className="container mx-auto px-4 py-2 flex items-center justify-between">
    <div className="flex items-center space-x-2 pl-28">
      <Map className="h-6 w-6 text-indigo-400" />
      <h1 className="text-white font-medium text-lg">Uganda Infrastructure Map</h1>
    </div>
    
    {/* Top navigation buttons */}
    <div className="flex items-center space-x-2">
      <button 
        onClick={() => setIsSearchPanelOpen(!isSearchPanelOpen)}
        className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-colors ${
          isSearchPanelOpen ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-white/80 hover:bg-slate-600'
        }`}
      >
        <Search className="h-4 w-4" />
        <span className="text-sm">Search</span>
      </button>
      
      <button 
        onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
        className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-colors ${
          isFilterPanelOpen ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-white/80 hover:bg-slate-600'
        }`}
      >
        <Filter className="h-4 w-4" />
        <span className="text-sm">Filter</span>
      </button>
      
      <div className="flex rounded-md overflow-hidden">
        <button 
          onClick={() => setMapMode('standard')}
          className={`px-3 py-1.5 text-sm border-r border-slate-600 ${
            mapMode === 'standard' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-white/80 hover:bg-slate-600'
          }`}
        >
          Standard
        </button>
        <button 
          onClick={() => setMapMode('satellite')}
          className={`px-3 py-1.5 text-sm ${
            mapMode === 'satellite' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-white/80 hover:bg-slate-600'
          }`}
        >
          Satellite
        </button>
      </div>
      
      <div className="flex space-x-1">
        <button 
          onClick={exportMapImage}
          className="bg-slate-700 text-white/80 hover:bg-slate-600 p-1.5 rounded-md transition-colors"
          title="Export map"
        >
          <Download className="h-4 w-4" />
        </button>
        
        <button 
          onClick={shareMapLink}
          className="bg-slate-700 text-white/80 hover:bg-slate-600 p-1.5 rounded-md transition-colors"
          title="Share map"
        >
          <Share2 className="h-4 w-4" />
        </button>
        
        {/* Exit Map Button */}
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-red-600 text-white hover:bg-red-700 p-1.5 rounded-md transition-colors flex items-center space-x-1 px-3"
          title="Exit map"
        >
          <X className="h-4 w-4 mr-1" />
          <span className="text-sm">Exit</span>
        </button>
      </div>
    </div>
  </div>
</div>
      
      {/* Search Panel */}
      {isSearchPanelOpen && (
        <div className="absolute top-14 left-1/2 transform -translate-x-1/2 z-20 bg-slate-800/95 backdrop-blur-md rounded-lg shadow-xl w-96 max-h-[calc(100vh-5rem)] overflow-hidden">
          <div className="p-3 border-b border-slate-700 flex items-center space-x-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for infrastructure..."
              className="flex-1 bg-transparent border-none text-white placeholder-slate-400 focus:ring-0 focus:outline-none text-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto max-h-64">
            {isLoading && searchTerm.length >= 3 ? (
              <div className="py-4 text-center text-slate-400 text-sm">Searching...</div>
            ) : searchResults.length > 0 ? (
              <ul className="divide-y divide-slate-700">
                {searchResults.map((result) => (
                  <li key={`${result.category}-${result.id}`} className="hover:bg-slate-700/50">
                    <button
                      onClick={() => handleSearchResultClick(result)}
                      className="px-4 py-2 w-full text-left flex items-center space-x-2"
                    >
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full" style={{ backgroundColor: result.color }}>
                        <span className="text-xs">{result.icon}</span>
                      </span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium truncate">{result.name}</p>
                        <p className="text-slate-400 text-xs">
                          {result.category === 'tower' ? `${result.operator} - ${result.type}` : 
                           result.category === 'school' ? `${result.level} - ${result.type}` : 
                           result.category === 'hospital' ? `${result.type}` : 
                           `${result.type}`}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : searchTerm.length >= 3 ? (
              <div className="py-4 text-center text-slate-400 text-sm">No results found</div>
            ) : (
              <div className="py-4 text-center text-slate-400 text-sm">Enter at least 3 characters to search</div>
            )}
          </div>
        </div>
      )}
      
      {/* Filter Panel */}
      {isFilterPanelOpen && (
        <div className="absolute top-14 right-4 z-20 bg-slate-800/95 backdrop-blur-md rounded-lg shadow-xl w-80 max-h-[calc(100vh-5rem)] overflow-auto">
          <div className="p-3 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-white font-medium flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </h3>
            <button 
              onClick={resetFilters}
              className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white/80 rounded-md"
            >
              Reset All
            </button>
          </div>
          
          <div className="p-3 space-y-4">
            {/* Tower Filters */}
            <div className="space-y-2">
              <h4 className="text-white text-sm font-medium flex items-center">
                <Radio className="h-3 w-3 mr-1.5 text-indigo-400" />
                Tower Filters
              </h4>
              
              {/* Tower Status */}
              <div className="ml-2 space-y-1">
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Status</p>
                <div className="grid grid-cols-2 gap-1">
                  {filterOptions.towerStatus.map(status => (
                    <label key={status} className="flex items-center space-x-1.5 text-sm text-white/80">
                      <input
                        type="checkbox"
                        checked={filters.towerStatus.includes(status)}
                        onChange={() => toggleFilter('towerStatus', status)}
                        className="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-800"
                      />
                      <span>{status}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Tower Operator */}
              <div className="ml-2 space-y-1">
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Operator</p>
                <div className="grid grid-cols-1 gap-1 max-h-24 overflow-y-auto pr-1">
                  {filterOptions.towerOperator.map(operator => (
                    <label key={operator} className="flex items-center space-x-1.5 text-sm text-white/80">
                      <input
                        type="checkbox"
                        checked={filters.towerOperator.includes(operator)}
                        onChange={() => toggleFilter('towerOperator', operator)}
                        className="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-800"
                      />
                      <span>{operator}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Tower Type */}
              <div className="ml-2 space-y-1">
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Type</p>
                <div className="grid grid-cols-1 gap-1 max-h-24 overflow-y-auto pr-1">
                  {filterOptions.towerType.map(type => (
                    <label key={type} className="flex items-center space-x-1.5 text-sm text-white/80">
                      <input
                        type="checkbox"
                        checked={filters.towerType.includes(type)}
                        onChange={() => toggleFilter('towerType', type)}
                        className="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-800"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            {/* School Filters */}
            <div className="space-y-2">
              <h4 className="text-white text-sm font-medium flex items-center">
                <School className="h-3 w-3 mr-1.5 text-indigo-400" />
                School Filters
              </h4>
              
              {/* School Level */}
              <div className="ml-2 space-y-1">
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Level</p>
                <div className="grid grid-cols-1 gap-1 max-h-24 overflow-y-auto pr-1">
                  {filterOptions.schoolLevel.map(level => (
                    <label key={level} className="flex items-center space-x-1.5 text-sm text-white/80">
                      <input
                        type="checkbox"
                        checked={filters.schoolLevel.includes(level)}
                        onChange={() => toggleFilter('schoolLevel', level)}
                        className="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-800"
                      />
                      <span>{level}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* School Type */}
              <div className="ml-2 space-y-1">
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Type</p>
                <div className="grid grid-cols-1 gap-1 max-h-24 overflow-y-auto pr-1">
                  {filterOptions.schoolType.map(type => (
                    <label key={type} className="flex items-center space-x-1.5 text-sm text-white/80">
                      <input
                        type="checkbox"
                        checked={filters.schoolType.includes(type)}
                        onChange={() => toggleFilter('schoolType', type)}
                        className="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-800"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Hospital Filters */}
            <div className="space-y-2">
              <h4 className="text-white text-sm font-medium flex items-center">
                <Hospital className="h-3 w-3 mr-1.5 text-indigo-400" />
                Hospital Filters
              </h4>
              
              {/* Hospital Type */}
              <div className="ml-2 space-y-1">
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Type</p>
                <div className="grid grid-cols-1 gap-1 max-h-24 overflow-y-auto pr-1">
                  {filterOptions.hospitalType.map(type => (
                    <label key={type} className="flex items-center space-x-1.5 text-sm text-white/80">
                      <input
                        type="checkbox"
                        checked={filters.hospitalType.includes(type)}
                        onChange={() => toggleFilter('hospitalType', type)}
                        className="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-800"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Common Filters */}
            <div className="space-y-2">
              <h4 className="text-white text-sm font-medium">Common Filters</h4>
              
              {/* Internet Connectivity */}
              <div className="ml-2 space-y-1">
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Internet Connection</p>
                <div className="grid grid-cols-1 gap-1">
                  <label className="flex items-center space-x-1.5 text-sm text-white/80">
                    <input
                      type="radio"
                      checked={filters.hasInternet === true}
                      onChange={() => setBooleanFilter(true)}
                      name="internetConnection"
                      className="rounded-full border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-800"
                    />
                    <span>Has Internet</span>
                  </label>
                  <label className="flex items-center space-x-1.5 text-sm text-white/80">
                    <input
                      type="radio"
                      checked={filters.hasInternet === false}
                      onChange={() => setBooleanFilter(false)}
                      name="internetConnection"
                      className="rounded-full border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-800"
                    />
                    <span>No Internet</span>
                  </label>
                  <label className="flex items-center space-x-1.5 text-sm text-white/80">
                    <input
                      type="radio"
                      checked={filters.hasInternet === null}
                      onChange={() => setBooleanFilter(null)}
                      name="internetConnection"
                      className="rounded-full border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-800"
                    />
                    <span>Any</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Layer Controls Button */}
      <div className="absolute bottom-5 left-5 z-10">
        <button
          className="bg-indigo-600 text-white p-3 rounded-md shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
          onClick={() => setIsLayerControlOpen(!isLayerControlOpen)}
        >
          <Layers className="h-6 w-6" />
        </button>
      </div>
      
      {/* Layer Control Panel */}
      {isLayerControlOpen && (
        <div className="absolute bottom-20 left-5 z-10 bg-slate-800/95 backdrop-blur-md rounded-lg shadow-xl w-72 overflow-hidden">
          <div className="p-3 border-b border-slate-700">
            <h3 className="text-white text-sm font-medium flex items-center">
              <Layers className="h-4 w-4 mr-2" />
              Map Layers
            </h3>
          </div>
          
          <div className="p-3 space-y-4">
            {/* Infrastructure Layers */}
            <div className="space-y-3">
              {/* Towers Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{backgroundColor: '#4CAF50'}}></span>
                  <span className="text-white text-sm">Telecom Towers ({summary.towers})</span>
                </div>
                <button
                  onClick={() => toggleLayer('towers')}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                    activeLayers.towers ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`${
                      activeLayers.towers ? 'translate-x-5' : 'translate-x-1'
                    } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
              
              {/* Schools Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-white text-sm">Schools ({summary.schools})</span>
                </div>
                <button
                  onClick={() => toggleLayer('schools')}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                    activeLayers.schools ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`${
                      activeLayers.schools ? 'translate-x-5' : 'translate-x-1'
                    } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
              
              {/* Hospitals Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-white text-sm">Hospitals ({summary.hospitals})</span>
                </div>
                <button
                  onClick={() => toggleLayer('hospitals')}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                    activeLayers.hospitals ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`${
                      activeLayers.hospitals ? 'translate-x-5' : 'translate-x-1'
                    } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
              
              {/* Water Bodies Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-white text-sm">Water Bodies ({summary.waterBodies})</span>
                </div>
                <button
                  onClick={() => toggleLayer('waterBodies')}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                    activeLayers.waterBodies ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`${
                      activeLayers.waterBodies ? 'translate-x-5' : 'translate-x-1'
                    } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
              
              {/* District Boundaries Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-gray-500"></span>
                  <span className="text-white text-sm">Districts ({summary.districtsCount})</span>
                </div>
                <button
                  onClick={() => toggleLayer('districts')}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                    activeLayers.districts ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`${
                      activeLayers.districts ? 'translate-x-5' : 'translate-x-1'
                    } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
            </div>
            
            {/* Legend */}
            <div className="pt-2 border-t border-slate-700">
              <h4 className="text-white text-xs font-medium mb-2 flex items-center">
                <Info className="h-3 w-3 mr-1.5" />
                Legend
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-white/80">Active Tower</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  <span className="text-white/80">Maintenance Tower</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  <span className="text-white/80">Inactive Tower</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  <span className="text-white/80">School</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  <span className="text-white/80">Hospital</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  <span className="text-white/80">Water Body</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Dashboard Button */}
      <div className="absolute top-16 right-5 z-10">
        {!selectedFeature && (
          <button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-lg flex items-center space-x-2 transition-colors hover-rise"
            onClick={() => alert('Statistics Dashboard would open here')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <span className="text-sm font-medium">Coverage Dashboard</span>
          </button>
        )}
      </div>

      {/* Quick navigation pill */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-10 bg-slate-800/90 backdrop-blur-md rounded-full shadow-lg overflow-hidden">
        <div className="flex items-center px-1 py-1">
          <button 
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium ${
              activeLayers.towers ? 'bg-indigo-600 text-white' : 'text-white/80 hover:bg-slate-700'
            }`}
            onClick={() => setActiveLayers(prev => ({ ...prev, towers: !prev.towers }))}
          >
            <Radio className="h-3 w-3 mr-1" />
            <span>Towers</span>
          </button>
          <button 
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium ${
              activeLayers.schools ? 'bg-indigo-600 text-white' : 'text-white/80 hover:bg-slate-700'
            }`}
            onClick={() => setActiveLayers(prev => ({ ...prev, schools: !prev.schools }))}
          >
            <School className="h-3 w-3 mr-1" />
            <span>Schools</span>
          </button>
          <button 
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium ${
              activeLayers.hospitals ? 'bg-indigo-600 text-white' : 'text-white/80 hover:bg-slate-700'
            }`}
            onClick={() => setActiveLayers(prev => ({ ...prev, hospitals: !prev.hospitals }))}
          >
            <Hospital className="h-3 w-3 mr-1" />
            <span>Hospitals</span>
          </button>
          <button 
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium ${
              activeLayers.waterBodies ? 'bg-indigo-600 text-white' : 'text-white/80 hover:bg-slate-700'
            }`}
            onClick={() => setActiveLayers(prev => ({ ...prev, waterBodies: !prev.waterBodies }))}
          >
            <Droplet className="h-3 w-3 mr-1" />
            <span>Water</span>
          </button>
        </div>
      </div>

      {/* Active filters display */}
      {(filters.towerStatus.length > 0 || 
        filters.towerOperator.length > 0 || 
        filters.towerType.length > 0 || 
        filters.schoolLevel.length > 0 ||
        filters.schoolType.length > 0 ||
        filters.hospitalType.length > 0 ||
        filters.hasInternet !== null) && (
        <div className="absolute top-16 left-5 z-10 bg-slate-800/90 backdrop-blur-md rounded-lg p-2 shadow-lg max-w-md">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-white text-xs font-medium">Active Filters</h4>
            <button 
              onClick={resetFilters}
              className="text-white/70 hover:text-white text-xs"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap">
            {filters.towerStatus.map(status => (
              <div key={`filter-status-${status}`} className="filter-chip">
                <span>{status}</span>
                <button onClick={() => toggleFilter('towerStatus', status)}>×</button>
              </div>
            ))}
            {filters.towerOperator.map(operator => (
              <div key={`filter-operator-${operator}`} className="filter-chip">
                <span>{operator}</span>
                <button onClick={() => toggleFilter('towerOperator', operator)}>×</button>
              </div>
            ))}
            {/* Similar chips for other filter types */}
            {filters.hasInternet !== null && (
              <div className="filter-chip">
                <span>{filters.hasInternet ? 'Has Internet' : 'No Internet'}</span>
                <button onClick={() => setBooleanFilter(null)}>×</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium">Loading data...</span>
        </div>
      )}

      {/* Debug Panel - Comment out for production */}
      {/* {Object.keys(debug).length > 0 && (
        <div className="absolute bottom-20 right-5 z-10 bg-black/80 text-white p-3 rounded text-xs max-w-xs max-h-60 overflow-auto">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold">Debug Info:</h3>
            <button 
              onClick={() => setDebug({})}
              className="text-white/70 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <pre className="whitespace-pre-wrap">{JSON.stringify(debug, null, 2)}</pre>
        </div> */}
    </div>
  ) 
}