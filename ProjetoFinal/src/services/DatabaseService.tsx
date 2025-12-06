import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

const db = Platform.OS !== "web" ? SQLite.openDatabaseSync("appdb.db") : null;

class DatabaseService {
  static async initDatabase() {
    if (Platform.OS === "web") {
      return;
    }

    try {
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

      await db!.execAsync(`
        CREATE TABLE IF NOT EXISTS challenges (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          difficulty INTEGER DEFAULT 1,
          baseXp INTEGER DEFAULT 100,
          isPublic INTEGER DEFAULT 1,
          codeTemplate TEXT,
          status TEXT DEFAULT 'Draft',
          progress INTEGER DEFAULT 0,
          userId TEXT,
          synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await db!.execAsync(`
        CREATE TABLE IF NOT EXISTS pending_challenges (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          data TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          synced INTEGER DEFAULT 0
        );
      `);

      
    } catch (error) {
      
      throw error;
    }
  }

  static getDatabase() {
    if (Platform.OS === "web") return null;
    return db;
  }

  static async clearDatabase() {
    if (Platform.OS === "web") return;

    try {
      await db!.execAsync("DROP TABLE IF EXISTS users;");
      await db!.execAsync("DROP TABLE IF EXISTS challenges;");
      await db!.execAsync("DROP TABLE IF EXISTS pending_challenges;");
      await this.initDatabase();
    } catch (error) {}
  }

  static async debugTable(tableName: string) {
    if (Platform.OS === "web") {
      return;
    }

    try {
      const result = await db!.getAllAsync(`SELECT * FROM ${tableName}`);
      return result;
    } catch (error) {}
  }
}

export default DatabaseService;
