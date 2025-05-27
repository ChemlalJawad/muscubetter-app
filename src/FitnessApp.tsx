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

// Bibliothèque d'exercices interfaces
enum MuscleGroup {
  Chest = 'Poitrine',
  Back = 'Dos',
  Legs = 'Jambes',
  Shoulders = 'Épaules',
  Arms = 'Bras',
  Core = 'Abdominaux',
  Cardio = 'Cardio',
  FullBody = 'Corps entier'
}

enum ExerciseType {
  Strength = 'Force',
  Cardio = 'Cardio',
  Flexibility = 'Souplesse',
  Plank = 'Gainage'
}

enum TrackingType {
  WeightReps = 'Poids/Répétitions',
  Time = 'Temps',
  Distance = 'Distance',
  RepsOnly = 'Répétitions seules'
}

enum Equipment {
  Bodyweight = 'Poids du corps',
  Dumbbells = 'Haltères',
  Barbell = 'Barre',
  Machine = 'Machine',
  Kettlebell = 'Kettlebell',
  ResistanceBand = 'Bande élastique',
  Cable = 'Câble',
  Bench = 'Banc',
  None = 'Aucun'
}

interface ExerciseVariant {
  name: string;
  description: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
}

interface LibraryExercise {
  id: number;
  name: string;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroups?: MuscleGroup[];
  type: ExerciseType;
  trackingType: TrackingType;
  equipment: Equipment[];
  description: string;
  videoUrl?: string;
  imageUrl?: string;
  variants?: ExerciseVariant[];
  isCustom: boolean;
  dateAdded: Date;
}

// Records personnels interfaces
interface BasePersonalRecord {
  id: number;
  exerciseId: number;
  date: Date;
  notes?: string;
}

interface WeightRecord extends BasePersonalRecord {
  weight: number; // en kg
  reps: number;
}

interface TimeRecord extends BasePersonalRecord {
  duration: number; // en secondes
}

interface DistanceRecord extends BasePersonalRecord {
  distance: number; // en mètres
  duration?: number; // en secondes
}

interface RepsRecord extends BasePersonalRecord {
  reps: number;
}

type PersonalRecord = WeightRecord | TimeRecord | DistanceRecord | RepsRecord;

// Badges interfaces
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'Régularité' | 'Performance' | 'Maîtrise';
  dateUnlocked?: Date;
  progress?: number;
  target: number;
}

// Système de niveaux inspiré manga/anime
enum UserLevel {
  NoviceEnReprise = 1,
  ApprentiAthlete = 2,
  GuerrierEnDevenir = 3,
  ForceMontante = 4,
  EnduranceEveillee = 5,
  SouplesseInitiale = 6,
  AthleteDetermine = 7,
  MaitreDeLaReprise = 8,
  LegendeEnMarche = 9,
  Gear5 = 10
}

interface LevelInfo {
  level: UserLevel;
  name: string;
  description: string;
  xpRequired: number;
  icon: string;
  color: string;
}

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

