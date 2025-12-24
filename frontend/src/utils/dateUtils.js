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
