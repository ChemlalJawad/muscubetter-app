import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { DataService } from '../lib/dataService';
import { Exercise } from '../lib/database';
// Import des icônes
import { Shield, Star, Sparkles, Dumbbell, Wind, Activity, Flame, Droplet, Medal, Zap, Award, Calendar, CheckCircle, TrendingUp, Plus } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { 
    userLevel, 
    userXP, 
    muscleCoins, 
    activeTab, 
    setActiveTab,
    weeklyProgram,
    startWorkout,
    addXP,
    addMuscleCoins,
    playerStats
  } = useAppContext();

  // Calcul du niveau basé sur l'XP
  const xpForNextLevel = userLevel * 1000;
  const xpProgress = (userXP % 1000) / 10; // Pourcentage de progression vers le niveau suivant

  // Fonction pour obtenir le nom du niveau actuel
  const getLevelName = (level: number): string => {
    const levelNames = [
      'Novice en Reprise',
      'Apprenti Athlète',
      'Guerrier en Devenir',
      'Force Montante',
      'Endurance Éveillée',
      'Souplesse Initiale',
      'Athlète Déterminé',
      'Maître de la Reprise',
      'Légende en Marche',
      'Gear 5'
    ];
    return levelNames[Math.min(level - 1, levelNames.length - 1)];
  };

  // Badges débloqués (exemple)
  const [unlockedBadges] = useState([
    { id: 'first-workout', name: 'Première Séance', icon: <Medal className="w-5 h-5 text-yellow-400" />, description: 'Compléter votre première séance d\'entraînement' },
    { id: 'streak-3', name: 'Série de 3', icon: <Flame className="w-5 h-5 text-orange-400" />, description: '3 jours consécutifs d\'entraînement' },
    { id: 'water-master', name: 'Hydratation Parfaite', icon: <Droplet className="w-5 h-5 text-blue-400" />, description: 'Atteindre votre objectif d\'hydratation 5 fois' },
  ]);
  
  // Streak actuel (jours consécutifs)
  const [streak] = useState(3);
  
  // État pour stocker les exercices
  const [exercises, setExercises] = useState<Exercise[]>([]);
  
  // État pour les quêtes avec validation
  const [quests, setQuests] = useState([
    { id: 1, name: "Le Réveil Musculaire", description: "5 min d'échauffement dynamique", completed: false, xp: 80, coins: 40, icon: '🌅' },
    { id: 2, name: "Hydratation Champion", description: "Boire 2 litres d'eau", progress: 0, max: 2, completed: false, xp: 100, coins: 50, icon: '💧' },
    { id: 3, name: "Le Défi Gainage", description: "Tenir la planche 60 secondes", completed: false, xp: 120, coins: 60, icon: '🏗️' },
    { id: 4, name: "La Marche Active", description: "30 min de marche rapide", completed: false, xp: 150, coins: 75, icon: '🚶' },
    { id: 5, name: "Sommeil Réparateur", description: "Dormir 7-8 heures", completed: false, xp: 100, coins: 50, icon: '😴' }
  ]);

  // Animation de célébration
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationText, setCelebrationText] = useState('');
  
  // Charger les exercices au chargement du composant
  useEffect(() => {
    const loadExercises = async () => {
      try {
        const exercisesData = await DataService.getExercises();
        setExercises(exercisesData);
        console.log('Exercices chargés:', exercisesData.length);
      } catch (err) {
        console.error('Erreur lors du chargement des exercices:', err);
      }
    };
    
    loadExercises();
  }, []);
  
  // Fonction pour obtenir le nom d'un exercice à partir de son ID
  const getExerciseName = (exerciseId: string): string => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    return exercise ? exercise.name : `Exercice ${exerciseId}`;
  };

  // Fonction pour valider une quête
  const completeQuest = async (questId: number) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.completed) return;

    // Marquer la quête comme complétée
    setQuests(prev => prev.map(q => 
      q.id === questId ? { ...q, completed: true } : q
    ));

    // Ajouter XP et coins
    await addXP(quest.xp);
    await addMuscleCoins(quest.coins);

    // Animation de célébration
    setCelebrationText(`+${quest.xp} XP • +${quest.coins} 💰`);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  // Fonction pour progresser sur une quête avec barre de progression
  const progressQuest = (questId: number, amount: number) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId && !q.completed && q.max) {
        const newProgress = Math.min(q.progress + amount, q.max);
        const isCompleted = newProgress >= q.max;
        
        if (isCompleted && !q.completed) {
          // Auto-compléter si la barre est pleine
          setTimeout(() => completeQuest(questId), 500);
        }
        
        return { ...q, progress: newProgress };
      }
      return q;
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">MuscuBetter</h1>
        <div className="bg-yellow-500/20 rounded-full px-3 py-1 flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-bold">{muscleCoins}</span>
        </div>
      </div>
      
      {/* Informations utilisateur */}
      <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Jawad
            </h2>
            <p className="text-gray-400">Niveau {userLevel}: {getLevelName(userLevel)}</p>
          </div>
          <div className="flex items-center space-x-2">
            {unlockedBadges.slice(0, 3).map((badge) => (
              <div key={badge.id} className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center" title={badge.name}>
                {badge.icon}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-400">
              <span className="text-xs">+{unlockedBadges.length > 3 ? unlockedBadges.length - 3 : 0}</span>
            </div>
          </div>
        </div>
        
        {/* Barre de progression XP */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              XP: {userXP}
            </span>
            <span className="text-gray-400">Prochain niveau: {xpForNextLevel}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500 relative overflow-hidden" 
              style={{ width: `${xpProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Série en cours */}
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 mb-6 border border-orange-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-400" />
            <div>
              <p className="font-bold">Série en cours</p>
              <p className="text-sm text-gray-300">{streak} jours consécutifs!</p>
            </div>
          </div>
          <div className="flex gap-1">
            {[...Array(Math.min(streak, 7))].map((_, i) => (
              <div key={i} className="text-2xl animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
                🔥
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Programme d'entraînement */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Programme de la semaine
        </h2>
        <div className="space-y-2 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          {/* Affichage du programme hebdomadaire */}
          {activeTab === 'home' && (
            <div>
              {/* Contenu de l'onglet Home */}
              <div className="space-y-3">
                {/* Programme d'entraînement détaillé */}
                {weeklyProgram.map((workout, index) => (
                  <div key={index} className="mb-4 bg-gray-700/30 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 border-b border-gray-600/30">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${workout.completed ? 'bg-green-500/30' : 'bg-blue-500/30'}`}>
                          {workout.completed ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Dumbbell className="w-4 h-4 text-blue-400" />}
                        </div>
                        <div>
                          <p className="font-medium">{workout.day}</p>
                          <p className="text-sm text-gray-400">{workout.type}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => !workout.completed && startWorkout(workout)}
                        className={`px-4 py-2 rounded-lg ${workout.completed ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'}`}
                      >
                        {workout.completed ? 'Terminé ✓' : 'Démarrer'}
                      </button>
                    </div>
                    
                    {/* Liste des exercices */}
                    <div className="p-3">
                      <p className="text-xs text-gray-400 mb-2">Exercices:</p>
                      <div className="space-y-2">
                        {workout.exercises.map((exercise, exIndex) => (
                          <div key={exIndex} className="flex justify-between items-center bg-gray-800/50 p-2 rounded">
                            <div>
                              <p className="text-sm font-medium">{getExerciseName(exercise.exercise_id)}</p>
                              <p className="text-xs text-gray-400">{exercise.sets} séries × {exercise.reps} reps</p>
                            </div>
                            <div className="bg-gray-700/50 px-2 py-1 rounded text-xs">
                              {exercise.weight ? `${exercise.weight} kg` : 'Poids du corps'}
                            </div>
                          </div>
                        ))}

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'stats' && (
            <div>
              {/* Contenu de l'onglet Statistiques */}
              <div className="space-y-6">
                {/* Attributs principaux */}
                <div>
                  <h3 className="font-semibold text-xl flex items-center gap-2 mb-4">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                    Attributs
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {/* Force */}
                    <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/30 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center">
                            <Dumbbell className="w-6 h-6 text-red-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-red-100">Force</h4>
                            <p className="text-sm text-red-300">Puissance musculaire</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-red-400">{playerStats?.force || 2}</p>
                          <p className="text-xs text-red-300">/ 100</p>
                        </div>
                      </div>
                      <div className="bg-gray-700/50 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-orange-600 h-full transition-all duration-500"
                          style={{ width: `${(playerStats?.force || 2)}%` }}
                        />
                      </div>
                      <p className="text-xs text-red-300 mt-2">
                        +2 tous les 2 niveaux • Prochain gain: Niveau {Math.ceil(userLevel / 2) * 2 + 2}
                      </p>
                    </div>

                    {/* Endurance */}
                    <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                            <Wind className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-blue-100">Endurance</h4>
                            <p className="text-sm text-blue-300">Résistance cardio</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-400">{playerStats?.endurance || 3}</p>
                          <p className="text-xs text-blue-300">/ 100</p>
                        </div>
                      </div>
                      <div className="bg-gray-700/50 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-600 h-full transition-all duration-500"
                          style={{ width: `${(playerStats?.endurance || 3)}%` }}
                        />
                      </div>
                      <p className="text-xs text-blue-300 mt-2">
                        +2 tous les 2 niveaux • Prochain gain: Niveau {Math.ceil(userLevel / 2) * 2 + 2}
                      </p>
                    </div>

                    {/* Vitesse */}
                    <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-green-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-green-100">Vitesse</h4>
                            <p className="text-sm text-green-300">Agilité & réactivité</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-400">{playerStats?.speed || 2}</p>
                          <p className="text-xs text-green-300">/ 100</p>
                        </div>
                      </div>
                      <div className="bg-gray-700/50 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-full transition-all duration-500"
                          style={{ width: `${(playerStats?.speed || 2)}%` }}
                        />
                      </div>
                      <p className="text-xs text-green-300 mt-2">
                        +2 tous les 2 niveaux • Prochain gain: Niveau {Math.ceil(userLevel / 2) * 2 + 2}
                      </p>
                    </div>

                    {/* Assiduité */}
                    <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-purple-100">Assiduité</h4>
                            <p className="text-sm text-purple-300">Régularité d'entraînement</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-400">{Math.round(playerStats?.assiduity || 0)}</p>
                          <p className="text-xs text-purple-300">/ 100</p>
                        </div>
                      </div>
                      <div className="bg-gray-700/50 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-600 h-full transition-all duration-500"
                          style={{ width: `${Math.round(playerStats?.assiduity || 0)}%` }}
                        />
                      </div>
                      <p className="text-xs text-purple-300 mt-2">
                        Augmente avec la régularité des entraînements
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statistiques d'entraînement */}
                <div>
                  <h3 className="font-semibold text-xl flex items-center gap-2 mb-4">
                    <Activity className="w-6 h-6 text-orange-400" />
                    Statistiques d'entraînement
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 text-center">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <Medal className="w-6 h-6 text-yellow-400" />
                      </div>
                      <p className="text-2xl font-bold text-yellow-400">{playerStats?.total_workouts_completed || 0}</p>
                      <p className="text-sm text-gray-400">Séances terminées</p>
                    </div>
                    
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 text-center">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <Dumbbell className="w-6 h-6 text-blue-400" />
                      </div>
                      <p className="text-2xl font-bold text-blue-400">{Math.round(playerStats?.total_weight_lifted || 0)}kg</p>
                      <p className="text-sm text-gray-400">Poids soulevé</p>
                    </div>
                    
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 text-center">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <Flame className="w-6 h-6 text-orange-400" />
                      </div>
                      <p className="text-2xl font-bold text-orange-400">{Math.round(playerStats?.streak_days || 0)}</p>
                      <p className="text-sm text-gray-400">Jours de série</p>
                    </div>
                    
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 text-center">
                      <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <Star className="w-6 h-6 text-green-400" />
                      </div>
                      <p className="text-2xl font-bold text-green-400">{userLevel}</p>
                      <p className="text-sm text-gray-400">Niveau actuel</p>
                    </div>
                  </div>
                </div>

                {/* Progression par niveau */}
                <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-2xl p-4">
                  <h4 className="font-semibold text-indigo-100 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    Système de progression
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-300">Niveau actuel:</span>
                      <span className="font-bold text-indigo-100">{userLevel}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-300">Prochain gain d'attributs:</span>
                      <span className="font-bold text-indigo-100">Niveau {Math.ceil(userLevel / 2) * 2 + 2}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-300">Gain par progression:</span>
                      <span className="font-bold text-indigo-100">+2 Force/Endurance/Vitesse</span>
                    </div>
                    <div className="mt-3 p-3 bg-indigo-900/30 rounded-lg">
                      <p className="text-xs text-indigo-200">
                        💡 <strong>Système débutant:</strong> Vos attributs commencent bas (2-3) et progressent régulièrement tous les 2 niveaux pour une montée en puissance réaliste !
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'quests' && (
            <div>
              {/* Animation de célébration */}
              {showCelebration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-2xl font-bold text-lg animate-bounce shadow-2xl">
                    🎉 {celebrationText} 🎉
                  </div>
                </div>
              )}

              {/* Contenu de l'onglet Quêtes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-xl flex items-center gap-2">
                    <Award className="w-6 h-6 text-yellow-400" />
                    Quêtes journalières
                  </h3>
                  <div className="text-sm text-gray-400">
                    {quests.filter(q => q.completed).length}/{quests.length} complétées
                  </div>
                </div>
                
                <div className="space-y-3">
                  {quests.map(quest => (
                    <div 
                      key={quest.id}
                      className={`bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border rounded-2xl p-4 transition-all duration-300 ${
                        quest.completed 
                          ? 'border-green-500/30 bg-gradient-to-r from-green-900/20 to-emerald-900/20' 
                          : 'border-gray-700/50 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div 
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 ${
                              quest.completed 
                                ? 'bg-green-500/30 border border-green-400/50' 
                                : quest.id === 2 
                                  ? 'bg-blue-500/30 border border-blue-400/50 cursor-pointer hover:bg-blue-500/40 active:scale-95' 
                                  : 'bg-gray-700/50 border border-gray-600/50'
                            }`}
                            onClick={() => {
                              if (quest.id === 2 && !quest.completed) {
                                progressQuest(quest.id, 0.5);
                              }
                            }}
                          >
                            {quest.completed ? <CheckCircle className="w-6 h-6 text-green-400" /> : quest.icon}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`font-semibold ${quest.completed ? 'text-green-100' : 'text-white'}`}>
                                {quest.name}
                              </p>
                              {quest.completed && <Sparkles className="w-4 h-4 text-yellow-400" />}
                            </div>
                            <p className="text-sm text-gray-400 mb-2">
                              {quest.id === 2 && !quest.completed 
                                ? "Cliquez sur la goutte d'eau pour boire +0.5L" 
                                : quest.description}
                            </p>
                            
                            {/* Barre de progression pour les quêtes avec progress */}
                            {quest.progress !== undefined && quest.max && (
                              <div className="mb-2">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs text-gray-400">
                                    {quest.progress}/{quest.max} {quest.id === 2 ? 'litres' : 'unités'}
                                  </span>
                                  <span className="text-xs text-blue-400">
                                    {Math.round((quest.progress / quest.max) * 100)}%
                                  </span>
                                </div>
                                <div className="bg-gray-700/50 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-500"
                                    style={{ width: `${(quest.progress / quest.max) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <p className="text-sm font-bold text-purple-400">+{quest.xp} XP</p>
                            <p className="text-sm font-bold text-yellow-400">+{quest.coins} 💰</p>
                          </div>
                          
                          {!quest.completed && quest.id !== 2 && (
                            <div className="flex gap-2">
                              {/* Bouton de validation pour toutes les quêtes sauf l'hydratation */}
                              <button
                                onClick={() => completeQuest(quest.id)}
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95 shadow-lg hover:shadow-green-500/25"
                              >
                                ✓ Valider
                              </button>
                            </div>
                          )}
                          
                          {quest.completed && (
                            <div className="px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-xl text-sm font-bold text-green-300">
                              ✓ Complétée
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Résumé des récompenses */}
                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-4 mt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-purple-100 mb-1">Récompenses totales</h4>
                      <p className="text-sm text-purple-300">Complétez toutes les quêtes pour maximiser vos gains !</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-400">
                        {quests.reduce((sum, q) => sum + q.xp, 0)} XP
                      </p>
                      <p className="text-lg font-bold text-yellow-400">
                        {quests.reduce((sum, q) => sum + q.coins, 0)} 💰
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
