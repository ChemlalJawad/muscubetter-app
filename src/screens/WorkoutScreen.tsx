import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { getExerciseById } from '../lib/database';
import { Exercise } from '../lib/database';
import { Dumbbell, ChevronRight, Play, Pause, SkipForward, Trophy, Target, Clock, Zap, ArrowRight, CheckCircle, Home, Menu, ChevronLeft, Star, Flame, Sparkles } from 'lucide-react';

// Composant de barre de progression circulaire avec animations
const CircularProgress: React.FC<{ progress: number; size?: number; strokeWidth?: number; showPercentage?: boolean }> = ({ 
  progress, 
  size = 120, 
  strokeWidth = 8, 
  showPercentage = false 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="transform -rotate-90 drop-shadow-lg"
        width={size}
        height={size}
      >
        {/* Cercle de fond avec glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="drop-shadow-sm"
        />
        {/* Cercle de progression avec gradient animé */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out drop-shadow-lg"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))'
          }}
        />
        {/* Définition du gradient */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white drop-shadow-lg">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Composant LoadingButton avec animations gaming
const LoadingButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ComponentType<any>;
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, icon: Icon, variant = 'primary', className = '', disabled = false }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    // Effet de ripple
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };
    
    setRipples(prev => [...prev, newRipple]);
    setIsPressed(true);
    
    // Nettoyer le ripple après l'animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      setIsPressed(false);
    }, 600);
    
    onClick?.();
  };

  const baseClasses = `
    relative overflow-hidden font-bold rounded-2xl transition-all duration-200 
    transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
    shadow-lg hover:shadow-xl active:shadow-md
    ${isPressed ? 'scale-95' : 'hover:scale-105'}
  `;
  
  const variantClasses = variant === 'primary' 
    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white'
    : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white border border-gray-600';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {/* Effet de ripple */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
      
      {/* Contenu du bouton */}
      <div className="relative z-10 flex items-center justify-center gap-2 px-6 py-4">
        {Icon && <Icon className="w-5 h-5" />}
        <span>{children}</span>
      </div>
      
      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000" />
    </button>
  );
};

