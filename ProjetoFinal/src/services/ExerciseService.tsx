import { Platform } from "react-native";
import DatabaseService from "./DatabaseService";

interface Exercise {
  id: string;
  title: string;
  description?: string;
  difficulty: number;
  xp: number;
  isPublic: boolean;
  codeTemplate?: string;
  status?: string;
  progress?: number;
  userId?: string;
}

class ExerciseService {
  static async syncExerciseFromBackend(exerciseData: any): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      const db = DatabaseService.getDatabase();
      if (!db) return;

      const existing = await db.getFirstAsync(
        "SELECT * FROM exercises WHERE id = ?",
        [exerciseData.id]
      );

      if (existing) {
        await db.runAsync(
          `UPDATE exercises SET 
            title = ?, 
            description = ?,
            difficulty = ?,
            xp = ?,
            isPublic = ?,
            codeTemplate = ?,
            status = ?,
            progress = ?,
            userId = ?,
            synced_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
          [
            exerciseData.title,
            exerciseData.description || null,
            exerciseData.difficulty || 1,
            exerciseData.xp || 100,
            exerciseData.isPublic ? 1 : 0,
            exerciseData.codeTemplate || null,
            exerciseData.status || 'Draft',
            exerciseData.progress || 0,
            exerciseData.userId || null,
            exerciseData.id
          ]
        );
      } else {
        await db.runAsync(
          `INSERT INTO exercises (id, title, description, difficulty, xp, isPublic, codeTemplate, status, progress, userId) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            exerciseData.id,
            exerciseData.title,
            exerciseData.description || null,
            exerciseData.difficulty || 1,
            exerciseData.xp || 100,
            exerciseData.isPublic ? 1 : 0,
            exerciseData.codeTemplate || null,
            exerciseData.status || 'Draft',
            exerciseData.progress || 0,
            exerciseData.userId || null
          ]
        );
      }
    } catch (error: any) {
      throw error;
    }
  }

  static async getExercisesByUserId(userId: string): Promise<Exercise[]> {
    if (Platform.OS === 'web') return [];

    try {
      const db = DatabaseService.getDatabase();
      if (!db) return [];

      const exercises = await db.getAllAsync<Exercise>(
        "SELECT * FROM exercises WHERE userId = ? ORDER BY synced_at DESC",
        [userId]
      );

      return exercises.map(ex => ({
        ...ex,
        isPublic: !!ex.isPublic,
      }));
    } catch (error) {
      return [];
    }
  }

  static async getExerciseById(id: string): Promise<Exercise | null> {
    if (Platform.OS === 'web') return null;

    try {
      const db = DatabaseService.getDatabase();
      if (!db) return null;

      const exercise = await db.getFirstAsync<Exercise>(
        "SELECT * FROM exercises WHERE id = ?",
        [id]
      );

      if (!exercise) return null;

      return {
        ...exercise,
        isPublic: !!exercise.isPublic,
      };
    } catch (error) {
      return null;
    }
  }

  static async deleteExercise(exerciseId: string): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const db = DatabaseService.getDatabase();
      if (!db) return;
      
      await db.runAsync("DELETE FROM exercises WHERE id = ?", [exerciseId]);
    } catch (error) {
    }
  }

  static async clearUserExercises(userId: string): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const db = DatabaseService.getDatabase();
      if (!db) return;
      
      await db.runAsync("DELETE FROM exercises WHERE userId = ?", [userId]);
    } catch (error) {
    }
  }
}

export default ExerciseService;