// Informations sur les niveaux
const levelInfos: LevelInfo[] = [
  {
    level: UserLevel.NoviceEnReprise,
    name: "Novice en Reprise",
    description: "Vous faites vos premiers pas dans votre reprise sportive. Continuez à vous entraîner régulièrement !",
    xpRequired: 0,
    icon: "🏋️",
    color: "#6366f1" // indigo-500
  },
  {
    level: UserLevel.ApprentiAthlete,
    name: "Apprenti Athlète",
    description: "Vous commencez à développer une routine d'entraînement. Votre corps s'adapte progressivement !",
    xpRequired: 1000,
    icon: "💪",
    color: "#8b5cf6" // violet-500
  },
  {
    level: UserLevel.GuerrierEnDevenir,
    name: "Guerrier en Devenir",
    description: "Votre détermination se renforce. Vous êtes sur la bonne voie pour devenir un véritable guerrier !",
    xpRequired: 2500,
    icon: "⚔️",
    color: "#ec4899" // pink-500
  },
  {
    level: UserLevel.ForceMontante,
    name: "Force Montante",
    description: "Votre force augmente sensiblement. Les charges deviennent plus faciles à soulever !",
    xpRequired: 5000,
    icon: "💪",
    color: "#ef4444" // red-500
  },
  {
    level: UserLevel.EnduranceEveillee,
    name: "Endurance Éveillée",
    description: "Votre endurance s'améliore. Vous pouvez maintenant tenir plus longtemps dans vos efforts !",
    xpRequired: 8000,
    icon: "🏃",
    color: "#f97316" // orange-500
  },
  {
    level: UserLevel.SouplesseInitiale,
    name: "Souplesse Initiale",
    description: "Votre corps gagne en souplesse. Vos mouvements deviennent plus fluides et précis !",
    xpRequired: 12000,
    icon: "🧘",
    color: "#14b8a6" // teal-500
  },
  {
    level: UserLevel.AthleteDetermine,
    name: "Athlète Déterminé",
    description: "Vous êtes désormais un athlète accompli. Votre détermination est impressionnante !",
    xpRequired: 18000,
    icon: "🏅",
    color: "#0ea5e9" // sky-500
  },
  {
    level: UserLevel.MaitreDeLaReprise,
    name: "Maître de la Reprise",
    description: "Vous maîtrisez parfaitement votre corps et vos entraînements. Un exemple pour les autres !",
    xpRequired: 25000,
    icon: "🥇",
    color: "#6366f1" // indigo-500
  },
  {
    level: UserLevel.LegendeEnMarche,
    name: "Légende en Marche",
    description: "Votre progression est légendaire. Peu de personnes atteignent ce niveau d'excellence !",
    xpRequired: 40000,
    icon: "🔥",
    color: "#a855f7" // purple-500
  },
  {
    level: UserLevel.Gear5,
    name: "Gear 5",
    description: "Vous avez atteint l'éveil ultime, comme Luffy en Gear 5. Votre potentiel est illimité !",
    xpRequired: 60000,
    icon: "✨",
    color: "#f43f5e" // rose-500
  }
];

