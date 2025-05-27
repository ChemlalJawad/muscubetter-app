import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Exercise, getExerciseById } from '../lib/database';

const WorkoutInProgress: React.FC = () => {
  const { 
    currentWorkout, 
    currentExerciseIndex, 
    currentSet, 
    completeSet 
  } = useAppContext();
  
  // State to store the current exercise details
  const [currentExerciseDetails, setCurrentExerciseDetails] = useState<Exercise | null>(null);

  if (!currentWorkout || !currentWorkout.exercises) {
    return <div>Chargement de l'entraînement...</div>;
  }

  const currentExercise = currentWorkout.exercises[currentExerciseIndex];
  
  // Fetch the exercise details when the current exercise changes
  useEffect(() => {
    const fetchExerciseDetails = async () => {
      if (currentExercise && currentExercise.exercise_id) {
        try {
          const exerciseData = await getExerciseById(currentExercise.exercise_id);
          if (exerciseData) {
            setCurrentExerciseDetails(exerciseData);
          }
        } catch (error) {
          console.error('Error fetching exercise details:', error);
        }
      }
    };
    
    fetchExerciseDetails();
  }, [currentExercise]);
  
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Exercice {currentExerciseIndex + 1}/{currentWorkout.exercises.length}
        </h2>
        <p className="text-gray-400">Série {currentSet}/{currentExercise.sets}</p>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">{currentExerciseDetails?.name || 'Chargement...'}</h3>
        <p className="text-gray-400 mb-2">
          {currentExercise.reps} répétitions
          {currentExercise.weight ? 
            ` à ${currentExercise.weight} kg` : 
            ''}
        </p>
        <p className="text-sm text-gray-500">
          {currentExercise.notes || currentExerciseDetails?.tips || 'Concentre-toi sur la forme et la technique.'}
        </p>
      </div>
      
      <button 
        onClick={completeSet}
        className="w-full py-3 rounded-lg bg-green-600 text-white font-medium"
      >
        Série terminée
      </button>
      
      {/* Progression de l'entraînement */}
      <div className="mt-6">
        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-500 h-2 rounded-full" 
            style={{ 
              width: `${((currentExerciseIndex + (currentSet / currentExercise.sets)) / currentWorkout.exercises.length) * 100}%` 
            }}
          ></div>
        </div>
        <p className="text-sm text-gray-400 text-center">
          {Math.round((currentExerciseIndex + (currentSet / currentExercise.sets)) / currentWorkout.exercises.length * 100)}% terminé
        </p>
      </div>
    </div>
  );
};

export default WorkoutInProgress;
