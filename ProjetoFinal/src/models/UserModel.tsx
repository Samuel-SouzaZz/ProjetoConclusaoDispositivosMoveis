/**
 * User Model - NÃO contém senha
 * Backend gerencia senhas (armazena apenas hash)
 * Frontend usa tokens (refresh token válido 7 dias)
 */
export interface User {
  id?: string | number;
  name?: string;
  email: string;
  handle?: string;
  collegeId?: string;
  college?: string;
  level?: number;
  xpTotal?: number;
  avatarUrl?: string | null;
  bio?: string | null;
  role?: string;
  created_at?: string;
  synced_at?: string;
}
