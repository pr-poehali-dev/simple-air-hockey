
import React from 'react';

interface ScoreBoardProps {
  player1Score: number;
  player2Score: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ player1Score, player2Score }) => {
  return (
    <div className="absolute top-2 left-0 right-0 flex justify-center gap-8 text-3xl font-bold">
      <div className="text-red-500">{player2Score}</div>
      <div className="text-gray-800">:</div>
      <div className="text-blue-500">{player1Score}</div>
    </div>
  );
};

export default ScoreBoard;
