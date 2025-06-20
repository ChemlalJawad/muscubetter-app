import { supabase } from './supabase';

// Types pour les données
export interface Exercise {
  id?: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  equipment: string[];
  muscles_primary: string[];
  muscles_secondary: string[];
  instructions: string;
  tips: string;
  record?: number;
  record_type?: 'poids' | 'répétitions' | 'temps' | 'distance';
  favorite?: boolean;
  created_at?: string;
}

export interface WorkoutProgram {
  id?: string;
  name: string;
  description: string;
  level: string;
  duration_weeks: number;
  workouts: Workout[];
  created_at?: string;
}

export interface Workout {
  id?: string;
  day: string;
  type: string;
  exercises: WorkoutExercise[];
  completed?: boolean;
  program_id?: string;
  created_at?: string;
}

export interface WorkoutExercise {
  exercise_id: string;
  sets: number;
  reps: number;
  weight?: number;
  rest_time?: number;
  notes?: string;
}

export interface PlayerStats {
  id?: string;
  player_id: string;
  force: number;
  endurance: number;
  speed: number;
  assiduity: number;
  total_weight_lifted: number;
  total_workouts_completed: number;
  streak_days: number;
  created_at?: string;
  updated_at?: string;
}

export interface DailyQuest {
  id: number;
  name: string;
  description: string;
  icon: string;
  xp: number;
  coins: number;
  progress?: number;
  max?: number;
  completed?: boolean;
  created_at?: string;
}

export interface DailyQuestProgress {
  id?: string;
  player_id: string;
  quest_id: number;
  progress: number;
  completed: boolean;
  completed_at?: string;
  date: string;
  created_at?: string;
  updated_at?: string;
}

export interface Badge {
  id?: string;
  name: string;
  description: string;
  icon: string;
  category: 'régularité' | 'performance' | 'maîtrise';
  unlocked?: boolean;
  created_at?: string;
}

export interface Player {
  player_id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  level: number;
  xp: number;
  muscle_coins: number;
  created_at?: string;
  updated_at?: string;
}

// Fonctions pour interagir avec la base de données

// Exercices
// Fonction supprimée pour éviter de recréer des tables existantes

export async function saveExercise(exercise: Exercise) {
  const { data, error } = await supabase
    .from('exercises')
    .upsert(exercise, { onConflict: 'id' })
    .select();
    
  if (error) {
    console.error('Erreur lors de la sauvegarde de l\'exercice:', error);
    return null;
  }
  
  return data?.[0] || null;
}

export async function saveExercises(exercises: Exercise[]) {
  const { data, error } = await supabase
    .from('exercises')
    .upsert(exercises, { onConflict: 'id' })
    .select();
    
  if (error) {
    console.error('Erreur lors de la sauvegarde des exercices:', error);
    return null;
  }
  
  return data || null;
}

export async function getExercises() {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Erreur lors de la récupération des exercices:', error);
    return [];
  }
  
  return data || [];
}

export async function getExerciseById(id: string) {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error(`Erreur lors de la récupération de l'exercice ${id}:`, error);
    return null;
  }
  
  return data;
}

export async function getExercisesByCategory(category: string) {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('category', category)
    .order('name');
    
  if (error) {
    console.error(`Erreur lors de la récupération des exercices de la catégorie ${category}:`, error);
    return [];
  }
  
  return data || [];
}

export async function updateExerciseRecord(id: string, record: number, record_type: string) {
  const { data, error } = await supabase
    .from('exercises')
    .update({ record, record_type })
    .eq('id', id)
    .select();
    
  if (error) {
    console.error(`Erreur lors de la mise à jour du record pour l'exercice ${id}:`, error);
    return null;
  }
  
  return data?.[0] || null;
}

export async function toggleExerciseFavorite(id: string, favorite: boolean) {
  const { data, error } = await supabase
    .from('exercises')
    .update({ favorite })
    .eq('id', id)
    .select();
    
  if (error) {
    console.error(`Erreur lors de la mise à jour du statut favori pour l'exercice ${id}:`, error);
    return null;
  }
  
  return data?.[0] || null;
}

// Programmes d'entraînement
// Fonction supprimée pour éviter de recréer des tables existantes

