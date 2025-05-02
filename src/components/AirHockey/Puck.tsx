
import React from 'react';

interface PuckProps {
  position: { x: number; y: number };
  puckRadius: number;
}

const Puck: React.FC<PuckProps> = ({ position, puckRadius }) => {
  return (
    <div
      className="absolute rounded-full bg-black"
      style={{
        width: puckRadius * 2,
        height: puckRadius * 2,
        left: position.x - puckRadius,
        top: position.y - puckRadius,
      }}
    />
  );
};

export default Puck;
