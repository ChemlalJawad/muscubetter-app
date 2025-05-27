import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
// Utilisation d'emojis au lieu d'icônes pour éviter les problèmes de compatibilité


const FitnessApp: React.FC = () => {
  // États pour la navigation et l'interface utilisateur
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('home');
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  
  // États pour les données utilisateur
  const [userLevel, setUserLevel] = useState<number>(1);
  const [userXP, setUserXP] = useState<number>(0);
  const [muscleCoins, setMuscleCoins] = useState<number>(250);
  const [streak, setStreak] = useState(3);
  const [waterIntake, setWaterIntake] = useState(0.5);
  const [totalWeight, setTotalWeight] = useState(45000);
  const [unlockedBadges, setUnlockedBadges] = useState(['first-workout']);
  
  // États pour les statistiques utilisateur
  const [userStats, setUserStats] = useState({
    force: 10,
    endurance: 10,
    souplesse: 10,
    assiduity: 8
  });
  
  // États pour le programme d'entraînement sur 4 semaines
  const [programWeeks, setProgramWeeks] = useState([
    { id: 1, name: "Réactivation", description: "Reprise en douceur pour réveiller les muscles et les articulations", current: true },
    { id: 2, name: "Consolidation", description: "Augmentation progressive des charges et du volume", current: false },
    { id: 3, name: "Progression", description: "Intensification des efforts et introduction de nouveaux exercices", current: false },
    { id: 4, name: "Stabilisation", description: "Maintien des acquis et préparation pour le cycle suivant", current: false }
  ]);
  
  // États pour la bibliothèque d'exercices
  const [exerciseCategories, setExerciseCategories] = useState([
    { id: 1, name: "Membres inférieurs", icon: "💪" },
    { id: 2, name: "Membres supérieurs", icon: "👍" },
    { id: 3, name: "Core", icon: "👕" },
    { id: 4, name: "Cardio", icon: "❤️" }
  ]);
  
  // Interface pour les types d'exercices
  interface Exercise {
    id: number;
    name: string;
    category: number;
    description: string;
    instructions: string;
    muscles: string[];
    equipment: string;
    difficulty: string;
    record: string;
    favorite: boolean;
    videoUrl?: string;
    tips?: string[];
  }

  const [exercises, setExercises] = useState<Exercise[]>([
    { 
      id: 1, 
      name: "Squat", 
      category: 1, 
      description: "Exercice polyarticulaire ciblant principalement les quadriceps, les ischio-jambiers et les fessiers.", 
      instructions: "1. Tenez-vous debout, pieds écartés largeur d'épaules\n2. Descendez comme pour vous asseoir, en gardant le dos droit\n3. Veillez à ce que vos genoux ne dépassent pas la pointe des pieds\n4. Remontez en poussant sur vos talons",
      muscles: ["Quadriceps", "Ischio-jambiers", "Fessiers", "Lombaires"],
      equipment: "Poids du corps ou barre",
      difficulty: "Débutant à avancé",
      record: "15 répétitions avec 60kg", 
      favorite: true,
      tips: ["Gardez le regard droit devant vous", "Maintenez le dos droit", "Respirez correctement: inspirez en descendant, expirez en montant"]
    },
    { 
      id: 2, 
      name: "Développé couché", 
      category: 2, 
      description: "Exercice de base pour développer les pectoraux, les épaules et les triceps.", 
      instructions: "1. Allongez-vous sur un banc, pieds au sol\n2. Saisissez la barre avec une prise légèrement plus large que les épaules\n3. Descendez la barre jusqu'à effleurer la poitrine\n4. Poussez pour remonter la barre à la position de départ",
      muscles: ["Pectoraux", "Épaules", "Triceps"],
      equipment: "Banc et haltères ou barre",
      difficulty: "Intermédiaire",
      record: "8 répétitions avec 50kg", 
      favorite: false,
      tips: ["Gardez les coudes à environ 45 degrés", "Contractez les abdominaux", "Ne rebondissez pas la barre sur la poitrine"]
    },
    { 
      id: 3, 
      name: "Planche", 
      category: 3, 
      description: "Exercice isométrique qui renforce l'ensemble de la ceinture abdominale et le dos.", 
      instructions: "1. Placez-vous en position de pompe sur les avant-bras\n2. Alignez votre corps des épaules aux chevilles\n3. Contractez les abdominaux et les fessiers\n4. Maintenez la position sans bouger",
      muscles: ["Abdominaux", "Lombaires", "Fessiers", "Épaules"],
      equipment: "Aucun",
      difficulty: "Débutant à avancé",
      record: "60 secondes", 
      favorite: true,
      tips: ["Ne laissez pas le bassin s'affaisser", "Respirez normalement", "Regardez vers le sol pour garder la nuque alignée"]
    },
    { 
      id: 4, 
      name: "Burpees", 
      category: 4, 
      description: "Exercice complet qui sollicite l'ensemble du corps et augmente le rythme cardiaque.", 
      instructions: "1. Commencez debout\n2. Accroupissez-vous et posez les mains au sol\n3. Lancez les jambes en arrière pour vous retrouver en position de pompe\n4. Faites une pompe (optionnel)\n5. Ramenez les jambes vers les mains\n6. Sautez en tendant les bras vers le haut",
      muscles: ["Quadriceps", "Pectoraux", "Abdominaux", "Système cardiovasculaire"],
      equipment: "Aucun",
      difficulty: "Intermédiaire à avancé",
      record: "20 répétitions", 
      favorite: false,
      tips: ["Adaptez l'exercice à votre niveau en supprimant la pompe ou le saut", "Maintenez un rythme régulier", "Respirez de façon contrôlée"]
    },
    { 
      id: 5, 
      name: "Fentes", 
      category: 1, 
      description: "Exercice unilatéral ciblant les quadriceps, les fessiers et améliorant l'équilibre.", 
      instructions: "1. Tenez-vous debout, pieds joints\n2. Faites un grand pas en avant avec une jambe\n3. Flechissez les deux genoux jusqu'à former un angle de 90 degrés\n4. Le genou arrière doit presque toucher le sol\n5. Poussez sur le pied avant pour revenir à la position initiale",
      muscles: ["Quadriceps", "Fessiers", "Ischio-jambiers", "Adducteurs"],
      equipment: "Poids du corps ou haltères",
      difficulty: "Débutant à intermédiaire",
      record: "12 répétitions avec 20kg", 
      favorite: false,
      tips: ["Gardez le buste droit", "Assurez-vous que le genou avant ne dépasse pas la pointe du pied", "Contractez les abdominaux pour stabiliser le tronc"]
    },
    { 
      id: 6, 
      name: "Traction", 
      category: 2, 
      description: "Exercice de tirage qui développe le dos, les biceps et les avant-bras.", 
      instructions: "1. Saisissez une barre fixe avec les mains en pronation (paumes vers l'avant)\n2. Suspendez-vous avec les bras tendus\n3. Tirez votre corps vers le haut jusqu'à ce que votre menton dépasse la barre\n4. Redescendez de manière contrôlée",
      muscles: ["Dorsaux", "Biceps", "Avant-bras", "Rhoïdes"],
      equipment: "Barre de traction",
      difficulty: "Intermédiaire à avancé",
      record: "8 répétitions", 
      favorite: true,
      tips: ["Commencez par des tractions assistées si nécessaire", "Concentrez-vous sur la contraction des dorsaux", "Évitez de balancer le corps"]
    }
  ]);
  
  // États pour les statistiques détaillées
  const [detailedStats, setDetailedStats] = useState({
    weeklyVolume: 12500, // Volume hebdomadaire en kg
    sessionsCompleted: 42, // Nombre total de séances complétées
    longestStreak: 14, // Plus longue série consécutive
    totalExercises: 24, // Nombre total d'exercices réalisés
    progressByWeek: [8500, 9200, 10800, 12500], // Progression du volume par semaine
    attendanceRate: 85 // Taux d'assiduité en %
  });
  
  // Interface pour les exercices du programme
  interface WorkoutExercise {
    name: string;
    sets: number;
    reps: string | number;
    rest: number;
    weight: string;
    xp: number;
  }

  // Interface pour les séances d'entraînement
  interface Workout {
    id: number;
    day: string;
    type: string;
    completed: boolean;
    exercises: WorkoutExercise[];
  }
  
  // États pour l'entraînement en cours
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);

  // Quêtes journalières
  const [dailyQuests, setDailyQuests] = useState<any[]>([
    { id: 1, name: "Le Réveil Musculaire", description: "5 min d'échauffement dynamique", completed: false, xp: 80, coins: 40, icon: '🌅' },
    { id: 2, name: "Hydratation Champion", description: "Boire 2 litres d'eau", progress: 0.5, max: 2, completed: false, xp: 100, coins: 50, icon: '💧' },
    { id: 3, name: "Le Défi Gainage", description: "Tenir la planche 60 secondes", completed: false, xp: 120, coins: 60, icon: '🏗️' },
    { id: 4, name: "La Marche Active", description: "30 min de marche rapide", completed: false, xp: 150, coins: 75, icon: '🚶' },
    { id: 5, name: "Sommeil Réparateur", description: "Dormir 7-8 heures", completed: false, xp: 100, coins: 50, icon: '😴' }
  ]);
  
  // Programme d'entraînement hebdomadaire
  const [weeklyProgram, setWeeklyProgram] = useState<Workout[]>([
    { 
      id: 1, 
      day: 'Lundi', 
      type: 'Full Body', 
      completed: false, 
      exercises: [
        { name: "Squats", sets: 3, reps: 15, rest: 60, weight: "Poids du corps", xp: 50 },
        { name: "Pompes (genoux)", sets: 2, reps: 12, rest: 45, weight: "Poids du corps", xp: 40 },
        { name: "Fentes alternées", sets: 2, reps: 10, rest: 45, weight: "Poids du corps", xp: 45 }
      ] 
    },
    { 
      id: 2, 
      day: 'Mercredi', 
      type: 'Full Body', 
      completed: false, 
      exercises: [
        { name: "Fentes", sets: 3, reps: 12, rest: 60, weight: "Poids du corps", xp: 50 },
        { name: "Pompes", sets: 2, reps: 10, rest: 45, weight: "Poids du corps", xp: 40 },
        { name: "Tractions", sets: 2, reps: 8, rest: 45, weight: "Poids du corps", xp: 45 }
      ] 
    },
    { 
      id: 3, 
      day: 'Vendredi', 
      type: 'Full Body', 
      completed: false, 
      exercises: [
        { name: "Soulevé de terre", sets: 3, reps: 12, rest: 60, weight: "Léger", xp: 50 },
        { name: "Élévations latérales", sets: 2, reps: 15, rest: 45, weight: "Léger", xp: 40 },
        { name: "Crunch", sets: 3, reps: 15, rest: 45, weight: "Poids du corps", xp: 45 }
      ] 
    }
  ]);
  
  // Référence pour les timers
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
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isResting, restTime]);
  
  // Vérifier la connexion à Supabase au chargement et charger les exercices
  useEffect(() => {
    async function initializeApp() {
      try {
        // Vérifier la connexion à Supabase
        const { error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        // Charger les exercices depuis Supabase
        await fetchExercisesFromSupabase();
      } catch (err: any) {
        console.error('Erreur d\'initialisation:', err);
      }
    }
    
    initializeApp();
  }, []);
  
  // Fonction pour récupérer les exercices depuis Supabase
  const fetchExercisesFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*');
      
      if (error) throw error;
      
      // Si des exercices sont trouvés, mettre à jour l'état
      if (data && data.length > 0) {
        setExercises(data as Exercise[]);
      } else {
        // Si aucun exercice n'est trouvé, sauvegarder les exercices par défaut
        await saveExercisesToSupabase();
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des exercices:', err);
    }
  };
  
  // Fonction pour sauvegarder les exercices et le programme d'entraînement dans Supabase
  const saveExercisesToSupabase = async () => {
    try {
      // Vérifier si la table existe déjà
      const { error: tableError } = await supabase
        .from('exercises')
        .select('id')
        .limit(1);
      
      // Si la table n'existe pas, elle sera créée automatiquement lors de l'insertion
      const { error } = await supabase
        .from('exercises')
        .insert(exercises);
      
      if (error) throw error;
      
      console.log('Exercices sauvegardés avec succès dans Supabase');
      
      // Sauvegarder également le programme d'entraînement
      const { error: programError } = await supabase
        .from('workout_program')
        .insert(weeklyProgram);
      
      if (programError) {
        console.error('Erreur lors de la sauvegarde du programme:', programError);
      } else {
        console.log('Programme d\'entraînement sauvegardé avec succès');
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des exercices:', err);
    }
  };
  
  // Fonction pour mettre à jour un exercice dans Supabase
  const updateExerciseInSupabase = async (exercise: Exercise) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .update(exercise)
        .eq('id', exercise.id);
      
      if (error) throw error;
      
      console.log(`Exercice ${exercise.name} mis à jour avec succès`);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'exercice:', err);
    }
  };

  // Fonctions de gestion des interactions utilisateur
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
      souplesse: prev.souplesse + Math.random() * 0.5,
      assiduity: prev.assiduity
    }));

    // Mise à jour du poids total
    if (exercise.weight !== "Poids du corps" && exercise.weight !== "-") {
      const weight = parseInt(exercise.weight) || 10;
      const reps = typeof exercise.reps === 'number' ? exercise.reps : parseInt(exercise.reps) || 0;
      setTotalWeight(prev => prev + (weight * reps));
    }

    if (currentSet < exercise.sets) {
      // Passer au repos
      setRestTime(exercise.rest);
      setIsResting(true);
      setCurrentSet(prev => prev + 1);
    } else if (currentExerciseIndex < currentWorkout.exercises.length - 1) {
      // Passer à l'exercice suivant
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
    } else {
      // Séance terminée
      completeWorkout();
    }
  };

  const completeWorkout = async () => {
    if (!currentWorkout) return;
    
    // Récompenses de fin de séance
    const totalXP = 500;
    const coinsEarned = 100;
    
    setUserXP(prev => prev + totalXP);
    setMuscleCoins(prev => prev + coinsEarned);
    
    // Mise à jour des quêtes
    setDailyQuests(prev => prev.map(quest => 
      quest.id === 1 ? { ...quest, completed: true } : quest
    ));
    
    // Débloquer des badges
    checkAndUnlockBadges();
    
    // Marquer l'entraînement comme terminé
    const updatedProgram = weeklyProgram.map(workout => 
      workout.id === currentWorkout.id ? { ...workout, completed: true } : workout
    );
    setWeeklyProgram(updatedProgram);
    
    // Sauvegarder la progression dans Supabase
    try {
      const { error } = await supabase
        .from('workout_program')
        .update({ completed: true })
        .eq('id', currentWorkout.id);
      
      if (error) throw error;
      
      // Sauvegarder également les statistiques utilisateur
      const { error: statsError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: 'current_user', // Remplacer par l'ID utilisateur réel après authentification
          xp: userXP,
          level: userLevel,
          muscle_coins: muscleCoins,
          force: userStats.force,
          endurance: userStats.endurance,
          souplesse: userStats.souplesse,
          assiduity: userStats.assiduity,
          streak: streak,
          total_weight: totalWeight,
          last_updated: new Date().toISOString()
        });
      
      if (statsError) console.error('Erreur lors de la sauvegarde des statistiques:', statsError);
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'entraînement:', err);
    }
    
    setCurrentScreen('workoutComplete');
  };

  const checkAndUnlockBadges = () => {
    // Vérifier les badges à débloquer
    if (totalWeight >= 100000 && !unlockedBadges.includes('centurion')) {
      setUnlockedBadges(prev => [...prev, 'centurion']);
    }
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTime(0);
  };

  const updateWaterIntake = () => {
    const newIntake = Math.min(waterIntake + 0.25, 2);
    setWaterIntake(newIntake);
    
    // Mettre à jour la quête d'hydratation
    setDailyQuests(prev => prev.map(quest => 
      quest.id === 2 ? { 
        ...quest, 
        progress: newIntake,
        completed: newIntake >= 2 
      } : quest
    ));

    // Si la quête est complétée, ajouter XP et pièces
    if (newIntake >= 2) {
      const quest = dailyQuests.find(q => q.id === 2);
      if (quest && !quest.completed) {
        setUserXP(prev => prev + quest.xp);
        setMuscleCoins(prev => prev + quest.coins);
      }
    }
  };

  const completeQuest = (questId: number) => {
    const quest = dailyQuests.find(q => q.id === questId);
    if (!quest || quest.completed) return;

    // Marquer la quête comme complétée
    setDailyQuests(prev => prev.map(q => 
      q.id === questId ? { ...q, completed: true } : q
    ));

    // Ajouter XP et pièces
    setUserXP(prev => prev + quest.xp);
    setMuscleCoins(prev => prev + quest.coins);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Dashboard Principal */}
      {currentScreen === 'dashboard' && (
        <div className="p-4 pb-20">
          {/* Header avec profil */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">MuscuBetter</h1>
              <p className="text-purple-300 flex items-center gap-2">
                <span className="text-sm">🛡️</span>
                Niveau {userLevel} - {getLevelName(userLevel)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-yellow-500/20 rounded-full px-3 py-1 flex items-center gap-1">
                <span className="text-sm text-yellow-400">💰</span>
                <span className="text-sm font-bold">{muscleCoins}</span>
              </div>
            </div>
          </div>

          {/* Barre d'XP */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center gap-1">
                <span className="text-sm text-yellow-400">⭐</span>
                XP: {userXP}
              </span>
              <span className="text-gray-400">Prochain niveau: {xpForNextLevel}</span>
            </div>
            <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500 relative overflow-hidden"
                style={{ width: `${xpProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Stats dynamiques */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 text-6xl opacity-10">💪</div>
              <span className="text-xl mb-2">💪</span>
              <p className="text-sm text-gray-300">Force</p>
              <p className="text-xl font-bold">{Math.floor(userStats.force)}</p>
              <div className="mt-2 bg-red-900/50 rounded-full h-1">
                <div className="bg-red-500 h-full rounded-full" style={{ width: `${Math.min(userStats.force, 100)}%` }} />
              </div>
            </div>
            <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 text-6xl opacity-10">🌊</div>
              <span className="text-xl mb-2">🌊</span>
              <p className="text-sm text-gray-300">Endurance</p>
              <p className="text-xl font-bold">{Math.floor(userStats.endurance)}</p>
              <div className="mt-2 bg-blue-900/50 rounded-full h-1">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(userStats.endurance, 100)}%` }} />
              </div>
            </div>
            <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 text-6xl opacity-10">🧘</div>
              <span className="text-xl mb-2">🏃</span>
              <p className="text-sm text-gray-300">Souplesse</p>
              <p className="text-xl font-bold">{Math.floor(userStats.souplesse)}</p>
              <div className="mt-2 bg-green-900/50 rounded-full h-1">
                <div className="bg-green-500 h-full rounded-full" style={{ width: `${Math.min(userStats.souplesse, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Série en cours */}
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 mb-6 border border-orange-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="font-bold">Série en cours</p>
                  <p className="text-sm text-gray-300">{streak} jours consécutifs!</p>
                </div>
              </div>
              <div className="bg-orange-500/30 rounded-full p-2">
                <span className="text-lg">➡️</span>
              </div>
            </div>
          </div>

          {/* Quêtes journalières */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-lg">🏆</span>
              Quêtes Journalières
            </h2>
            <div className="space-y-3">
              {dailyQuests.map(quest => (
                <div key={quest.id} className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{quest.icon}</div>
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
                        onClick={() => completeQuest(quest.id)}
                        className={`rounded-full p-2 ${quest.completed ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}`}
                        disabled={quest.completed}
                      >
                        {quest.completed ? <span className="text-lg">✅</span> : <span className="text-lg">➕</span>}
                      </button>
                    )}
                  </div>
                  {quest.progress !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{quest.progress}L</span>
                        <span>{quest.max}L</span>
                      </div>
                      <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${(quest.progress / quest.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {quest.completed && (
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        +{quest.xp} XP
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-yellow-400">💰</span>
                        +{quest.coins}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Programme de la semaine */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-purple-400 text-lg">📅</span>
              Programme de la semaine
            </h2>
            <div className="space-y-3">
              {weeklyProgram.map(workout => (
                <div key={workout.id} className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{workout.day}</p>
                        <span className="bg-purple-500/20 text-purple-400 text-xs rounded-full px-2 py-0.5">{workout.type}</span>
                      </div>
                      <p className="text-sm text-gray-400">{workout.exercises.length} exercices</p>
                    </div>
                    <button 
                      onClick={() => startWorkout(workout)}
                      className={`rounded-full p-2 ${workout.completed ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}
                    >
                      {workout.completed ? <span className="text-lg">✅</span> : <span className="text-lg">▶️</span>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Écran d'entraînement */}
      {currentScreen === 'workout' && currentWorkout && (
        <div className="p-4 pb-20">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setCurrentScreen('dashboard')}
              className="bg-gray-800 rounded-full p-2"
            >
              <span className="text-lg">⬅️</span>
            </button>
            <h1 className="text-xl font-bold">{currentWorkout.type}</h1>
            <div className="w-10" />
          </div>

          <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-400">Exercice {currentExerciseIndex + 1}/{currentWorkout.exercises.length}</p>
              <div className="bg-purple-500/20 text-purple-400 text-xs rounded-full px-2 py-0.5">
                {currentWorkout.day}
              </div>
            </div>

            {!isResting ? (
              <div className="bg-gray-900 rounded-2xl p-6 text-center border border-gray-700">
                <h3 className="text-2xl font-bold mb-2">
                  {currentWorkout.exercises[currentExerciseIndex].name}
                </h3>
                
                {/* Bouton pour afficher/masquer les détails de l'exercice */}
                <button 
                  onClick={() => setShowExerciseDetails(!showExerciseDetails)}
                  className="text-sm text-blue-400 mb-2 flex items-center justify-center mx-auto gap-1"
                >
                  {showExerciseDetails ? 'Masquer les détails' : 'Voir les détails'}
                  <span className={`text-sm transition-transform ${showExerciseDetails ? 'inline-block' : ''}`}>{showExerciseDetails ? '🔽' : '▶️'}</span>
                </button>
                
                {/* Détails de l'exercice */}
                {showExerciseDetails && (
                  <div className="bg-gray-800 rounded-lg p-4 mb-4 text-left">
                    {/* Trouver l'exercice correspondant dans la bibliothèque */}
                    {(() => {
                      const exerciseDetails = exercises.find(ex => 
                        ex.name === currentWorkout.exercises[currentExerciseIndex].name
                      );
                      
                      if (exerciseDetails) {
                        return (
                          <>
                            <div className="mb-3">
                              <h4 className="font-bold text-sm text-gray-300 mb-1">Instructions :</h4>
                              {exerciseDetails.instructions.split('\n').map((line, index) => (
                                <p key={index} className="text-sm text-gray-400 mb-1">{line}</p>
                              ))}
                            </div>
                            
                            <div className="mb-3">
                              <h4 className="font-bold text-sm text-gray-300 mb-1">Muscles sollicités :</h4>
                              <div className="flex flex-wrap gap-1">
                                {exerciseDetails.muscles.map((muscle, index) => (
                                  <span key={index} className="bg-red-500/20 text-red-400 text-xs rounded-full px-2 py-0.5">
                                    {muscle}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            {exerciseDetails.tips && exerciseDetails.tips.length > 0 && (
                              <div>
                                <h4 className="font-bold text-sm text-gray-300 mb-1">Conseils :</h4>
                                <ul className="text-sm text-gray-400">
                                  {exerciseDetails.tips.map((tip, index) => (
                                    <li key={index} className="mb-1">• {tip}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        );
                      } else {
                        return <p className="text-sm text-gray-400">Détails non disponibles pour cet exercice.</p>;
                      }
                    })()}
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-4 my-6">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <span className="text-gray-400 mx-auto mb-1 text-lg">🔄</span>
                    <p className="text-gray-400 text-sm">Séries</p>
                    <p className="text-xl font-bold text-purple-400">
                      {currentSet}/{currentWorkout.exercises[currentExerciseIndex].sets}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <span className="text-gray-400 mx-auto mb-1 text-lg">🎯</span>
                    <p className="text-gray-400 text-sm">Répétitions</p>
                    <p className="text-xl font-bold text-blue-400">
                      {currentWorkout.exercises[currentExerciseIndex].reps}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <span className="text-gray-400 mx-auto mb-1 text-lg">⚖️</span>
                    <p className="text-gray-400 text-sm">Charge</p>
                    <p className="text-xl font-bold text-green-400">
                      {currentWorkout.exercises[currentExerciseIndex].weight}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={completeSet}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full px-8 py-4 text-lg font-bold transform transition hover:scale-105 w-full"
                >
                  Série terminée ✓
                </button>
                
                <p className="text-sm text-gray-400 mt-4">
                  +{currentWorkout.exercises[currentExerciseIndex].xp} XP par série
                </p>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-2xl p-6 text-center border border-gray-700">
                <h3 className="text-2xl font-bold mb-4">Temps de repos</h3>
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="377"
                      strokeDashoffset={377 - (377 * (restTime / currentWorkout.exercises[currentExerciseIndex].rest))}
                      className="text-blue-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold">{restTime}</span>
                  </div>
                </div>
                <button
                  onClick={skipRest}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full px-8 py-4 text-lg font-bold transform transition hover:scale-105 w-full"
                >
                  Passer le repos
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Écran Programme */}
      {currentScreen === 'program' && (
        <div className="p-4 pb-20">
          {/* Header avec titre */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Programme</h1>
              <p className="text-purple-300">Programme de reprise sur 4 semaines</p>
            </div>
          </div>
          
          {/* Sélection des semaines */}
          <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
            {programWeeks.map(week => (
              <div 
                key={week.id}
                className={`flex-shrink-0 rounded-xl p-3 ${week.current ? 'bg-purple-500/30 border border-purple-500/50' : 'bg-gray-800 border border-gray-700'}`}
                style={{ width: '180px' }}
              >
                <h3 className="font-bold mb-1">Semaine {week.id}</h3>
                <p className="text-sm text-purple-300 mb-2">{week.name}</p>
                <p className="text-xs text-gray-400">{week.description}</p>
              </div>
            ))}
          </div>
          
          {/* Détails de la semaine en cours */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-purple-400 text-lg">📅</span>
              Semaine 1: Réactivation
            </h2>
            <p className="text-sm text-gray-300 mb-4">
              Cette semaine est conçue pour réveiller progressivement vos muscles et articulations. 
              Les exercices sont de faible intensité avec un volume modéré pour permettre au corps de s'adapter sans risque de blessure.
            </p>
            
            <h3 className="font-bold mb-2">Objectifs de la semaine:</h3>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm">
                <div className="bg-green-500/20 rounded-full p-1">
                  <span className="text-green-400 text-xs">✓</span>
                </div>
                Retrouver les sensations de base
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="bg-green-500/20 rounded-full p-1">
                  <span className="text-green-400 text-xs">✓</span>
                </div>
                Travailler la technique des mouvements
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="bg-green-500/20 rounded-full p-1">
                  <span className="text-green-400 text-xs">✓</span>
                </div>
                Préparer le corps aux efforts plus intenses
              </li>
            </ul>
            
            <div className="space-y-3">
              {weeklyProgram.map(workout => (
                <div key={workout.id} className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{workout.day}</p>
                        <span className="bg-purple-500/20 text-purple-400 text-xs rounded-full px-2 py-0.5">{workout.type}</span>
                      </div>
                      <p className="text-sm text-gray-400">{workout.exercises.length} exercices</p>
                    </div>
                    <button 
                      onClick={() => startWorkout(workout)}
                      className={`rounded-full p-2 ${workout.completed ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}
                    >
                      {workout.completed ? <span className="text-lg">✅</span> : <span className="text-lg">▶️</span>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Conseils pour la semaine */}
          <div className="bg-blue-500/20 rounded-xl p-4 mb-6 border border-blue-500/30">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <span className="text-blue-400 text-lg">⚡</span>
              Conseils pour cette semaine
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Échauffez-vous soigneusement avant chaque séance (5-10 minutes)</li>
              <li>• Concentrez-vous sur la qualité d'exécution plutôt que sur la charge</li>
              <li>• Hydratez-vous régulièrement pendant l'entraînement</li>
              <li>• Prévoyez 48h de récupération entre deux séances</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Écran Exercices */}
      {currentScreen === 'exercises' && (
        <div className="p-4 pb-20">
          {/* Header avec titre */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Exercices</h1>
              <p className="text-purple-300">Bibliothèque d'exercices</p>
            </div>
            <div className="bg-gray-800 rounded-full p-2">
              <span className="text-gray-400 text-lg">🔍</span>
            </div>
          </div>
          
          {/* Catégories d'exercices */}
          <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
            <div className="flex-shrink-0 bg-purple-500/30 rounded-xl p-3 border border-purple-500/50" style={{ width: '100px' }}>
              <div className="text-2xl mb-1 text-center">🚀</div>
              <p className="text-sm text-center">Tous</p>
            </div>
            {exerciseCategories.map(category => (
              <div key={category.id} className="flex-shrink-0 bg-gray-800 rounded-xl p-3 border border-gray-700" style={{ width: '100px' }}>
                <div className="text-2xl mb-1 text-center">{category.icon}</div>
                <p className="text-sm text-center">{category.name}</p>
              </div>
            ))}
          </div>
          
          {/* Liste des exercices */}
          <div className="space-y-4 mb-6">
            {exercises.map(exercise => (
              <div key={exercise.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{exercise.name}</h3>
                  <div className={`${exercise.favorite ? 'text-yellow-400' : 'text-gray-500'}`}>
                    <span className="text-lg">⭐</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-3">{exercise.description}</p>
                <div className="flex justify-between items-center">
                  <span className="bg-purple-500/20 text-purple-400 text-xs rounded-full px-2 py-0.5">
                    {exerciseCategories.find(c => c.id === exercise.category)?.name}
                  </span>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-yellow-400 text-sm">🏆</span>
                    <span>{exercise.record}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Bouton d'ajout */}
          <div className="fixed bottom-20 right-4">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-4 shadow-lg">
              <span className="text-lg">➕</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Écran Statistiques */}
      {currentScreen === 'stats' && (
        <div className="p-4 pb-20">
          {/* Header avec titre */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Statistiques</h1>
              <p className="text-purple-300">Suivi de votre progression</p>
            </div>
          </div>
          
          {/* Résumé des statistiques */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-red-400 text-lg">💪</span>
                <p className="font-bold">Volume total</p>
              </div>
              <p className="text-2xl font-bold">{detailedStats.weeklyVolume} kg</p>
              <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                <span className="text-xs">⬆️</span> +15% cette semaine
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-blue-400 text-lg">📅</span>
                <p className="font-bold">Séances</p>
              </div>
              <p className="text-2xl font-bold">{detailedStats.sessionsCompleted}</p>
              <p className="text-xs text-gray-400 mt-1">
                Taux d'assiduité: {detailedStats.attendanceRate}%
              </p>
            </div>
          </div>
          
          {/* Graphique de progression */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
            <h2 className="text-lg font-bold mb-4">Progression du volume</h2>
            <div className="h-40 flex items-end justify-between">
              {detailedStats.progressByWeek.map((volume, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-12 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-md"
                    style={{ height: `${(volume / 15000) * 100}%` }}
                  />
                  <p className="text-xs mt-1">S{index + 1}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Statistiques détaillées */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
            <h2 className="text-lg font-bold mb-4">Détails par catégorie</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium">Force</p>
                  <p className="text-sm font-bold">{userStats.force}/100</p>
                </div>
                <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: `${userStats.force}%` }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium">Endurance</p>
                  <p className="text-sm font-bold">{userStats.endurance}/100</p>
                </div>
                <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${userStats.endurance}%` }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium">Souplesse</p>
                  <p className="text-sm font-bold">{userStats.souplesse}/100</p>
                </div>
                <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: `${userStats.souplesse}%` }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium">Assiduité</p>
                  <p className="text-sm font-bold">{userStats.assiduity}/10</p>
                </div>
                <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${userStats.assiduity * 10}%` }} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Badges et accomplissements */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-yellow-400 text-lg">🏅</span>
              Badges débloqués
            </h2>
            
            <div className="grid grid-cols-4 gap-3">
              <div className="flex flex-col items-center">
                <div className="bg-yellow-500/20 rounded-full p-3 mb-1">
                  <span className="text-yellow-400 text-xl">🏆</span>
                </div>
                <p className="text-xs text-center">Départ Idéal</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-yellow-500/20 rounded-full p-3 mb-1">
                  <span className="text-yellow-400 text-xl">🔥</span>
                </div>
                <p className="text-xs text-center">Série x3</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gray-700/50 rounded-full p-3 mb-1">
                  <span className="text-gray-500 text-xl">💪</span>
                </div>
                <p className="text-xs text-center text-gray-500">Centurion</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gray-700/50 rounded-full p-3 mb-1">
                  <span className="text-gray-500 text-xl">🏃</span>
                </div>
                <p className="text-xs text-center text-gray-500">Marathonien</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Écran de fin d'entraînement */}
      {currentScreen === 'workoutComplete' && (
        <div className="p-4 pb-20 flex flex-col items-center justify-center min-h-screen">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full p-6 mb-6">
            <span className="text-green-400 text-5xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Entraînement terminé!</h1>
          <p className="text-gray-400 mb-8">Excellent travail aujourd'hui</p>
          
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 mb-8">
            <h2 className="text-xl font-bold mb-4">Récompenses</h2>
            <div className="flex justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-xl">⭐</span>
                <span>XP gagnés</span>
              </div>
              <span className="text-xl font-bold">+500</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-xl">💰</span>
                <span>Muscles Coins</span>
              </div>
              <span className="text-xl font-bold">+100</span>
            </div>
          </div>
          
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-8 py-4 text-lg font-bold transform transition hover:scale-105 w-full max-w-md"
          >
            Retour au tableau de bord
          </button>
        </div>
      )}

      {/* Navigation du bas */}
      {(currentScreen === 'dashboard' || currentScreen === 'program' || currentScreen === 'exercises' || currentScreen === 'stats') && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-2">
          <div className="flex justify-around">
            <button 
              className={`flex flex-col items-center p-2 ${activeTab === 'home' ? 'text-purple-400' : 'text-gray-500'}`}
              onClick={() => { setActiveTab('home'); setCurrentScreen('dashboard'); }}
            >
              <span className="text-xl mb-1">🏠</span>
              <span className="text-xs">Accueil</span>
            </button>
            <button 
              className={`flex flex-col items-center p-2 ${activeTab === 'program' ? 'text-purple-400' : 'text-gray-500'}`}
              onClick={() => { setActiveTab('program'); setCurrentScreen('program'); }}
            >
              <span className="text-xl mb-1">📅</span>
              <span className="text-xs">Programme</span>
            </button>
            <button 
              className={`flex flex-col items-center p-2 ${activeTab === 'exercises' ? 'text-purple-400' : 'text-gray-500'}`}
              onClick={() => { setActiveTab('exercises'); setCurrentScreen('exercises'); }}
            >
              <span className="text-xl mb-1">💪</span>
              <span className="text-xs">Exercices</span>
            </button>
            <button 
              className={`flex flex-col items-center p-2 ${activeTab === 'stats' ? 'text-purple-400' : 'text-gray-500'}`}
              onClick={() => { setActiveTab('stats'); setCurrentScreen('stats'); }}
            >
              <span className="text-xl mb-1">📊</span>
              <span className="text-xs">Stats</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FitnessApp;
