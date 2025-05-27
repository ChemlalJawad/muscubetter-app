-- Script d'insertion du programme d'entraînement "Full Body" sur 4 semaines
-- Créé pour MuscuBetter avec des UUID valides - Version sans ON CONFLICT

-- 1. Insertion du programme d'entraînement
INSERT INTO workout_programs (id, name, description, level, duration_weeks)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Programme Full Body 4 Semaines', 'Programme complet de reprise sur 4 semaines avec 3 séances par semaine', 'Débutant', 4);

-- 2. Insertion des séances d'entraînement
-- Jour 1: Full Body & Cardio
INSERT INTO workouts (id, day, type, program_id, completed)
VALUES 
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Jour 1', 'Full Body & Cardio', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', false);

-- Jour 2: Jambes & Abdos
INSERT INTO workouts (id, day, type, program_id, completed)
VALUES 
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Jour 2', 'Jambes & Abdos', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', false);

-- Jour 3: Haut du corps & Cardio
INSERT INTO workouts (id, day, type, program_id, completed)
VALUES 
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Jour 3', 'Haut du corps & Cardio', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', false);

-- 3. Insertion des exercices pour chaque séance
-- Vérification de l'existence des exercices et création si nécessaire

-- Exercices nécessaires
INSERT INTO exercises (id, name, description, category, difficulty, equipment, muscles_primary, muscles_secondary, instructions, tips)
VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Tapis de course', 'Marche rapide ou jogging léger sur tapis de course', 'Cardio', 'Débutant', ARRAY['Tapis de course'], ARRAY['Jambes', 'Système cardiovasculaire'], ARRAY['Core'], 'Marchez ou courez à un rythme confortable sur le tapis de course.', 'Gardez une bonne posture et balancez naturellement les bras.'),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Vélo elliptique', 'Exercice cardiovasculaire à faible impact', 'Cardio', 'Débutant', ARRAY['Vélo elliptique'], ARRAY['Jambes', 'Système cardiovasculaire'], ARRAY['Bras', 'Core'], 'Placez vos pieds sur les pédales et commencez à pédaler en tenant les poignées.', 'Maintenez le dos droit et engagez les muscles abdominaux.'),
  ('00eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Squat à la barre', 'Exercice polyarticulaire ciblant principalement les jambes', 'Jambes', 'Intermédiaire', ARRAY['Barre', 'Rack à squat'], ARRAY['Quadriceps', 'Fessiers'], ARRAY['Ischio-jambiers', 'Lombaires'], 'Placez la barre sur vos trapèzes, descendez en pliant les genoux jusqu''à ce que vos cuisses soient parallèles au sol, puis remontez.', 'Gardez le dos droit et les genoux alignés avec les orteils.'),
  ('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Développé couché', 'Exercice de poussée horizontale pour la poitrine', 'Poitrine', 'Intermédiaire', ARRAY['Barre', 'Banc'], ARRAY['Pectoraux'], ARRAY['Triceps', 'Épaules'], 'Allongez-vous sur un banc, descendez la barre jusqu''à la poitrine, puis poussez vers le haut.', 'Gardez les poignets droits et les coudes à un angle de 45 degrés.'),
  ('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Rowing à la barre', 'Exercice de tirage pour le dos', 'Dos', 'Intermédiaire', ARRAY['Barre'], ARRAY['Dorsaux', 'Rhomboïdes'], ARRAY['Biceps', 'Avant-bras'], 'Penchez-vous en avant, tirez la barre vers votre abdomen, puis redescendez lentement.', 'Gardez le dos droit et les épaules basses.'),
  ('30eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Développé militaire', 'Exercice de poussée verticale pour les épaules', 'Épaules', 'Intermédiaire', ARRAY['Barre', 'Haltères'], ARRAY['Deltoïdes'], ARRAY['Triceps', 'Trapèzes'], 'En position debout ou assise, poussez la barre ou les haltères au-dessus de votre tête, puis redescendez.', 'Évitez de cambrer le dos et gardez les abdominaux engagés.'),
  ('40eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Fentes avec haltères', 'Exercice unilatéral pour les jambes', 'Jambes', 'Intermédiaire', ARRAY['Haltères'], ARRAY['Quadriceps', 'Fessiers'], ARRAY['Ischio-jambiers', 'Core'], 'Tenez un haltère dans chaque main, faites un pas en avant, pliez les genoux, puis revenez à la position initiale.', 'Gardez le torse droit et le genou avant aligné avec le pied.'),
  ('50eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Gainage (planche)', 'Exercice statique pour renforcer le core', 'Abdominaux', 'Débutant', ARRAY['Aucun'], ARRAY['Abdominaux', 'Core'], ARRAY['Épaules', 'Fessiers'], 'Placez-vous en position de planche sur les avant-bras, maintenez la position en gardant le corps aligné.', 'Engagez les abdominaux et ne laissez pas le bassin s''affaisser.'),
  ('60eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'Presse à cuisses', 'Exercice guidé pour les jambes', 'Jambes', 'Débutant', ARRAY['Machine presse à cuisses'], ARRAY['Quadriceps', 'Fessiers'], ARRAY['Ischio-jambiers'], 'Asseyez-vous sur la machine, poussez la plateforme avec vos pieds, puis pliez lentement les genoux pour revenir.', 'Ne verrouillez pas complètement les genoux en position haute.'),
  ('70eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'Leg extensions', 'Exercice d''isolation pour les quadriceps', 'Jambes', 'Débutant', ARRAY['Machine leg extensions'], ARRAY['Quadriceps'], ARRAY[]::text[], 'Asseyez-vous sur la machine, étendez les jambes pour soulever le poids, puis revenez lentement.', 'Évitez de verrouiller les genoux et contrôlez le mouvement.'),
  ('80eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'Leg curls', 'Exercice d''isolation pour les ischio-jambiers', 'Jambes', 'Débutant', ARRAY['Machine leg curls'], ARRAY['Ischio-jambiers'], ARRAY[]::text[], 'Allongez-vous sur la machine, pliez les jambes pour soulever le poids, puis revenez lentement.', 'Contrôlez le mouvement dans les deux directions.'),
  ('90eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'Mollets à la machine', 'Exercice d''isolation pour les mollets', 'Jambes', 'Débutant', ARRAY['Machine mollets', 'Haltères'], ARRAY['Mollets'], ARRAY[]::text[], 'Placez-vous sur la machine, montez sur la pointe des pieds, puis redescendez lentement.', 'Effectuez une extension complète et une flexion complète.'),
  ('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'Crunchs', 'Exercice d''isolation pour les abdominaux', 'Abdominaux', 'Débutant', ARRAY['Aucun', 'Machine abdominaux'], ARRAY['Abdominaux'], ARRAY[]::text[], 'Allongez-vous sur le dos, pliez les genoux, soulevez les épaules du sol en contractant les abdominaux.', 'Concentrez-vous sur la contraction des abdominaux plutôt que sur l''amplitude.'),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a28', 'Relevés de jambes', 'Exercice pour les abdominaux inférieurs', 'Abdominaux', 'Intermédiaire', ARRAY['Aucun'], ARRAY['Abdominaux inférieurs'], ARRAY['Fléchisseurs de hanches'], 'Allongez-vous sur le dos, soulevez les jambes tendues vers le plafond, puis redescendez sans toucher le sol.', 'Gardez le bas du dos plaqué au sol.'),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a29', 'Gainage latéral', 'Exercice statique pour les obliques', 'Abdominaux', 'Intermédiaire', ARRAY['Aucun'], ARRAY['Obliques', 'Core'], ARRAY['Épaules'], 'Placez-vous sur le côté en appui sur un avant-bras, soulevez les hanches pour former une ligne droite.', 'Gardez le corps aligné et ne laissez pas les hanches s''affaisser.'),
  ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', 'Rameur', 'Exercice cardiovasculaire complet', 'Cardio', 'Débutant', ARRAY['Rameur'], ARRAY['Dos', 'Jambes', 'Système cardiovasculaire'], ARRAY['Bras', 'Core'], 'Asseyez-vous sur le rameur, poussez avec les jambes, tirez avec les bras, puis revenez à la position initiale.', 'Commencez le mouvement par les jambes, puis enchaînez avec le dos et les bras.'),
  ('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'Tirage vertical', 'Exercice de tirage vertical pour le dos', 'Dos', 'Intermédiaire', ARRAY['Machine tirage vertical'], ARRAY['Dorsaux'], ARRAY['Biceps', 'Avant-bras'], 'Asseyez-vous à la machine, saisissez la barre, tirez vers le bas jusqu''à la poitrine, puis remontez lentement.', 'Gardez le dos droit et les épaules basses.'),
  ('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'Développé incliné avec haltères', 'Exercice de poussée pour la partie supérieure de la poitrine', 'Poitrine', 'Intermédiaire', ARRAY['Haltères', 'Banc incliné'], ARRAY['Pectoraux supérieurs'], ARRAY['Triceps', 'Épaules'], 'Allongez-vous sur un banc incliné, poussez les haltères vers le haut, puis redescendez.', 'Gardez les poignets droits et les coudes à un angle de 45 degrés.'),
  ('01eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Élévations latérales', 'Exercice d''isolation pour les deltoïdes latéraux', 'Épaules', 'Débutant', ARRAY['Haltères'], ARRAY['Deltoïdes latéraux'], ARRAY[]::text[], 'Tenez un haltère dans chaque main, soulevez-les latéralement jusqu''à l''horizontale, puis redescendez.', 'Gardez les coudes légèrement fléchis et évitez de hausser les épaules.'),
  ('11eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'Biceps curl avec haltères', 'Exercice d''isolation pour les biceps', 'Bras', 'Débutant', ARRAY['Haltères'], ARRAY['Biceps'], ARRAY['Avant-bras'], 'Tenez un haltère dans chaque main, fléchissez les coudes pour soulever les haltères, puis redescendez.', 'Gardez les coudes près du corps et évitez de balancer le torse.'),
  ('21eebc99-9c0b-4ef8-bb6d-6bb9bd380a35', 'Triceps extensions', 'Exercice d''isolation pour les triceps', 'Bras', 'Débutant', ARRAY['Poulie haute'], ARRAY['Triceps'], ARRAY[]::text[], 'Saisissez la corde ou la barre de la poulie haute, étendez les bras vers le bas, puis revenez à la position initiale.', 'Gardez les coudes près de la tête et concentrez-vous sur la contraction des triceps.');

-- 4. Insertion des exercices pour chaque séance
-- Jour 1: Full Body & Cardio
INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
VALUES
  -- Échauffement
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 1, 1, NULL, 0, 'Échauffement: 10 minutes de marche rapide ou jogging léger'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 1, 1, NULL, 0, 'Alternative pour échauffement: 10 minutes à intensité légère'),
  
  -- Circuit (3 tours)
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '00eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 3, 12, 30, 0, 'Barre seule ou 20-30 kg selon ta force'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 3, 10, 40, 0, 'Barre seule ou 30-40 kg selon ta force'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 3, 10, 30, 0, 'Barre seule ou 20-30 kg selon ta force'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '30eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 3, 10, 14, 0, 'Haltères de 5-7 kg par main'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 3, 10, 14, 0, 'Haltères de 5-7 kg par main, 10 répétitions par jambe'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '50eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 3, 1, NULL, 90, 'Tenir 30 secondes, repos de 1 minute 30 entre chaque tour du circuit'),
  
  -- Cardio
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 1, 1, NULL, 0, 'Cardio: 25 minutes de course à intensité modérée'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 1, 1, NULL, 0, 'Alternative pour cardio: 25 minutes à intensité modérée');

-- Jour 2: Jambes & Abdos
INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
VALUES
  -- Échauffement
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 1, 1, NULL, 0, 'Échauffement: 10 minutes à intensité légère'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 1, 1, NULL, 0, 'Alternative pour échauffement: 10 minutes de marche rapide'),
  
  -- Exercices
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '60eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 3, 12, NULL, 60, '50-60% de ta charge maximale habituelle'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '70eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 3, 15, NULL, 60, '50-60% de ta charge maximale habituelle'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '80eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 3, 15, NULL, 60, '50-60% de ta charge maximale habituelle'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '90eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 3, 15, NULL, 60, '50-60% de ta charge maximale habituelle'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 3, 15, NULL, 60, 'À la machine ou au sol'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a28', 3, 15, NULL, 60, 'Contrôler le mouvement'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a29', 3, 1, NULL, 60, 'Tenir 30 secondes de chaque côté'),
  
  -- Cardio
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 1, 1, NULL, 0, 'Cardio: 20 minutes à intensité modérée'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 1, 1, NULL, 0, 'Alternative pour cardio: 20 minutes à intensité modérée');

-- Jour 3: Haut du corps & Cardio
INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
VALUES
  -- Échauffement
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', 1, 1, NULL, 0, 'Échauffement: 10 minutes à intensité légère'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 1, 1, NULL, 0, 'Alternative pour échauffement: 10 minutes à intensité légère'),
  
  -- Exercices
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 3, 10, NULL, 60, '50-60% de ta charge maximale habituelle'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 3, 10, 24, 60, 'Haltères de 11-13 kg par main'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '01eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 3, 12, 8, 60, 'Haltères de 3-5 kg par main'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '11eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 3, 12, 14, 60, 'Haltères de 5-7 kg par main'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '21eebc99-9c0b-4ef8-bb6d-6bb9bd380a35', 3, 12, NULL, 60, '50-60% de ta charge maximale habituelle'),
  
  -- Cardio
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 1, 1, NULL, 0, 'Cardio: 30 minutes à intensité modérée'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', 1, 1, NULL, 0, 'Alternative pour cardio: 30 minutes à intensité modérée');
