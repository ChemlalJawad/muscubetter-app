import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { 
  Player, 
  PlayerStats, 
  Workout, 
  DailyQuest, 
  DailyQuestProgress, 
  getDailyQuestProgress, 
  updateDailyQuestProgress, 
  resetDailyQuests
} from '../lib/database';
import { DataService } from '../lib/dataService';

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
  completeQuest: (questId: number) => void;
  updateWaterIntake: () => void;
  completeSet: () => void;
  skipRest: () => void;
  completeWorkout: () => void;
  setWorkoutStarted: (started: boolean) => void;
  navigateToExercise: (index: number) => void;
  addXP: (amount: number) => Promise<void>;
  addMuscleCoins: (amount: number) => Promise<void>;
  loadDailyQuests: () => void;
  progressQuest: (questId: number, amount: number) => void;
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
  const checkLevelUp = async (currentXP: number) => {
    // Calcul du niveau basé sur des seuils progressifs
    let level = 1;
    let xpRequired = 0;
    let xpForCurrentLevel = 500; // XP requis pour passer au niveau 2
    
    while (currentXP >= xpRequired + xpForCurrentLevel) {
      xpRequired += xpForCurrentLevel;
      level++;
      
      // Augmentation progressive des XP requis par niveau
      if (level <= 3) {
        xpForCurrentLevel = 500;
      } else if (level <= 6) {
        xpForCurrentLevel = 750;
      } else if (level <= 10) {
        xpForCurrentLevel = 1000;
      } else {
        xpForCurrentLevel = 1500;
      }
    }
    
    if (level > userLevel) {
      setUserLevel(level);
      await checkAttributeProgression(level);
      console.log(`Level up! Nouveau niveau: ${level}`);
    }
  };

  // Fonction pour vérifier et appliquer la progression des attributs
  const checkAttributeProgression = async (newLevel: number) => {
    if (!playerStats) return;

    // Calculer les gains d'attributs basés sur le niveau
    // Progression : +2 force/endurance/speed tous les 2 niveaux
    const attributeGain = Math.floor(newLevel / 2) * 2;
    
    // Valeurs de base pour débutant
    const baseForce = 2;
    const baseEndurance = 3;
    const baseSpeed = 2;
    
    const updatedStats = {
      ...playerStats,
      force: Math.min(baseForce + attributeGain, 100),
      endurance: Math.min(baseEndurance + attributeGain, 100),
      speed: Math.min(baseSpeed + attributeGain, 100)
    };
    
    // Sauvegarder uniquement si les attributs ont changé
    if (updatedStats.force !== playerStats.force || 
        updatedStats.endurance !== playerStats.endurance || 
        updatedStats.speed !== playerStats.speed) {
      await DataService.updatePlayerStats(updatedStats);
      setPlayerStats(updatedStats);
      console.log(`Attributs mis à jour - Niveau ${newLevel}: Force ${updatedStats.force}, Endurance ${updatedStats.endurance}, Vitesse ${updatedStats.speed}`);
    }
  };

  // Fonction pour ajouter de l'XP
  const addXP = async (amount: number) => {
    const newXP = userXP + amount;
    setUserXP(newXP);
    await checkLevelUp(newXP);
    await saveUserData(userLevel, newXP, muscleCoins);
  };

  // Fonction pour ajouter des Muscle Coins
  const addMuscleCoins = async (amount: number) => {
    const newCoins = muscleCoins + amount;
    setMuscleCoins(newCoins);
    await saveUserData(userLevel, userXP, newCoins);
  };

  // Fonction pour mettre à jour l'hydratation
  const updateWaterIntake = () => {
    // Trouver la quête d'hydratation
    setDailyQuests(prevQuests => 
      prevQuests.map(quest => {
        if (quest.id === 2 && !quest.completed) { // ID 2 = Hydratation Champion
          const newProgress = Math.min((quest.progress || 0) + 0.5, quest.max || 2);
          const isCompleted = newProgress >= (quest.max || 2);
          
          // Mettre à jour la progression dans la base de données si on a un joueur connecté
          if (currentPlayer?.player_id) {
            updateDailyQuestProgress(currentPlayer.player_id, quest.id, newProgress, isCompleted);
            
            // Si la quête est complétée, donner les récompenses
            if (isCompleted && !quest.completed) {
              addXP(quest.xp);
              addMuscleCoins(quest.coins);
            }
          }
          
          return {
            ...quest,
            progress: newProgress,
            completed: isCompleted
          };
        }
        return quest;
      })
    );
  };

  // Fonction pour progresser dans une quête avec persistance
  const progressQuest = useCallback(async (questId: number, amount: number) => {
    if (!currentPlayer?.player_id) return;
    
    setDailyQuests(prev => prev.map(quest => {
      if (quest.id === questId && quest.max && !quest.completed) {
        const newProgress = Math.min((quest.progress || 0) + amount, quest.max);
        const isCompleted = newProgress >= quest.max;
        
        // Sauvegarder la progression dans la base de données
        updateDailyQuestProgress(currentPlayer.player_id, questId, newProgress, isCompleted);
        
        // Si la quête est complétée, donner les récompenses
        if (isCompleted && !quest.completed) {
          addXP(quest.xp);
          addMuscleCoins(quest.coins);
        }
        
        return {
          ...quest,
          progress: newProgress,
          completed: isCompleted
        };
      }
      return quest;
    }));
  }, [currentPlayer?.player_id, addXP, addMuscleCoins]);

  // Fonction pour charger les quêtes avec persistance
  const loadDailyQuests = useCallback(async () => {
    if (!currentPlayer?.player_id) return;
    
    try {
      // Reset automatique des quêtes si nouveau jour
      await resetDailyQuests(currentPlayer.player_id);
      
      // Charger la progression des quêtes depuis la base de données
      const questProgress = await getDailyQuestProgress(currentPlayer.player_id);
      
      // Mettre à jour les quêtes avec la progression sauvegardée
      const updatedQuests = dailyQuests.map(quest => {
        const progress = questProgress.find(p => p.quest_id === quest.id);
        if (progress) {
          return {
            ...quest,
            completed: progress.completed,
            progress: progress.progress
          };
        }
        return quest;
      });
      
      setDailyQuests(updatedQuests);
    } catch (error) {
      console.error('Erreur lors du chargement des quêtes:', error);
    }
  }, [currentPlayer?.player_id, dailyQuests]);

  // Fonction pour compléter une quête - avec sauvegarde immédiate
  const completeQuest = async (questId: number) => {
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
        let stats = await DataService.getPlayerStats(playerId);
        
        // Si pas de stats, créer des stats de débutant
        if (!stats) {
          const beginnerStats = {
            player_id: playerId,
            force: 2,
            endurance: 3,
            speed: 2,
            assiduity: 0,
            total_weight_lifted: 0,
            total_workouts_completed: 0,
            streak_days: 0
          };
          await DataService.updatePlayerStats(beginnerStats);
          stats = beginnerStats;
          console.log('Stats de débutant créées');
        }
        
        setPlayerStats(stats);
        
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
          
          // Vérifier la progression des attributs au chargement
          const currentLevel = parseInt(localStorage.getItem('muscubetter_user_level') || '1');
          await checkAttributeProgression(currentLevel);
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

  // Charger les données au démarrage et les quêtes
  useEffect(() => {
    loadDailyQuests();
  }, [loadDailyQuests]);

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
    completeQuest: (questId: number) => completeQuest(questId),
    updateWaterIntake,
    completeSet,
    skipRest,
    completeWorkout,
    setWorkoutStarted,
    navigateToExercise,
    addXP,
    addMuscleCoins,
    loadDailyQuests,
    progressQuest
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
