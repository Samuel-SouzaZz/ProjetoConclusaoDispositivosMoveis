import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Configuração da API
 *
 * Usa `EXPO_PUBLIC_API_BASE_URL` se definido (ex.: http://192.168.1.100:3000/api)
 * Caso contrário, escolhe um valor padrão por plataforma:
 * - Android (emulador): http://10.0.2.2:3000/api
 * - iOS (simulador) / Web: http://localhost:3000/api
 */
const BASE_URL = 'http://10.0.0.40:3000/api'
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (Platform.OS === 'android'
    ? 'http://10.0.0.40:3000/api'
    : 'http://localhost:3000/api');

// Chaves de armazenamento
const TOKEN_KEY = '@app:access_token';
const REFRESH_TOKEN_KEY = '@app:refresh_token';

/**
 * Serviço de API - Conecta ao backend Node.js
 */
class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token automaticamente
    this.api.interceptors.request.use(
      async (config) => {
        // Endpoints públicos que não precisam de token
        const publicEndpoints = ['/auth/login', '/auth/signup', '/auth/refresh'];
        const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
        
        // Se for endpoint público, não adicionar token e não gerar warning
        if (isPublicEndpoint) {
          return config;
        }
        
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`[ApiService] Token adicionado para ${config.method?.toUpperCase()} ${config.url}`);
        } else {
          console.warn(`[ApiService] Nenhum token encontrado para ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para tratar erros
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          console.warn(`[ApiService] 401 Unauthorized para ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
          
          // Token expirado - tentar renovar
          const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
          if (refreshToken) {
            try {
              console.log('[ApiService] Tentando renovar token...');
              const newTokens = await this.refreshTokens(refreshToken);
              await this.saveTokens(newTokens.accessToken, newTokens.refreshToken);
              console.log('[ApiService] Token renovado com sucesso');
              
              // Retentar a requisição original
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                return this.api.request(error.config);
              }
            } catch (refreshError) {
              // Falha ao renovar - fazer logout
              console.warn('[ApiService] Falha ao renovar token, limpando tokens:', refreshError);
              await this.clearTokens();
            }
          } else {
            console.warn('[ApiService] Nenhum refresh token encontrado, limpando tokens');
            await this.clearTokens();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * AUTH - Cadastro
   */
  async signup(data: {
    name: string;
    email: string;
    password: string;
    handle: string;
    collegeId?: string;
  }) {
    const response = await this.api.post('/auth/signup', data);
    const { user, tokens } = response.data;
    await this.saveTokens(tokens.accessToken, tokens.refreshToken);
    return { user, tokens };
  }


  /**
 * Retornar o token JWT salvo (para uso no AuthContext/biometria)
 */
async getToken(): Promise<string | null> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return token;
} 

  /**
   * AUTH - Login
   */
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    const { user, tokens } = response.data;
    await this.saveTokens(tokens.accessToken, tokens.refreshToken);
    return { user, tokens };
  }

  /**
   * AUTH - Renovar token
   */
  async refreshTokens(refreshToken: string) {
    const response = await this.api.post('/auth/refresh', { refreshToken });
    return response.data.tokens;
  }

  /**
   * USERS - Perfil atual
   */
  async getMe() {
    // Verificar se há token antes de fazer a requisição
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new Error('Não autenticado. Faça login novamente.');
    }
    
    const response = await this.api.get('/users/me');
    return response.data;
  }

  /**
   * USERS - Atualizar perfil
   */
  async updateMe(data: {
    name?: string;
    handle?: string;
    bio?: string;
    avatarUrl?: string;
  }) {
    const response = await this.api.patch('/users/me', data);
    return response.data;
  }

  /**
   * USERS - Perfil público
   */
  async getPublicProfile(userId: string) {
    const response = await this.api.get(`/users/${userId}/profile`);
    return response.data;
  }

  /**
   * USERS - Perfil completo com estatísticas, desafios e submissões
   * NOTA: Este endpoint não está disponível no backend atual (retorna 404)
   * Use getMe() + getMyChallenges() + getMySubmissions() como alternativa
   */
  async getUserCompleteProfile() {
    const response = await this.api.get('/users/me/profile/complete');
    return response.data;
  }

  /**
   * CHALLENGES - Criar desafio
   * Nota: O backend usa /exercises, mas na UI chamamos de "desafio"
   * IMPORTANTE: O backend espera 'baseXp', não 'xp'
   */
  async createChallenge(data: {
    title: string;
    description?: string;
    difficulty?: number;
    codeTemplate?: string;
    isPublic?: boolean;
    languageId?: string;
    baseXp?: number; // ⚠️ Backend espera 'baseXp', não 'xp'
    subject?: string;
    groupId?: string;
  }) {
    // Converter 'xp' para 'baseXp' se fornecido (compatibilidade)
    const payload: any = { ...data };
    if (payload.xp !== undefined && payload.baseXp === undefined) {
      payload.baseXp = payload.xp;
      delete payload.xp;
    }
    
    const response = await this.api.post('/exercises', payload);
    return response.data;
  }

  /**
   * CHALLENGES - Listar meus desafios
   * Nota: O backend usa /exercises/mine, mas na UI chamamos de "desafio"
   * Retorna: { items: Exercise[], total: number }
   */
  async getMyChallenges(params?: {
    page?: number;
    limit?: number;
  }) {
    // Verificar se há token antes de fazer a requisição
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new Error('Não autenticado. Faça login novamente.');
    }
    
    // O backend espera page e limit como query params
    const config = params && Object.keys(params).length > 0 ? { params } : {};
    const response = await this.api.get('/exercises/mine', config);
    return response.data; // { items: [], total: number }
  }

  /**
   * CHALLENGES - Atualizar desafio
   * Nota: O backend usa /exercises/:id, mas na UI chamamos de "desafio"
   * IMPORTANTE: O backend espera 'baseXp', não 'xp'
   */
  async updateChallenge(challengeId: string, data: {
    title?: string;
    description?: string;
    difficulty?: number;
    codeTemplate?: string;
    isPublic?: boolean;
    languageId?: string;
    baseXp?: number; // ⚠️ Backend espera 'baseXp', não 'xp'
    subject?: string;
    groupId?: string;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; // ⚠️ Uppercase
  }) {
    // Converter 'xp' para 'baseXp' se fornecido (compatibilidade)
    const payload: any = { ...data };
    if (payload.xp !== undefined && payload.baseXp === undefined) {
      payload.baseXp = payload.xp;
      delete payload.xp;
    }
    
    // Converter status para uppercase se fornecido
    if (payload.status && typeof payload.status === 'string') {
      payload.status = payload.status.toUpperCase();
    }
    
    const response = await this.api.patch(`/exercises/${challengeId}`, payload);
    return response.data;
  }

  /**
   * CHALLENGES - Excluir desafio
   * Nota: O backend usa /exercises/:id, mas na UI chamamos de "desafio"
   */
  async deleteChallenge(challengeId: string) {
    const response = await this.api.delete(`/exercises/${challengeId}`);
    return response.data;
  }

  /**
   * SUBMISSIONS - Listar minhas submissões
   * Nota: O backend usa /submissions/me
   * Retorna: { items: Submission[], total: number }
   */
  async getMySubmissions(params?: {
    page?: number;
    limit?: number;
  }) {
    // Verificar se há token antes de fazer a requisição
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new Error('Não autenticado. Faça login novamente.');
    }
    
    // O backend espera page e limit como query params
    const config = params && Object.keys(params).length > 0 ? { params } : {};
    const response = await this.api.get('/submissions/me', config);
    return response.data; // { items: [], total: number }
  }

  /**
   * COLLEGES - Listar faculdades
   */
  async getColleges() {
    const response = await this.api.get('/colleges');
    return response.data;
  }

  /**
   * CHALLENGES - Listar desafios
   * Nota: O backend usa /exercises, mas na UI chamamos de "desafio"
   */
  async getChallenges(params?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    languageId?: string;
  }) {
    const response = await this.api.get('/exercises', { params });
    return response.data;
  }

  /**
   * SUBMISSIONS - Submeter solução
   * Nota: O frontend usa "challengeId", mas o backend espera "exerciseId"
   */
  async submitChallenge(data: {
    challengeId: string;
    code: string;
    languageId: string;
  }) {
    // Converter challengeId para exerciseId para o backend
    const payload = {
      exerciseId: data.challengeId,
      code: data.code,
      languageId: data.languageId,
    };
    const response = await this.api.post('/submissions', payload);
    return response.data;
  }

  /**
   * LEADERBOARDS - Ranking geral
   * Nota: O backend não tem rota genérica /leaderboards
   * Use getGeneralLeaderboard(), getLeaderboardByLanguage(), getLeaderboardBySeason(), ou getLeaderboardByCollege()
   */
  async getLeaderboards(params?: {
    seasonId?: string;
    collegeId?: string;
    languageId?: string;
    limit?: number;
    page?: number;
  }) {
    try {
      // Se tiver seasonId, usar ranking por temporada
      if (params?.seasonId) {
        return await this.getLeaderboardBySeason(params.seasonId, { limit: params.limit, page: params.page });
      }
      
      // Se tiver collegeId, usar ranking por faculdade
      if (params?.collegeId) {
        return await this.getLeaderboardByCollege(params.collegeId, { limit: params.limit, page: params.page });
      }
      
      // Se tiver languageId, usar ranking por linguagem
      if (params?.languageId) {
        return await this.getLeaderboardByLanguage(params.languageId, { limit: params.limit, page: params.page });
      }
      
      // Caso contrário, usar ranking geral
      return await this.getGeneralLeaderboard({ limit: params?.limit, page: params?.page });
    } catch (error: any) {
      const status = error?.response?.status;
      const isNetworkIssue = !error?.response;
      // Fallback amigável para WEB quando API não está disponível (404/sem servidor)
      if (Platform.OS === 'web' && (status === 404 || isNetworkIssue)) {
        console.warn('[ApiService] /leaderboards indisponível. Usando dados mock para preview web.');
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

  /**
   * LEADERBOARDS - Ranking geral
   */
  async getGeneralLeaderboard(params?: { page?: number; limit?: number }) {
    const config = params && Object.keys(params).length > 0 ? { params } : {};
    const response = await this.api.get('/leaderboards/general', config);
    return response.data;
  }

  /**
   * LEADERBOARDS - Ranking por linguagem
   */
  async getLeaderboardByLanguage(languageId: string, params?: { page?: number; limit?: number }) {
    const config = { params: { languageId, ...params } };
    const response = await this.api.get('/leaderboards/by-language', config);
    return response.data;
  }

  /**
   * LEADERBOARDS - Ranking por temporada
   */
  async getLeaderboardBySeason(seasonId: string, params?: { page?: number; limit?: number }) {
    const config = { params: { seasonId, ...params } };
    const response = await this.api.get('/leaderboards/by-season', config);
    return response.data;
  }

  /**
   * LEADERBOARDS - Ranking por faculdade
   */
  async getLeaderboardByCollege(collegeId: string, params?: { page?: number; limit?: number }) {
    const config = { params: { collegeId, ...params } };
    const response = await this.api.get('/leaderboards/by-college', config);
    return response.data;
  }

  /**
   * LANGUAGES - Linguagens disponíveis
   */
  async getLanguages() {
    const response = await this.api.get('/languages');
    return response.data;
  }

  /**
   * GROUPS - Grupos
   */
  async getGroups() {
    const response = await this.api.get('/groups');
    return response.data;
  }

  /**
   * GROUPS - Meus grupos
   */
  async getMyGroups() {
    const response = await this.api.get('/groups/my');
    return response.data;
  }

  /**
   * GROUPS - Detalhes de um grupo
   */
  async getGroup(groupId: string) {
    const response = await this.api.get(`/groups/${groupId}`);
    return response.data;
  }

  /**
   * GROUPS - Membros do grupo
   */
  async getGroupMembers(groupId: string) {
    const response = await this.api.get(`/groups/${groupId}/members`);
    return response.data;
  }

  /**
   * GROUPS - Desafios do grupo
   * Nota: O backend usa /groups/:id/exercises (não /challenges)
   */
  async getGroupChallenges(groupId: string) {
    const response = await this.api.get(`/groups/${groupId}/exercises`);
    return response.data;
  }

  /**
   * GROUPS - Entrar/Sair do grupo
   */
  async joinGroup(groupId: string) {
    const response = await this.api.post(`/groups/${groupId}/join`);
    return response.data;
  }

  async leaveGroup(groupId: string) {
    const response = await this.api.post(`/groups/${groupId}/leave`);
    return response.data;
  }

  /**
   * STATS - Estatísticas de exercícios
   * Nota: O backend não tem rota genérica /stats
   * Use getStatsExercises() ou getUserStats(userId)
   */
  async getStats() {
    // Manter compatibilidade - redireciona para estatísticas de exercícios
    const response = await this.api.get('/stats/exercises');
    return response.data;
  }

  /**
   * STATS - Estatísticas de exercícios
   */
  async getStatsExercises(exerciseId?: string) {
    const params = exerciseId ? { exerciseId } : {};
    const response = await this.api.get('/stats/exercises', { params });
    return response.data;
  }

  /**
   * STATS - Estatísticas do usuário (scoreboard)
   */
  async getUserStats(userId: string) {
    const response = await this.api.get(`/stats/users/${userId}`);
    return response.data;
  }

  /**
   * Utilitários - Salvar tokens
   */
  private async saveTokens(accessToken: string, refreshToken: string) {
    await AsyncStorage.setItem(TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    console.log('[ApiService] Tokens salvos com sucesso');
  }

  /**
   * Utilitários - Limpar tokens (logout)
   */
  async clearTokens() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Utilitários - Verificar se está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  }

  /**
   * Utilitários - Tratamento de erros
   * Backend retorna erros no formato: { error: { message, statusCode, details } }
   */
  handleError(error: any): string {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Erro da API - Backend usa formato { error: { message, statusCode, details } }
        const errorData = error.response.data;
        const message = errorData?.error?.message || errorData?.message || errorData?.error;
        return message || 'Erro ao comunicar com o servidor';
      } else if (error.request) {
        // Sem resposta do servidor
        return 'Não foi possível conectar ao servidor. Verifique sua conexão e se o servidor está rodando em ' + BASE_URL;
      } else if (error.code === 'ECONNABORTED') {
        // Timeout
        return 'Tempo de conexão esgotado. Verifique sua conexão.';
      }
    }
    
    // Erro de rede ou outros
    if (error.message?.includes('Network Error') || error.message?.includes('network')) {
      return 'Erro de rede. Verifique sua conexão com a internet.';
    }
    
    return error.message || 'Erro desconhecido';
  }
}

export default new ApiService();


