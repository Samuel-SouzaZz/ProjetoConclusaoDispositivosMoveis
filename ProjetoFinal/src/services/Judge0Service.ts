import ApiService from './ApiService';

export const LANGUAGE_JUDGE0_MAP: Record<string, number> = {
  'java': 62,
  'python': 71,
  'javascript': 63,
  'c': 50,
  'cpp': 54,
};

export const DEFAULT_LANGUAGE_ID = 62;

class Judge0Service {
  async executeCode(
    sourceCode: string,
    languageId: number,
    input?: string
  ): Promise<{ sucesso: boolean; resultado: string }> {
    try {
      const response = await ApiService.executeCode({
        sourceCode,
        languageId,
        ...(input?.trim() ? { input } : {}),
      });
      return response;
    } catch (error: any) {
      return {
        sucesso: false,
        resultado: error?.message || 'Erro ao executar código',
      };
    }
  }
}

export default new Judge0Service();

