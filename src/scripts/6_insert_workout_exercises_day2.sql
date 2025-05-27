-- Insérer les exercices pour le Jour 2
DO $$
DECLARE
  workout_id UUID;
  ex_tapis_id UUID;
  ex_velo_id UUID;
  ex_presse_id UUID;
  ex_extensions_id UUID;
  ex_curls_id UUID;
  ex_mollets_id UUID;
  ex_crunchs_id UUID;
  ex_releves_id UUID;
  ex_gainage_lat_id UUID;
BEGIN
  -- Récupérer les IDs nécessaires
  SELECT w.id INTO workout_id FROM workouts w
  JOIN workout_programs p ON w.program_id = p.id
  WHERE p.name = 'Programme Full Body 4 Semaines' AND w.day = 'Jour 2'
  LIMIT 1;
  
  SELECT id INTO ex_tapis_id FROM exercises WHERE name = 'Tapis de course' LIMIT 1;
  SELECT id INTO ex_velo_id FROM exercises WHERE name = 'Vélo elliptique' LIMIT 1;
  SELECT id INTO ex_presse_id FROM exercises WHERE name = 'Presse à cuisses' LIMIT 1;
  SELECT id INTO ex_extensions_id FROM exercises WHERE name = 'Leg extensions' LIMIT 1;
  SELECT id INTO ex_curls_id FROM exercises WHERE name = 'Leg curls' LIMIT 1;
  SELECT id INTO ex_mollets_id FROM exercises WHERE name = 'Mollets à la machine' LIMIT 1;
  SELECT id INTO ex_crunchs_id FROM exercises WHERE name = 'Crunchs' LIMIT 1;
  SELECT id INTO ex_releves_id FROM exercises WHERE name = 'Relevés de jambes' LIMIT 1;
  SELECT id INTO ex_gainage_lat_id FROM exercises WHERE name = 'Gainage latéral' LIMIT 1;
  
  -- Échauffement
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_velo_id, 1, 1, NULL, 0, 'Échauffement: 10 minutes à intensité légère');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_tapis_id, 1, 1, NULL, 0, 'Alternative pour échauffement: 10 minutes de marche rapide');
  
  -- Exercices
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_presse_id, 3, 12, NULL, 60, '50-60% de ta charge maximale habituelle');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_extensions_id, 3, 15, NULL, 60, '50-60% de ta charge maximale habituelle');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_curls_id, 3, 15, NULL, 60, '50-60% de ta charge maximale habituelle');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_mollets_id, 3, 15, NULL, 60, '50-60% de ta charge maximale habituelle');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_crunchs_id, 3, 15, NULL, 60, 'À la machine ou au sol');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_releves_id, 3, 15, NULL, 60, 'Contrôler le mouvement');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_gainage_lat_id, 3, 1, NULL, 60, 'Tenir 30 secondes de chaque côté');
  
  -- Cardio
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_velo_id, 1, 1, NULL, 0, 'Cardio: 20 minutes à intensité modérée');
  
  INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
  VALUES (workout_id, ex_tapis_id, 1, 1, NULL, 0, 'Alternative pour cardio: 20 minutes à intensité modérée');
  
END;
$$;
