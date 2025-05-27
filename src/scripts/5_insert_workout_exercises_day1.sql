-- Insérer les exercices pour le Jour 1
DO $$
DECLARE
  workout_id UUID;
  ex_tapis_id UUID;
  ex_velo_id UUID;
  ex_squat_id UUID;
  ex_developpe_id UUID;
  ex_rowing_id UUID;
  ex_militaire_id UUID;
  ex_fentes_id UUID;
  ex_gainage_id UUID;
BEGIN
  -- Récupérer les IDs nécessaires
  SELECT w.id INTO workout_id FROM workouts w
  JOIN workout_programs p ON w.program_id = p.id
  WHERE p.name = 'Programme Full Body 4 Semaines' AND w.day = 'Jour 1'
  LIMIT 1;
  
  SELECT id INTO ex_tapis_id FROM exercises WHERE name = 'Tapis de course' LIMIT 1;
  SELECT id INTO ex_velo_id FROM exercises WHERE name = 'Vélo elliptique' LIMIT 1;
  SELECT id INTO ex_squat_id FROM exercises WHERE name = 'Squat à la barre' LIMIT 1;
  SELECT id INTO ex_developpe_id FROM exercises WHERE name = 'Développé couché' LIMIT 1;
  SELECT id INTO ex_rowing_id FROM exercises WHERE name = 'Rowing à la barre' LIMIT 1;
  SELECT id INTO ex_militaire_id FROM exercises WHERE name = 'Développé militaire' LIMIT 1;
  SELECT id INTO ex_fentes_id FROM exercises WHERE name = 'Fentes avec haltères' LIMIT 1;
  SELECT id INTO ex_gainage_id FROM exercises WHERE name = 'Gainage (planche)' LIMIT 1;
  
  -- Échauffement
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_tapis_id, 1, 1, NULL, 0, 'Échauffement: 10 minutes de marche rapide ou jogging léger');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_velo_id, 1, 1, NULL, 0, 'Alternative pour échauffement: 10 minutes à intensité légère');
  
  -- Circuit (3 tours)
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_squat_id, 3, 12, 30, 0, 'Barre seule ou 20-30 kg selon ta force');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_developpe_id, 3, 10, 40, 0, 'Barre seule ou 30-40 kg selon ta force');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_rowing_id, 3, 10, 30, 0, 'Barre seule ou 20-30 kg selon ta force');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_militaire_id, 3, 10, 14, 0, 'Haltères de 5-7 kg par main');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_fentes_id, 3, 10, 14, 0, 'Haltères de 5-7 kg par main, 10 répétitions par jambe');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_gainage_id, 3, 1, NULL, 90, 'Tenir 30 secondes, repos de 1 minute 30 entre chaque tour du circuit');
  
  -- Cardio
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_tapis_id, 1, 1, NULL, 0, 'Cardio: 25 minutes de course à intensité modérée');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_velo_id, 1, 1, NULL, 0, 'Alternative pour cardio: 25 minutes à intensité modérée');
  
END;
$$;
