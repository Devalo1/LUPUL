import React from "react";

interface FilterBarProps {
  filter: "all" | "upcoming" | "past";
  setFilter: (filter: "all" | "upcoming" | "past") => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filter, setFilter }) => {
  return (
    <div className="sticky top-0 bg-white dark:bg-gray-800 shadow-md z-10">
      <div className="container mx-auto px-4 py-4 flex justify-center space-x-4">
        <button
          className={`px-4 py-2 rounded-md ${
            filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
          }`}
          onClick={() => setFilter("all")}
        >
          Toate
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            filter === "upcoming" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
          }`}
          onClick={() => setFilter("upcoming")}
        >
          Viitoare
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            filter === "past" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
          }`}
          onClick={() => setFilter("past")}
        >
          Trecute
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
