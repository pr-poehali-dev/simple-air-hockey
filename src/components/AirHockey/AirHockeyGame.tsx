
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
  
  // Track paddle movement for collision dynamics
  const [lastPlayer1Pos, setLastPlayer1Pos] = useState({ x: width / 2, y: height - 100 });
  const [lastPlayer2Pos, setLastPlayer2Pos] = useState({ x: width / 2, y: 100 });
  
  // Game state
  const [gameActive, setGameActive] = useState(true);
  const gameLoopRef = useRef<number | null>(null);
  
  // Reset puck after scoring
  const resetPuck = () => {
    setPuckPosition({ x: width / 2, y: height / 2 });
    // Give random initial velocity
    setPuckVelocity({ 
      x: (Math.random() * 6 - 3), 
      y: (Math.random() * 6 - 3)
    });
  };

  // Handle player movement and track for collision effects
  const handlePlayer1Move = (newPos: { x: number; y: number }) => {
    setLastPlayer1Pos(player1Position);
    setPlayer1Position(newPos);
  };

  const handlePlayer2Move = (newPos: { x: number; y: number }) => {
    setLastPlayer2Pos(player2Position);
    setPlayer2Position(newPos);
  };
  
  // Game loop
  useEffect(() => {
    // Initial puck velocity
    resetPuck();
    
    const updateGame = () => {
      if (!gameActive) return;
      
      // Calculate new puck position
      const newPosition = {
        x: puckPosition.x + puckVelocity.x,
        y: puckPosition.y + puckVelocity.y
      };
      
      let newVelocity = { ...puckVelocity };
      
      // Wall collisions
      if (newPosition.x - puckRadius <= 0) {
        newPosition.x = puckRadius;
        newVelocity.x = Math.abs(newVelocity.x);
      } else if (newPosition.x + puckRadius >= width) {
        newPosition.x = width - puckRadius;
        newVelocity.x = -Math.abs(newVelocity.x);
      }
      
      // Goal detections
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
      
      // Helper function to check paddle collision
      const checkPaddleCollision = (
        paddlePos: { x: number; y: number }, 
        lastPos: { x: number; y: number }
      ) => {
        const dx = paddlePos.x - newPosition.x;
        const dy = paddlePos.y - newPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < paddleRadius + puckRadius) {
          // Calculate paddle velocity
          const paddleVelX = paddlePos.x - lastPos.x;
          const paddleVelY = paddlePos.y - lastPos.y;
          
          // Calculate normalized collision vector
          const collNormX = dx / distance;
          const collNormY = dy / distance;
          
          // Calculate relative velocity
          const relVelX = newVelocity.x - paddleVelX;
          const relVelY = newVelocity.y - paddleVelY;
          
          // Calculate impulse with extra "hit strength"
          const impulseFactor = 1.5; // Hit stronger!
          const impulse = -(relVelX * collNormX + relVelY * collNormY) * impulseFactor;
          
          // Apply impulse to puck's velocity
          newVelocity.x += impulse * collNormX;
          newVelocity.y += impulse * collNormY;
          
          // Add paddle velocity for a more natural feel
          newVelocity.x += paddleVelX * 0.7;
          newVelocity.y += paddleVelY * 0.7;
          
          // Move puck to prevent overlapping
          const moveX = (paddleRadius + puckRadius - distance) * collNormX;
          const moveY = (paddleRadius + puckRadius - distance) * collNormY;
          
          newPosition.x -= moveX;
          newPosition.y -= moveY;
          
          // Add some randomness to prevent predictable rebounds
          newVelocity.x += (Math.random() - 0.5) * 0.3;
          newVelocity.y += (Math.random() - 0.5) * 0.3;
          
          // Ensure minimum speed after collision
          const speed = Math.sqrt(newVelocity.x * newVelocity.x + newVelocity.y * newVelocity.y);
          if (speed < 3) {
            const factor = 3 / speed;
            newVelocity.x *= factor;
            newVelocity.y *= factor;
          }
        }
      };
      
      checkPaddleCollision(player1Position, lastPlayer1Pos);
      checkPaddleCollision(player2Position, lastPlayer2Pos);
      
      // Apply friction
      newVelocity.x *= 0.98;
      newVelocity.y *= 0.98;
      
      // Update state
      setPuckPosition(newPosition);
      setPuckVelocity(newVelocity);
    };
    
    // Start game loop with framerate timing
    const runGameLoop = () => {
      updateGame();
      gameLoopRef.current = setTimeout(runGameLoop, frameRate);
    };
    
    runGameLoop();
    
    // Cleanup
    return () => {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
    };
  }, [gameActive, puckPosition, puckVelocity, player1Position, player2Position, lastPlayer1Pos, lastPlayer2Pos]);
  
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
        setPosition={handlePlayer1Move}
        fieldDimensions={{ width, height }}
        paddleRadius={paddleRadius}
      />
      <Paddle 
        playerId="player2"
        position={player2Position}
        setPosition={handlePlayer2Move}
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
