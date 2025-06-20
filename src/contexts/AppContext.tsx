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
  navigateToExercise: (index: number) => void;
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
  
  // États pour les données utilisateur - avec persistance localStorage
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [userLevel, setUserLevel] = useState<number>(() => {
    const saved = localStorage.getItem('muscubetter_user_level');
    return saved ? parseInt(saved) : 1;
  });
  const [userXP, setUserXP] = useState<number>(() => {
    const saved = localStorage.getItem('muscubetter_user_xp');
    return saved ? parseInt(saved) : 0;
  });
  const [muscleCoins, setMuscleCoins] = useState<number>(() => {
    const saved = localStorage.getItem('muscubetter_muscle_coins');
    return saved ? parseInt(saved) : 250;
  });
  
  // États pour les statistiques et les programmes
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [weeklyProgram, setWeeklyProgram] = useState<Workout[]>([]);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  
  // États pour l'entraînement en cours - avec persistance
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(() => {
    const saved = localStorage.getItem('muscubetter_current_workout');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(() => {
    const saved = localStorage.getItem('muscubetter_exercise_index');
    return saved ? parseInt(saved) : 0;
  });
  const [currentSet, setCurrentSet] = useState(() => {
    const saved = localStorage.getItem('muscubetter_current_set');
    return saved ? parseInt(saved) : 1;
  });

  // Fonction pour sauvegarder l'état de l'entraînement
  const saveWorkoutState = (workout: Workout | null, exerciseIndex: number, set: number) => {
    if (workout) {
      localStorage.setItem('muscubetter_current_workout', JSON.stringify(workout));
      localStorage.setItem('muscubetter_exercise_index', exerciseIndex.toString());
      localStorage.setItem('muscubetter_current_set', set.toString());
    } else {
      localStorage.removeItem('muscubetter_current_workout');
      localStorage.removeItem('muscubetter_exercise_index');
      localStorage.removeItem('muscubetter_current_set');
    }
  };

  // Fonction pour sauvegarder les données utilisateur
  const saveUserData = async (level: number, xp: number, coins: number) => {
    // Sauvegarder localement
    localStorage.setItem('muscubetter_user_level', level.toString());
    localStorage.setItem('muscubetter_user_xp', xp.toString());
    localStorage.setItem('muscubetter_muscle_coins', coins.toString());
    
    // Sauvegarder en base de données
    try {
      const playerId = '00000000-0000-0000-0000-000000000001';
      await DataService.updatePlayerXP(playerId, xp, coins);
      console.log(`Données utilisateur sauvegardées: Level=${level}, XP=${xp}, Coins=${coins}`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde en base:', error);
    }
  };

  // Fonction pour vérifier si le niveau augmente - avec progression graduelle
  const checkLevelUp = async (newXP: number) => {
    // Progression plus graduelle : 500 XP pour les premiers niveaux, puis augmentation
    const getXPForLevel = (level: number) => {
      if (level <= 3) return 500; // Niveaux 1-3: 500 XP chacun
      if (level <= 6) return 750; // Niveaux 4-6: 750 XP chacun
      if (level <= 10) return 1000; // Niveaux 7-10: 1000 XP chacun
      return 1250; // Niveaux 11+: 1250 XP chacun
    };

    let totalXPNeeded = 0;
    let newLevel = 1;
    
    // Calculer le niveau basé sur l'XP total
    let remainingXP = newXP;
    while (remainingXP >= getXPForLevel(newLevel)) {
      remainingXP -= getXPForLevel(newLevel);
      newLevel++;
    }

    if (newLevel > userLevel) {
      setUserLevel(newLevel);
      await saveUserData(newLevel, newXP, muscleCoins);
      console.log(`🎉 LEVEL UP! Nouveau niveau: ${newLevel}`);
    }
  };

  // Fonction pour compléter une quête - avec sauvegarde immédiate
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
      await checkLevelUp(newXP);
      await saveUserData(userLevel, newXP, newMuscleCoins);
      
      // Sauvegarder dans Supabase
      try {
        // 1. Mettre à jour le statut de la quête
        await DataService.updateQuestCompletion(questId, true);
        console.log(`Quête ${questId} marquée comme complétée dans Supabase`);
        
        // 2. Mettre à jour les statistiques du joueur avec progression graduelle
        const playerId = '00000000-0000-0000-0000-000000000001';
        const currentStats = await DataService.getPlayerStats(playerId);
        if (currentStats) {
          await DataService.updatePlayerStats({
            ...currentStats,
            assiduity: Math.min(currentStats.assiduity + 0.5, 100) // Progression plus lente
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
          const playerId = '00000000-0000-0000-0000-000000000001';
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

  // Fonction pour démarrer un entraînement - avec persistance
  const startWorkout = (workout: Workout) => {
    setCurrentWorkout(workout);
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setWorkoutStarted(false);
    setCurrentScreen('workout');
    
    // Sauvegarder l'état de l'entraînement
    saveWorkoutState(workout, 0, 1);
  };

  // Fonction pour compléter une série d'exercice - avec persistance
  const completeSet = () => {
    if (!currentWorkout) return;
    
    const newSet = currentSet + 1;
    const newExerciseIndex = currentExerciseIndex;
    
    // Si nous avons terminé toutes les séries de cet exercice
    if (currentSet >= (currentWorkout.exercises[currentExerciseIndex]?.sets || 1)) {
      // Si c'était le dernier exercice, terminer l'entraînement
      if (currentExerciseIndex >= currentWorkout.exercises.length - 1) {
        completeWorkout();
        return;
      }
      
      // Sinon, passer à l'exercice suivant
      const nextExerciseIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextExerciseIndex);
      setCurrentSet(1);
      saveWorkoutState(currentWorkout, nextExerciseIndex, 1);
    } else {
      // Sinon, passer à la série suivante
      setCurrentSet(newSet);
      saveWorkoutState(currentWorkout, newExerciseIndex, newSet);
    }
    
    // Commencer le temps de repos
    setIsResting(true);
    setRestTime(currentWorkout.exercises[currentExerciseIndex]?.rest_time || 60);
  };

  // Fonction pour passer le temps de repos
  const skipRest = () => {
    setIsResting(false);
  };

  // Fonction pour terminer l'entraînement - avec progression graduelle
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
    
    // Calculer les gains de statistiques avec progression plus graduelle
    const baseXPGain = 100; // XP de base pour un entraînement
    const bonusXP = currentWorkout.exercises.length * 10; // Bonus selon le nombre d'exercices
    const totalXPGain = baseXPGain + bonusXP;
    
    const baseCoinGain = 50; // Muscle Coins de base
    const bonusCoins = Math.floor(currentWorkout.exercises.length / 2) * 10;
    const totalCoinGain = baseCoinGain + bonusCoins;
    
    // Progression graduelle des statistiques (plus lente et réaliste)
    const forceGain = Math.min(0.5 + Math.random() * 1, 2); // 0.5-1.5 points max
    const enduranceGain = Math.min(0.5 + Math.random() * 1, 2); // 0.5-1.5 points max
    
    // Calculer le poids total soulevé (estimation)
    const totalWeightLifted = currentWorkout.exercises.reduce((total, exercise) => {
      const weight = exercise.weight || 0;
      const reps = exercise.reps || 0;
      const sets = exercise.sets || 0;
      return total + (weight * reps * sets);
    }, 0);
    
    // Mettre à jour l'XP et les Muscle Coins
    const newXP = userXP + totalXPGain;
    const newMuscleCoins = muscleCoins + totalCoinGain;
    
    setUserXP(newXP);
    setMuscleCoins(newMuscleCoins);
    await checkLevelUp(newXP);
    await saveUserData(userLevel, newXP, newMuscleCoins);
    
    // Sauvegarder dans Supabase avec progression graduelle
    try {
      // Marquer l'entraînement comme terminé
      if (currentWorkout.id) {
        await DataService.updateWorkoutCompletion(currentWorkout.id, true);
        console.log(`Entraînement ${currentWorkout.id} marqué comme terminé dans Supabase`);
      }
      
      // Mettre à jour les statistiques du joueur avec progression graduelle
      const playerId = '00000000-0000-0000-0000-000000000001';
      if (playerStats) {
        const updatedStats = {
          ...playerStats,
          force: Math.min(playerStats.force + forceGain, 100),
          endurance: Math.min(playerStats.endurance + enduranceGain, 100),
          total_weight_lifted: playerStats.total_weight_lifted + totalWeightLifted,
          total_workouts_completed: playerStats.total_workouts_completed + 1,
          streak_days: Math.min(playerStats.streak_days + 0.2, 100) // Progression très graduelle
        };
        
        await DataService.updatePlayerStats(updatedStats);
        setPlayerStats(updatedStats);
        console.log('Statistiques du joueur mises à jour avec progression graduelle');
      }
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour des données dans Supabase:', err);
    }
    
    // Nettoyer l'état de l'entraînement
    saveWorkoutState(null, 0, 1);
    
    // Afficher l'écran de fin d'entraînement
    setCurrentScreen('workoutComplete');
  };

  // Fonction pour naviguer librement pendant l'entraînement
  const navigateToExercise = (index: number) => {
    if (!currentWorkout) return;
    
    // Vérifier si l'index est valide
    if (index < 0 || index >= currentWorkout.exercises.length) return;
    
    // Mettre à jour l'index de l'exercice
    setCurrentExerciseIndex(index);
    setCurrentSet(1);
    
    // Sauvegarder l'état de l'entraînement
    saveWorkoutState(currentWorkout, index, 1);
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
        
        // Charger le joueur - SANS écraser les valeurs localStorage
        const player = await DataService.getPlayerById(playerId);
        if (player) {
          setCurrentPlayer(player);
          // Ne charger depuis la DB que si localStorage est vide
          if (!localStorage.getItem('muscubetter_user_level')) {
            setUserLevel(player.level || 1);
          }
          if (!localStorage.getItem('muscubetter_user_xp')) {
            setUserXP(player.xp || 0);
          }
          if (!localStorage.getItem('muscubetter_muscle_coins')) {
            setMuscleCoins(player.muscle_coins || 250);
          }
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
    setWorkoutStarted,
    navigateToExercise
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
