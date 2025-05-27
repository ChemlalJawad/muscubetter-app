import React, { useState, useEffect } from 'react';
import { Workout, Exercise, getExerciseById } from '../lib/database';

interface WorkoutPreviewProps {
  workout: Workout;
  onStart: () => void;
}

const WorkoutPreview: React.FC<WorkoutPreviewProps> = ({ workout, onStart }) => {
  // State to store the exercise details
  const [exerciseDetails, setExerciseDetails] = useState<{[key: string]: Exercise}>({});
  
  // Fetch exercise details when component mounts
  useEffect(() => {
    const fetchExerciseDetails = async () => {
      const details: {[key: string]: Exercise} = {};
      
      if (workout.exercises) {
        for (const exercise of workout.exercises) {
          if (exercise.exercise_id) {
            try {
              const exerciseData = await getExerciseById(exercise.exercise_id);
              if (exerciseData) {
                details[exercise.exercise_id] = exerciseData;
              }
            } catch (error) {
              console.error('Error fetching exercise details:', error);
            }
          }
        }
      }
      
      setExerciseDetails(details);
    };
    
    fetchExerciseDetails();
  }, [workout]);
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Prêt à commencer ?</h2>
      <p className="text-gray-400 mb-4">
        Cet entraînement comprend {workout.exercises?.length || 0} exercices et devrait prendre environ 45 minutes.
      </p>
      
      {/* Aperçu des exercices */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Exercices au programme :</h3>
        <ul className="space-y-2">
          {workout.exercises?.map((exercise, index) => (
            <li key={index} className="flex items-center">
              <span className="w-6 h-6 flex items-center justify-center bg-blue-500/20 rounded-full text-blue-400 mr-2">
                {index + 1}
              </span>
              <span>{exerciseDetails[exercise.exercise_id]?.name || 'Chargement...'}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <button 
        onClick={onStart}
        className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium"
      >
        Démarrer l'entraînement
      </button>
    </div>
  );
};

export default WorkoutPreview;
