import { useState, useEffect, useRef } from 'react';

function ControlPanel({ config, onChange }) {
  const handleColorChange = (colorType, value) => {
    onChange({ [colorType]: value });
  };

  const handleMaterialChange = (material) => {
    onChange({ material });
  };

  const handleTypeChange = (type) => {
    onChange({ type });
  };

  return (
    <div className="control-panel">
      <h3>Customize Your Shoe</h3>
      
      <div className="control-group">
        <label>Shoe Type:</label>
        <select 
          value={config.type} 
          onChange={(e) => handleTypeChange(e.target.value)}
        >
          <option value="sneaker">Sneaker</option>
          <option value="boot">Boot</option>
          <option value="dress">Dress Shoe</option>
          <option value="casual">Casual</option>
        </select>
      </div>

      <div className="control-group">
        <label>Primary Color:</label>
        <input
          type="color"
          value={config.primaryColor}
          onChange={(e) => handleColorChange('primaryColor', e.target.value)}
        />
      </div>

      <div className="control-group">
        <label>Secondary Color:</label>
        <input
          type="color"
          value={config.secondaryColor}
          onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
        />
      </div>

      <div className="control-group">
        <label>Material:</label>
        <div className="radio-group">
          {['leather', 'canvas', 'synthetic'].map(material => (
            <label key={material}>
              <input
                type="radio"
                name="material"
                value={material}
                checked={config.material === material}
                onChange={(e) => handleMaterialChange(e.target.value)}
              />
              {material.charAt(0).toUpperCase() + material.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div className="control-group">
        <label>Size:</label>
        <input
          type="range"
          min="6"
          max="13"
          value={config.size}
          onChange={(e) => onChange({ size: parseInt(e.target.value) })}
        />
        <span className="size-display">Size {config.size}</span>
      </div>
    </div>
  );
}

export default ControlPanel;
