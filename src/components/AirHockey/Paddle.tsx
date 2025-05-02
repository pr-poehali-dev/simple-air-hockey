
import React, { useEffect, useRef } from 'react';

interface PaddleProps {
  playerId: 'player1' | 'player2';
  position: { x: number; y: number };
  setPosition: (position: { x: number; y: number }) => void;
  fieldDimensions: { width: number; height: number };
  paddleRadius: number;
}

const Paddle: React.FC<PaddleProps> = ({ 
  playerId, 
  position, 
  setPosition, 
  fieldDimensions, 
  paddleRadius 
}) => {
  const paddleRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  
  const handleMouseDown = () => {
    isDragging.current = true;
  };
  
  const handleMouseUp = () => {
    isDragging.current = false;
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !paddleRef.current) return;
      
      const rect = paddleRef.current.parentElement?.getBoundingClientRect();
      if (!rect) return;
      
      let newX = e.clientX - rect.left - paddleRadius;
      let newY = e.clientY - rect.top - paddleRadius;
      
      // Boundary checks
      newX = Math.max(paddleRadius, Math.min(newX, fieldDimensions.width - paddleRadius));
      
      // Player 1 stays at the bottom half, Player 2 at the top half
      if (playerId === 'player1') {
        newY = Math.max(fieldDimensions.height / 2, Math.min(newY, fieldDimensions.height - paddleRadius));
      } else {
        newY = Math.max(paddleRadius, Math.min(newY, fieldDimensions.height / 2 - paddleRadius));
      }
      
      setPosition({ x: newX, y: newY });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [fieldDimensions, paddleRadius, playerId, setPosition]);
  
  return (
    <div
      ref={paddleRef}
      onMouseDown={handleMouseDown}
      className={`absolute rounded-full cursor-grab active:cursor-grabbing ${
        playerId === 'player1' ? 'bg-blue-500' : 'bg-red-500'
      }`}
      style={{
        width: paddleRadius * 2,
        height: paddleRadius * 2,
        left: position.x - paddleRadius,
        top: position.y - paddleRadius,
        touchAction: 'none',
      }}
    />
  );
};

export default Paddle;
