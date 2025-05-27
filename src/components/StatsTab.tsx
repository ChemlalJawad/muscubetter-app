import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const StatsTab: React.FC = () => {
  const { playerStats, userLevel } = useAppContext();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Mes statistiques</h2>
      
      {/* Statistiques détaillées */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
        <h3 className="font-medium mb-2">Performance globale</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Poids total soulevé</p>
            <p className="text-xl font-bold">{playerStats?.total_weight_lifted || 0} kg</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Entraînements terminés</p>
            <p className="text-xl font-bold">{playerStats?.total_workouts_completed || 0}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Série actuelle</p>
            <p className="text-xl font-bold">{playerStats?.streak_days || 0} jours</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Niveau actuel</p>
            <p className="text-xl font-bold">{userLevel}</p>
          </div>
        </div>
      </div>
      
      {/* Graphique de progression (simplifié) */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="font-medium mb-4">Progression</h3>
        <div className="h-40 flex items-end justify-between">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="w-8 bg-blue-500/20 rounded-t-md" style={{ height: `${Math.random() * 70 + 20}%` }}></div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>Lun</span>
          <span>Mar</span>
          <span>Mer</span>
          <span>Jeu</span>
          <span>Ven</span>
          <span>Sam</span>
          <span>Dim</span>
        </div>
      </div>
    </div>
  );
};

export default StatsTab;
