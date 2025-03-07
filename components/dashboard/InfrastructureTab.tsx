"use client";

import {
  Radio,
  School as SchoolIcon,
  Hospital as HospitalIcon,
  Droplet,
  Search,
  Filter,
  Edit,
  Trash,
  Plus,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  ActiveTab,
  AuthUser,
  District,
  Tower,
  School,
  Hospital,
  WaterBody,
} from "../../types";

interface InfrastructureTabProps {
  activeTab: ActiveTab;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterRegion: string;
  setFilterRegion: (region: string) => void;
  filterDensity: "high" | "medium" | "low" | "";
  setFilterDensity: (density: "high" | "medium" | "low" | "") => void;
  handleSearch: () => void;
  user: AuthUser;
  districts: District[];
  towers: Tower[];
  schools: School[];
  hospitals: Hospital[];
  waterBodies: WaterBody[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  setItemsPerPage: (perPage: number) => void;
  handlePageChange: (page: number) => void;
  sortField: string;
  sortDirection: "asc" | "desc";
  handleSort: (field: string) => void;
  setShowAddForm: (show: boolean) => void;
  setEditingId: (id: string | null) => void;
  setFormData: (data: any) => void;
  setFormErrors: (errors: Record<string, string>) => void;
  setJsonFields: (fields: any) => void;
  handleEditRecord: (record: any) => void;
  handleDeleteRecord: (id: string, name: string) => void;
}

export default function InfrastructureTab({
  activeTab,
  searchTerm,
  setSearchTerm,
  filterRegion,
  setFilterRegion,
  filterDensity,
  setFilterDensity,
  handleSearch,
  user,
  districts,
  towers,
  schools,
  hospitals,
  waterBodies,
  totalCount,
  currentPage,
  itemsPerPage,
  setItemsPerPage,
  handlePageChange,
  sortField,
  sortDirection,
  handleSort,
  setShowAddForm,
  setEditingId,
  setFormData,
  setFormErrors,
  setJsonFields,
  handleEditRecord,
  handleDeleteRecord,
}: InfrastructureTabProps) {
  // Helper function to get district name by ID
  const getDistrictName = (districtId: string) => {
    const district = districts.find((d) => d.id === districtId);
    return district ? district.name : "Unknown";
  };

  const handleAddNew = () => {
    setShowAddForm(true);
    setEditingId(null);
    setFormData({});
    setFormErrors({});
    setJsonFields({});
  };

  // Calculate the total number of pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];

    // Display 5 page numbers max with current page in the middle when possible
    if (totalPages <= 5) {
      // Less than 5 pages total, just show all of them
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else if (currentPage <= 3) {
      // Current page is near the start
      for (let i = 1; i <= 5; i++) {
        pageNumbers.push(i);
      }
    } else if (currentPage >= totalPages - 2) {
      // Current page is near the end
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Current page is in the middle
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="space-y-6">
      {/* Search and filter controls */}
      <div className="flex flex-wrap gap-4 bg-white p-5 rounded-xl shadow-md border border-gray-200">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-600 mb-1">Search</label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Search size={16} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">District</label>
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Districts</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Population Density
          </label>
          <select
            value={filterDensity}
            onChange={(e) => setFilterDensity(e.target.value as any)}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="high">High Density</option>
            <option value="medium">Medium Density</option>
            <option value="low">Low Density</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center text-gray-800">
          {activeTab === "towers" && (
            <>
              <Radio size={20} className="mr-2 text-blue-600" />
              <span>Telecom Towers</span>
            </>
          )}
          {activeTab === "schools" && (
            <>
              <SchoolIcon size={20} className="mr-2 text-blue-600" />
              <span>Schools</span>
            </>
          )}
          {activeTab === "hospitals" && (
            <>
              <HospitalIcon size={20} className="mr-2 text-red-600" />
              <span>Hospitals</span>
            </>
          )}
          {activeTab === "waterBodies" && (
            <>
              <Droplet size={20} className="mr-2 text-cyan-600" />
              <span>Water Bodies</span>
            </>
          )}
          <span className="ml-2 text-sm text-gray-600">
            ({totalCount} total)
          </span>
        </h3>

        {(user.role === "admin" || user.role === "editor") && (
          <button
            onClick={handleAddNew}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Add New</span>
          </button>
        )}
      </div>

      {/* Data table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    {sortField === "name" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      ))}
                  </div>
                </th>

                {/* Towers columns */}
                {activeTab === "towers" && (
                  <>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("operator")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Operator</span>
                        {sortField === "operator" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        {sortField === "status" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("type")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Type</span>
                        {sortField === "type" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          ))}
                      </div>
                    </th>
                  </>
                )}

                {/* Schools columns */}
                {activeTab === "schools" && (
                  <>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("level")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Level</span>
                        {sortField === "level" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("type")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Type</span>
                        {sortField === "type" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("has_internet")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Internet</span>
                        {sortField === "has_internet" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          ))}
                      </div>
                    </th>
                  </>
                )}

                {/* Hospitals columns */}
                {activeTab === "hospitals" && (
                  <>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("type")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Type</span>
                        {sortField === "type" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("beds")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Beds</span>
                        {sortField === "beds" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("has_internet")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Internet</span>
                        {sortField === "has_internet" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          ))}
                      </div>
                    </th>
                  </>
                )}

                {/* Water Bodies columns */}
                {activeTab === "waterBodies" && (
                  <>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("type")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Type</span>
                        {sortField === "type" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("area_sqkm")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Area (km²)</span>
                        {sortField === "area_sqkm" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("is_protected")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Protected</span>
                        {sortField === "is_protected" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          ))}
                      </div>
                    </th>
                  </>
                )}

                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("district_id")}
                >
                  <div className="flex items-center space-x-1">
                    <span>District</span>
                    {sortField === "district_id" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      ))}
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {/* Towers */}
              {activeTab === "towers" &&
                towers.map((tower) => (
                  <tr
                    key={tower.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {tower.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {tower.operator}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          tower.status === "active"
                            ? "bg-green-100 text-green-800"
                            : tower.status === "maintenance"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {tower.status?.charAt(0).toUpperCase() +
                          tower.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {tower.type?.charAt(0).toUpperCase() +
                        tower.type?.slice(1)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {tower.district_id
                        ? getDistrictName(tower.district_id)
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditRecord(tower)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          disabled={user.role === "viewer"}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteRecord(tower.id, tower.name)
                          }
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                          disabled={user.role !== "admin"}
                          title="Delete"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* Schools */}
              {activeTab === "schools" &&
                schools.map((school) => (
                  <tr
                    key={school.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {school.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                      {school.level}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                      {school.type}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {school.has_internet ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          <CheckCircle size={12} className="mr-1" />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          <XCircle size={12} className="mr-1" />
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {school.district_id
                        ? getDistrictName(school.district_id)
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditRecord(school)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          disabled={user.role === "viewer"}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteRecord(school.id, school.name)
                          }
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                          disabled={user.role !== "admin"}
                          title="Delete"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* Hospitals */}
              {activeTab === "hospitals" &&
                hospitals.map((hospital) => (
                  <tr
                    key={hospital.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {hospital.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                      {hospital.type}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {hospital.beds || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {hospital.has_internet ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          <CheckCircle size={12} className="mr-1" />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          <XCircle size={12} className="mr-1" />
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {hospital.district_id
                        ? getDistrictName(hospital.district_id)
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditRecord(hospital)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          disabled={user.role === "viewer"}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteRecord(hospital.id, hospital.name)
                          }
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                          disabled={user.role !== "admin"}
                          title="Delete"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* Water Bodies */}
              {activeTab === "waterBodies" &&
                waterBodies.map((waterBody) => (
                  <tr
                    key={waterBody.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {waterBody.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                      {waterBody.type}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {waterBody.area_sqkm?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {waterBody.is_protected ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          <CheckCircle size={12} className="mr-1" />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          <XCircle size={12} className="mr-1" />
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {waterBody.district_id
                        ? getDistrictName(waterBody.district_id)
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditRecord(waterBody)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          disabled={user.role === "viewer"}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteRecord(waterBody.id, waterBody.name)
                          }
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                          disabled={user.role !== "admin"}
                          title="Delete"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* Empty states for each tab */}
              {activeTab === "towers" && towers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <Radio size={40} className="text-gray-400 mb-2" />
                      <p>
                        No towers found. Try adjusting your filters or add a new
                        tower.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {activeTab === "schools" && schools.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <SchoolIcon size={40} className="text-gray-400 mb-2" />
                      <p>
                        No schools found. Try adjusting your filters or add a
                        new school.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {activeTab === "hospitals" && hospitals.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <HospitalIcon size={40} className="text-gray-400 mb-2" />
                      <p>
                        No hospitals found. Try adjusting your filters or add a
                        new hospital.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {activeTab === "waterBodies" && waterBodies.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <Droplet size={40} className="text-gray-400 mb-2" />
                      <p>
                        No water bodies found. Try adjusting your filters or add
                        a new water body.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Fixed version */}

        {/* Simplified Pagination Section */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-wrap justify-between items-center gap-4">
          <div>
            <label className="text-sm text-gray-600 mr-2">
              Items per page:
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {totalCount > 0 ? (
              <>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalCount)} of{" "}
                {totalCount} entries
              </>
            ) : (
              <>No entries found</>
            )}
          </div>

          {totalCount > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage <= 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>

              {/* Direct page number buttons - much simpler approach */}
              <div className="flex space-x-1">
                {[
                  ...Array(Math.min(5, Math.ceil(totalCount / itemsPerPage))),
                ].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
                className={`px-3 py-1 rounded-md ${
                  currentPage >= Math.ceil(totalCount / itemsPerPage)
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
