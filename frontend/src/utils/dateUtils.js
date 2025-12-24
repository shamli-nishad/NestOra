export const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'TH';
    switch (day % 10) {
        case 1: return 'ST';
        case 2: return 'ND';
        case 3: return 'RD';
        default: return 'TH';
    }
};

export const formatHeaderDate = (date = new Date()) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const monthName = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const dayNumber = date.getDate();
    const suffix = getOrdinalSuffix(dayNumber);

    return `${dayName}, ${monthName} ${dayNumber}${suffix}`;
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    // Append time to ensure local timezone interpretation or force timezone agnostic display
    // Easiest is to just split the YYYY-MM-DD string as the Date object constructor behavior 
    // with hyphens is inconsistent across browsers/timezones (often treated as UTC).
    // Replacing hyphens with slashes largely treats it as local time in many browsers, 
    // but the most robust way for display is to create the date object carefully.

    // Approach: Create date from parts to ensure local time midnight
    const parts = dateString.split('-');
    if (parts.length === 3) {
        // new Date(year, monthIndex, day)
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        return date.toLocaleDateString();
    }
    return new Date(dateString).toLocaleDateString();
};

export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
};

export const getLocalDateTimeForInput = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
