
export const isChoreDue = (chore, targetDate = new Date()) => {
    // If completed, not pending (usually filtered out before calling this, but safe to ignore here if needed)
    // determining "due"ness is independent of completion status for the schedule calculation,
    // but the user requirement is for "pending chores" count.

    // Normalize targetDate to start of day for accurate comparisons
    const date = new Date(targetDate);
    date.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = date.getTime() === today.getTime();

    switch (chore.frequency) {
        case 'Daily':
            return true;

        case 'Weekly':
            if (!chore.frequencyDays || chore.frequencyDays.length === 0) return false;
            // day 0 = Sunday, 1 = Monday...
            // User likely selects Mon, Tue... Map appropriately.
            // Let's assume frequencyDays stores full day names or indices. 
            // Better to standardise on indices (0-6) or names ('Sunday').
            // Let's use names to match common UI patterns, or indices for easier logic.
            // Let's stick to: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            const dayMap = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
            const todayDay = date.getDay();
            // Check if today's day (e.g. 1 for Mon) is in the chore's list
            // Only return true if today matches one of the days
            // The input will likely be an array of strings like ['Mon', 'Wed']
            // So we convert date.getDay() to string or check mapping
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const todayName = days[todayDay];
            return chore.frequencyDays.includes(todayName);

        case 'Monthly':
            // Checks if today is the Xth day of the month
            if (!chore.frequencyDate) return false;
            return date.getDate() === parseInt(chore.frequencyDate);

        case 'One-time':
            // Due on the specific date. 
            // ALSO due if it's overdue (i.e. due date was in the past) and it's not done?
            // The constraint says "due today (or overdue one-time tasks)".
            // So if today >= dueDate
            if (!chore.dueDate) return false;
            // Parse YYYY-MM-DD manually to ensure local midnight time
            // otherwise new Date('2025-12-25') is UTC, which might be Dec 24th local.
            const [y, m, d] = chore.dueDate.split('-').map(Number);
            const due = new Date(y, m - 1, d);
            due.setHours(0, 0, 0, 0);
            return date >= due;

        default:
            return false;
    }
};
