import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Award, Zap, Heart, Activity, Timer, CheckCircle, Star, TrendingUp, Target, Dumbbell, Wind, Sparkles, ChevronRight, Users, Trophy, Flame, Droplet, Moon, Footprints, BookOpen, Plus, Search, Filter, Camera, Clock, Weight, Repeat, Ruler, Calendar, Medal, Shield, Crown, Swords, Gem, Brain, Rocket } from 'lucide-react';

// TypeScript interfaces for workout structure
interface Exercise {
  name: string;
  sets: number;
  reps: number | string;
  rest: number;
  weight: string;
  xp: number;
}

interface Workout {
  id: number;
  name: string;
  exercises: Exercise[];
}

// Quest interfaces
interface BaseQuest {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  xp: number;
  coins: number;
  icon: string;
}

interface StandardQuest extends BaseQuest {
  progress?: undefined;
  max?: undefined;
}

interface ProgressQuest extends BaseQuest {
  progress: number;
  max: number;
}

type Quest = StandardQuest | ProgressQuest;

// Programme d'entraînement sur 4 semaines
const workoutProgram = {
  week1: [
    {
      id: 1,
      name: "Séance Full Body - Réactivation",
      exercises: [
        { name: "Squats", sets: 3, reps: 15, rest: 60, weight: "Poids du corps", xp: 50 },
        { name: "Pompes (genoux)", sets: 2, reps: 12, rest: 45, weight: "Poids du corps", xp: 40 },
        { name: "Fentes alternées", sets: 2, reps: 10, rest: 45, weight: "Poids du corps", xp: 45 },
        { name: "Planche", sets: 3, reps: "20 sec", rest: 30, weight: "-", xp: 35 },
        { name: "Rowing machine", sets: 2, reps: 15, rest: 60, weight: "Léger", xp: 40 }
      ]
    }
  ]
};

