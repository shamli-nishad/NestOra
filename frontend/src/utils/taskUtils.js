
export const isTaskDue = (task, targetDate = new Date()) => {
    // If completed, not pending (usually filtered out before calling this, but safe to ignore here if needed)
    // determining "due"ness is independent of completion status for the schedule calculation,
    // but the user requirement is for "pending chores" count.

    // Normalize targetDate to start of day for accurate comparisons
    const date = new Date(targetDate);
    date.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = date.getTime() === today.getTime();

    switch (task.frequency) {
        case 'Daily':
            return true;

        case 'Weekly':
            if (!task.frequencyDays || task.frequencyDays.length === 0) return false;
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
            return task.frequencyDays.includes(todayName);

        case 'Monthly':
            // Checks if today is the Xth day of the month
            if (!task.frequencyDate) return false;
            return date.getDate() === parseInt(task.frequencyDate);

        case 'One-time':
            // Due on the specific date. 
            // ALSO due if it's overdue (i.e. due date was in the past) and it's not done?
            // The constraint says "due today (or overdue one-time tasks)".
            // So if today >= dueDate
            if (!task.dueDate) return false;
            // Parse YYYY-MM-DD manually to ensure local midnight time
            // otherwise new Date('2025-12-25') is UTC, which might be Dec 24th local.
            const [y, m, d] = task.dueDate.split('-').map(Number);
            const due = new Date(y, m - 1, d);
            due.setHours(0, 0, 0, 0);
            return date >= due;

        default:
            return false;
    }
};

export const isTaskOverdue = (task) => {
    // Only one-time tasks can be overdue
    if (task.frequency !== 'One-time' || !task.dueDate || task.completed) {
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [y, m, d] = task.dueDate.split('-').map(Number);
    const due = new Date(y, m - 1, d);
    due.setHours(0, 0, 0, 0);

    return due < today;
};

export const getNextDueDate = (task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextDate = new Date(today);

    switch (task.frequency) {
        case 'Daily':
            nextDate.setDate(today.getDate() + 1);
            return nextDate.toISOString().split('T')[0];

        case 'Weekly':
            if (!task.frequencyDays || task.frequencyDays.length === 0) return null;
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const todayIndex = today.getDay();

            // Find next day in the list
            // Create array of indices from chore days
            const targetIndices = task.frequencyDays.map(d => days.indexOf(d)).sort((a, b) => a - b);

            // Find first index > todayIndex
            let nextIndex = targetIndices.find(i => i > todayIndex);

            // If not found, wrap around to first index in list (next week)
            let daysToAdd = 0;
            if (nextIndex !== undefined) {
                daysToAdd = nextIndex - todayIndex;
            } else {
                nextIndex = targetIndices[0];
                daysToAdd = (7 - todayIndex) + nextIndex;
            }

            nextDate.setDate(today.getDate() + daysToAdd);
            return nextDate.toISOString().split('T')[0];

        case 'Monthly':
            if (!task.frequencyDate) return null;
            const targetDate = parseInt(task.frequencyDate);
            const currentDay = today.getDate();

            // If target date is in future this month, usually it would just be "Upcoming" pending task.
            // But if we are calculating "Next Due" for a COMPLETED task (done today), 
            // it implies next occurrence is Next Month.
            // Wait, logic check: 
            // If I do a monthly task early? (Today is 5th, due 15th). 
            // If completed, "Next" is next month's 15th. 
            // If due today (15th) and completed, "Next" is next month's 15th.

            // Correct logic: Set date to targetDate. 
            // If result <= today, add 1 month.
            nextDate.setDate(targetDate);
            if (nextDate <= today) {
                nextDate.setMonth(nextDate.getMonth() + 1);
            }
            return nextDate.toISOString().split('T')[0];

        case 'One-time':
        default:
            return null;
    }
};