const FitnessApp = () => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [userLevel, setUserLevel] = useState<UserLevel>(UserLevel.NoviceEnReprise);
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
  
  // Bibliothèque d'exercices
  const [exerciseLibrary, setExerciseLibrary] = useState<LibraryExercise[]>([
    {
      id: 1,
      name: "Squat",
      primaryMuscleGroup: MuscleGroup.Legs,
      secondaryMuscleGroups: [MuscleGroup.Core],
      type: ExerciseType.Strength,
      trackingType: TrackingType.WeightReps,
      equipment: [Equipment.Bodyweight, Equipment.Barbell, Equipment.Dumbbells],
      description: "Le squat est un exercice polyarticulaire qui cible principalement les quadriceps, les ischio-jambiers et les fessiers.",
      videoUrl: "https://example.com/squat.mp4",
      imageUrl: "https://example.com/squat.jpg",
      variants: [
        { name: "Squat poids du corps", description: "Version basique sans équipement", difficulty: "Débutant" },
        { name: "Squat gobelet", description: "Avec un haltère tenu devant la poitrine", difficulty: "Intermédiaire" },
        { name: "Squat barre", description: "Avec une barre sur les épaules", difficulty: "Avancé" }
      ],
      isCustom: false,
      dateAdded: new Date(2025, 4, 1)
    },
    {
      id: 2,
      name: "Pompes",
      primaryMuscleGroup: MuscleGroup.Chest,
      secondaryMuscleGroups: [MuscleGroup.Shoulders, MuscleGroup.Arms],
      type: ExerciseType.Strength,
      trackingType: TrackingType.RepsOnly,
      equipment: [Equipment.Bodyweight],
      description: "Les pompes sont un exercice de base qui cible principalement les pectoraux, les épaules et les triceps.",
      videoUrl: "https://example.com/pushups.mp4",
      imageUrl: "https://example.com/pushups.jpg",
      variants: [
        { name: "Pompes sur les genoux", description: "Version facilitée pour débutants", difficulty: "Débutant" },
        { name: "Pompes classiques", description: "Version standard", difficulty: "Intermédiaire" },
        { name: "Pompes déclinées", description: "Avec les pieds surélevés", difficulty: "Avancé" }
      ],
      isCustom: false,
      dateAdded: new Date(2025, 4, 1)
    },
    {
      id: 3,
      name: "Planche",
      primaryMuscleGroup: MuscleGroup.Core,
      secondaryMuscleGroups: [MuscleGroup.Shoulders],
      type: ExerciseType.Plank,
      trackingType: TrackingType.Time,
      equipment: [Equipment.Bodyweight],
      description: "La planche est un exercice statique qui renforce les abdominaux, le dos et les épaules.",
      videoUrl: "https://example.com/plank.mp4",
      imageUrl: "https://example.com/plank.jpg",
      variants: [
        { name: "Planche sur les genoux", description: "Version facilitée", difficulty: "Débutant" },
        { name: "Planche standard", description: "Sur les avant-bras", difficulty: "Intermédiaire" },
        { name: "Planche latérale", description: "Sur un seul côté", difficulty: "Avancé" }
      ],
      isCustom: false,
      dateAdded: new Date(2025, 4, 1)
    },
    {
      id: 4,
      name: "Course",
      primaryMuscleGroup: MuscleGroup.Cardio,
      secondaryMuscleGroups: [MuscleGroup.Legs],
      type: ExerciseType.Cardio,
      trackingType: TrackingType.Distance,
      equipment: [Equipment.None],
      description: "La course est un exercice cardio-vasculaire qui améliore l'endurance et brûle des calories.",
      videoUrl: "https://example.com/running.mp4",
      imageUrl: "https://example.com/running.jpg",
      isCustom: false,
      dateAdded: new Date(2025, 4, 1)
    }
  ]);
  
  // Records personnels
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([
    {
      id: 1,
      exerciseId: 1, // Squat
      weight: 80,
      reps: 8,
      date: new Date(2025, 4, 15),
      notes: "Première fois à 80kg"
    } as WeightRecord,
    {
      id: 2,
      exerciseId: 2, // Pompes
      reps: 15,
      date: new Date(2025, 4, 10)
    } as RepsRecord,
    {
      id: 3,
      exerciseId: 3, // Planche
      duration: 60, // 60 secondes
      date: new Date(2025, 4, 12)
    } as TimeRecord,
    {
      id: 4,
      exerciseId: 4, // Course
      distance: 5000, // 5 km
      duration: 1500, // 25 minutes
      date: new Date(2025, 4, 20)
    } as DistanceRecord
  ]);
  
  // État pour le modal d'ajout de record personnel
  const [showPRModal, setShowPRModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<LibraryExercise | null>(null);
  const [newPR, setNewPR] = useState<{
    weight?: number;
    reps?: number;
    duration?: number;
    distance?: number;
    notes?: string;
  }>({});
  
  // Badges
  const [badges, setBadges] = useState<Badge[]>([
    {
      id: "first-workout",
      name: "Le Départ Idéal",
      description: "Terminer la première séance du programme",
      icon: "🏅",
      category: "Régularité",
      dateUnlocked: new Date(2025, 4, 5),
      progress: 1,
      target: 1
    },
    {
      id: "serial-sportif",
      name: "Serial Sportif",
      description: "Enchaîner 7 jours d'activité physique",
      icon: "🔥",
      category: "Régularité",
      dateUnlocked: new Date(2025, 4, 12),
      progress: 7,
      target: 7
    },
    {
      id: "first-pr",
      name: "Premier RP",
      description: "Enregistrer un premier Record Personnel",
      icon: "🥇",
      category: "Performance",
      dateUnlocked: new Date(2025, 4, 15),
      progress: 1,
      target: 1
    },
    {
      id: "centurion",
      name: "Le Centurion",
      description: "Soulever un volume total de 100 000 kg",
      icon: "💪",
      category: "Performance",
      progress: 45000,
      target: 100000
    }
  ]);
  
  // Filtre pour la bibliothèque d'exercices
  const [exerciseFilter, setExerciseFilter] = useState({
    muscleGroup: null as MuscleGroup | null,
    equipment: null as Equipment | null,
    searchTerm: ""
  });

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
  
  // Fonction pour calculer le niveau en fonction de l'XP
  const calculateLevel = (xp: number): UserLevel => {
    for (let i = levelInfos.length - 1; i >= 0; i--) {
      if (xp >= levelInfos[i].xpRequired) {
        return levelInfos[i].level;
      }
    }
    return UserLevel.NoviceEnReprise;
  };
  
  // Fonction pour obtenir les informations du niveau actuel
  const getCurrentLevelInfo = (): LevelInfo => {
    return levelInfos.find(info => info.level === userLevel) || levelInfos[0];
  };
  
  // Fonction pour obtenir les informations du niveau suivant
  const getNextLevelInfo = (): LevelInfo | null => {
    const currentLevelIndex = levelInfos.findIndex(info => info.level === userLevel);
    if (currentLevelIndex < levelInfos.length - 1) {
      return levelInfos[currentLevelIndex + 1];
    }
    return null;
  };
  
  // Fonction pour ajouter de l'XP et mettre à jour le niveau si nécessaire
  const addXP = (amount: number) => {
    const newXP = userXP + amount;
    setUserXP(newXP);
    
    const newLevel = calculateLevel(newXP);
    if (newLevel !== userLevel) {
      setUserLevel(newLevel);
      // Afficher une animation ou notification de niveau supérieur
      // TODO: Implémenter l'animation de niveau supérieur
    }
  };
  
  // Fonction pour ouvrir le modal d'ajout de record personnel
  const openPRModal = (exercise: LibraryExercise) => {
    setSelectedExercise(exercise);
    setNewPR({});
    setShowPRModal(true);
  };
  
  // Fonction pour fermer le modal d'ajout de record personnel
  const closePRModal = () => {
    setShowPRModal(false);
    setSelectedExercise(null);
    setNewPR({});
  };
  
  // Fonction pour ajouter un nouveau record personnel
  const addPersonalRecord = () => {
    if (!selectedExercise) return;
    
    const newRecord: Partial<PersonalRecord> = {
      id: personalRecords.length + 1,
      exerciseId: selectedExercise.id,
      date: new Date(),
      notes: newPR.notes
    };
    
    let isRecord = false;
    
    // Créer le bon type de record selon le type d'exercice
    switch (selectedExercise.trackingType) {
      case TrackingType.WeightReps:
        if (newPR.weight && newPR.reps) {
          const weightRecord = newRecord as WeightRecord;
          weightRecord.weight = newPR.weight;
          weightRecord.reps = newPR.reps;
          
          // Vérifier si c'est un nouveau record
          const existingWeightRecords = personalRecords.filter(
            r => r.exerciseId === selectedExercise.id && 'weight' in r
          ) as WeightRecord[];
          
          if (existingWeightRecords.length === 0 || 
              existingWeightRecords.every(r => r.weight < weightRecord.weight || 
                                            (r.weight === weightRecord.weight && r.reps < weightRecord.reps))) {
            isRecord = true;
          }
          
          setPersonalRecords(prev => [...prev, weightRecord]);
        }
        break;
        
      case TrackingType.RepsOnly:
        if (newPR.reps) {
          const repsRecord = newRecord as RepsRecord;
          repsRecord.reps = newPR.reps;
          
          // Vérifier si c'est un nouveau record
          const existingRepsRecords = personalRecords.filter(
            r => r.exerciseId === selectedExercise.id && 'reps' in r && !('weight' in r)
          ) as RepsRecord[];
          
          if (existingRepsRecords.length === 0 || 
              existingRepsRecords.every(r => r.reps < repsRecord.reps)) {
            isRecord = true;
          }
          
          setPersonalRecords(prev => [...prev, repsRecord]);
        }
        break;
        
      case TrackingType.Time:
        if (newPR.duration) {
          const timeRecord = newRecord as TimeRecord;
          timeRecord.duration = newPR.duration;
          
          // Vérifier si c'est un nouveau record
          const existingTimeRecords = personalRecords.filter(
            r => r.exerciseId === selectedExercise.id && 'duration' in r && !('distance' in r)
          ) as TimeRecord[];
          
          if (existingTimeRecords.length === 0 || 
              existingTimeRecords.every(r => r.duration < timeRecord.duration)) {
            isRecord = true;
          }
          
          setPersonalRecords(prev => [...prev, timeRecord]);
        }
        break;
        
      case TrackingType.Distance:
        if (newPR.distance) {
          const distanceRecord = newRecord as DistanceRecord;
          distanceRecord.distance = newPR.distance;
          if (newPR.duration) distanceRecord.duration = newPR.duration;
          
          // Vérifier si c'est un nouveau record
          const existingDistanceRecords = personalRecords.filter(
            r => r.exerciseId === selectedExercise.id && 'distance' in r
          ) as DistanceRecord[];
          
          if (existingDistanceRecords.length === 0 || 
              existingDistanceRecords.every(r => r.distance < distanceRecord.distance)) {
            isRecord = true;
          }
          
          setPersonalRecords(prev => [...prev, distanceRecord]);
        }
        break;
    }
    
    // Si c'est un nouveau record, ajouter de l'XP et débloquer un badge si nécessaire
    if (isRecord) {
      addXP(100); // Bonus XP pour un nouveau record
      
      // Vérifier si c'est le premier RP de l'utilisateur
      if (personalRecords.length === 0) {
        const firstPRBadge = badges.find(b => b.id === "first-pr");
        if (firstPRBadge && !firstPRBadge.dateUnlocked) {
          setBadges(prev => prev.map(b => 
            b.id === "first-pr" ? { ...b, dateUnlocked: new Date() } : b
          ));
        }
      }
      
      // Vérifier si l'utilisateur a 5 records différents
      const uniqueExercisesWithRecords = new Set(
        personalRecords.map(r => r.exerciseId)
      );
      
      if (uniqueExercisesWithRecords.size >= 5) {
        const machinePRBadge = badges.find(b => b.id === "machine-pr");
        if (machinePRBadge && !machinePRBadge.dateUnlocked) {
          setBadges(prev => prev.map(b => 
            b.id === "machine-pr" ? { ...b, dateUnlocked: new Date() } : b
          ));
        }
      }
    }
    
    closePRModal();
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

          {/* Niveau et progression */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-2" 
                  style={{ background: `linear-gradient(135deg, ${getCurrentLevelInfo().color}, ${getCurrentLevelInfo().color}90)` }}
                >
                  <span className="text-xl">{getCurrentLevelInfo().icon}</span>
                </div>
                <div>
                  <p className="font-bold">{getCurrentLevelInfo().name}</p>
                  <p className="text-xs text-gray-400">Niveau {userLevel}</p>
                </div>
              </div>
              <button 
                className="bg-gray-800 rounded-full p-1"
                onClick={() => setCurrentScreen('level-details')}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            {getNextLevelInfo() && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-400">Progression vers {getNextLevelInfo()?.name}</span>
                  <span className="text-sm text-gray-400">
                    {userXP}/{getNextLevelInfo()?.xpRequired} XP
                  </span>
                </div>
                <div className="bg-gray-800 h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${((userXP - getCurrentLevelInfo().xpRequired) / (getNextLevelInfo()!.xpRequired - getCurrentLevelInfo().xpRequired)) * 100}%`,
                      background: `linear-gradient(to right, ${getCurrentLevelInfo().color}, ${getNextLevelInfo()?.color})` 
                    }}
                  ></div>
                </div>
              </div>
            )}
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

      {/* Écran Bibliothèque d'exercices */}
      {currentScreen === 'exercises' && (
        <div className="p-4 pb-20">
          <h1 className="text-2xl font-bold mb-4">Bibliothèque d'exercices</h1>
          
          {/* Barre de recherche et filtres */}
          <div className="mb-6">
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Rechercher un exercice..."
                className="w-full bg-gray-800 rounded-full px-4 py-2 pl-10 text-white"
                value={exerciseFilter.searchTerm}
                onChange={(e) => setExerciseFilter({...exerciseFilter, searchTerm: e.target.value})}
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            
            {/* Filtres par groupe musculaire */}
            <div className="mb-3">
              <p className="text-sm text-gray-400 mb-2">Groupe musculaire</p>
              <div className="flex flex-wrap gap-2">
                {Object.values(MuscleGroup).map((group) => (
                  <button
                    key={group}
                    onClick={() => setExerciseFilter({
                      ...exerciseFilter, 
                      muscleGroup: exerciseFilter.muscleGroup === group ? null : group as MuscleGroup
                    })}
                    className={`px-3 py-1 rounded-full text-xs ${exerciseFilter.muscleGroup === group ? 'bg-purple-600' : 'bg-gray-700'}`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Filtres par équipement */}
            <div>
              <p className="text-sm text-gray-400 mb-2">Équipement</p>
              <div className="flex flex-wrap gap-2">
                {Object.values(Equipment).map((equip) => (
                  <button
                    key={equip}
                    onClick={() => setExerciseFilter({
                      ...exerciseFilter, 
                      equipment: exerciseFilter.equipment === equip ? null : equip as Equipment
                    })}
                    className={`px-3 py-1 rounded-full text-xs ${exerciseFilter.equipment === equip ? 'bg-purple-600' : 'bg-gray-700'}`}
                  >
                    {equip}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Liste des exercices filtrés */}
          <div className="space-y-3">
            {exerciseLibrary
              .filter(exercise => {
                // Filtre par terme de recherche
                if (exerciseFilter.searchTerm && !exercise.name.toLowerCase().includes(exerciseFilter.searchTerm.toLowerCase())) {
                  return false;
                }
                
                // Filtre par groupe musculaire
                if (exerciseFilter.muscleGroup && 
                    exercise.primaryMuscleGroup !== exerciseFilter.muscleGroup && 
                    !exercise.secondaryMuscleGroups?.includes(exerciseFilter.muscleGroup)) {
                  return false;
                }
                
                // Filtre par équipement
                if (exerciseFilter.equipment && !exercise.equipment.includes(exerciseFilter.equipment)) {
                  return false;
                }
                
                return true;
              })
              .map(exercise => {
                // Trouver le record personnel pour cet exercice
                const record = personalRecords.find(r => r.exerciseId === exercise.id);
                
                return (
                  <div key={exercise.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">{exercise.name}</h3>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <span className="bg-gray-700 rounded-full px-2 py-0.5 mr-2">{exercise.primaryMuscleGroup}</span>
                          <span className="bg-gray-700 rounded-full px-2 py-0.5">{exercise.type}</span>
                        </div>
                      </div>
                      {record && (
                        <div className="bg-yellow-500/20 rounded-lg px-2 py-1 text-xs text-yellow-400">
                          {/* Affichage du RP en fonction du type */}
                          {'weight' in record && (
                            <span>RP: {record.weight}kg × {record.reps}</span>
                          )}
                          {'duration' in record && record.duration !== undefined && (
                            <span>RP: {Math.floor(record.duration / 60)}:{(record.duration % 60).toString().padStart(2, '0')}</span>
                          )}
                          {'reps' in record && !('weight' in record) && (
                            <span>RP: {record.reps} reps</span>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">{exercise.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-xs">
                        {exercise.equipment.slice(0, 2).map((equip, i) => (
                          <span key={i} className="mr-2 text-gray-400">{equip}</span>
                        ))}
                        {exercise.equipment.length > 2 && <span className="text-gray-400">+{exercise.equipment.length - 2}</span>}
                      </div>
                      <button 
                        className="bg-gray-700 rounded-full p-1 hover:bg-gray-600 transition-colors"
                        onClick={() => openPRModal(exercise)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
          
          {/* Bouton ajouter un exercice personnalisé */}
          <div className="fixed bottom-20 right-4">
            <button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg transform transition-transform hover:scale-105"
              title="Ajouter un exercice personnalisé"
            >
              <Plus className="w-7 h-7" />
            </button>
          </div>
          
          {/* Message si aucun exercice ne correspond aux filtres */}
          {exerciseLibrary.filter(exercise => {
            if (exerciseFilter.searchTerm && !exercise.name.toLowerCase().includes(exerciseFilter.searchTerm.toLowerCase())) {
              return false;
            }
            if (exerciseFilter.muscleGroup && 
                exercise.primaryMuscleGroup !== exerciseFilter.muscleGroup && 
                !exercise.secondaryMuscleGroups?.includes(exerciseFilter.muscleGroup)) {
              return false;
            }
            if (exerciseFilter.equipment && !exercise.equipment.includes(exerciseFilter.equipment)) {
              return false;
            }
            return true;
          }).length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Aucun exercice ne correspond à vos critères</p>
              </div>
              <button 
                onClick={() => setExerciseFilter({muscleGroup: null, equipment: null, searchTerm: ""})}
                className="text-purple-400 text-sm mt-2"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      )}

      {/* Écran de détails du niveau */}
      {currentScreen === 'level-details' && (
        <div className="p-4 pb-20">
          <h1 className="text-2xl font-bold mb-6">Progression de Niveau</h1>
          
          {/* Niveau actuel */}
          <div 
            className="bg-gray-800 rounded-xl p-4 mb-6 border-2" 
            style={{ borderColor: getCurrentLevelInfo().color }}
          >
            <div className="flex items-center mb-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mr-3" 
                style={{ background: `linear-gradient(135deg, ${getCurrentLevelInfo().color}, ${getCurrentLevelInfo().color}90)` }}
              >
                <span className="text-2xl">{getCurrentLevelInfo().icon}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">{getCurrentLevelInfo().name}</h2>
                <p className="text-sm text-gray-400">Niveau {userLevel}</p>
              </div>
            </div>
            <p className="text-gray-300 mb-3">{getCurrentLevelInfo().description}</p>
            <div className="flex justify-between text-sm text-gray-400">
              <span>XP requis: {getCurrentLevelInfo().xpRequired}</span>
              <span>Votre XP: {userXP}</span>
            </div>
          </div>
          
          {/* Progression vers le niveau suivant */}
          {getNextLevelInfo() && (
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">Prochain niveau</h2>
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center mb-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-3 opacity-70" 
                    style={{ background: `linear-gradient(135deg, ${getNextLevelInfo()?.color}, ${getNextLevelInfo()?.color}90)` }}
                  >
                    <span className="text-xl">{getNextLevelInfo()?.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold">{getNextLevelInfo()?.name}</h3>
                    <p className="text-xs text-gray-400">Niveau {getNextLevelInfo()?.level}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-3">{getNextLevelInfo()?.description}</p>
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Progression</span>
                    <span className="text-xs text-gray-400">
                      {userXP - getCurrentLevelInfo().xpRequired}/{getNextLevelInfo()!.xpRequired - getCurrentLevelInfo().xpRequired} XP
                    </span>
                  </div>
                  <div className="bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${((userXP - getCurrentLevelInfo().xpRequired) / (getNextLevelInfo()!.xpRequired - getCurrentLevelInfo().xpRequired)) * 100}%`,
                        background: `linear-gradient(to right, ${getCurrentLevelInfo().color}, ${getNextLevelInfo()?.color})` 
                      }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  Il vous manque {getNextLevelInfo()!.xpRequired - userXP} XP pour atteindre ce niveau
                </p>
              </div>
            </div>
          )}
          
          {/* Tous les niveaux */}
          <div>
            <h2 className="text-lg font-bold mb-3">Tous les niveaux</h2>
            <div className="space-y-2">
              {levelInfos.map((info) => (
                <div 
                  key={info.level} 
                  className={`bg-gray-800 rounded-lg p-3 flex items-center ${info.level === userLevel ? 'border border-' + info.color : ''}`}
                >
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${info.level <= userLevel ? 'opacity-100' : 'opacity-50'}`}
                    style={{ background: `linear-gradient(135deg, ${info.color}, ${info.color}90)` }}
                  >
                    <span className="text-sm">{info.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${info.level <= userLevel ? 'text-white' : 'text-gray-500'}`}>
                      {info.name}
                    </p>
                    <p className="text-xs text-gray-400">Niveau {info.level}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {info.xpRequired} XP
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Bouton pour tester l'ajout d'XP */}
          <div className="fixed bottom-20 right-4">
            <button 
              onClick={() => addXP(500)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full px-4 py-2 font-bold text-sm shadow-lg"
            >
              +500 XP (Test)
            </button>
          </div>
        </div>
      )}
      
      {/* Navigation bottom */}
      {/* Modal d'ajout de record personnel */}
      {showPRModal && selectedExercise && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-md p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Ajouter un record pour {selectedExercise.name}</h2>
              <button 
                onClick={closePRModal}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                  style={{ backgroundColor: selectedExercise.primaryMuscleGroup === MuscleGroup.Cardio ? '#0ea5e9' : '#8b5cf6' }}
                >
                  {selectedExercise.primaryMuscleGroup === MuscleGroup.Cardio ? 
                    <span>🏃</span> : 
                    <span>💪</span>
                  }
                </div>
                <div>
                  <p className="text-sm text-gray-400">{selectedExercise.primaryMuscleGroup}</p>
                  <p className="text-xs text-gray-500">{selectedExercise.trackingType}</p>
                </div>
              </div>
              
              {/* Champs spécifiques selon le type d'exercice */}
              <div className="space-y-4 mt-4">
                {selectedExercise.trackingType === TrackingType.WeightReps && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Poids (kg)</label>
                      <input 
                        type="number"
                        className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white"
                        placeholder="Ex: 80"
                        value={newPR.weight || ''}
                        onChange={(e) => setNewPR({...newPR, weight: parseFloat(e.target.value) || undefined})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Répétitions</label>
                      <input 
                        type="number"
                        className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white"
                        placeholder="Ex: 8"
                        value={newPR.reps || ''}
                        onChange={(e) => setNewPR({...newPR, reps: parseInt(e.target.value) || undefined})}
                      />
                    </div>
                  </>
                )}
                
                {selectedExercise.trackingType === TrackingType.RepsOnly && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Répétitions</label>
                    <input 
                      type="number"
                      className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white"
                      placeholder="Ex: 15"
                      value={newPR.reps || ''}
                      onChange={(e) => setNewPR({...newPR, reps: parseInt(e.target.value) || undefined})}
                    />
                  </div>
                )}
                
                {selectedExercise.trackingType === TrackingType.Time && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Durée (secondes)</label>
                    <input 
                      type="number"
                      className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white"
                      placeholder="Ex: 60"
                      value={newPR.duration || ''}
                      onChange={(e) => setNewPR({...newPR, duration: parseInt(e.target.value) || undefined})}
                    />
                  </div>
                )}
                
                {selectedExercise.trackingType === TrackingType.Distance && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Distance (mètres)</label>
                      <input 
                        type="number"
                        className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white"
                        placeholder="Ex: 5000"
                        value={newPR.distance || ''}
                        onChange={(e) => setNewPR({...newPR, distance: parseFloat(e.target.value) || undefined})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Durée (secondes)</label>
                      <input 
                        type="number"
                        className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white"
                        placeholder="Ex: 1500"
                        value={newPR.duration || ''}
                        onChange={(e) => setNewPR({...newPR, duration: parseInt(e.target.value) || undefined})}
                      />
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3 text-sm">
                      {newPR.distance && newPR.duration ? (
                        <div>
                          <p className="text-gray-400">Vitesse moyenne:</p>
                          <p className="font-bold">
                            {((newPR.distance / 1000) / (newPR.duration / 3600)).toFixed(2)} km/h
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500">Entrez la distance et la durée pour calculer la vitesse</p>
                      )}
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Notes (optionnel)</label>
                  <textarea 
                    className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white"
                    placeholder="Ex: Bonne forme, sensation de facilité..."
                    rows={2}
                    value={newPR.notes || ''}
                    onChange={(e) => setNewPR({...newPR, notes: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            {/* Historique des records */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-400 mb-2">Records précédents</h3>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {personalRecords
                  .filter(record => record.exerciseId === selectedExercise.id)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((record, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-2 text-sm">
                      <div className="flex justify-between">
                        <div>
                          {'weight' in record && (
                            <span>{record.weight} kg × {record.reps} reps</span>
                          )}
                          {'duration' in record && !('distance' in record) && (
                            <span>
                              {Math.floor(record.duration / 60)}:{(record.duration % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                          {'reps' in record && !('weight' in record) && (
                            <span>{record.reps} répétitions</span>
                          )}
                          {'distance' in record && (
                            <span>
                              {(record.distance / 1000).toFixed(1)} km
                              {record.duration && (
                                <> ({((record.distance / 1000) / (record.duration / 3600)).toFixed(2)} km/h)</>  
                              )}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                      </div>
                      {record.notes && <p className="text-xs text-gray-400 mt-1">{record.notes}</p>}
                    </div>
                  ))}
                  
                {personalRecords.filter(record => record.exerciseId === selectedExercise.id).length === 0 && (
                  <p className="text-sm text-gray-500 italic">Aucun record enregistré pour cet exercice</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={closePRModal}
                className="flex-1 bg-gray-700 rounded-lg py-2.5 font-medium"
              >
                Annuler
              </button>
              <button 
                onClick={addPersonalRecord}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg py-2.5 font-medium"
                disabled={(
                  (selectedExercise.trackingType === TrackingType.WeightReps && (!newPR.weight || !newPR.reps)) ||
                  (selectedExercise.trackingType === TrackingType.RepsOnly && !newPR.reps) ||
                  (selectedExercise.trackingType === TrackingType.Time && !newPR.duration) ||
                  (selectedExercise.trackingType === TrackingType.Distance && !newPR.distance)
                )}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {(currentScreen === 'dashboard' || currentScreen === 'badges' || currentScreen === 'exercises' || currentScreen === 'level-details') && (
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
            <button 
              onClick={() => setCurrentScreen('exercises')}
              className={`flex flex-col items-center py-2 ${currentScreen === 'exercises' ? 'text-purple-400' : 'text-gray-400'}`}
            >
              <Dumbbell className="w-6 h-6 mb-1" />
              <span className="text-xs">Exercices</span>
            </button>
            <button className="flex flex-col items-center py-2 text-gray-400">
              <TrendingUp className="w-6 h-6 mb-1" />
              <span className="text-xs">Stats</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FitnessApp;
