
import React from 'react';
import AirHockeyGame from '@/components/AirHockey/AirHockeyGame';

const AirHockey = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Аэрохоккей</h1>
      <div className="mb-4 text-sm text-gray-600 max-w-md text-center">
        <p>Перетаскивайте биты мышкой. Игрок внизу (синий) играет против игрока вверху (красный).</p>
      </div>
      <AirHockeyGame />
    </div>
  );
};

export default AirHockey;
