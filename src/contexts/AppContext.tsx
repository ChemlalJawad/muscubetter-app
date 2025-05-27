import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { DataService } from '../lib/dataService';
import { 
  Player, 
  PlayerStats, 
  Workout, 
  DailyQuest 
} from '../lib/database';

// Définition du type pour le contexte
interface AppContextType {
  // États utilisateur
  currentPlayer: Player | null;
  userLevel: number;
  userXP: number;
  muscleCoins: number;
  playerStats: PlayerStats | null;
  
  // États de navigation
  currentScreen: string;
  activeTab: string;
  
  // États d'entraînement
  weeklyProgram: Workout[];
  currentWorkout: Workout | null;
  workoutStarted: boolean;
  isResting: boolean;
  restTime: number;
  currentExerciseIndex: number;
  currentSet: number;
  
  // États des quêtes
  dailyQuests: DailyQuest[];
  
  // Fonctions de mise à jour
  setCurrentScreen: (screen: string) => void;
  setActiveTab: (tab: string) => void;
  startWorkout: (workout: Workout) => void;
  completeQuest: (questId: string) => Promise<void>;
  updateWaterIntake: () => void;
  completeSet: () => void;
  skipRest: () => void;
  completeWorkout: () => Promise<void>;
  setWorkoutStarted: (started: boolean) => void;
}

// Création du contexte avec des valeurs par défaut
const AppContext = createContext<AppContextType | null>(null);

// Hook personnalisé pour utiliser le contexte
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext doit être utilisé à l\'intérieur d\'un AppProvider');
  }
  return context;
};

// Props pour le provider
interface AppProviderProps {
  children: ReactNode;
}