export async function saveWorkoutProgram(program: WorkoutProgram) {
  // D'abord, sauvegarder le programme
  const { data: programData, error: programError } = await supabase
    .from('workout_programs')
    .upsert({
      id: program.id,
      name: program.name,
      description: program.description,
      level: program.level,
      duration_weeks: program.duration_weeks
    }, { onConflict: 'id' })
    .select();
    
  if (programError) {
    console.error('Erreur lors de la sauvegarde du programme:', programError);
    return null;
  }
  
  const programId = programData?.[0]?.id;
  
  if (!programId) {
    console.error('Impossible de récupérer l\'ID du programme sauvegardé');
    return null;
  }
  
  // Ensuite, sauvegarder les entraînements associés
  for (const workout of program.workouts) {
    const { data: workoutData, error: workoutError } = await supabase
      .from('workouts')
      .upsert({
        id: workout.id,
        day: workout.day,
        type: workout.type,
        program_id: programId,
        completed: workout.completed || false
      }, { onConflict: 'id' })
      .select();
      
    if (workoutError) {
      console.error('Erreur lors de la sauvegarde de l\'entraînement:', workoutError);
      continue;
    }
    
    const workoutId = workoutData?.[0]?.id;
    
    if (!workoutId) {
      console.error('Impossible de récupérer l\'ID de l\'entraînement sauvegardé');
      continue;
    }
    
    // Enfin, sauvegarder les exercices de l'entraînement
    for (const exercise of workout.exercises) {
      const { error: exerciseError } = await supabase
        .from('workout_exercises')
        .upsert({
          workout_id: workoutId,
          exercise_id: exercise.exercise_id,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          rest_time: exercise.rest_time,
          notes: exercise.notes
        }, { onConflict: 'workout_id, exercise_id' });
        
      if (exerciseError) {
        console.error('Erreur lors de la sauvegarde de l\'exercice d\'entraînement:', exerciseError);
      }
    }
  }
  
  return { ...program, id: programId };
}

export async function getWorkoutPrograms() {
  const { data, error } = await supabase
    .from('workout_programs')
    .select('*')
    .order('created_at');
    
  if (error) {
    console.error('Erreur lors de la récupération des programmes:', error);
    return [];
  }
  
  // Pour chaque programme, récupérer les entraînements
  const programsWithWorkouts = await Promise.all(data.map(async (program) => {
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('*')
      .eq('program_id', program.id)
      .order('day');
      
    if (workoutsError) {
      console.error(`Erreur lors de la récupération des entraînements pour le programme ${program.id}:`, workoutsError);
      return { ...program, workouts: [] };
    }
    
    // Pour chaque entraînement, récupérer les exercices
    const workoutsWithExercises = await Promise.all(workouts.map(async (workout) => {
      const { data: exercises, error: exercisesError } = await supabase
        .from('workout_exercises')
        .select(`
          *,
          exercises:exercise_id (*)
        `)
        .eq('workout_id', workout.id);
        
      if (exercisesError) {
        console.error(`Erreur lors de la récupération des exercices pour l'entraînement ${workout.id}:`, exercisesError);
        return { ...workout, exercises: [] };
      }
      
      // Transformer les données pour correspondre à notre structure
      const formattedExercises = exercises.map(item => ({
        exercise_id: item.exercise_id,
        sets: item.sets,
        reps: item.reps,
        weight: item.weight,
        rest_time: item.rest_time,
        notes: item.notes,
        ...item.exercises
      }));
      
      return { ...workout, exercises: formattedExercises };
    }));
    
    return { ...program, workouts: workoutsWithExercises };
  }));
  
  return programsWithWorkouts;
}

export async function updateWorkoutCompletion(workoutId: string, completed: boolean) {
  const { data, error } = await supabase
    .from('workouts')
    .update({ completed })
    .eq('id', workoutId)
    .select();
    
  if (error) {
    console.error(`Erreur lors de la mise à jour du statut de complétion pour l'entraînement ${workoutId}:`, error);
    return null;
  }
  
  return data?.[0] || null;
}

// Statistiques du joueur
// Fonction supprimée pour éviter de recréer des tables existantes

