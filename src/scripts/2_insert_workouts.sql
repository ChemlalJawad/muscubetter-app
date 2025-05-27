-- Récupérer l'ID du programme
WITH program_id AS (
  SELECT id FROM workout_programs 
  WHERE name = 'Programme Full Body 4 Semaines' 
  LIMIT 1
)
-- Insérer les séances d'entraînement
INSERT INTO workouts (day, type, program_id, completed)
SELECT 'Jour 1', 'Full Body & Cardio', id, false FROM program_id
UNION ALL
SELECT 'Jour 2', 'Jambes & Abdos', id, false FROM program_id
UNION ALL
SELECT 'Jour 3', 'Haut du corps & Cardio', id, false FROM program_id;
