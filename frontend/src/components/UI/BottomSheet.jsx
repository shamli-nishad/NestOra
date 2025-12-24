import React from 'react';
import './BottomSheet.css';

/**
 * A reusable BottomSheet component that slides up from the bottom.
 *
 * @param {boolean} isOpen - Whether the sheet is visible.
 * @param {function} onClose - Function to call when closing the sheet.
 * @param {string} title - The title of the sheet.
 * @param {React.ReactNode} children - The content of the sheet.
 */
const BottomSheet = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
                {/* <div className="sheet-handle"></div> */}
                {title && <h2>{title}</h2>}
                {children}
            </div>
        </div>
    );
};

export default BottomSheet;
