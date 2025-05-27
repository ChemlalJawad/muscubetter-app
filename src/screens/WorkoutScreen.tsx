import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { getExerciseById } from '../lib/database';
import { Exercise } from '../lib/database';
import { Dumbbell, ChevronRight } from 'lucide-react';

// Composants temporaires pour remplacer ceux qui sont manquants
const WorkoutPreview: React.FC<{ workout: any; onStart: () => void }> = ({ workout, onStart }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Aperçu de l'entraînement</h2>
      <p className="mb-4">Type: {workout.type}</p>
      <p className="mb-4">Jour: {workout.day}</p>
      <p className="mb-6">{workout.exercises?.length || 0} exercices prévus</p>
      <button 
        onClick={onStart}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
      >
        Commencer l'entraînement
      </button>
    </div>
  );
};

const RestTimer: React.FC = () => {
  const { restTime, skipRest } = useAppContext();
  
  return (
    <div className="bg-gray-800/50 rounded-lg p-6 text-center">
      <h2 className="text-xl font-semibold mb-4">Temps de repos</h2>
      <div className="text-4xl font-bold mb-6">{restTime}s</div>
      <button 
        onClick={skipRest}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
      >
        Passer
      </button>
    </div>
  );
};

const WorkoutInProgress: React.FC = () => {
  const { currentWorkout, currentExerciseIndex, currentSet, completeSet } = useAppContext();
  const [exerciseDetails, setExerciseDetails] = useState<Exercise | null>(null);
  const [nextExerciseDetails, setNextExerciseDetails] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Utiliser useEffect pour charger les détails des exercices
  useEffect(() => {
    let isMounted = true;
    
    const loadExerciseDetails = async () => {
      // Vérifier si les données nécessaires sont disponibles
      if (!currentWorkout || !currentWorkout.exercises || currentWorkout.exercises.length === 0 ||
          currentExerciseIndex >= currentWorkout.exercises.length) {
        return;
      }
      
      const exercise = currentWorkout.exercises[currentExerciseIndex];
      if (!exercise || !exercise.exercise_id) {
        return;
      }
      
      setLoading(true);
      try {
        // Charger les détails de l'exercice actuel
        const details = await getExerciseById(exercise.exercise_id);
        if (details && isMounted) {
          setExerciseDetails(details);
        }
        
        // Charger les détails de l'exercice suivant s'il existe
        if (currentExerciseIndex < currentWorkout.exercises.length - 1) {
          const nextExercise = currentWorkout.exercises[currentExerciseIndex + 1];
          if (nextExercise && nextExercise.exercise_id) {
            const nextDetails = await getExerciseById(nextExercise.exercise_id);
            if (nextDetails && isMounted) {
              setNextExerciseDetails(nextDetails);
            }
          }
        } else {
          // Pas d'exercice suivant
          setNextExerciseDetails(null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des détails de l\'exercice:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadExerciseDetails();
    
    // Nettoyage pour éviter les mises à jour sur un composant démonté
    return () => {
      isMounted = false;
    };
  }, [currentWorkout, currentExerciseIndex]);
  
  // Vérifier si l'entraînement est disponible
  if (!currentWorkout || !currentWorkout.exercises || currentWorkout.exercises.length === 0) {
    return <div className="bg-gray-800/50 rounded-lg p-6 text-center">Aucun exercice disponible</div>;
  }
  
  // Récupérer les informations de l'exercice actuel
  const currentExercise = currentWorkout.exercises[currentExerciseIndex];
  const totalSets = currentExercise.sets || 1;
  const reps = currentExercise.reps || 10;
  const weight = currentExercise.weight || 0;
  
  // Calculer la progression de l'entraînement
  const totalExercises = currentWorkout.exercises.length;
  const progressPercent = ((currentExerciseIndex) / totalExercises) * 100;
  
  return (
    <div className="bg-gradient-to-b from-gray-800/70 to-gray-900/70 rounded-xl p-6 border border-gray-700/50 shadow-lg">
      {/* En-tête avec progression */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Exercice {currentExerciseIndex + 1}/{totalExercises}
          </h2>
          <div className="bg-blue-500/20 rounded-full px-3 py-1 text-sm font-medium text-blue-400">
            Série {currentSet}/{totalSets}
          </div>
        </div>
        
        {/* Barre de progression */}
        <div className="w-full bg-gray-700/50 rounded-full h-2 mb-1 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse text-blue-400">Chargement...</div>
        </div>
      ) : (
        <>
          {/* Détails de l'exercice actuel */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-4 mb-6 border border-blue-700/30">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center mr-4">
                <Dumbbell className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{exerciseDetails?.name || `Exercice ${currentExerciseIndex + 1}`}</h3>
                <p className="text-sm text-gray-400">{exerciseDetails?.category || 'Catégorie non spécifiée'}</p>
              </div>
            </div>
            
            {exerciseDetails?.description && (
              <p className="text-sm mb-3 text-gray-300">{exerciseDetails.description}</p>
            )}
            
            <div className="grid grid-cols-3 gap-2 bg-gray-800/50 rounded-lg p-3 mb-3">
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">Répétitions</p>
                <p className="font-bold text-white">{reps}</p>
              </div>
              <div className="text-center border-x border-gray-700/50">
                <p className="text-xs text-gray-400 mb-1">Poids</p>
                <p className="font-bold text-white">{weight > 0 ? `${weight} kg` : 'Poids du corps'}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">Repos</p>
                <p className="font-bold text-white">{currentExercise.rest_time || 60}s</p>
              </div>
            </div>
            
            {exerciseDetails?.instructions && (
              <div className="bg-gray-800/50 rounded-lg p-3 mb-2">
                <p className="text-xs font-medium text-blue-400 mb-1">Instructions:</p>
                <p className="text-xs text-gray-300">{exerciseDetails.instructions}</p>
              </div>
            )}
            
            {exerciseDetails?.tips && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs font-medium text-green-400 mb-1">Conseils:</p>
                <p className="text-xs text-gray-300">{exerciseDetails.tips}</p>
              </div>
            )}
          </div>
          
          {/* Aperçu de l'exercice suivant */}
          {nextExerciseDetails && currentExerciseIndex < currentWorkout.exercises.length - 1 && (
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700/50">
              <p className="text-sm font-medium text-gray-400 mb-2">Exercice suivant:</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                  <ChevronRight className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium">{nextExerciseDetails.name}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span>{currentWorkout.exercises[currentExerciseIndex + 1]?.sets || 0} séries</span>
                    <span className="mx-1">•</span>
                    <span>{currentWorkout.exercises[currentExerciseIndex + 1]?.reps || 0} reps</span>
                    {currentWorkout.exercises[currentExerciseIndex + 1]?.weight !== undefined && (
                      <>
                        <span className="mx-1">•</span>
                        <span>
                          {(currentWorkout.exercises[currentExerciseIndex + 1]?.weight ?? 0) > 0 
                            ? `${currentWorkout.exercises[currentExerciseIndex + 1]?.weight} kg` 
                            : 'Poids du corps'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Bouton pour compléter la série */}
      <button 
        onClick={completeSet}
        className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-bold text-white shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98]"
      >
        Série terminée
      </button>
    </div>
  );
};

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
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Aucun entraînement sélectionné.</p>
        <button 
          onClick={() => setCurrentScreen('dashboard')}
          className="mt-4 px-4 py-2 bg-blue-600 rounded-lg"
        >
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{currentWorkout.type}</h1>
        <button 
          onClick={() => setCurrentScreen('dashboard')}
          className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400"
        >
          Annuler
        </button>
      </div>
      
      {!workoutStarted ? (
        <WorkoutPreview 
          workout={currentWorkout} 
          onStart={() => setWorkoutStarted(true)} 
        />
      ) : isResting ? (
        <RestTimer />
      ) : (
        <WorkoutInProgress />
      )}
    </div>
  );
};

export default WorkoutScreen;
