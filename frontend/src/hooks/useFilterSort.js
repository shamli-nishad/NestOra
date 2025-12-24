import { useState, useMemo } from 'react';

/**
 * Custom hook for filtering and sorting arrays of objects.
 * 
 * @param {Array} data - The array of data to filter and sort.
 * @param {Object} config - Initial configuration.
 * @param {Object} config.initialFilters - Initial state for filters { key: value }.
 * @param {Object} config.initialSort - Initial sort state { key: string, direction: 'asc' | 'desc' }.
 * @param {Function} config.sortFunctions - Custom sort functions { key: (a, b) => number }.
 * @returns {Object} - { processedData, filters, setFilter, sortConfig, setSortConfig }
 */
export const useFilterSort = (data, { initialFilters = {}, initialSort = { key: '', direction: 'asc' }, sortFunctions = {} } = {}) => {
    const [filters, setFilters] = useState(initialFilters);
    const [sortConfig, setSortConfig] = useState(initialSort);

    const setFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const processedData = useMemo(() => {
        if (!data) return [];

        let result = [...data];

        // 1. Apply Filters
        Object.keys(filters).forEach(key => {
            const filterValue = filters[key];
            if (filterValue && filterValue !== 'All') {
                result = result.filter(item => {
                    const itemValue = item[key];
                    // Handle simple equality or array inclusion (e.g. if item has multiple tags)
                    return itemValue === filterValue;
                });
            }
        });

        // 2. Apply Sorting
        if (sortConfig.key) {
            const { key, direction } = sortConfig;

            result.sort((a, b) => {
                // Use custom sort function if provided
                if (sortFunctions[key]) {
                    return sortFunctions[key](a, b, direction);
                }

                // Default sorting logic
                const aValue = a[key] || '';
                const bValue = b[key] || '';

                if (aValue < bValue) return direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [data, filters, sortConfig, sortFunctions]);

    return {
        processedData,
        filters,
        setFilter,
        sortConfig,
        setSortConfig
    };
};
