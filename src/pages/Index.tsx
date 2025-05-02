
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 color-black text-black">Добро пожаловать!</h1>
        <p className="text-xl text-gray-600 mb-6">Выберите игру, чтобы начать</p>
        <Link to="/airhockey">
          <Button className="bg-blue-500 hover:bg-blue-600">Играть в Аэрохоккей</Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