const FitnessApp = () => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [userStats, setUserStats] = useState({
    force: 10,
    endurance: 10,
    souplesse: 10
  });
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restTime, setRestTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [streak, setStreak] = useState(3);
  const [muscleCoins, setMuscleCoins] = useState(250);
  const [waterIntake, setWaterIntake] = useState(0.5);
  const [totalWeight, setTotalWeight] = useState(45000);
  const [unlockedBadges, setUnlockedBadges] = useState(['first-workout']);
  
  // Quêtes journalières enrichies
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([
    { id: 1, name: "Le Réveil Musculaire", description: "5 min d'échauffement dynamique", completed: false, xp: 80, coins: 40, icon: '🌅' },
    { id: 2, name: "Hydratation Champion", description: "Boire 2 litres d'eau", progress: 0.5, max: 2, completed: false, xp: 100, coins: 50, icon: '💧' },
    { id: 3, name: "Le Défi Gainage", description: "Tenir la planche 60 secondes", completed: false, xp: 120, coins: 60, icon: '🏗️' },
    { id: 4, name: "La Marche Active", description: "30 min de marche rapide", completed: false, xp: 150, coins: 75, icon: '🚶' },
    { id: 5, name: "Sommeil Réparateur", description: "Dormir 7-8 heures", completed: false, xp: 100, coins: 50, icon: '😴' }
  ]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer pour le repos
  useEffect(() => {
    if (isResting && restTime > 0) {
      intervalRef.current = setInterval(() => {
        setRestTime(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isResting, restTime]);
  
  // Fonction pour ajuster le temps de repos
  const adjustRestTime = (seconds: number) => {
    if (isResting) {
      setRestTime(prev => Math.max(0, prev + seconds));
    }
  };

  const startWorkout = (workout: Workout) => {
    setCurrentWorkout(workout);
    setCurrentScreen('workout');
    setWorkoutStarted(true);
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
  };

  const completeSet = () => {
    if (!currentWorkout) return;
    const exercise = currentWorkout.exercises[currentExerciseIndex];
    
    // Gain d'XP
    const xpGained = exercise.xp;
    setUserXP(prev => prev + xpGained);
    
    // Mise à jour des stats
    setUserStats(prev => ({
      force: prev.force + Math.random() * 2,
      endurance: prev.endurance + Math.random() * 1.5,
      souplesse: prev.souplesse + Math.random() * 0.5
    }));

    // Mise à jour du poids total
    if (exercise.weight !== "Poids du corps" && exercise.weight !== "-") {
      const weightValue = parseInt(exercise.weight) || 5;
      const repsValue = typeof exercise.reps === 'string' ? parseInt(exercise.reps) || 1 : exercise.reps;
      setTotalWeight(prev => prev + weightValue * repsValue);
    }

    if (currentSet < exercise.sets) {
      setCurrentSet(prev => prev + 1);
      setRestTime(exercise.rest);
      setIsResting(true);
    } else {
      if (currentExerciseIndex < currentWorkout.exercises.length - 1) {
        nextExercise();
      } else {
        completeWorkout();
      }
    }
  };

  const nextExercise = () => {
    if (!currentWorkout) return;
    
    setCurrentExerciseIndex(prev => prev + 1);
    setCurrentSet(1);
    
    // Définir le temps de repos entre les exercices
    const nextExercise = currentWorkout.exercises[currentExerciseIndex + 1];
    setRestTime(nextExercise ? nextExercise.rest : 60);
    setIsResting(true);
  };

  const completeWorkout = () => {
    if (!currentWorkout) return;
    
    // Gain d'XP bonus pour avoir terminé l'entraînement
    const bonusXP = 100;
    setUserXP(prev => prev + bonusXP);
    
    // Mise à jour des stats
    setUserStats(prev => ({
      force: prev.force + 5,
      endurance: prev.endurance + 3,
      souplesse: prev.souplesse + 2
    }));
    
    // Mise à jour des MuscleCoins
    setMuscleCoins(prev => prev + 50);
    
    // Vérifier les badges
    checkAndUnlockBadges();
    
    // Afficher l'écran de résumé
    setCurrentScreen('summary');
    setWorkoutStarted(false);
  };

  const checkAndUnlockBadges = () => {
    // Logique pour débloquer des badges
    if (!unlockedBadges.includes('workout-complete')) {
      setUnlockedBadges(prev => [...prev, 'workout-complete']);
    }
  };

  const skipRest = () => {
    setRestTime(0);
    setIsResting(false);
  };
  
  // Calcul du pourcentage pour l'anneau de progression du repos
  const calculateRestProgress = () => {
    if (!currentWorkout || !isResting) return 0;
    const currentExercise = currentWorkout.exercises[currentExerciseIndex];
    const totalRestTime = currentExercise.rest;
    return ((totalRestTime - restTime) / totalRestTime) * 100;
  };

  const updateWaterIntake = () => {
    const newIntake = Math.min(waterIntake + 0.25, 2);
    setWaterIntake(newIntake);
    
    // Mise à jour de la quête d'hydratation
    setDailyQuests(prev => 
      prev.map(quest => {
        if (quest.id === 2) {
          // Ensure we're working with a ProgressQuest
          const progressQuest = quest as ProgressQuest;
          return {
            ...progressQuest,
            progress: newIntake,
            completed: newIntake >= progressQuest.max
          };
        }
        return quest;
      })
    );
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      {/* Dashboard */}
      {currentScreen === 'dashboard' && (
        <div className="p-4 pb-20">
          {/* En-tête utilisateur */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Bonjour, Jawad!</h1>
              <div className="flex items-center mt-1">
                <div className="flex items-center bg-gray-800 rounded-full px-3 py-1">
                  <Zap className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm">Niveau {userLevel}</span>
                </div>
                <div className="flex items-center bg-gray-800 rounded-full px-3 py-1 ml-2">
                  <Flame className="w-4 h-4 text-orange-400 mr-1" />
                  <span className="text-sm">Série: {streak} jours</span>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center bg-gray-800 rounded-full px-3 py-1 mr-2">
                <Trophy className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-sm">{muscleCoins}</span>
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-400">Progression</span>
              <span className="text-sm text-gray-400">{userXP}/1000 XP</span>
            </div>
            <div className="bg-gray-800 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                style={{ width: `${(userXP / 1000) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Stats utilisateur */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <Dumbbell className="w-6 h-6 mx-auto mb-1 text-red-400" />
              <p className="text-xs text-gray-400">Force</p>
              <p className="font-bold">{Math.floor(userStats.force)}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <Heart className="w-6 h-6 mx-auto mb-1 text-green-400" />
              <p className="text-xs text-gray-400">Endurance</p>
              <p className="font-bold">{Math.floor(userStats.endurance)}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <Wind className="w-6 h-6 mx-auto mb-1 text-blue-400" />
              <p className="text-xs text-gray-400">Souplesse</p>
              <p className="font-bold">{Math.floor(userStats.souplesse)}</p>
            </div>
          </div>

          {/* Quêtes journalières */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">Quêtes journalières</h2>
            <div className="space-y-3">
              {dailyQuests.map(quest => (
                <div key={quest.id} className="bg-gray-800 rounded-xl p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{quest.icon}</div>
                      <div>
                        <p className="font-medium">{quest.name}</p>
                        <p className="text-xs text-gray-400">{quest.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {quest.progress !== undefined ? (
                        <div className="mr-3">
                          <div className="text-xs text-gray-400 text-right mb-1">
                            {quest.progress}/{quest.max}
                          </div>
                          <div className="w-16 bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-500 h-full"
                              style={{ width: `${(quest.progress / quest.max) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center mr-3">
                          <span className="text-xs text-gray-400 mr-1">+{quest.xp} XP</span>
                          <span className="text-xs text-yellow-400">+{quest.coins}</span>
                        </div>
                      )}
                      {quest.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-600"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hydratation */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">Hydratation</h2>
              <span className="text-sm text-gray-400">{waterIntake}/2L</span>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Droplet className="w-5 h-5 text-blue-400 mr-2" />
                  <span>Eau consommée aujourd'hui</span>
                </div>
                <button 
                  onClick={updateWaterIntake}
                  className="bg-blue-500/20 text-blue-400 rounded-full p-1"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-gray-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full"
                  style={{ width: `${(waterIntake / 2) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Programme d'entraînement */}
          <div>
            <h2 className="text-lg font-bold mb-3">Programme d'entraînement</h2>
            <div className="space-y-3">
              {workoutProgram.week1.map(workout => (
                <div key={workout.id} className="bg-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">{workout.name}</h3>
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>~45 min</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {workout.exercises.map((exercise, i) => (
                        <div key={i} className="bg-gray-700 rounded-full px-2 py-1 text-xs">
                          {exercise.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => startWorkout(workout)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg py-2.5 font-medium flex items-center justify-center"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Commencer
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Écran d'entraînement */}
      {currentScreen === 'workout' && currentWorkout && (
        <div className="p-4 flex flex-col h-screen">
          {/* En-tête de l'entraînement */}
          <div className="mb-6">
            <h1 className="text-xl font-bold mb-1">{currentWorkout.name}</h1>
            <div className="flex items-center text-sm text-gray-400">
              <Dumbbell className="w-4 h-4 mr-1" />
              <span>{currentExerciseIndex + 1}/{currentWorkout.exercises.length} exercices</span>
            </div>
          </div>

          {/* Exercice actuel */}
          <div className="bg-gray-800 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">
                {currentWorkout.exercises[currentExerciseIndex].name}
              </h2>
              <div className="bg-gray-700 rounded-full px-3 py-1 text-sm">
                {currentSet}/{currentWorkout.exercises[currentExerciseIndex].sets} séries
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-700 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-400">Répétitions</p>
                <p className="font-bold">{currentWorkout.exercises[currentExerciseIndex].reps}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-400">Repos</p>
                <p className="font-bold">{currentWorkout.exercises[currentExerciseIndex].rest}s</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-400">Poids</p>
                <p className="font-bold">{currentWorkout.exercises[currentExerciseIndex].weight}</p>
              </div>
            </div>

            {isResting ? (
              <div>
                {/* Cercle de progression du repos */}
                <div className="flex flex-col items-center mb-4">
                  <div className="relative w-40 h-40 mx-auto mb-2">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      {/* Cercle de fond */}
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke="#374151" 
                        strokeWidth="8"
                      />
                      {/* Cercle de progression */}
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke="#8B5CF6" 
                        strokeWidth="8"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * (restTime / currentWorkout.exercises[currentExerciseIndex].rest) * 100) / 100}
                        transform="rotate(-90 50 50)"
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <p className="text-4xl font-bold">{restTime}</p>
                      <p className="text-sm text-gray-400">secondes</p>
                    </div>
                  </div>
                  
                  {/* Boutons d'ajustement du temps */}
                  <div className="flex justify-center gap-2 mb-3">
                    <button 
                      onClick={() => adjustRestTime(-5)}
                      className="bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-600 transition-colors"
                    >
                      -5s
                    </button>
                    <button 
                      onClick={() => adjustRestTime(-10)}
                      className="bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-600 transition-colors"
                    >
                      -10s
                    </button>
                    <button 
                      onClick={() => adjustRestTime(10)}
                      className="bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-600 transition-colors"
                    >
                      +10s
                    </button>
                    <button 
                      onClick={() => adjustRestTime(15)}
                      className="bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-600 transition-colors"
                    >
                      +15s
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={skipRest}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg py-2.5 font-medium flex items-center justify-center"
                >
                  <SkipForward className="w-5 h-5 mr-2" />
                  Passer le repos
                </button>
              </div>
            ) : (
              <button
                onClick={completeSet}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg py-2.5 font-medium"
              >
                Série terminée
              </button>
            )}
          </div>

          {/* Prochains exercices */}
          <div className="flex-1 overflow-auto">
            <h3 className="text-sm font-bold text-gray-400 mb-2">À venir:</h3>
            <div className="space-y-2">
              {currentWorkout.exercises.slice(currentExerciseIndex + 1).map((exercise, i) => (
                <div key={i} className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{exercise.name}</p>
                    <p className="text-xs text-gray-400">{exercise.sets} séries × {exercise.reps} reps</p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {exercise.weight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Écran de résumé */}
      {currentScreen === 'summary' && (
        <div className="p-4 flex flex-col items-center justify-center min-h-screen">
          <div className="mb-6 text-center">
            <div className="inline-flex p-4 rounded-full bg-green-500/20 mb-4">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Entraînement terminé!</h1>
            <p className="text-gray-400">Excellent travail, continuez comme ça!</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 w-full max-w-sm mb-6">
            <h2 className="font-bold mb-3">Résumé</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  XP gagnée
                </span>
                <span className="font-bold text-yellow-400">+100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Stats améliorées
                </span>
                <span className="font-bold text-green-400">↑</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 w-full max-w-sm mb-6 border border-purple-500/30">
            <p className="text-sm text-gray-300 mb-1">Nouveau badge débloqué!</p>
            <p className="font-bold flex items-center gap-2 justify-center">
              <Medal className="w-5 h-5 text-yellow-400" />
              Première séance complétée
            </p>
          </div>

          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full px-8 py-3 font-bold transform transition hover:scale-105"
          >
            Retour au tableau de bord
          </button>
        </div>
      )}

      {/* Écran Badges */}
      {currentScreen === 'badges' && (
        <div className="p-4 pb-20">
          <h1 className="text-2xl font-bold mb-6">Badges & Accomplissements</h1>
          
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '🎯', name: 'Le Départ Idéal', unlocked: true },
              { icon: '🌟', name: 'Semaine Parfaite', unlocked: false },
              { icon: '🎵', name: 'Le Rythme est Là', unlocked: false },
              { icon: '🏆', name: 'Habitude Installée', unlocked: false },
              { icon: '🔥', name: 'Serial Sportif', unlocked: true },
              { icon: '🥇', name: 'Premier RP', unlocked: true },
              { icon: '🤖', name: 'Machine à RP', unlocked: false },
              { icon: '💯', name: 'Le Centurion', unlocked: false },
              { icon: '🏃', name: 'Endurance Secrète', unlocked: false }
            ].map((badge, i) => (
              <div 
                key={i}
                className={`bg-gray-800 rounded-xl p-4 text-center ${
                  badge.unlocked ? '' : 'opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="text-xs">{badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation bottom */}
      {(currentScreen === 'dashboard' || currentScreen === 'badges') && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800">
          <div className="grid grid-cols-4 gap-1 p-2">
            <button 
              onClick={() => setCurrentScreen('dashboard')}
              className={`flex flex-col items-center py-2 ${currentScreen === 'dashboard' ? 'text-purple-400' : 'text-gray-400'}`}
            >
              <Activity className="w-6 h-6 mb-1" />
              <span className="text-xs">Accueil</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('badges')}
              className={`flex flex-col items-center py-2 ${currentScreen === 'badges' ? 'text-purple-400' : 'text-gray-400'}`}
            >
              <Award className="w-6 h-6 mb-1" />
              <span className="text-xs">Badges</span>
            </button>
            <button className="flex flex-col items-center py-2 text-gray-400">
              <TrendingUp className="w-6 h-6 mb-1" />
              <span className="text-xs">Stats</span>
            </button>
            <button className="flex flex-col items-center py-2 text-gray-400">
              <Users className="w-6 h-6 mb-1" />
              <span className="text-xs">Social</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FitnessApp;