// Composant ExerciseCard avec effets gaming
const ExerciseCard: React.FC<{
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'current' | 'next';
  className?: string;
}> = ({ title, subtitle, children, variant = 'default', className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const variantClasses = {
    default: 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50',
    current: 'bg-gradient-to-br from-blue-900/80 to-purple-900/80 border-blue-500/50 shadow-blue-500/20',
    next: 'bg-gradient-to-br from-green-900/80 to-teal-900/80 border-green-500/50 shadow-green-500/20'
  };

  return (
    <div 
      className={`
        ${variantClasses[variant]} 
        backdrop-blur-md border rounded-2xl p-6 shadow-2xl
        transition-all duration-300 transform hover:scale-[1.02] hover:shadow-3xl
        ${isHovered ? 'shadow-2xl' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header avec effets */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            {variant === 'current' && <Flame className="w-5 h-5 text-orange-400 animate-pulse" />}
            {variant === 'next' && <Star className="w-5 h-5 text-green-400" />}
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {subtitle}
            </p>
          )}
        </div>
        {variant === 'current' && (
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
        )}
      </div>
      
      {children}
    </div>
  );
};

// Composant WorkoutPreview amélioré
const WorkoutPreview: React.FC<{ workout: any; onStart: () => void }> = ({ workout, onStart }) => {
  const totalExercises = workout.exercises?.length || 0;
  const estimatedTime = totalExercises * 3; // Estimation 3 min par exercice

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-md mx-auto">
        {/* En-tête avec statistiques */}
        <ExerciseCard title={workout.type} subtitle={`Jour ${workout.day}`} variant="current" className="mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-2 mx-auto">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{estimatedTime}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Minutes</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mb-2 mx-auto">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{totalExercises}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Exercices</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-2 mx-auto">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">Modéré</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Intensité</div>
            </div>
          </div>
        </ExerciseCard>

        {/* Liste des exercices */}
        <ExerciseCard title="Aperçu des exercices" className="mb-6">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {workout.exercises.map((exercise: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 rounded-full">
                    <span className="text-sm font-bold text-blue-400">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">Exercice {index + 1}</div>
                    <div className="text-sm text-gray-400">{exercise.sets} séries × {exercise.reps} reps</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </ExerciseCard>

        {/* Bouton de démarrage */}
        <LoadingButton
          onClick={onStart}
          icon={Play}
          className="w-full text-lg py-4"
        >
          Commencer l'entraînement
        </LoadingButton>
      </div>
    </div>
  );
};

// Composant RestTimer amélioré
const RestTimer: React.FC = () => {
  const { restTime, skipRest } = useAppContext();
  const totalTime = 60; // Temps de repos total en secondes
  const progress = ((totalTime - restTime) / totalTime) * 100; // Progression correcte

  const restTips = [
    "Respirez profondément et détendez-vous",
    "Hydratez-vous pendant ce temps de repos",
    "Visualisez votre prochaine série",
    "Étirez légèrement les muscles travaillés"
  ];

  // Utiliser useState pour stabiliser le conseil affiché
  const [currentTip] = useState(() => restTips[Math.floor(Math.random() * restTips.length)]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        {/* Timer circulaire */}
        <div className="mb-8 relative">
          <CircularProgress progress={progress} size={200} strokeWidth={12} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">{restTime}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Secondes</div>
            </div>
          </div>
        </div>

        {/* Conseil de récupération */}
        <ExerciseCard title="Temps de récupération" className="mb-8">
          <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-400/20">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Pause className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-sm text-blue-100">{currentTip}</p>
          </div>
        </ExerciseCard>

        {/* Bouton passer */}
        <LoadingButton
          onClick={skipRest}
          icon={SkipForward}
          variant="secondary"
          className="w-full"
        >
          Passer le repos
        </LoadingButton>
      </div>
    </div>
  );
};

// Composant WorkoutInProgress amélioré
const WorkoutInProgress: React.FC = () => {
  const { 
    currentWorkout, 
    currentExerciseIndex, 
    currentSet, 
    setCurrentScreen, 
    completeSet,
    navigateToExercise 
  } = useAppContext();

  const [isLoading, setIsLoading] = useState(true);
  const [exerciseDetails, setExerciseDetails] = useState<any>(null);
  const [nextExerciseDetails, setNextExerciseDetails] = useState<any>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const loadExerciseDetails = async () => {
      if (!currentWorkout) return;
      setIsLoading(true);
      try {
        const currentExercise = currentWorkout.exercises[currentExerciseIndex];
        const nextExercise = currentWorkout.exercises[currentExerciseIndex + 1];
        
        if (currentExercise) {
          const details = await getExerciseById(currentExercise.exercise_id);
          setExerciseDetails(details);
        }
        
        if (nextExercise) {
          const nextDetails = await getExerciseById(nextExercise.exercise_id);
          setNextExerciseDetails(nextDetails);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadExerciseDetails();
  }, [currentWorkout, currentExerciseIndex]);

  if (!currentWorkout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-white text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Dumbbell className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Aucun entraînement en cours</h2>
          <LoadingButton onClick={() => setCurrentScreen('dashboard')} icon={Home}>
            Retour au tableau de bord
          </LoadingButton>
        </div>
      </div>
    );
  }

  const currentExercise = currentWorkout.exercises[currentExerciseIndex];
  const totalExercises = currentWorkout.exercises.length;
  const overallProgress = ((currentExerciseIndex + (currentSet / (currentExercise?.sets || 1))) / totalExercises) * 100;
  const nextExercise = currentWorkout.exercises[currentExerciseIndex + 1];

  const handleCompleteSet = async () => {
    setIsLoading(true);
    setShowCelebration(true);
    
    // Animation de célébration
    setTimeout(() => setShowCelebration(false), 1500);
    
    // Simuler un temps de traitement réaliste
    await new Promise(resolve => setTimeout(resolve, 800));
    
    completeSet();
    setIsLoading(false);
  };

  const handleNavigateToExercise = (index: number) => {
    navigateToExercise(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Particules d'arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Animation de célébration */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-6xl animate-bounce">🔥</div>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 animate-pulse" />
        </div>
      )}

      {/* Barre de navigation mobile */}
      <div className="sticky top-0 z-40 bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Bouton retour */}
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 active:scale-95"
          >
            <Home className="w-4 h-4 text-white" />
            <span className="text-sm text-white font-medium">Menu</span>
          </button>

          {/* Titre avec niveau */}
          <div className="text-center">
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              {currentWorkout.type}
            </h1>
            <p className="text-xs text-gray-300">
              Exercice {currentExerciseIndex + 1}/{totalExercises}
            </p>
          </div>

          {/* Navigation tactile */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleNavigateToExercise(currentExerciseIndex - 1)}
              disabled={currentExerciseIndex === 0}
              className="p-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:opacity-50 rounded-full transition-all duration-200 active:scale-90"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => handleNavigateToExercise(currentExerciseIndex + 1)}
              disabled={currentExerciseIndex >= totalExercises - 1}
              className="p-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:opacity-50 rounded-full transition-all duration-200 active:scale-90"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal mobile */}
      <div className="px-4 py-6 pb-24 space-y-6">
        {/* Progression globale avec animation */}
        <div className="text-center">
          <CircularProgress 
            progress={overallProgress} 
            size={140} 
            strokeWidth={12} 
            showPercentage={true}
          />
          <p className="text-white/80 mt-3 text-sm font-medium">
            Progression globale
          </p>
        </div>

        {/* Navigation rapide mobile */}
        <ExerciseCard title="🎯 Navigation rapide" className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
            {currentWorkout.exercises.map((exercise: any, index: number) => (
              <button
                key={index}
                onClick={() => handleNavigateToExercise(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
                  index === currentExerciseIndex 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <div className="text-lg font-bold text-white">{index + 1}</div>
                <div className="text-xs text-white/70">{exercise.sets}×{exercise.reps}</div>
              </button>
            ))}
          </div>
        </ExerciseCard>

        {/* Exercice actuel avec design gaming */}
        <ExerciseCard 
          title={exerciseDetails?.name || `💪 Exercice ${currentExerciseIndex + 1}`}
          subtitle={exerciseDetails?.muscles_primary?.join(', ') || 'Groupe musculaire'}
          variant="current"
        >
          {/* Progression de série avec animation */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-white flex items-center gap-2">
                <Target className="w-4 h-4" />
                Série actuelle
              </span>
              <span className="text-sm text-gray-300 bg-white/10 px-3 py-1 rounded-full">
                {currentSet + 1}/{currentExercise?.sets || 0}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${(currentSet / (currentExercise?.sets || 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* Stats de l'exercice avec design gaming */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{currentExercise?.reps || 0}</div>
              <div className="text-xs text-red-300 uppercase tracking-wide font-medium">Répétitions</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {(currentExercise?.weight ?? 0) > 0 ? `${currentExercise.weight}kg` : 'Corps'}
              </div>
              <div className="text-xs text-blue-300 uppercase tracking-wide font-medium">Poids</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{currentExercise?.rest_time || 60}s</div>
              <div className="text-xs text-green-300 uppercase tracking-wide font-medium">Repos</div>
            </div>
          </div>

          {/* Instructions avec design amélioré */}
          {exerciseDetails?.instructions && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-400/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-100 mb-2">Instructions</h4>
                  <p className="text-sm text-blue-100/80 leading-relaxed">{exerciseDetails.instructions}</p>
                </div>
              </div>
            </div>
          )}
        </ExerciseCard>

        {/* Exercice suivant avec preview */}
        {nextExercise && nextExerciseDetails && (
          <ExerciseCard
            title="⏭️ Exercice suivant"
            subtitle={nextExerciseDetails.name}
            variant="next"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-green-100 flex items-center gap-2">
                <Target className="w-4 h-4" />
                {nextExercise.sets} séries × {nextExercise.reps} répétitions
              </div>
              <ArrowRight className="w-5 h-5 text-green-400" />
            </div>
          </ExerciseCard>
        )}
      </div>

      {/* Bouton flottant série terminée */}
      <div className="fixed bottom-6 left-4 right-4 z-30">
        <LoadingButton
          onClick={handleCompleteSet}
          icon={isLoading ? undefined : CheckCircle}
          className="w-full text-lg py-6 shadow-2xl"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Enregistrement...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              Série terminée 🔥
            </div>
          )}
        </LoadingButton>
      </div>
    </div>
  );
};

// Composant principal WorkoutScreen
const WorkoutScreen: React.FC = () => {
  const { 
    currentWorkout,
    workoutStarted,
    isResting,
    setCurrentScreen,
    setWorkoutStarted
  } = useAppContext();

  if (!currentWorkout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Aucun entraînement sélectionné</h2>
          <p className="text-gray-400">Retournez au programme pour choisir un entraînement.</p>
        </div>
      </div>
    );
  }

  if (isResting) {
    return <RestTimer />;
  }

  if (workoutStarted) {
    return <WorkoutInProgress />;
  }

  return <WorkoutPreview workout={currentWorkout} onStart={() => setWorkoutStarted(true)} />;
};

export default WorkoutScreen;
