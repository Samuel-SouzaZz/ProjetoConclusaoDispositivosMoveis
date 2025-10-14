import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

// Abre/cria o banco de dados (apenas em mobile)
const db = Platform.OS !== "web" ? SQLite.openDatabaseSync("appdb.db") : null;

/**
 * Serviço de Banco de Dados
 * Responsável por criar tabelas e fornecer acesso ao banco
 */
class DatabaseService {
  /**
   * Inicializa o banco de dados e cria as tabelas
   */
  static async initDatabase() {
    // SQLite não funciona no web
    if (Platform.OS === "web") {
      console.log("⚠️ SQLite não disponível no web - usando apenas backend");
      return;
    }

    try {
      // Cria tabela de usuários (SEM SENHA - usa backend para auth)
      await db!.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          handle TEXT,
          college TEXT,
          level INTEGER DEFAULT 1,
          xpTotal INTEGER DEFAULT 0,
          avatarUrl TEXT,
          bio TEXT,
          synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log("✅ Banco de dados inicializado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao inicializar banco de dados:", error);
      throw error;
    }
  }

  /**
   * Retorna a instância do banco de dados
   */
  static getDatabase() {
    if (Platform.OS === "web") return null;
    return db;
  }

  /**
   * Limpa todas as tabelas (útil para desenvolvimento)
   */
  static async clearDatabase() {
    if (Platform.OS === "web") return;

    try {
      await db!.execAsync("DROP TABLE IF EXISTS users;");
      await this.initDatabase();
      console.log("🗑️ Banco de dados limpo!");
    } catch (error) {
      console.error("❌ Erro ao limpar banco:", error);
    }
  }

  /**
   * Lista todos os registros de uma tabela (debug)
   */
  static async debugTable(tableName: string) {
    if (Platform.OS === "web") {
      console.log("⚠️ SQLite debug não disponível no web");
      return;
    }

    try {
      const result = await db!.getAllAsync(`SELECT * FROM ${tableName}`);
      console.log(`📊 Dados da tabela ${tableName}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Erro ao ler tabela ${tableName}:`, error);
    }
  }
}

export default DatabaseService;
