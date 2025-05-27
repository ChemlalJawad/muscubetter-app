-- Insérer les exercices pour le Jour 3
DO $$
DECLARE
  workout_id UUID;
  ex_rameur_id UUID;
  ex_velo_id UUID;
  ex_tirage_id UUID;
  ex_developpe_incline_id UUID;
  ex_elevations_id UUID;
  ex_biceps_id UUID;
  ex_triceps_id UUID;
BEGIN
  -- Récupérer les IDs nécessaires
  SELECT w.id INTO workout_id FROM workouts w
  JOIN workout_programs p ON w.program_id = p.id
  WHERE p.name = 'Programme Full Body 4 Semaines' AND w.day = 'Jour 3'
  LIMIT 1;
  
  SELECT id INTO ex_rameur_id FROM exercises WHERE name = 'Rameur' LIMIT 1;
  SELECT id INTO ex_velo_id FROM exercises WHERE name = 'Vélo elliptique' LIMIT 1;
  SELECT id INTO ex_tirage_id FROM exercises WHERE name = 'Tirage vertical' LIMIT 1;
  SELECT id INTO ex_developpe_incline_id FROM exercises WHERE name = 'Développé incliné avec haltères' LIMIT 1;
  SELECT id INTO ex_elevations_id FROM exercises WHERE name = 'Élévations latérales' LIMIT 1;
  SELECT id INTO ex_biceps_id FROM exercises WHERE name = 'Biceps curl avec haltères' LIMIT 1;
  SELECT id INTO ex_triceps_id FROM exercises WHERE name = 'Triceps extensions' LIMIT 1;
  
  -- Échauffement
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_rameur_id, 1, 1, NULL, 0, 'Échauffement: 10 minutes à intensité légère');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_velo_id, 1, 1, NULL, 0, 'Alternative pour échauffement: 10 minutes à intensité légère');
  
  -- Exercices
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_tirage_id, 3, 10, NULL, 60, '50-60% de ta charge maximale habituelle');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_developpe_incline_id, 3, 10, 24, 60, 'Haltères de 11-13 kg par main');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_elevations_id, 3, 12, 8, 60, 'Haltères de 3-5 kg par main');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_biceps_id, 3, 12, 14, 60, 'Haltères de 5-7 kg par main');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_triceps_id, 3, 12, NULL, 60, '50-60% de ta charge maximale habituelle');
  
  -- Cardio
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_velo_id, 1, 1, NULL, 0, 'Cardio: 30 minutes à intensité modérée');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_rameur_id, 1, 1, NULL, 0, 'Alternative pour cardio: 30 minutes à intensité modérée');
  
END;
$$;
