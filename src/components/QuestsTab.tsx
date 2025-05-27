import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { DailyQuest } from '../lib/database';

const QuestsTab: React.FC = () => {
  const { 
    dailyQuests, 
    completeQuest, 
    updateWaterIntake 
  } = useAppContext();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Quêtes journalières</h2>
      
      <div className="space-y-4">
        {dailyQuests.map((quest: DailyQuest) => (
          <div key={quest.id} className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="text-2xl mr-3">{quest.icon}</div>
                <div>
                  <p className="font-medium">{quest.name}</p>
                  <p className="text-sm text-gray-400">{quest.description}</p>
                </div>
              </div>
              {quest.progress !== undefined ? (
                <button 
                  onClick={updateWaterIntake}
                  className={`rounded-full p-2 ${quest.completed ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}
                >
                  <span className="text-lg">💧</span>
                </button>
              ) : (
                <button 
                  onClick={() => quest.id && completeQuest(quest.id)}
                  className={`rounded-full p-2 ${quest.completed ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}
                  disabled={quest.completed}
                >
                  {quest.completed ? <span className="text-lg">✅</span> : <span className="text-lg">💧</span>}
                </button>
              )}
            </div>
            
            {/* Barre de progression pour la quête d'hydratation */}
            {quest.progress !== undefined && (
              <div className="mt-2">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(quest.progress / (quest.max || 2)) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>{quest.progress} / {quest.max || 2}</span>
                  <span>+{quest.xp} XP</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestsTab;
