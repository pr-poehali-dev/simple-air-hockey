
import React, { useState, useEffect, useRef } from 'react';
import Paddle from './Paddle';
import Puck from './Puck';
import ScoreBoard from './ScoreBoard';

interface AirHockeyGameProps {
  width?: number;
  height?: number;
}

const AirHockeyGame: React.FC<AirHockeyGameProps> = ({ 
  width = 600, 
  height = 800 
}) => {
  const paddleRadius = 30;
  const puckRadius = 20;
  const frameRate = 16; // ~60fps
  
  // State for player positions
  const [player1Position, setPlayer1Position] = useState({ x: width / 2, y: height - 100 });
  const [player2Position, setPlayer2Position] = useState({ x: width / 2, y: 100 });
  
  // State for puck
  const [puckPosition, setPuckPosition] = useState({ x: width / 2, y: height / 2 });
  const [puckVelocity, setPuckVelocity] = useState({ x: 0, y: 0 });
  
  // Score
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  
  // Game state
  const [gameActive, setGameActive] = useState(true);
  const animationFrameId = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(Date.now());
  
  // Reset puck after scoring
  const resetPuck = () => {
    setPuckPosition({ x: width / 2, y: height / 2 });
    setPuckVelocity({ 
      x: Math.random() * 2 - 1, 
      y: Math.random() * 2 - 1 
    });
  };
  
  // Check collisions and update positions
  const updateGameState = () => {
    const now = Date.now();
    const deltaTime = now - lastUpdateTime.current;
    lastUpdateTime.current = now;
    
    if (!gameActive) return;
    
    // Update puck position
    const newPosition = {
      x: puckPosition.x + puckVelocity.x * deltaTime * 0.3,
      y: puckPosition.y + puckVelocity.y * deltaTime * 0.3
    };
    
    // Wall collisions
    let newVelocity = { ...puckVelocity };
    
    // Left and right walls
    if (newPosition.x - puckRadius <= 0 || newPosition.x + puckRadius >= width) {
      newVelocity.x = -newVelocity.x * 0.9; // Bounce with some friction
    }
    
    // Goals/Top and Bottom
    if (newPosition.y - puckRadius <= 0) {
      // Player 1 scores
      setPlayer1Score(prev => prev + 1);
      resetPuck();
      return;
    } else if (newPosition.y + puckRadius >= height) {
      // Player 2 scores
      setPlayer2Score(prev => prev + 1);
      resetPuck();
      return;
    }
    
    // Paddle collisions
    const checkPaddleCollision = (paddlePos: { x: number; y: number }) => {
      const dx = paddlePos.x - newPosition.x;
      const dy = paddlePos.y - newPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < paddleRadius + puckRadius) {
        // Calculate new velocity based on impact angle
        const angle = Math.atan2(dy, dx);
        const speed = Math.sqrt(newVelocity.x * newVelocity.x + newVelocity.y * newVelocity.y);
        
        // Push puck away from paddle
        newVelocity.x = -Math.cos(angle) * speed * 1.05; // Slight speed increase
        newVelocity.y = -Math.sin(angle) * speed * 1.05;
        
        // Ensure puck doesn't get stuck in paddle
        const newDist = paddleRadius + puckRadius;
        newPosition.x = paddlePos.x - Math.cos(angle) * newDist;
        newPosition.y = paddlePos.y - Math.sin(angle) * newDist;
      }
    };
    
    checkPaddleCollision(player1Position);
    checkPaddleCollision(player2Position);
    
    // Apply small friction
    newVelocity.x *= 0.995;
    newVelocity.y *= 0.995;
    
    // Update state
    setPuckPosition(newPosition);
    setPuckVelocity(newVelocity);
  };
  
  // Game loop
  useEffect(() => {
    // Start with a random direction
    setPuckVelocity({ 
      x: (Math.random() * 2 - 1) * 0.5, 
      y: (Math.random() * 2 - 1) * 0.5 
    });
    
    const gameLoop = () => {
      updateGameState();
      animationFrameId.current = window.setTimeout(gameLoop, frameRate);
    };
    
    gameLoop();
    
    return () => {
      if (animationFrameId.current !== null) {
        clearTimeout(animationFrameId.current);
      }
    };
  }, [gameActive]);
  
  return (
    <div 
      className="relative bg-green-100 border-4 border-gray-800 overflow-hidden"
      style={{ width, height }}
    >
      {/* Center line */}
      <div 
        className="absolute bg-gray-400 left-0 right-0" 
        style={{ top: height / 2 - 1, height: 2 }}
      />
      
      {/* Center circle */}
      <div 
        className="absolute border-2 border-gray-400 rounded-full"
        style={{ 
          width: 100, 
          height: 100, 
          left: width / 2 - 50, 
          top: height / 2 - 50 
        }}
      />
      
      {/* Paddles */}
      <Paddle 
        playerId="player1"
        position={player1Position}
        setPosition={setPlayer1Position}
        fieldDimensions={{ width, height }}
        paddleRadius={paddleRadius}
      />
      <Paddle 
        playerId="player2"
        position={player2Position}
        setPosition={setPlayer2Position}
        fieldDimensions={{ width, height }}
        paddleRadius={paddleRadius}
      />
      
      {/* Puck */}
      <Puck position={puckPosition} puckRadius={puckRadius} />
      
      {/* Score */}
      <ScoreBoard player1Score={player1Score} player2Score={player2Score} />
    </div>
  );
};

export default AirHockeyGame;
