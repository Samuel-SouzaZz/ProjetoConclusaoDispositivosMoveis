import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

const apiUrl = extra.apiUrl as string;
const apiPath = extra.apiPath as string;

if (!extra?.apiUrl || !extra?.apiPath) {
  throw new Error("Variáveis API_URL ou API_PATH não foram carregadas do app.config.js");
}

export const BASE_URL = `${apiUrl}${apiPath}`;

// NUNCA salvar senhas, apenas tokens
const TOKEN_KEY = 'app_access_token';
const REFRESH_TOKEN_KEY = 'app_refresh_token';

class SecureStorage {
  static async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`Erro ao ler ${key}:`, error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
}

class ApiService {
  private api: AxiosInstance;
  private refreshTokenPromise: Promise<any> | null = null;

  private async safeRequest<T = any>(
    request: () => Promise<{ data: T } | AxiosResponse<T>>
  ): Promise<T> {
    try {
      const response: any = await request();
      return (response as AxiosResponse<T>).data ?? response;
    } catch (error) {
      const message = this.handleError(error);
      throw new Error(message);
    }
  }

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await SecureStorage.getItem(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
          const url = originalRequest.url || '';
          const isAuthRequest = url.includes('/users/me') ||
            url.includes('/auth/refresh') ||
            url.includes('/auth/login') ||
            url.includes('/auth/signup');

          if (isAuthRequest) {
            await this.clearTokens();
            return Promise.reject(error);
          }

          (originalRequest as any)._retry = true;

          try {
            if (!this.refreshTokenPromise) {
              const refreshToken = await SecureStorage.getItem(REFRESH_TOKEN_KEY);
              
              if (!refreshToken) {
                await this.clearTokens();
                return Promise.reject(error);
              }

              this.refreshTokenPromise = this.refreshTokens(refreshToken)
                .then(async (newTokens) => {
                  await this.saveTokens(newTokens.accessToken, newTokens.refreshToken);
                  this.refreshTokenPromise = null;
                  return newTokens;
                })
                .catch(async (refreshError) => {
                  this.refreshTokenPromise = null;
                  await this.clearTokens();
                  throw refreshError;
                });
            }

            const newTokens = await this.refreshTokenPromise;
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return this.api.request(originalRequest);
            
          } catch (refreshError) {
            await this.clearTokens();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async signup(payload: {
    name: string;
    email: string;
    password: string;
    handle: string;
    collegeId?: string;
  }) {
    const response: any = await this.safeRequest(() => this.api.post('/auth/signup', payload));
    const { user, tokens } = response;
    await this.saveTokens(tokens.accessToken, tokens.refreshToken);
    return { user, tokens };
  }


  async getToken(): Promise<string | null> {
    const token = await SecureStorage.getItem(TOKEN_KEY);
    return token;
  }

  async setToken(token: string): Promise<void> {
    await SecureStorage.setItem(TOKEN_KEY, token);
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  async login(email: string, password: string, rememberMe: boolean = true) {
    const response: any = await this.safeRequest(() => this.api.post('/auth/login', { email, password }));
    const { user, tokens } = response;
    
    if (rememberMe) {
      await this.saveTokens(tokens.accessToken, tokens.refreshToken);
    } else {
      await SecureStorage.setItem(TOKEN_KEY, tokens.accessToken);
      this.api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
    }
    
    return { user, tokens };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const response: any = await this.safeRequest(() => 
        this.api.post('/auth/refresh', { refreshToken })
      );
      
      if (response && response.tokens) {
        return {
          accessToken: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken,
        };
      }
      
      if (response && response.accessToken && response.refreshToken) {
        return {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        };
      }
      
      throw new Error('Formato de resposta de refresh inválido');
    } catch (error: any) {
      await this.clearTokens();
      throw error;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    const token = await SecureStorage.getItem(REFRESH_TOKEN_KEY);
    return token;
  }

  async getTokens(): Promise<{ accessToken?: string | null; refreshToken?: string | null }> {
    const accessToken = await SecureStorage.getItem(TOKEN_KEY);
    const refreshToken = await SecureStorage.getItem(REFRESH_TOKEN_KEY);
    return { accessToken, refreshToken };
  }

  async getMe() {
    return this.safeRequest(() => this.api.get('/users/me'));
  }

  async updateMe(data: {
    name?: string;
    handle?: string;
    bio?: string;
    avatarUrl?: string;
  }) {
    return this.safeRequest(() => this.api.patch('/users/me', data));
  }

  async uploadMyAvatar(dataUrl: string) {
    return this.safeRequest(() =>
      this.api.post("/users/me/avatar", { dataUrl })
    );
  }

  async getLeaderboardByGroup(groupId: string, params?: { page?: number; limit?: number }) {
    return this.safeRequest(() =>
      this.api.get('/leaderboards/by-group', { params: { groupId, ...(params || {}) } })
    );
  }

  async getPublicProfile(userId: string) {
    return this.safeRequest(() => this.api.get(`/users/${userId}/profile`));
  }

  async getUserCompleteProfile() {
    return null;
  }

  async createChallenge(data: {
    title: string;
    description?: string;
    difficulty?: number;
    codeTemplate?: string;
    isPublic?: boolean;
    languageId?: string;
    xp?: number;
  }) {
    interface CreateChallengePayload {
      title: string;
      description?: string;
      difficulty?: number;
      codeTemplate?: string;
      isPublic?: boolean;
      languageId?: string;
      baseXp?: number;
    }

    const payload: CreateChallengePayload = {
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      codeTemplate: data.codeTemplate,
      isPublic: data.isPublic,
      languageId: data.languageId,
    };

    if (data.xp !== undefined) {
      payload.baseXp = data.xp;
    }

    return this.safeRequest(() => this.api.post('/exercises', payload));
  }

  async getMyChallenges(params?: {
    status?: 'Draft' | 'Published' | 'all';
    page?: number;
    limit?: number;
  }) {
    const token = await SecureStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new Error('Não autenticado. Faça login novamente.');
    }

    const config = params && Object.keys(params).length > 0 ? { params } : {};
    return this.safeRequest(() => this.api.get('/exercises/mine', config));
  }

  async updateChallenge(challengeId: string, data: {
    title?: string;
    description?: string;
    difficulty?: number;
    codeTemplate?: string;
    isPublic?: boolean;
    languageId?: string;
    xp?: number;
  }) {
    interface UpdateChallengePayload {
      title?: string;
      description?: string;
      difficulty?: number;
      codeTemplate?: string;
      isPublic?: boolean;
      languageId?: string;
      baseXp?: number;
    }

    const payload: UpdateChallengePayload = {
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      codeTemplate: data.codeTemplate,
      isPublic: data.isPublic,
      languageId: data.languageId,
    };

    if (data.xp !== undefined) {
      payload.baseXp = data.xp;
    }

    return this.safeRequest(() => this.api.patch(`/exercises/${challengeId}`, payload));
  }

  async getChallengeById(exerciseId: string) {
    return this.safeRequest(() => this.api.get(`/exercises/${exerciseId}`));
  }

  async getExerciseByCode(code: string) {
    return this.safeRequest(() => this.api.get(`/exercises/code/${encodeURIComponent(code)}`));
  }

  async deleteChallenge(challengeId: string) {
    return this.safeRequest(() => this.api.delete(`/exercises/${challengeId}`));
  }

  async getMySubmissions(params?: {
    page?: number;
    limit?: number;
    status?: 'Accepted' | 'Rejected' | 'Pending' | 'all';
  }) {
    return this.safeRequest(() => this.api.get('/submissions/me', { params }));
  }

  async getAllSubmissions(params?: {
    page?: number;
    limit?: number;
    exerciseId?: string;
    status?: string;
  }) {
    return this.safeRequest(() => this.api.get('/submissions', { params }));
  }

  async getExerciseRanking(exerciseId: string) {
    try {
      return await this.safeRequest(() => this.api.get(`/exercises/${exerciseId}/ranking`));
    } catch (error: any) {
      if (error?.message?.includes('404') || error?.response?.status === 404) {
        try {
          return await this.safeRequest(() => 
            this.api.get('/submissions', { 
              params: { 
                exerciseId, 
                status: 'ACCEPTED',
                limit: 100 
              } 
            })
          );
        } catch (fallbackError) {
          return [];
        }
      }
      throw error;
    }
  }

  async getColleges() {
    return this.safeRequest(() => this.api.get('/colleges'));
  }

  async getChallenges(params?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    languageId?: string;
    q?: string;
  }) {
    try {
      const data = await this.safeRequest(() => this.api.get('/exercises', { params }));

      if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
          return { items: data, total: data.length };
        }
        if ((data as any).items || (data as any).data) {
          return {
            items: (data as any).items || (data as any).data || [],
            total:
              (data as any).total ||
              ((data as any).items || (data as any).data || []).length
          };
        }
      }
      return { items: [], total: 0 };
    } catch (error: any) {
      return { items: [], total: 0 };
    }
  }

  async submitChallenge(data: {
    exerciseId: string;
    code: string;
    languageId: string;
    timeSpentMs?: number;
  }) {
    return this.safeRequest(() => this.api.post('/submissions', data));
  }

  async getLeaderboards(params?: {
    seasonId?: string;
    collegeId?: string;
    limit?: number;
  }) {
    try {
      return await this.safeRequest(() => this.api.get('/leaderboards/general', { params }));
    } catch (error: any) {
      const status = error?.response?.status;
      const isNetworkIssue = !error?.response;
      if (Platform.OS === 'web' && (status === 404 || isNetworkIssue)) {
        const mock = [
          { id: 'u1', name: 'Victor Demarque', xpTotal: 10000 },
          { id: 'u2', name: 'João Antônio Souza', xpTotal: 3200 },
          { id: 'u3', name: 'Maria Silva', xpTotal: 1500 },
          { id: 'u4', name: 'Samuel Carlos', xpTotal: 300 },
          { id: 'u5', name: 'Testando Silva', xpTotal: 0 },
          { id: 'u6', name: 'Ana Pereira', xpTotal: 980 },
          { id: 'u7', name: 'Lucas Lima', xpTotal: 750 },
          { id: 'u8', name: 'Beatriz Santos', xpTotal: 640 },
          { id: 'u9', name: 'Rafael Torres', xpTotal: 520 },
          { id: 'u10', name: 'Carla Nunes', xpTotal: 410 },
        ];
        return mock;
      }
      throw error;
    }
  }

  async getLanguages() {
    return this.safeRequest(() => this.api.get('/languages'));
  }

  async getPublicForums(params?: { page?: number; limit?: number }) {
    return this.safeRequest(() => this.api.get('/forum/foruns', { params }));
  }

  async getMyForums(params?: { page?: number; limit?: number }) {
    return this.safeRequest(() => this.api.get('/forum/meus', { params }));
  }

  async createForum(data: {
    exerciseCode: string;
    nome: string;
    assunto: string;
    descricao?: string;
    isPublic?: boolean;
    palavrasChave?: string[];
  }) {
    interface CreateForumPayload {
      exerciseCode: string;
      nome: string;
      assunto: string;
      descricao?: string;
      statusPrivacidade?: 'PUBLICO' | 'PRIVADO';
      palavrasChave?: string[];
    }

    const payload: CreateForumPayload = {
      exerciseCode: data.exerciseCode,
      nome: data.nome,
      assunto: data.assunto,
      descricao: data.descricao,
      palavrasChave: data.palavrasChave,
    };

    if (typeof data.isPublic === 'boolean') {
      payload.statusPrivacidade = data.isPublic ? 'PUBLICO' : 'PRIVADO';
    }

    return this.safeRequest(() => this.api.post('/forum', payload));
  }

  async getForumById(forumId: string) {
    return this.safeRequest(() => this.api.get(`/forum/${forumId}`));
  }

  async updateForum(forumId: string, data: {
    nome?: string;
    assunto?: string;
    descricao?: string;
    isPublic?: boolean;
    palavrasChave?: string[];
  }) {
    interface UpdateForumPayload {
      nome?: string;
      assunto?: string;
      descricao?: string;
      statusPrivacidade?: 'PUBLICO' | 'PRIVADO';
      palavrasChave?: string[];
    }

    const payload: UpdateForumPayload = {
      nome: data.nome,
      assunto: data.assunto,
      descricao: data.descricao,
    };

    if (typeof data.isPublic === 'boolean') {
      payload.statusPrivacidade = data.isPublic ? 'PUBLICO' : 'PRIVADO';
    }

    return this.safeRequest(() => this.api.patch(`/forum/${forumId}`, payload));
  }

  async deleteForum(forumId: string) {
    return this.safeRequest(() => this.api.delete(`/forum/${forumId}`));
  }

  async getForumTopics(forumId: string, params?: { page?: number; limit?: number }) {
    return this.safeRequest(() => this.api.get(`/forum-topics/forum/${forumId}`, { params }));
  }

  async getForumParticipants(forumId: string) {
    return this.safeRequest(() => this.api.get(`/forum/${forumId}/participantes`));
  }

  async joinForum(forumId: string) {
    return this.safeRequest(() => this.api.post(`/forum/${forumId}/participar`));
  }

  async leaveForum(forumId: string) {
    return this.safeRequest(() => this.api.post(`/forum/${forumId}/sair`));
  }

  async getForumTopicById(topicId: string) {
    return this.safeRequest(() => this.api.get(`/forum-topics/${topicId}`));
  }

  async createForumTopic(forumId: string, data: {
    titulo: string;
    conteudo: string;
    palavrasChave?: string[];
  }) {
    return this.safeRequest(() => this.api.post(`/forum-topics/forum/${forumId}`, data));
  }

  async updateForumTopic(topicId: string, data: {
    titulo?: string;
    conteudo?: string;
    palavrasChave?: string[];
    status?: 'ABERTO' | 'FECHADO' | 'ARQUIVADO';
    fixado?: boolean;
  }) {
    return this.safeRequest(() => this.api.patch(`/forum-topics/${topicId}`, data));
  }

  async deleteForumTopic(topicId: string) {
    return this.safeRequest(() => this.api.delete(`/forum-topics/${topicId}`));
  }

  async getTopicComments(topicId: string, params?: { page?: number; limit?: number }) {
    return this.safeRequest(() => this.api.get(`/forum-comments/topic/${topicId}`, { params }));
  }

  async getForumCommentById(commentId: string) {
    return this.safeRequest(() => this.api.get(`/forum-comments/${commentId}`));
  }

  async createForumComment(topicId: string, data: { conteudo: string }) {
    return this.safeRequest(() => this.api.post(`/forum-comments/topic/${topicId}`, data));
  }

  async updateForumComment(commentId: string, data: { conteudo: string }) {
    return this.safeRequest(() => this.api.patch(`/forum-comments/${commentId}`, data));
  }

  async deleteForumComment(commentId: string) {
    return this.safeRequest(() => this.api.delete(`/forum-comments/${commentId}`));
  }

  async getGroups() {
    return this.safeRequest(() => this.api.get('/groups'));
  }

  async getMyGroups() {
    return this.safeRequest(() => this.api.get('/groups/my'));
  }

  async createGroup(data: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }) {
    interface CreateGroupPayload {
      name: string;
      description?: string;
      visibility?: 'PUBLIC' | 'PRIVATE';
    }

    const payload: CreateGroupPayload = {
      name: data.name,
      description: data.description,
    };
    if (typeof data.isPublic === 'boolean') {
      payload.visibility = data.isPublic ? 'PUBLIC' : 'PRIVATE';
    }
    return this.safeRequest(() => this.api.post('/groups', payload));
  }

  async updateGroup(groupId: string, data: {
    name?: string;
    description?: string;
    isPublic?: boolean;
  }) {
    interface UpdateGroupPayload {
      name?: string;
      description?: string;
      visibility?: 'PUBLIC' | 'PRIVATE';
    }

    const payload: UpdateGroupPayload = {
      name: data.name,
      description: data.description,
    };
    if (typeof data.isPublic === 'boolean') {
      payload.visibility = data.isPublic ? 'PUBLIC' : 'PRIVATE';
    }
    return this.safeRequest(() => this.api.patch(`/groups/${groupId}`, payload));
  }

  async getGroup(groupId: string) {
    return this.safeRequest(() => this.api.get(`/groups/${groupId}`));
  }
  async removeGroupMember(groupId: string, userId: string) {
    return this.safeRequest(() => this.api.delete(`/groups/${groupId}/members/${userId}`));
  }

  async setGroupMemberRole(groupId: string, userId: string, role: 'MEMBER' | 'MODERATOR') {
    return this.safeRequest(() =>
      this.api.post(`/groups/${groupId}/members/${userId}/role`, { role })
    );
  }

  async getGroupChallenges(groupId: string) {
    return this.safeRequest(() => this.api.get(`/groups/${groupId}/exercises`));
  }

  async createGroupChallenge(groupId: string, data: {
    title: string;
    description?: string;
    difficulty?: number;
    codeTemplate?: string;
    isPublic?: boolean;
    languageId?: string;
    xp?: number;
  }) {
    interface CreateGroupChallengePayload {
      title: string;
      description?: string;
      difficulty?: number;
      codeTemplate?: string;
      languageId?: string;
      baseXp?: number;
      groupId?: string;
    }

    const payload: CreateGroupChallengePayload = {
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      codeTemplate: data.codeTemplate,
      languageId: data.languageId,
      baseXp: data.xp,
      groupId,
    };
    return this.safeRequest(() => this.api.post('/exercises', payload));
  }

  async joinGroup(groupId: string) {
    return this.safeRequest(() => this.api.post(`/groups/${groupId}/join`));
  }
  async leaveGroup(groupId: string) {
    return this.safeRequest(() => this.api.post(`/groups/${groupId}/leave`));
  }

  async generateGroupInviteLink(groupId: string) {
    return this.safeRequest(() => this.api.post(`/groups/${groupId}/invite-link`));
  }

  async joinGroupByToken(groupId: string, token: string) {
    return this.safeRequest(() => this.api.post(`/groups/${groupId}/join-by-token`, { token }));
  }

  async getStats() {
    return this.safeRequest(() => this.api.get('/stats/public'));
  }

  async getDashboardStats(userId: string) {
    try {
      const response: any = await this.safeRequest(() => this.api.get(`/stats/users/${userId}`));
      return {
        languages: response.languagesUsed || 0,
        challenges: response.publishedChallenges || 0,
        forumsCreated: response.forumsCreated || 0,
        totalXp: response.totalXp || 0,
        level: response.level || 1,
        weekProgress: response.weekProgress || 0,
      };
    } catch (error) {
      return {
        languages: 0,
        challenges: 0,
        forumsCreated: 0,
        totalXp: 0,
        level: 1,
        weekProgress: 0,
      };
    }
  }

  async getMyCompletedExercises(): Promise<string[]> {
    try {
      const response: any = await this.safeRequest(() => this.api.get('/submissions/me/completed'));
      return response?.exerciseIds || [];
    } catch (error) {
      return [];
    }
  }

  async getUserStats(userId: string) {
    try {
      return await this.safeRequest(() => this.api.get(`/stats/users/${userId}`));
    } catch (error) {
      return null;
    }
  }

  async getAllBadges() {
    try {
      const response = await this.safeRequest(() => this.api.get('/badges'));
      return Array.isArray(response) ? response : (response?.items || []);
    } catch (error) {
      return [];
    }
  }

  async getUserBadges(userId: string) {
    try {
      const response = await this.safeRequest(() => this.api.get(`/users/${userId}/badges`));
      return Array.isArray(response) ? response : [];
    } catch (error) {
      return [];
    }
  }

  async getAllTitles() {
    try {
      const response: any = await this.safeRequest(() => this.api.get('/titles'));
      return Array.isArray(response) ? response : (response?.items || []);
    } catch (error) {
      return [];
    }
  }

  async getUserTitles(userId: string) {
    try {
      const response: any = await this.safeRequest(() => this.api.get(`/users/${userId}/titles`));
      return Array.isArray(response) ? response : [];
    } catch (error) {
      return [];
    }
  }

  async getGeneralLeaderboard(params?: { page?: number; limit?: number }) {
    try {
      const response: any = await this.safeRequest(() => this.api.get('/leaderboards/general', { params }));
      return Array.isArray(response) ? response : (response?.items || []);
    } catch (error) {
      return [];
    }
  }

  async executeCode(data: {
    sourceCode: string;
    languageId: number;
    input?: string;
  }): Promise<{ sucesso: boolean; resultado: string }> {
    try {
      const response = await this.safeRequest(() => 
        this.api.post('/execute', data)
      );
      return response as { sucesso: boolean; resultado: string };
    } catch (error: any) {
      return {
        sucesso: false,
        resultado: error?.message || 'Erro ao executar código',
      };
    }
  }

  // NUNCA salva senhas - apenas tokens
  async saveTokens(accessToken: string, refreshToken: string) {
    await SecureStorage.setItem(TOKEN_KEY, accessToken);
    await SecureStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    this.api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = await SecureStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (refreshToken) {
        try {
          await this.api.post('/auth/logout', { refreshToken }, {
            timeout: 5000,
          });
        } catch (error) {}
      }
    } catch (error) {}
    finally {
      await this.clearTokens();
    }
  }

  async logoutAll(): Promise<void> {
    try {
      try {
        await this.api.post('/auth/logout-all', {}, {
            timeout: 5000,
          });
      } catch (error) {}
    } catch (error) {}
    finally {
      await this.clearTokens();
    }
  }

  async clearTokens() {
    try {
      await SecureStorage.removeItem(TOKEN_KEY);
      await SecureStorage.removeItem(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem('@app:access_token');
      await AsyncStorage.removeItem('@app:refresh_token');
      await AsyncStorage.removeItem('@app:user_id');
      delete this.api.defaults.headers.common['Authorization'];
      this.refreshTokenPromise = null;
    } catch (error) {
      console.error('Erro ao limpar tokens:', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStorage.getItem(TOKEN_KEY);
    if (!token) {
      return false;
    }

    try {
      const response = await axios.get(`${BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      return !!response.data;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr?.response?.status === 401 || axiosErr?.response?.status === 403) {
        await this.clearTokens();
      }
      return false;
    }
  }

  getBaseUrl(): string {
    return BASE_URL.replace('/api', '');
  }

  handleError(error: unknown): string {
    const axiosError = error as AxiosError<Record<string, unknown>>;
    
    if (axios.isAxiosError(error) && axiosError.response) {
      const data = axiosError.response.data;
      let message: string;

      if (typeof data === 'string') {
        message = data;
      }
      else if (data && typeof data === 'object') {
        message = (data.message || data.error || data.msg || JSON.stringify(data)) as string;
        if (typeof message === 'object') {
          message = JSON.stringify(message);
        }
      } else {
        message = 'Erro ao comunicar com o servidor';
      }

      return message || 'Erro ao comunicar com o servidor';
    } else if (axios.isAxiosError(error) && axiosError.request) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão e se o servidor está rodando em ' + BASE_URL;
    } else if (axios.isAxiosError(error) && axiosError.code === 'ECONNABORTED') {
      return 'Tempo de conexão esgotado. Verifique sua conexão.';
    }

    const errorObj = error as { message?: string };
    if (errorObj?.message?.includes('Network Error') || errorObj?.message?.includes('network')) {
      return 'Erro de rede. Verifique sua conexão com a internet.';
    }

    if (typeof errorObj?.message === 'string') {
      return errorObj.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'Erro desconhecido';
  }
}

export default new ApiService();