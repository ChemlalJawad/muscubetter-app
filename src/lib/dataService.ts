import { supabase } from './supabase';
import { 
  Exercise, 
  WorkoutProgram, 
  Workout, 
  PlayerStats, 
  DailyQuest, 
  Player,
  getExercises,
  saveExercise,
  getPlayerStats,
  updatePlayerStats,
  getDailyQuests,
  updateQuestCompletion,
  getWorkoutPrograms,
  saveWorkoutProgram,
  updateWorkoutCompletion,
  getPlayerById,
  savePlayer,
  getPlayers,
  updatePlayerXP
} from './database';
// Toutes les données sont maintenant gérées directement en base de données

// Ré-export de l'interface Player pour faciliter l'utilisation
export type { Player } from './database';

// Service pour gérer toutes les interactions avec la base de données
export class DataService {
  // Vérifier la connexion à la base de données
  static async initialize() {
    try {
      console.log('Vérification de la connexion à la base de données...');
      
      // Vérifier la connexion à Supabase
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error('Erreur de connexion à Supabase:', error);
        return false;
      }
      
      // Vérifier simplement que nous pouvons accéder à la base de données
      const { error: dbError } = await supabase.from('players').select('player_id').limit(1);
      
      if (dbError) {
        console.error('Erreur lors de l\'accès à la base de données:', dbError);
        return false;
      }
      
      console.log('Connexion à la base de données établie avec succès');
      return true;
    } catch (err) {
      console.error('Erreur lors de la vérification de la connexion à la base de données:', err);
      return false;
    }
  }
  
  // Création ou mise à jour d'un joueur spécifique
  static async createOrUpdatePlayer(player: Player) {
    try {
      console.log(`Création/mise à jour du joueur ${player.username}...`);
      
      // Vérifier si le joueur existe déjà - vérification effectuée dans savePlayer
      // Nous n'avons pas besoin de stocker le résultat ici
      await getPlayerById(player.player_id);
      
      // Insérer ou mettre à jour le joueur
      const savedPlayer = await savePlayer(player);
      
      if (!savedPlayer) {
        console.error(`Erreur lors de la création/mise à jour du joueur`);
        return null;
      }
      
      console.log(`Joueur ${player.username} créé/mis à jour avec succès`);
      
      // Créer ou mettre à jour les statistiques du joueur
      const defaultStats: PlayerStats = {
        player_id: player.player_id,
        force: 2,
        endurance: 3,
        speed: 2,
        assiduity: 0,
        total_weight_lifted: 0,
        total_workouts_completed: 0,
        streak_days: 0
      };
      
      const updatedStats = await this.updatePlayerStats(defaultStats);
      
      if (!updatedStats) {
        console.error(`Erreur lors de la mise à jour des statistiques pour le joueur ${player.username}`);
      } else {
        console.log(`Statistiques pour le joueur ${player.username} mises à jour avec succès`);
      }
      
      return savedPlayer;
    } catch (err) {
      console.error(`Erreur lors de la création/mise à jour du joueur:`, err);
      return null;
    }
  }
  
  // Récupération des exercices
  static async getExercises(): Promise<Exercise[]> {
    return await getExercises();
  }
  
  // Récupération des quêtes journalières
  static async getDailyQuests(): Promise<DailyQuest[]> {
    return await getDailyQuests();
  }
  
  // Récupération des programmes d'entraînement
  static async getWorkoutPrograms(): Promise<WorkoutProgram[]> {
    return await getWorkoutPrograms();
  }
  
  // Récupération des statistiques du joueur
  static async getPlayerStats(playerId: string): Promise<PlayerStats | null> {
    return await getPlayerStats(playerId);
  }
  
  // Mise à jour d'une quête
  static async updateQuestCompletion(questId: number, completed: boolean, progress?: number): Promise<DailyQuest | null> {
    return await updateQuestCompletion(questId, completed, progress);
  }
  
  // Mise à jour d'un entraînement
  static async updateWorkoutCompletion(workoutId: string, completed: boolean): Promise<Workout | null> {
    return await updateWorkoutCompletion(workoutId, completed);
  }
  
  // Mise à jour des statistiques du joueur
  static async updatePlayerStats(stats: PlayerStats): Promise<PlayerStats | null> {
    return await updatePlayerStats(stats);
  }
  
  // Mise à jour de l'XP et des Muscle Coins du joueur
  static async updatePlayerXP(playerId: string, xp: number, muscleCoins: number) {
    return await updatePlayerXP(playerId, xp, muscleCoins);
  }
  
  // Récupération d'un joueur par son ID
  static async getPlayerById(playerId: string) {
    return await getPlayerById(playerId);
  }
  
  // Récupération de tous les joueurs
  static async getPlayers() {
    return await getPlayers();
  }
  
  // Sauvegarde d'un exercice
  static async saveExercise(exercise: Exercise): Promise<Exercise | null> {
    return await saveExercise(exercise);
  }
  
  // Sauvegarde d'un programme d'entraînement
  static async saveWorkoutProgram(program: WorkoutProgram): Promise<WorkoutProgram | null> {
    return await saveWorkoutProgram(program);
  }
}