export async function getPlayerStats(playerId: string) {
  const { data, error } = await supabase
    .from('player_stats')
    .select('*')
    .eq('player_id', playerId)
    .single();
    
  if (error) {
    // Si l'erreur est "No rows found", créer des statistiques par défaut
    if (error.code === 'PGRST116') {
      const defaultStats: PlayerStats = {
        player_id: playerId,
        force: 2,
        endurance: 3,
        speed: 2,
        assiduity: 0,
        total_weight_lifted: 0,
        total_workouts_completed: 0,
        streak_days: 0
      };
      
      const { data: newStats, error: createError } = await supabase
        .from('player_stats')
        .insert(defaultStats)
        .select();
        
      if (createError) {
        console.error('Erreur lors de la création des statistiques par défaut:', createError);
        return defaultStats;
      }
      
      return newStats?.[0] || defaultStats;
    }
    
    console.error(`Erreur lors de la récupération des statistiques pour le joueur ${playerId}:`, error);
    return null;
  }
  
  return data;
}

export async function updatePlayerStats(stats: PlayerStats) {
  const { data, error } = await supabase
    .from('player_stats')
    .upsert(stats, { onConflict: 'player_id' })
    .select();
    
  if (error) {
    console.error('Erreur lors de la mise à jour des statistiques du joueur:', error);
    return null;
  }
  
  return data?.[0] || null;
}

/**
 * Met à jour l'XP et les Muscle Coins du joueur dans la base de données
 * Cette fonction est cruciale pour éviter la perte de données entre les sessions
 */
export async function updatePlayerXP(playerId: string, xp: number, muscleCoins: number) {
  try {
    // Vérifier si le joueur existe
    const { error: fetchError } = await supabase
      .from('players')
      .select('player_id')
      .eq('player_id', playerId)
      .single();
    
    if (fetchError) {
      console.error('Erreur lors de la vérification de l\'existence du joueur:', fetchError);
      return null;
    }
    
    // Mettre à jour l'XP et les Muscle Coins
    const { data, error } = await supabase
      .from('players')
      .update({
        xp: xp,
        muscle_coins: muscleCoins,
        updated_at: new Date().toISOString()
      })
      .eq('player_id', playerId)
      .select();
    
    if (error) {
      console.error('Erreur lors de la mise à jour de l\'XP et des Muscle Coins:', error);
      return null;
    }
    
    console.log(`XP et Muscle Coins mis à jour pour le joueur ${playerId}:`, { xp, muscleCoins });
    return data?.[0] || null;
  } catch (err) {
    console.error('Exception lors de la mise à jour de l\'XP et des Muscle Coins:', err);
    return null;
  }
}

// Quêtes journalières
// Fonction supprimée pour éviter de recréer des tables existantes

export async function getDailyQuests() {
  const { data, error } = await supabase
    .from('daily_quests')
    .select('*')
    .order('created_at');
    
  if (error) {
    console.error('Erreur lors de la récupération des quêtes journalières:', error);
    return [];
  }
  
  return data || [];
}

export async function getDailyQuestProgress(playerId: string, date: string = new Date().toISOString().split('T')[0]) {
  const { data, error } = await supabase
    .from('daily_quest_progress')
    .select('*')
    .eq('player_id', playerId)
    .eq('date', date);
    
  if (error) {
    console.error('Erreur lors de la récupération de la progression des quêtes:', error);
    return [];
  }
  
  return data || [];
}

export async function updateDailyQuestProgress(playerId: string, questId: number, progress: number, completed: boolean = false) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('daily_quest_progress')
    .upsert({
      player_id: playerId,
      quest_id: questId,
      progress: progress,
      completed: completed,
      completed_at: completed ? new Date().toISOString() : null,
      date: today
    }, {
      onConflict: 'player_id,quest_id,date'
    })
    .select();
    
  if (error) {
    console.error('Erreur lors de la mise à jour de la progression des quêtes:', error);
    return null;
  }
  
  return data?.[0] || null;
}

export async function resetDailyQuests(playerId: string) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Vérifier s'il y a déjà des quêtes pour aujourd'hui
  const { data: todayQuests } = await supabase
    .from('daily_quest_progress')
    .select('*')
    .eq('player_id', playerId)
    .eq('date', today);
    
  // Si pas de quêtes pour aujourd'hui, les créer
  if (!todayQuests || todayQuests.length === 0) {
    const defaultQuests = [
      { quest_id: 1, progress: 0, completed: false },
      { quest_id: 2, progress: 0, completed: false },
      { quest_id: 3, progress: 0, completed: false },
      { quest_id: 4, progress: 0, completed: false },
      { quest_id: 5, progress: 0, completed: false },
      { quest_id: 6, progress: 0, completed: false },
      { quest_id: 7, progress: 0, completed: false },
      { quest_id: 8, progress: 0, completed: false }
    ];
    
    const questsToInsert = defaultQuests.map(quest => ({
      player_id: playerId,
      quest_id: quest.quest_id,
      progress: quest.progress,
      completed: quest.completed,
      date: today
    }));
    
    const { error } = await supabase
      .from('daily_quest_progress')
      .insert(questsToInsert);
      
    if (error) {
      console.error('Erreur lors de la création des quêtes journalières:', error);
    }
  }
  
  return true;
}

