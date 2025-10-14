import { Alert } from 'react-native';
import UserService from '../services/UserService';
import { User } from '../models/UserModel';

/**
 * UserController
 * Camada de controle entre a UI e o Service
 * Responsável por validações e lógica de negócios
 */
class UserController {
  /**
   * Valida email
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida senha
   */
  static validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 6) {
      return { valid: false, message: 'A senha deve ter no mínimo 6 caracteres' };
    }
    if (password.length > 50) {
      return { valid: false, message: 'A senha deve ter no máximo 50 caracteres' };
    }
    return { valid: true };
  }

  /**
   * Valida nome
   */
  static validateName(name: string): { valid: boolean; message?: string } {
    if (name.trim().length < 3) {
      return { valid: false, message: 'O nome deve ter no mínimo 3 caracteres' };
    }
    if (name.trim().length > 100) {
      return { valid: false, message: 'O nome deve ter no máximo 100 caracteres' };
    }
    return { valid: true };
  }

  /**
   * Registra um novo usuário com validações
   */
  static async registerUser(
    name: string,
    email: string,
    password: string,
    college?: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Validações
      const nameValidation = this.validateName(name);
      if (!nameValidation.valid) {
        return { success: false, error: nameValidation.message };
      }

      if (!this.validateEmail(email)) {
        return { success: false, error: 'Email inválido' };
      }

      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.message };
      }

      // Cria o usuário
      const user = await UserService.createUser(name, email, password, college);
      
      return { success: true, user };
    } catch (error: any) {
      console.error('Erro no UserController.registerUser:', error);
      return { success: false, error: error.message || 'Erro ao registrar usuário' };
    }
  }

  /**
   * Autentica um usuário
   */
  static async authenticateUser(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      if (!email || !password) {
        return { success: false, error: 'Preencha todos os campos' };
      }

      if (!this.validateEmail(email)) {
        return { success: false, error: 'Email inválido' };
      }

      const user = await UserService.authenticateUser(email, password);

      if (!user) {
        return { success: false, error: 'Email ou senha incorretos' };
      }

      return { success: true, user };
    } catch (error: any) {
      console.error('Erro no UserController.authenticateUser:', error);
      return { success: false, error: 'Erro ao fazer login' };
    }
  }

  /**
   * Atualiza dados do usuário com validações
   */
  static async updateUserData(
    userId: string | number,
    data: Partial<User>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validações
      if (data.name) {
        const nameValidation = this.validateName(data.name);
        if (!nameValidation.valid) {
          return { success: false, error: nameValidation.message };
        }
      }

      if (data.email && !this.validateEmail(data.email)) {
        return { success: false, error: 'Email inválido' };
      }

      if (data.password) {
        const passwordValidation = this.validatePassword(data.password);
        if (!passwordValidation.valid) {
          return { success: false, error: passwordValidation.message };
        }
      }

      const updated = await UserService.updateUser(userId, data);

      if (!updated) {
        return { success: false, error: 'Não foi possível atualizar' };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erro no UserController.updateUserData:', error);
      return { success: false, error: error.message || 'Erro ao atualizar usuário' };
    }
  }

  /**
   * Deleta um usuário com confirmação
   */
  static async deleteUserWithConfirmation(
    userId: string | number,
    onSuccess?: () => void
  ): Promise<void> {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja deletar esta conta? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              const deleted = await UserService.deleteUser(userId);
              
              if (deleted) {
                Alert.alert('Sucesso', 'Conta deletada com sucesso');
                onSuccess?.();
              } else {
                Alert.alert('Erro', 'Não foi possível deletar a conta');
              }
            } catch (error) {
              Alert.alert('Erro', 'Erro ao deletar conta');
              console.error('Erro ao deletar usuário:', error);
            }
          },
        },
      ]
    );
  }

  /**
   * Busca informações completas do usuário
   */
  static async getUserProfile(userId: string | number): Promise<User | null> {
    try {
      return await UserService.getUserById(userId);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  }

  /**
   * Verifica se um email já está cadastrado
   */
  static async isEmailAvailable(email: string): Promise<boolean> {
    try {
      const user = await UserService.getUserByEmail(email);
      return user === null;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  }
}

export default UserController;