// Provider du contexte
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // États pour la navigation et l'interface utilisateur
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('home');
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  
  // États pour les données utilisateur
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [userXP, setUserXP] = useState<number>(0);
  const [muscleCoins, setMuscleCoins] = useState<number>(250);
  
  // États pour les statistiques et les programmes
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [weeklyProgram, setWeeklyProgram] = useState<Workout[]>([]);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  
  // États pour l'entraînement en cours
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  
  // Fonction pour vérifier si le niveau augmente
  const checkLevelUp = (newXP: number) => {
    const newLevel = Math.floor(newXP / 1000) + 1;
    if (newLevel > userLevel) {
      setUserLevel(newLevel);
    }
  };

  // Fonction pour compléter une quête
  const completeQuest = async (questId: string) => {
    // Mettre à jour l'état local
    setDailyQuests(prevQuests => 
      prevQuests.map(quest => 
        quest.id === questId 
          ? { ...quest, completed: true } 
          : quest
      )
    );
    
    // Mettre à jour les statistiques utilisateur
    const completedQuest = dailyQuests.find(q => q.id === questId);
    if (completedQuest) {
      // Calculer les nouvelles valeurs d'XP et de Muscle Coins
      const newXP = userXP + completedQuest.xp;
      const newMuscleCoins = muscleCoins + completedQuest.coins;
      
      // Mettre à jour l'état local
      setUserXP(newXP);
      setMuscleCoins(newMuscleCoins);
      checkLevelUp(newXP);
      
      // Sauvegarder dans Supabase
      try {
        // 1. Mettre à jour le statut de la quête
        await DataService.updateQuestCompletion(questId, true);
        console.log(`Quête ${questId} marquée comme complétée dans Supabase`);
        
        // 2. Mettre à jour l'XP et les Muscle Coins du joueur
        const playerId = 'jawad-player-id';
        await DataService.updatePlayerXP(playerId, newXP, newMuscleCoins);
        console.log(`XP et Muscle Coins mis à jour dans Supabase: XP=${newXP}, Coins=${newMuscleCoins}`);
        
        // 3. Mettre à jour les statistiques du joueur
        const currentStats = await DataService.getPlayerStats(playerId);
        if (currentStats) {
          await DataService.updatePlayerStats({
            ...currentStats,
            assiduity: currentStats.assiduity + 1
          });
          console.log('Statistiques du joueur mises à jour dans Supabase');
        }
      } catch (err) {
        console.error('Erreur lors de la mise à jour de la quête dans Supabase:', err);
      }
    }
  };

  // Fonction pour mettre à jour l'hydratation
  const updateWaterIntake = () => {
    // Trouver la quête d'hydratation
    const waterQuest = dailyQuests.find(q => q.id === 'quest-hydration');
    if (!waterQuest || waterQuest.completed) return;
    
    // Augmenter la progression
    const newProgress = (waterQuest.progress || 0) + 0.5;
    
    // Mettre à jour l'état local
    setDailyQuests(prevQuests => 
      prevQuests.map(q => 
        q.id === 'quest-hydration' 
          ? { 
              ...q, 
              progress: newProgress,
              completed: newProgress >= (q.max || 2)
            } 
          : q
      )
    );
    
    // Si la quête est complétée, ajouter XP et pièces
    if (newProgress >= (waterQuest.max || 2)) {
      const newXP = userXP + (waterQuest.xp || 50);
      const newMuscleCoins = muscleCoins + (waterQuest.coins || 10);
      
      setUserXP(newXP);
      setMuscleCoins(newMuscleCoins);
      checkLevelUp(newXP);
      
      // Sauvegarder dans Supabase
      DataService.updateQuestCompletion('quest-hydration', true)
        .then(() => {
          console.log('Quête d\'hydratation complétée dans Supabase');
          
          // Mettre à jour l'XP et les Muscle Coins
          const playerId = 'jawad-player-id';
          return DataService.updatePlayerXP(playerId, newXP, newMuscleCoins);
        })
        .then(() => {
          console.log(`XP et Muscle Coins mis à jour dans Supabase: XP=${newXP}, Coins=${newMuscleCoins}`);
        })
        .catch(err => console.error('Erreur lors de la mise à jour de la quête:', err));
    } else {
      // Mettre à jour la progression dans Supabase
      DataService.updateQuestCompletion('quest-hydration', false, newProgress)
        .then(() => console.log('Progression d\'hydratation mise à jour dans Supabase'))
        .catch(err => console.error('Erreur lors de la mise à jour de la progression:', err));
    }
  };

  // Fonction pour démarrer un entraînement
  const startWorkout = (workout: Workout) => {
    setCurrentWorkout(workout);
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setWorkoutStarted(false);
    setCurrentScreen('workout');
  };

  // Fonction pour compléter une série d'exercice
  const completeSet = () => {
    if (!currentWorkout) return;
    
    // Si nous avons terminé toutes les séries de cet exercice
    if (currentSet >= (currentWorkout.exercises[currentExerciseIndex]?.sets || 1)) {
      // Si c'était le dernier exercice, terminer l'entraînement
      if (currentExerciseIndex >= currentWorkout.exercises.length - 1) {
        completeWorkout();
        return;
      }
      
      // Sinon, passer à l'exercice suivant
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
    } else {
      // Sinon, passer à la série suivante
      setCurrentSet(prev => prev + 1);
    }
    
    // Commencer le temps de repos
    setIsResting(true);
    setRestTime(currentWorkout.exercises[currentExerciseIndex]?.rest_time || 60);
  };

  // Fonction pour passer le temps de repos
  const skipRest = () => {
    setIsResting(false);
  };

  // Fonction pour terminer l'entraînement
  const completeWorkout = async () => {
    if (!currentWorkout) return;
    
    // Mettre à jour l'état de l'entraînement
    setWeeklyProgram(prevProgram => 
      prevProgram.map(w => 
        w.id === currentWorkout.id 
          ? { ...w, completed: true } 
          : w
      )
    );
    
    // Calculer les gains de statistiques
    // Générer un nombre aléatoire entre 3 et 8, puis arrondir à l'entier le plus proche
    const forceGain = Math.round(Math.random() * 5 + 3); // Entre 3 et 8, arrondi à l'entier
    const enduranceGain = Math.round(Math.random() * 5 + 2); // Entre 2 et 7, arrondi à l'entier
    
    // Calculer le poids total soulevé pendant l'entraînement
    let totalWeightLifted = 0;
    if (currentWorkout && currentWorkout.exercises) {
      currentWorkout.exercises.forEach((ex: any) => {
        if (ex.weight && ex.sets && ex.reps) {
          const weight = typeof ex.weight === 'string' ? parseFloat(ex.weight) : ex.weight;
          if (!isNaN(weight)) {
            totalWeightLifted += weight * ex.sets * ex.reps;
          }
        }
      });
    }
    
    // Mettre à jour les statistiques du joueur localement
    if (playerStats) {
      setPlayerStats({
        ...playerStats,
        force: Math.min(playerStats.force + forceGain, 100),
        endurance: Math.min(playerStats.endurance + enduranceGain, 100),
        total_weight_lifted: playerStats.total_weight_lifted + totalWeightLifted,
        total_workouts_completed: playerStats.total_workouts_completed + 1,
        streak_days: playerStats.streak_days + 1
      });
    }
    
    // Mettre à jour XP et coins
    const newXP = userXP + 500;
    const newMuscleCoins = muscleCoins + 100;
    
    setUserXP(newXP);
    setMuscleCoins(newMuscleCoins);
    checkLevelUp(newXP);
    
    // Sauvegarder dans Supabase
    try {
      // Mettre à jour le statut de l'entraînement
      if (currentWorkout && currentWorkout.id) {
        const workoutId = typeof currentWorkout.id === 'number' ? 
          `workout-${currentWorkout.id}` : currentWorkout.id.toString();
        
        await DataService.updateWorkoutCompletion(workoutId, true);
        console.log(`Entraînement ${workoutId} marqué comme complété dans Supabase`);
      }
      
      // Mettre à jour les statistiques du joueur
      const playerId = '00000000-0000-0000-0000-000000000001';
      if (playerStats) {
        const updatedStats = {
          ...playerStats,
          force: Math.min(playerStats.force + forceGain, 100),
          endurance: Math.min(playerStats.endurance + enduranceGain, 100),
          total_weight_lifted: playerStats.total_weight_lifted + totalWeightLifted,
          total_workouts_completed: playerStats.total_workouts_completed + 1,
          streak_days: playerStats.streak_days + 1
        };
        
        await DataService.updatePlayerStats(updatedStats);
        console.log('Statistiques du joueur mises à jour dans Supabase');
      }
      
      // Mettre à jour l'XP et les Muscle Coins
      await DataService.updatePlayerXP(playerId, newXP, newMuscleCoins);
      console.log(`XP et Muscle Coins mis à jour dans Supabase: XP=${newXP}, Coins=${newMuscleCoins}`);
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour des données dans Supabase:', err);
    }
    
    // Afficher l'écran de fin d'entraînement
    setCurrentScreen('workoutComplete');
  };

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      try {
        // Initialiser la connexion à la base de données
        await DataService.initialize();
        
        // Charger les statistiques du joueur
        const playerId = '00000000-0000-0000-0000-000000000001';
        const stats = await DataService.getPlayerStats(playerId);
        if (stats) {
          setPlayerStats(stats);
        }
        
        // Charger le joueur
        const player = await DataService.getPlayerById(playerId);
        if (player) {
          setCurrentPlayer(player);
          setUserLevel(player.level || 1);
          setUserXP(player.xp || 0);
          setMuscleCoins(player.muscle_coins || 250);
        }
        
        // Charger le programme d'entraînement
        const programData = await DataService.getWorkoutPrograms();
        if (programData && programData.length > 0 && programData[0].workouts) {
          // Convertir les WorkoutProgram en Workout
          const workouts: Workout[] = programData[0].workouts;
          setWeeklyProgram(workouts);
          console.log('Programme chargé:', workouts.length);
        }
        
        // Charger les quêtes journalières
        const questsData = await DataService.getDailyQuests();
        if (questsData) {
          setDailyQuests(questsData);
          console.log('Quêtes chargées:', questsData.length);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
      }
    };
    
    loadData();
    
    // Minuteur pour le temps de repos
    const timer = setInterval(() => {
      if (isResting && restTime > 0) {
        setRestTime(prev => prev - 1);
      } else if (isResting && restTime === 0) {
        setIsResting(false);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isResting, restTime]);

  // Valeur du contexte
  const value: AppContextType = {
    currentPlayer,
    userLevel,
    userXP,
    muscleCoins,
    playerStats,
    currentScreen,
    activeTab,
    weeklyProgram,
    currentWorkout,
    workoutStarted,
    isResting,
    restTime,
    currentExerciseIndex,
    currentSet,
    dailyQuests,
    setCurrentScreen,
    setActiveTab,
    startWorkout,
    completeQuest,
    updateWaterIntake,
    completeSet,
    skipRest,
    completeWorkout,
    setWorkoutStarted
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
