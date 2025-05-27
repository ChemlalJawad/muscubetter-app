import React from 'react';
import { AppProvider } from './contexts/AppContext';
import Dashboard from './screens/Dashboard';
import WorkoutScreen from './screens/WorkoutScreen';
import WorkoutComplete from './screens/WorkoutComplete';
import { useAppContext } from './contexts/AppContext';

// Importation des icônes (vous devrez installer lucide-react)
// npm install lucide-react
import { Activity, TrendingUp, Dumbbell, Award } from 'lucide-react';

// Composant principal qui gère l'affichage des différents écrans
const FitnessAppContent: React.FC = () => {
  const { currentScreen, setCurrentScreen, activeTab, setActiveTab } = useAppContext();
  
  // Fonction pour gérer la navigation du menu en bas
  const handleNavigation = (screen: string, tab?: string) => {
    setCurrentScreen(screen);
    if (tab) {
      setActiveTab(tab);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white pb-20">
      {/* Affichage des écrans principaux */}
      {currentScreen === 'dashboard' && <Dashboard />}
      {currentScreen === 'workout' && <WorkoutScreen />}
      {currentScreen === 'workoutComplete' && <WorkoutComplete />}
      
      {/* Menu de navigation en bas */}
      {(currentScreen === 'dashboard' || currentScreen === 'badges' || currentScreen === 'stats' || currentScreen === 'social') && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800">
          <div className="grid grid-cols-4 gap-1 p-2">
            <button 
              onClick={() => handleNavigation('dashboard', 'home')}
              className={`flex flex-col items-center py-2 ${currentScreen === 'dashboard' && activeTab === 'home' ? 'text-purple-400' : 'text-gray-400'}`}
            >
              <Activity className="w-6 h-6 mb-1" />
              <span className="text-xs">Accueil</span>
            </button>
            <button 
              onClick={() => handleNavigation('dashboard', 'stats')}
              className={`flex flex-col items-center py-2 ${currentScreen === 'dashboard' && activeTab === 'stats' ? 'text-purple-400' : 'text-gray-400'}`}
            >
              <TrendingUp className="w-6 h-6 mb-1" />
              <span className="text-xs">Stats</span>
            </button>
            <button 
              onClick={() => handleNavigation('dashboard', 'quests')}
              className={`flex flex-col items-center py-2 ${currentScreen === 'dashboard' && activeTab === 'quests' ? 'text-purple-400' : 'text-gray-400'}`}
            >
              <Award className="w-6 h-6 mb-1" />
              <span className="text-xs">Quêtes</span>
            </button>
            <button 
              onClick={() => handleNavigation('dashboard', 'program')}
              className={`flex flex-col items-center py-2 ${currentScreen === 'dashboard' && activeTab === 'program' ? 'text-purple-400' : 'text-gray-400'}`}
            >
              <Dumbbell className="w-6 h-6 mb-1" />
              <span className="text-xs">Programme</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant wrapper qui fournit le contexte
const FitnessApp: React.FC = () => {
  return (
    <AppProvider>
      <FitnessAppContent />
    </AppProvider>
  );
};

export default FitnessApp;
