import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const WorkoutComplete: React.FC = () => {
  const { setCurrentScreen } = useAppContext();

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <div className="bg-gray-800/50 rounded-xl p-8 mb-6">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-2">Entraînement terminé !</h1>
        <p className="text-gray-400 mb-6">Félicitations pour ton effort aujourd'hui !</p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-yellow-400 text-2xl font-bold">+500</p>
            <p className="text-gray-400">XP gagnés</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-yellow-400 text-2xl font-bold">+100</p>
            <p className="text-gray-400">Muscle Coins</p>
          </div>
        </div>
        
        <button 
          onClick={() => setCurrentScreen('dashboard')}
          className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium"
        >
          Retour au tableau de bord
        </button>
      </div>
    </div>
  );
};

export default WorkoutComplete;
