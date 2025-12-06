import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import ApiService from './ApiService';
import DatabaseService from './DatabaseService';

let NetInfo: any;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch (error) {
  NetInfo = {
    fetch: async () => ({ isConnected: navigator?.onLine, isInternetReachable: navigator?.onLine }),
    addEventListener: () => () => {},
  };
}

const PENDING_CHALLENGES_KEY = '@offline_pending_challenges';
const SYNC_IN_PROGRESS_KEY = '@offline_sync_in_progress';

export interface PendingChallenge {
  id: string;
  type: 'challenge' | 'groupChallenge';
  data: {
    title: string;
    description?: string;
    difficulty?: number;
    codeTemplate?: string;
    isPublic?: boolean;
    languageId?: string;
    xp?: number;
    groupId?: string;
    tests?: Array<{
      input: string;
      expectedOutput: string;
      description?: string;
    }>;
  };
  createdAt: number;
  synced: boolean;
}

class OfflineSyncService {
  private syncListeners: Set<() => void> = new Set();
  private isListening = false;

  async isOnline(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return typeof navigator !== 'undefined' && navigator.onLine;
    }

    try {
      const state = await NetInfo.fetch();
      return state.isConnected === true && state.isInternetReachable === true;
    } catch (error) {
      return false;
    }
  }

  async savePendingChallenge(challenge: Omit<PendingChallenge, 'id' | 'createdAt' | 'synced'>): Promise<string> {
    try {
      const pending: PendingChallenge = {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...challenge,
        createdAt: Date.now(),
        synced: false,
      };

      const existing = await this.getPendingChallenges();
      existing.push(pending);

      await AsyncStorage.setItem(PENDING_CHALLENGES_KEY, JSON.stringify(existing));
      await this.saveToDatabase(pending);

      const online = await this.isOnline();
      if (online) {
        this.syncPendingChallenges().catch(() => {});
      }

      return pending.id;
    } catch (error) {
      throw new Error('Erro ao salvar desafio offline');
    }
  }

  private async saveToDatabase(pending: PendingChallenge) {
    if (Platform.OS === 'web') return;

    try {
      const db = DatabaseService.getDatabase();
      if (!db) return;

      await db.runAsync(
        `INSERT OR REPLACE INTO pending_challenges 
         (id, type, data, created_at, synced) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          pending.id,
          pending.type,
          JSON.stringify(pending.data),
          pending.createdAt,
          pending.synced ? 1 : 0,
        ]
      );
    } catch (error) {}
  }

  async getPendingChallenges(): Promise<PendingChallenge[]> {
    try {
      const data = await AsyncStorage.getItem(PENDING_CHALLENGES_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async removePendingChallenge(id: string): Promise<void> {
    try {
      const pending = await this.getPendingChallenges();
      const filtered = pending.filter(p => p.id !== id);
      await AsyncStorage.setItem(PENDING_CHALLENGES_KEY, JSON.stringify(filtered));

      if (Platform.OS !== 'web') {
        const db = DatabaseService.getDatabase();
        if (db) {
          await db.runAsync('DELETE FROM pending_challenges WHERE id = ?', [id]);
        }
      }
    } catch (error) {
      throw new Error('Erro ao remover desafio pendente');
    }
  }

  async markAsSynced(id: string): Promise<void> {
    try {
      const pending = await this.getPendingChallenges();
      const updated = pending.map(p => 
        p.id === id ? { ...p, synced: true } : p
      );
      await AsyncStorage.setItem(PENDING_CHALLENGES_KEY, JSON.stringify(updated));

      if (Platform.OS !== 'web') {
        const db = DatabaseService.getDatabase();
        if (db) {
          await db.runAsync(
            'UPDATE pending_challenges SET synced = ? WHERE id = ?',
            [1, id]
          );
        }
      }
    } catch (error) {}
  }

  async syncPendingChallenges(): Promise<{ success: number; failed: number }> {
    const inProgress = await AsyncStorage.getItem(SYNC_IN_PROGRESS_KEY);
    if (inProgress === 'true') {
      return { success: 0, failed: 0 };
    }

    try {
      await AsyncStorage.setItem(SYNC_IN_PROGRESS_KEY, 'true');

      const online = await this.isOnline();
      if (!online) {
        return { success: 0, failed: 0 };
      }

      const pending = await this.getPendingChallenges();
      const unsynced = pending.filter(p => !p.synced);

      let success = 0;
      let failed = 0;

      for (const challenge of unsynced) {
        try {
          let result;
          
          if (challenge.type === 'groupChallenge' && challenge.data.groupId) {
            result = await ApiService.createGroupChallenge(
              challenge.data.groupId,
              {
                title: challenge.data.title,
                description: challenge.data.description,
                difficulty: challenge.data.difficulty,
                codeTemplate: challenge.data.codeTemplate,
                isPublic: challenge.data.isPublic,
                languageId: challenge.data.languageId,
                xp: challenge.data.xp,
              }
            );
          } else {
            result = await ApiService.createChallenge({
              title: challenge.data.title,
              description: challenge.data.description,
              difficulty: challenge.data.difficulty,
              codeTemplate: challenge.data.codeTemplate,
              isPublic: challenge.data.isPublic,
              languageId: challenge.data.languageId,
              xp: challenge.data.xp,
            });
          }

          if (result) {
            await this.removePendingChallenge(challenge.id);
            success++;
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
        }
      }

      this.syncListeners.forEach(listener => listener());

      return { success, failed };
    } catch (error) {
      return { success: 0, failed: 0 };
    } finally {
      await AsyncStorage.removeItem(SYNC_IN_PROGRESS_KEY);
    }
  }

  /**
   * Adiciona um listener para mudanças de sincronização
   */
  addSyncListener(listener: () => void): () => void {
    this.syncListeners.add(listener);
    return () => {
      this.syncListeners.delete(listener);
    };
  }

  /**
   * Inicia o listener automático de conexão
   */
  startConnectionListener(): () => void {
    if (this.isListening) {
      return () => {};
    }

    this.isListening = true;

    try {
      const unsubscribe = NetInfo.addEventListener((state: any) => {
        if (state.isConnected && state.isInternetReachable) {
          this.syncPendingChallenges().catch(() => {});
        }
      });

      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
        this.isListening = false;
      };
    } catch (error) {
      this.isListening = false;
      return () => {};
    }
  }

  async getPendingCount(): Promise<number> {
    const pending = await this.getPendingChallenges();
    return pending.filter(p => !p.synced).length;
  }
}

export default new OfflineSyncService();

