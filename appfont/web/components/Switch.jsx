import React, { useState } from 'react';

const Switch = ({ initialStatus, type, id, onToggle }) => {
  const [isOn, setIsOn] = useState(initialStatus);

  const toggleSwitch = (e) => {
    e.stopPropagation()
    const newStatus = !isOn;
    setIsOn(newStatus);

    // Call the onToggle callback to handle the save action and show toast
    onToggle(type, newStatus, id);
  };

  return (
    <div className={`switch ${isOn ? 'on' : 'off'}`} onClick={toggleSwitch}>
      <div className="toggle"></div>
    </div>
  );
};

export default Switch;