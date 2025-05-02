
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
  
  // Previous paddle positions for collision detection
  const prevPlayer1Pos = useRef({ x: width / 2, y: height - 100 });
  const prevPlayer2Pos = useRef({ x: width / 2, y: 100 });
  
  // Game state
  const [gameActive, setGameActive] = useState(true);
  const animationFrameId = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(Date.now());
  
  // Reset puck after scoring
  const resetPuck = () => {
    setPuckPosition({ x: width / 2, y: height / 2 });
    // Give the puck some initial velocity
    setPuckVelocity({ 
      x: (Math.random() * 2 - 1) * 2, // Stronger horizontal velocity
      y: (Math.random() * 2 - 1) * 2  // Stronger vertical velocity
    });
  };
  
  // Check collisions and update positions
  const updateGameState = () => {
    const now = Date.now();
    const deltaTime = Math.min(now - lastUpdateTime.current, 50); // Cap deltaTime at 50ms
    lastUpdateTime.current = now;
    
    if (!gameActive) return;
    
    // Update puck position
    const newPosition = {
      x: puckPosition.x + puckVelocity.x * deltaTime * 0.2,
      y: puckPosition.y + puckVelocity.y * deltaTime * 0.2
    };
    
    // Wall collisions
    let newVelocity = { ...puckVelocity };
    
    // Left and right walls
    if (newPosition.x - puckRadius <= 0) {
      newPosition.x = puckRadius; // Prevent getting stuck in the wall
      newVelocity.x = Math.abs(newVelocity.x) * 0.9; // Bounce with friction
    } else if (newPosition.x + puckRadius >= width) {
      newPosition.x = width - puckRadius; // Prevent getting stuck in the wall
      newVelocity.x = -Math.abs(newVelocity.x) * 0.9; // Bounce with friction
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
    
    // Paddle collisions (improved)
    const checkPaddleCollision = (paddlePos: { x: number; y: number }, prevPos: React.MutableRefObject<{ x: number; y: number }>) => {
      const dx = paddlePos.x - newPosition.x;
      const dy = paddlePos.y - newPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < paddleRadius + puckRadius) {
        // Calculate movement vector of the paddle
        const paddleMovementX = paddlePos.x - prevPos.current.x;
        const paddleMovementY = paddlePos.y - prevPos.current.y;
        
        // Calculate impact angle
        const angle = Math.atan2(dy, dx);
        
        // Base speed from the paddle's movement + existing puck speed
        const paddleSpeed = Math.sqrt(paddleMovementX * paddleMovementX + paddleMovementY * paddleMovementY);
        const puckSpeed = Math.sqrt(newVelocity.x * newVelocity.x + newVelocity.y * newVelocity.y);
        
        // Combine paddle and puck speed with a stronger effect from the paddle
        const finalSpeed = Math.max(puckSpeed, paddleSpeed * 2) + 5; // Minimum speed and boost
        
        // Apply new velocity - direction opposite from impact, speed based on paddle movement
        newVelocity.x = -Math.cos(angle) * finalSpeed;
        newVelocity.y = -Math.sin(angle) * finalSpeed;
        
        // Ensure puck doesn't get stuck in paddle
        const newDist = paddleRadius + puckRadius;
        newPosition.x = paddlePos.x - Math.cos(angle) * newDist;
        newPosition.y = paddlePos.y - Math.sin(angle) * newDist;
        
        // Update previous position
        prevPos.current = { ...paddlePos };
      }
    };
    
    checkPaddleCollision(player1Position, prevPlayer1Pos);
    checkPaddleCollision(player2Position, prevPlayer2Pos);
    
    // Apply friction (reduce speed over time)
    newVelocity.x *= 0.985;
    newVelocity.y *= 0.985;
    
    // Ensure minimum speed to avoid the puck stopping completely
    if (Math.abs(newVelocity.x) < 0.1 && Math.abs(newVelocity.y) < 0.1) {
      newVelocity.x = (Math.random() * 2 - 1) * 0.5;
      newVelocity.y = (Math.random() * 2 - 1) * 0.5;
    }
    
    // Update state
    setPuckPosition(newPosition);
    setPuckVelocity(newVelocity);
  };
  
  // Game loop
  useEffect(() => {
    // Start with a random direction
    resetPuck();
    
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
  
  // Update previous positions when current positions change
  useEffect(() => {
    prevPlayer1Pos.current = player1Position;
  }, [player1Position]);
  
  useEffect(() => {
    prevPlayer2Pos.current = player2Position;
  }, [player2Position]);
  
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
      
      {/* Reset button */}
      <button
        className="absolute bottom-2 right-2 bg-gray-200 hover:bg-gray-300 text-black px-2 py-1 rounded text-sm"
        onClick={resetPuck}
      >
        Сбросить шайбу
      </button>
    </div>
  );
};

export default AirHockeyGame;
