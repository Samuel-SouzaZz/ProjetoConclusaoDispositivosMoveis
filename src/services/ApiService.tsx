import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Configuração da API
 * 
 * ⚠️ IMPORTANTE: Configure o IP da sua máquina aqui:
 */
const LOCAL_IP = '172.20.10.2'; // 🔴 ALTERE PARA O SEU IP (use 'ipconfig' no CMD)

/**
 * Detecta automaticamente a URL baseada no ambiente:
 * - Web: usa localhost
 * - Mobile (Android/iOS): usa o IP da máquina
 */
const BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3000/api' 
  : `http://${LOCAL_IP}:3000/api`;

// Log para debug - mostra qual URL está sendo usada
console.log(` API configurada para: ${BASE_URL}`);
console.log(` Plataforma: ${Platform.OS}`);

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
      timeout: 30000, // Aumentado para 30 segundos
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token automaticamente
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
          // Token expirado - tentar renovar
          const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
          if (refreshToken) {
            try {
              const newTokens = await this.refreshTokens(refreshToken);
              await this.saveTokens(newTokens.accessToken, newTokens.refreshToken);
              // Retentar a requisição original
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                return this.api.request(error.config);
              }
            } catch {
              // Falha ao renovar - fazer logout
              await this.clearTokens();
            }
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
    // Converte collegeId para número se fornecido
    const payload = {
      ...data,
      collegeId: data.collegeId ? parseInt(data.collegeId, 10) : undefined,
    };
    
    const response = await this.api.post('/auth/signup', payload);
    const { user, tokens } = response.data;
    await this.saveTokens(tokens.accessToken, tokens.refreshToken);
    return user;
  }

  /**
   * AUTH - Login
   */
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    const { user, tokens } = response.data;
    await this.saveTokens(tokens.accessToken, tokens.refreshToken);
    return user;
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
   * COLLEGES - Listar faculdades
   */
  async getColleges() {
    const response = await this.api.get('/colleges');
    return response.data;
  }

  /**
   * EXERCISES - Listar exercícios
   */
  async getExercises(params?: {
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
   */
  async submitExercise(data: {
    exerciseId: string;
    code: string;
    languageId: string;
  }) {
    const response = await this.api.post('/submissions', data);
    return response.data;
  }

  /**
   * LEADERBOARDS - Rankings
   */
  async getLeaderboards(params?: {
    seasonId?: string;
    collegeId?: string;
    limit?: number;
  }) {
    const response = await this.api.get('/leaderboards', { params });
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
   * STATS - Estatísticas
   */
  async getStats() {
    const response = await this.api.get('/stats');
    return response.data;
  }

  /**
   * Utilitários - Salvar tokens
   */
  private async saveTokens(accessToken: string, refreshToken: string) {
    await AsyncStorage.setItem(TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
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
   */
  handleError(error: any): string {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Erro da API
        const message = error.response.data?.message || error.response.data?.error;
        return message || 'Erro ao comunicar com o servidor';
      } else if (error.request) {
        // Sem resposta do servidor
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          return `⚠️ BACKEND NÃO RESPONDEU!\n\nVerifique:\n1. Backend está rodando?\n2. URL correta: ${BASE_URL}\n3. Firewall bloqueando?`;
        }
        return `Não foi possível conectar ao servidor.\n\nURL tentada: ${BASE_URL}\n\nVerifique se o backend está rodando.`;
      }
    }
    return error.message || 'Erro desconhecido';
  }
}

export default new ApiService();

