// components/Popup.tsx
import React from 'react';

const Popup = ({ message, onClose }: { message: string; onClose: () => void }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default Popup;
