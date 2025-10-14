import { Platform } from "react-native";
import DatabaseService from "./DatabaseService";
import { User } from "../models/UserModel";

/**
 * Serviço de Usuários - Cache Local (SQLite)
 * 
 * ⚠️ IMPORTANTE: Este serviço NÃO faz autenticação!
 * Autenticação é feita via ApiService (backend)
 * SQLite apenas armazena dados do usuário logado (cache)
 * 
 * 📱 Funciona apenas em MOBILE (não funciona no web)
 */
class UserService {
  /**
   * Salva/atualiza dados do usuário no cache local (após login via backend)
   */
  static async syncUserFromBackend(userData: any): Promise<void> {
    // SQLite não funciona no web
    if (Platform.OS === 'web') {
      console.log("⚠️ Cache SQLite não disponível no web");
      return;
    }

    try {
      const db = DatabaseService.getDatabase();
      if (!db) return;

      // Verifica se usuário já existe no cache
      const existing = await db.getFirstAsync(
        "SELECT * FROM users WHERE id = ?",
        [userData.id]
      );

      if (existing) {
        // Atualiza cache
        await db.runAsync(
          `UPDATE users SET 
            name = ?, 
            email = ?, 
            handle = ?,
            college = ?, 
            level = ?,
            xpTotal = ?,
            avatarUrl = ?,
            bio = ?,
            synced_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
          [
            userData.name,
            userData.email,
            userData.handle || null,
            userData.collegeId || null,
            userData.level || 1,
            userData.xpTotal || 0,
            userData.avatarUrl || null,
            userData.bio || null,
            userData.id
          ]
        );
      } else {
        // Cria novo registro no cache
        await db.runAsync(
          `INSERT INTO users (id, name, email, handle, college, level, xpTotal, avatarUrl, bio) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userData.id,
            userData.name,
            userData.email,
            userData.handle || null,
            userData.collegeId || null,
            userData.level || 1,
            userData.xpTotal || 0,
            userData.avatarUrl || null,
            userData.bio || null
          ]
        );
      }

      console.log("✅ Dados do usuário sincronizados no cache local");
    } catch (error: any) {
      console.error("❌ Erro ao sincronizar usuário:", error);
      throw error;
    }
  }

  /**
   * Busca dados do usuário no cache local
   */
  static async getUserById(id: string | number): Promise<User | null> {
    if (Platform.OS === 'web') return null;

    try {
      const db = DatabaseService.getDatabase();
      if (!db) return null;

      const user = await db.getFirstAsync<User>(
        "SELECT * FROM users WHERE id = ?",
        [id]
      );

      return user || null;
    } catch (error) {
      console.error("❌ Erro ao buscar usuário no cache:", error);
      return null;
    }
  }

  /**
   * Limpa o cache do usuário (usado no logout)
   */
  static async clearUserCache(userId: string): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const db = DatabaseService.getDatabase();
      if (!db) return;
      
      await db.runAsync("DELETE FROM users WHERE id = ?", [userId]);
      console.log("🗑️ Cache do usuário limpo");
    } catch (error) {
      console.error("❌ Erro ao limpar cache:", error);
    }
  }

  /**
   * Limpa todo o cache local
   */
  static async clearAllCache(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const db = DatabaseService.getDatabase();
      if (!db) return;
      
      await db.runAsync("DELETE FROM users");
      console.log("🗑️ Todo o cache foi limpo");
    } catch (error) {
      console.error("❌ Erro ao limpar cache:", error);
    }
  }
}

export default UserService;
