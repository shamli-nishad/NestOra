import React from 'react';
import './FilterBar.css';
import { Filter, ArrowUpDown } from 'lucide-react';

const FilterBar = ({
    filterOptions = [], // [{ key: 'category', label: 'Category', options: ['A', 'B'] }]
    sortOptions = [], // [{ value: 'date', label: 'Date' }]
    currentFilters,
    onFilterChange,
    currentSort,
    onSortChange
}) => {
    return (
        <div className="filter-bar">
            <div className="filters-group">
                <Filter size={16} className="filter-icon" />
                {filterOptions.map((filter) => (
                    <div key={filter.key} className="filter-item">
                        <select
                            value={currentFilters[filter.key] || 'All'}
                            onChange={(e) => onFilterChange(filter.key, e.target.value)}
                            className="filter-select"
                        >
                            <option value="All">{filter.label}: All</option>
                            {filter.options.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            <div className="sort-group">
                <ArrowUpDown size={16} className="filter-icon" />
                <select
                    value={currentSort.key}
                    onChange={(e) => onSortChange({ key: e.target.value, direction: 'asc' })} // Default to asc, user can maybe toggle later
                    className="filter-select sort-select"
                >
                    <option value="" disabled>Sort By</option>
                    {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {/* Optional: Add button to toggle direction */}
                {currentSort.key && (
                    <button
                        className="sort-direction-btn"
                        onClick={() => onSortChange({ ...currentSort, direction: currentSort.direction === 'asc' ? 'desc' : 'asc' })}
                    >
                        {currentSort.direction === 'asc' ? '↑' : '↓'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default FilterBar;
