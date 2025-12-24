import { useLocalStorage } from './useLocalStorage';

/**
 * Hook to manage and apply data retention policies.
 * 
 * @returns {Object} { retentionDays, updateRetentionDays, applyRetention }
 */
export const useRetentionPolicy = () => {
    const [settings, setSettings] = useLocalStorage('nestora_settings', { retentionDays: 7 });

    const retentionDays = settings.retentionDays || 7;

    const updateRetentionDays = (days) => {
        setSettings({ ...settings, retentionDays: parseInt(days, 10) });
    };

    /**
     * Filters out items that are older than the retention period.
     * 
     * @param {Array} items - The list of items to filter.
     * @param {string} dateKey - The key in the item object containing the date string (ISO).
     * @param {Function} [filterCondition] - Optional callback. If provided, only items returning true are subject to retention check.
     * @returns {Array} - The cleaned list of items.
     */
    const applyRetention = (items, dateKey, filterCondition = null) => {
        if (!items || !Array.isArray(items)) return [];

        const now = new Date();
        const cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - retentionDays);

        return items.filter(item => {
            // If a filter condition is provided and the item doesn't match, keep it safe.
            if (filterCondition && !filterCondition(item)) {
                return true;
            }

            const itemDateStr = item[dateKey];
            if (!itemDateStr) return true; // If no date, keep it safe (or maybe discard? assuming keep for safety)

            const itemDate = new Date(itemDateStr);

            // Keep item if it is newer than the cutoff date
            return itemDate >= cutoffDate;
        });
    };

    return {
        retentionDays,
        updateRetentionDays,
        applyRetention
    };
};