export async function updateQuestCompletion(questId: number, completed: boolean, progress?: number) {
  const updateData: any = { completed };
  
  if (progress !== undefined) {
    updateData.progress = progress;
  }
  
  const { data, error } = await supabase
    .from('daily_quests')
    .update(updateData)
    .eq('id', questId)
    .select();
    
  if (error) {
    console.error(`Erreur lors de la mise à jour du statut de complétion pour la quête ${questId}:`, error);
    return null;
  }
  
  return data?.[0] || null;
}

// Badges
// Fonction supprimée pour éviter de recréer des tables existantes

// Joueurs
// Fonction supprimée pour éviter de recréer des tables existantes

export async function getPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('username');
    
  if (error) {
    console.error('Erreur lors de la récupération des joueurs:', error);
    return [];
  }
  
  return data || [];
}

export async function getPlayerById(playerId: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('player_id', playerId)
    .single();
    
  if (error) {
    console.error(`Erreur lors de la récupération du joueur ${playerId}:`, error);
    return null;
  }
  
  return data;
}

export async function savePlayer(player: Player) {
  try {
    // Vérifier d'abord si le joueur existe déjà par player_id
    const { data: existingPlayer, error: checkError } = await supabase
      .from('players')
      .select('*')
      .eq('player_id', player.player_id)
      .maybeSingle();
    
    if (checkError) {
      console.error('Erreur lors de la vérification du joueur:', checkError);
      return null;
    }
    
    let result;
    
    if (existingPlayer) {
      // Si le joueur existe, mettre à jour
      const { data, error } = await supabase
        .from('players')
        .update({
          username: player.username,
          full_name: player.full_name,
          level: player.level,
          xp: player.xp,
          muscle_coins: player.muscle_coins,
          updated_at: new Date().toISOString()
        })
        .eq('player_id', player.player_id)
        .select();
      
      if (error) {
        console.error('Erreur lors de la mise à jour du joueur:', error);
        return null;
      }
      
      result = data?.[0];
    } else {
      // Si le joueur n'existe pas, l'insérer
      const { data, error } = await supabase
        .from('players')
        .insert(player)
        .select();
      
      if (error) {
        console.error('Erreur lors de l\'insertion du joueur:', error);
        console.error('Détails de l\'erreur:', error.details);
        console.error('Joueur à insérer:', player);
        return null;
      }
      
      result = data?.[0];
    }
    
    return result || null;
  } catch (err) {
    console.error('Exception lors de la sauvegarde du joueur:', err);
    return null;
  }
}

export async function getBadges() {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('category, name');
    
  if (error) {
    console.error('Erreur lors de la récupération des badges:', error);
    return [];
  }
  
  return data || [];
}

export async function unlockBadge(badgeId: string) {
  const { data, error } = await supabase
    .from('badges')
    .update({ unlocked: true })
    .eq('id', badgeId)
    .select();
    
  if (error) {
    console.error(`Erreur lors du déverrouillage du badge ${badgeId}:`, error);
    return null;
  }
  
  return data?.[0] || null;
}

// Initialisation des tables
export async function initializeDatabase() {
  // Ne plus créer de tables car elles existent déjà dans la base de données
  console.log('Vérification de la connexion à la base de données');
  
  try {
    // Vérifier simplement que nous pouvons accéder à la base de données
    const { error } = await supabase.from('players').select('player_id').limit(1);
    
    if (error) {
      console.error('Erreur lors de la vérification de la connexion à la base de données:', error);
      return false;
    }
    
    console.log('Connexion à la base de données établie avec succès');
    return true;
  } catch (err) {
    console.error('Exception lors de la vérification de la connexion à la base de données:', err);
    return false;
  }
}
