import React from 'react';
import './SegmentedControl.css';

/**
 * A reusable SegmentedControl component for tab-like switching.
 *
 * @param {Array<{value: string, label: string}>} options - Array of options.
 * @param {string} value - The current selected value.
 * @param {function} onChange - Function to call when an option is selected.
 */
const SegmentedControl = ({ options, value, onChange }) => {
    return (
        <div className="segmented-control">
            {options.map((option) => (
                <button
                    key={option.value}
                    className={`segment ${value === option.value ? 'active' : ''}`}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

export default SegmentedControl;
