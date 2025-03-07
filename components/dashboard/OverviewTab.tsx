"use client";

import { useState } from "react";
import {
  Radio,
  School,
  Hospital as HospitalIcon,
  Zap,
  Filter,
  Calendar,
  ChevronDown,
  Plus,
  Edit,
  Trash,
  BarChart2,
} from "lucide-react";
import {
  SummaryStats,
  District,
  Tower,
  School as SchoolType,
  Hospital as HospitalType,
  AuditLog,
} from "../../types";
import { formatRelativeTime } from "@/app/utils/helper";

interface OverviewTabProps {
  summaryStats: SummaryStats;
  districts: District[];
  recentActivity: AuditLog[];
  schools: SchoolType[];
  hospitals: HospitalType[];
  towers: Tower[];
}

export default function OverviewTab({
  summaryStats,
  districts,
  recentActivity,
  schools,
  hospitals,
  towers,
}: OverviewTabProps) {
  // Add state to track whether to show all districts or just the first 10
  const [showAllDistricts, setShowAllDistricts] = useState(false);
  
  // Toggle function to show/hide all districts
  const toggleShowAllDistricts = () => {
    setShowAllDistricts(prevState => !prevState);
  };
  
  // Determine which districts to display based on the state
  const displayedDistricts = showAllDistricts 
    ? districts 
    : districts.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Towers"
          value={summaryStats.totalTowers}
          icon={<Radio size={20} className="text-blue-600" />}
          bgColor="bg-blue-100"
          percentage={
            (summaryStats.activeTowers / summaryStats.totalTowers) * 100 || 0
          }
          subtext={`${summaryStats.activeTowers} active towers`}
        />

        <SummaryCard
          title="Schools & Education"
          value={summaryStats.totalSchools}
          icon={<School size={20} className="text-blue-600" />}
          bgColor="bg-blue-100"
          percentage={
            (summaryStats.schoolsWithInternet / summaryStats.totalSchools) *
              100 || 0
          }
          subtext={`${summaryStats.schoolsWithInternet} with internet`}
          color="bg-blue-500"
        />

        <SummaryCard
          title="Hospitals"
          value={summaryStats.totalHospitals}
          icon={<HospitalIcon size={20} className="text-red-600" />}
          bgColor="bg-red-100"
          percentage={
            (summaryStats.hospitalsWithInternet / summaryStats.totalHospitals) *
              100 || 0
          }
          subtext={`${summaryStats.hospitalsWithInternet} with internet`}
          color="bg-red-500"
        />

        <SummaryCard
          title="Population Coverage"
          value={`${((summaryStats.populationCovered / summaryStats.populationTotal) * 100 || 0).toFixed(1)}%`}
          icon={<Zap size={20} className="text-purple-600" />}
          bgColor="bg-purple-100"
          percentage={
            (summaryStats.populationCovered / summaryStats.populationTotal) *
              100 || 0
          }
          subtext={`${summaryStats.populationCovered.toLocaleString()} of ${summaryStats.populationTotal.toLocaleString()}`}
          color="bg-gradient-to-r from-blue-500 to-purple-500"
        />
      </div>

      {/* Quick stats and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Infrastructure by District */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Infrastructure by District {showAllDistricts && <span className="text-sm font-normal text-gray-600">({districts.length} total)</span>}
            </h3>
            <button className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors">
              <Filter size={16} />
            </button>
          </div>

          <div className={`${showAllDistricts ? "max-h-96" : "h-64"} overflow-auto`}>
            {districts.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      District
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Schools
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Hospitals
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Telecom
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {displayedDistricts.map((district) => {
                    // Safe counting that handles empty or undefined arrays
                    const districtSchools = (schools || []).filter(
                      (s) => s?.district_id === district.id
                    ).length;
                    const districtHospitals = (hospitals || []).filter(
                      (h) => h?.district_id === district.id
                    ).length;
                    const districtTowers = (towers || []).filter(
                      (t) => t?.district_id === district.id
                    ).length;

                    return (
                      <tr
                        key={district.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 py-2 text-sm whitespace-nowrap text-gray-900">
                          {district.name}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          <div className="flex items-center">
                            <span className="mr-2 text-gray-800">
                              {districtSchools}
                            </span>
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{
                                  width: `${Math.min(100, (districtSchools / 5) * 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm">
                          <div className="flex items-center">
                            <span className="mr-2 text-gray-800">
                              {districtHospitals}
                            </span>
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500 rounded-full"
                                style={{
                                  width: `${Math.min(100, (districtHospitals / 5) * 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm">
                          <div className="flex items-center">
                            <span className="mr-2 text-gray-800">
                              {districtTowers}
                            </span>
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{
                                  width: `${Math.min(100, (districtTowers / 10) * 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* If there are less than 10 districts and we're not showing all, add empty rows to maintain height */}
                  {!showAllDistricts && districts.length < 10 &&
                    Array(10 - districts.length)
                      .fill(0)
                      .map((_, index) => (
                        <tr key={`empty-${index}`}>
                          <td
                            colSpan={4}
                            className="px-3 py-2 text-sm text-gray-400 italic text-center"
                          >
                            {index === 0 && districts.length === 0
                              ? "No district data available"
                              : "\u00A0"}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No districts found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    District data could not be loaded.
                  </p>
                </div>
              </div>
            )}
          </div>

          {districts.length > 10 && (
            <div className="mt-3 text-center">
              <button 
                onClick={toggleShowAllDistricts}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center mx-auto"
              >
                {showAllDistricts ? (
                  <>
                    Show fewer districts
                    <ChevronDown className="ml-1 h-4 w-4 transform rotate-180" />
                  </>
                ) : (
                  <>
                    View all districts
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Recent Activity
            </h3>
            <button className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors">
              <Calendar size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {/* Display recent activities from audit logs */}
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.action === "create"
                        ? "bg-green-100 text-green-600"
                        : activity.action === "update"
                          ? "bg-blue-100 text-blue-600"
                          : activity.action === "delete"
                            ? "bg-red-100 text-red-600"
                            : activity.action === "analysis"
                              ? "bg-purple-100 text-purple-600"
                              : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {activity.action === "create" && <Plus size={18} />}
                    {activity.action === "update" && <Edit size={18} />}
                    {activity.action === "delete" && <Trash size={18} />}
                    {activity.action === "analysis" && <BarChart2 size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.details}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatRelativeTime(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              // Fallback activities if none exist
              <p className="text-center text-gray-500">
                No recent activity found
              </p>
            )}
          </div>
          <div className="mt-3 text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm">
              View all activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Summary card component for dashboard metrics
interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor: string;
  percentage: number;
  subtext: string;
  color?: string;
}

function SummaryCard({
  title,
  value,
  icon,
  bgColor,
  percentage,
  subtext,
  color = "bg-green-500",
}: SummaryCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-2xl font-bold mt-1 text-gray-800">{value}</p>
        </div>
        <div className={`p-2 ${bgColor} rounded-lg`}>{icon}</div>
      </div>
      <div className="mt-3 flex items-center text-xs text-gray-600">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} rounded-full`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="ml-2 text-green-700">{percentage.toFixed(1)}%</span>
      </div>
      <p className="mt-1 text-xs text-gray-600">{subtext}</p>
    </div>
  );
}