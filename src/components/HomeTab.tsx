import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Workout } from '../lib/database';

const HomeTab: React.FC = () => {
  const { 
    playerStats, 
    weeklyProgram, 
    startWorkout 
  } = useAppContext();

  return (
    <div>
      {/* Statistiques principales */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">Force</p>
          <p className="text-2xl font-bold">{playerStats?.force || 0}</p>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
            <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${playerStats?.force || 0}%` }}></div>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">Endurance</p>
          <p className="text-2xl font-bold">{playerStats?.endurance || 0}</p>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${playerStats?.endurance || 0}%` }}></div>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">Assiduité</p>
          <p className="text-2xl font-bold">{playerStats?.assiduity || 0}</p>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${playerStats?.assiduity || 0}%` }}></div>
          </div>
        </div>
      </div>
      
      {/* Programme d'entraînement */}
      <h2 className="text-xl font-semibold mb-4">Programme de la semaine</h2>
      <div className="grid grid-cols-1 gap-4 mb-6">
        {weeklyProgram.map((workout: Workout, index: number) => (
          <div key={workout.id || index} className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{workout.day}</h3>
                <p className="text-sm text-gray-400">{workout.type}</p>
              </div>
              <button 
                onClick={() => startWorkout(workout)}
                className={`px-4 py-2 rounded-lg ${workout.completed ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}
                disabled={workout.completed}
              >
                {workout.completed ? 'Terminé ✓' : 'Démarrer'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeTab;
