import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const RestTimer: React.FC = () => {
  const { restTime, skipRest } = useAppContext();

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 mb-6 text-center">
      <h2 className="text-xl font-semibold mb-2">Temps de repos</h2>
      <p className="text-4xl font-bold mb-4">{restTime} s</p>
      <button 
        onClick={skipRest}
        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium"
      >
        Passer
      </button>
    </div>
  );
};

export default RestTimer;
