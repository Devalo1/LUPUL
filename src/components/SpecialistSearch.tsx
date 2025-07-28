import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaFilter, FaTimes, FaUserMd } from "react-icons/fa";

interface SpecialistSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  loading?: boolean;
  totalResults?: number;
}

export interface SearchFilters {
  searchTerm: string;
  specialization: string;
  isActive: boolean | null;
  sortBy: "name" | "specialization" | "rating" | "experience";
  sortOrder: "asc" | "desc";
}

// Lista de specializări disponibile
const AVAILABLE_SPECIALIZATIONS = [
  "Psihoterapie individuală",
  "Terapie de cuplu",
  "Terapie de familie",
  "Terapie cognitivă",
  "Psihanaliză",
  "Terapie comportamentală",
  "Consultație psihologică",
  "Evaluare psihologică",
  "Consultație psihiatrică",
  "Consiliere psihologică",
  "Workshop",
  "Coaching",
  "Dezvoltare personală",
  "Consiliere parentală",
  "Mindfulness",
  "Coaching sportiv",
  "Psihologie sportivă",
  "Antrenament mental",
  "Performanță sportivă",
];

const SpecialistSearch: React.FC<SpecialistSearchProps> = ({
  onSearch,
  onClear,
  loading = false,
  totalResults = 0,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    specialization: "",
    isActive: true,
    sortBy: "name",
    sortOrder: "asc",
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const onSearchRef = useRef(onSearch);

  // Update the ref when onSearch changes
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearchRef.current(filters);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters]); // Only depend on filters, not onSearch

  const handleInputChange = (
    field: keyof SearchFilters,
    value: string | boolean | null
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: "",
      specialization: "",
      isActive: true,
      sortBy: "name",
      sortOrder: "asc",
    });
    onClear();
  };

  const hasActiveFilters =
    filters.searchTerm || filters.specialization || filters.isActive === false;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Caută după nume sau specializare..."
              value={filters.searchTerm}
              onChange={(e) => handleInputChange("searchTerm", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            {filters.searchTerm && (
              <button
                onClick={() => handleInputChange("searchTerm", "")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Șterge text căutare"
                aria-label="Șterge text căutare"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Specialization Filter */}
        <div className="lg:w-64">
          <select
            value={filters.specialization}
            onChange={(e) =>
              handleInputChange("specialization", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
            title="Selectează specializarea"
            aria-label="Filtrează după specializare"
          >
            <option value="">Toate specializările</option>
            {AVAILABLE_SPECIALIZATIONS.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        {/* Toggle Advanced Filters */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            showAdvancedFilters
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <FaFilter />
          Filtre
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
            disabled={loading}
          >
            <FaTimes />
            Șterge
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={
                  filters.isActive === null
                    ? "all"
                    : filters.isActive
                      ? "active"
                      : "inactive"
                }
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange(
                    "isActive",
                    value === "all" ? null : value === "active"
                  );
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
                title="Selectează statusul"
                aria-label="Filtrează după status"
              >
                <option value="all">Toți specialiștii</option>
                <option value="active">Doar activi</option>
                <option value="inactive">Doar inactivi</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sortează după
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  handleInputChange(
                    "sortBy",
                    e.target.value as SearchFilters["sortBy"]
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
                title="Selectează criteriul de sortare"
                aria-label="Selectează criteriul de sortare"
              >
                <option value="name">Nume</option>
                <option value="specialization">Specializare</option>
                <option value="rating">Rating</option>
                <option value="experience">Experiență</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordine
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  handleInputChange(
                    "sortOrder",
                    e.target.value as SearchFilters["sortOrder"]
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
                title="Selectează ordinea de sortare"
                aria-label="Selectează ordinea de sortare"
              >
                <option value="asc">Crescător</option>
                <option value="desc">Descrescător</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Info */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <FaUserMd />
          <span>
            {loading
              ? "Se caută..."
              : `${totalResults} specialist${totalResults !== 1 ? "i" : ""} găsi${totalResults !== 1 ? "ți" : "t"}`}
          </span>
        </div>

        {hasActiveFilters && (
          <div className="text-blue-600">Filtre aplicate</div>
        )}
      </div>
    </div>
  );
};

export default SpecialistSearch;
