import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import ApiService from '../services/ApiService';
import OfflineSyncService from '../services/OfflineSyncService';
import IconImage from './IconImage';
import Judge0Service, { LANGUAGE_JUDGE0_MAP, DEFAULT_LANGUAGE_ID } from '../services/Judge0Service';

interface ITest {
  input: string;
  expectedOutput: string;
  description?: string;
}

interface CreateChallengeData {
  title: string;
  subject: string;
  description: string;
  difficulty: number;
  codeTemplate: string;
  isPublic: boolean;
  languageId?: string;
  tests: ITest[];
}

interface Language {
  id: string;
  name: string;
  slug?: string;
}

interface CreateChallengeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (challenge: any) => void;
  groupId?: string;
}

const difficultyOptions = [
  { value: 1, label: 'Fácil', xp: 50, color: '#10b981' },
  { value: 2, label: 'Médio', xp: 100, color: '#f59e0b' },
  { value: 3, label: 'Difícil', xp: 200, color: '#ef4444' },
  { value: 4, label: 'Expert', xp: 350, color: '#8b5cf6' },
  { value: 5, label: 'Master', xp: 500, color: '#1f2937' },
];

const codeTemplates: Record<string, string> = {
  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        // Escreva seu código aqui
        
        scanner.close();
    }
}`,
  python: `# Escreva seu código aqui

def main():
    pass

if __name__ == "__main__":
    main()`,
  javascript: `// Escreva seu código aqui

function main() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    // Seu código aqui
}

main();`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Escreva seu código aqui
    
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    // Escreva seu código aqui
    
    return 0;
}`,
};

const getBaseXpByDifficulty = (difficulty: number): number => {
  const option = difficultyOptions.find(d => d.value === difficulty);
  return option?.xp || 0;
};

export default function CreateChallengeModal({
  visible,
  onClose,
  onSuccess,
  groupId,
}: CreateChallengeModalProps) {
  const { colors } = useTheme();

  const [formData, setFormData] = useState<CreateChallengeData>({
    title: '',
    subject: '',
    description: '',
    difficulty: 1,
    codeTemplate: codeTemplates.java,
    isPublic: !groupId, // Se for grupo, não é público por padrão
    languageId: undefined,
    tests: [
      { input: '', expectedOutput: '', description: '' },
      { input: '', expectedOutput: '', description: '' },
    ],
  });

  const [languages, setLanguages] = useState<Language[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'code' | 'tests'>('info');
  const [formError, setFormError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [createdExercise, setCreatedExercise] = useState<any | null>(null);

  useEffect(() => {
    if (!visible) return;
    
    setLoadingLanguages(true);
    ApiService.getLanguages()
      .then((response: any) => {
        const items = Array.isArray(response) ? response : (response?.items || []);
        setLanguages(items);
        
        if (items.length > 0 && !formData.languageId) {
          const javaLang = items.find((l: Language) => 
            l.name?.toLowerCase() === 'java' || l.slug?.toLowerCase() === 'java'
          );
          if (javaLang) {
            setFormData(prev => ({ ...prev, languageId: javaLang.id }));
          }
        }
      })
      .catch(() => setLanguages([]))
      .finally(() => setLoadingLanguages(false));
  }, [visible]);

  const handleClose = useCallback(() => {
    setFormData({
      title: '',
      subject: '',
      description: '',
      difficulty: 1,
      codeTemplate: codeTemplates.java,
      isPublic: !groupId,
      languageId: undefined,
      tests: [
        { input: '', expectedOutput: '', description: '' },
        { input: '', expectedOutput: '', description: '' },
      ],
    });
    setFormError('');
    setTestResult(null);
    setTestError(null);
    setTestInput('');
    setActiveTab('info');
    setShowSuccessModal(false);
    setSuccessCode(null);
    setCreatedExercise(null);
    onClose();
  }, [groupId, onClose]);

  const handleLanguageChange = (languageId: string) => {
    setFormData(prev => {
      const selectedLang = languages.find(l => l.id === languageId);
      const slug = selectedLang?.slug?.toLowerCase() || selectedLang?.name?.toLowerCase() || 'java';
      const template = codeTemplates[slug] || codeTemplates.java;
      
      return {
        ...prev,
        languageId,
        codeTemplate: template,
      };
    });
  };

  const addTest = () => {
    setFormData(prev => ({
      ...prev,
      tests: [...prev.tests, { input: '', expectedOutput: '', description: '' }],
    }));
  };

  const removeTest = (index: number) => {
    if (formData.tests.length <= 2) {
      Alert.alert('Aviso', 'É necessário manter pelo menos 2 testes.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      tests: prev.tests.filter((_, i) => i !== index),
    }));
  };

  const updateTest = (index: number, field: keyof ITest, value: string) => {
    setFormData(prev => {
      const tests = [...prev.tests];
      tests[index] = { ...tests[index], [field]: value };
      return { ...prev, tests };
    });
  };

  const handleTestCode = async () => {
    if (!formData.codeTemplate.trim()) {
      setTestError('Digite algum código para testar');
      setTestResult(null);
      return;
    }

    let judge0LanguageId = DEFAULT_LANGUAGE_ID;
    if (formData.languageId) {
      const selectedLang = languages.find(l => l.id === formData.languageId);
      if (selectedLang) {
        const slug = selectedLang.slug?.toLowerCase() || selectedLang.name?.toLowerCase() || '';
        judge0LanguageId = LANGUAGE_JUDGE0_MAP[slug] || DEFAULT_LANGUAGE_ID;
      }
    }

    setIsTesting(true);
    setTestError(null);
    setTestResult(null);

    try {
      const inputToUse = testInput.trim() || undefined;
      const result = await Judge0Service.executeCode(
        formData.codeTemplate,
        judge0LanguageId,
        inputToUse
      );

      if (!result.sucesso) {
        throw new Error(result.resultado || 'Erro na execução do código');
      }

      setTestResult(result.resultado || 'Código executado com sucesso!');
    } catch (error: any) {
      setTestResult(null);
      setTestError(error?.message || 'Não foi possível testar o código.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async () => {
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Título é obrigatório.');
      setActiveTab('info');
      return;
    }
    if (!formData.subject.trim()) {
      setFormError('Assunto é obrigatório.');
      setActiveTab('info');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Descrição é obrigatória.');
      setActiveTab('info');
      return;
    }
    if (!formData.languageId) {
      setFormError('Selecione uma linguagem.');
      setActiveTab('info');
      return;
    }

    const validTests = formData.tests.filter(
      test => test.expectedOutput && test.expectedOutput.trim().length > 0
    );
    if (validTests.length < 2) {
      setFormError('É necessário pelo menos 2 testes com saída esperada.');
      setActiveTab('tests');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        title: formData.title.trim(),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        difficulty: formData.difficulty,
        codeTemplate: formData.codeTemplate,
        isPublic: groupId ? false : formData.isPublic,
        languageId: formData.languageId,
        tests: validTests,
      };

      if (groupId) {
        payload.groupId = groupId;
      }

      const isOnline = await OfflineSyncService.isOnline();
      const challengeData = {
        title: payload.title,
        description: payload.description,
        difficulty: payload.difficulty,
        codeTemplate: payload.codeTemplate,
        isPublic: groupId ? false : payload.isPublic,
        languageId: payload.languageId,
        xp: getBaseXpByDifficulty(payload.difficulty),
        tests: validTests,
      };

      let created: any;

      if (!isOnline) {
        // Offline: salva localmente para sincronização posterior
        const offlineId = await OfflineSyncService.savePendingChallenge({
          type: groupId ? 'groupChallenge' : 'challenge',
          data: {
            ...challengeData,
            groupId: groupId,
          },
        });

        Alert.alert(
          'Salvo Offline',
          'Seu desafio foi salvo localmente e será enviado automaticamente quando a conexão for restaurada.',
          [
            {
              text: 'OK',
              onPress: () => {
                onSuccess({ id: offlineId, ...challengeData, isOffline: true });
                onClose();
              },
            },
          ]
        );
        return;
      }

      // Online: cria normalmente
      if (groupId) {
        created = await ApiService.createGroupChallenge(groupId, challengeData);
      } else {
        created = await ApiService.createChallenge(challengeData);
      }

      const exercise = created?.exercise || created;
      const code = exercise?.publicCode || exercise?.public_code || exercise?.code;

      setCreatedExercise(exercise);
      setSuccessCode(code);
      setShowSuccessModal(true);
    } catch (error: any) {
      const errorMessage = ApiService.handleError(error);
      
      // Se falhar e estiver online, tenta salvar offline como fallback
      const isOnline = await OfflineSyncService.isOnline();
      if (!isOnline) {
        try {
          const offlineId = await OfflineSyncService.savePendingChallenge({
            type: groupId ? 'groupChallenge' : 'challenge',
            data: {
              title: formData.title.trim(),
              description: formData.description.trim(),
              difficulty: formData.difficulty,
              codeTemplate: formData.codeTemplate,
              isPublic: groupId ? false : formData.isPublic,
              languageId: formData.languageId,
              xp: getBaseXpByDifficulty(formData.difficulty),
              groupId: groupId,
            },
          });

          Alert.alert(
            'Salvo Offline',
            'Seu desafio foi salvo localmente e será enviado automaticamente quando a conexão for restaurada.',
            [
              {
                text: 'OK',
                onPress: () => {
                  onSuccess({ id: offlineId, isOffline: true });
                  onClose();
                },
              },
            ]
          );
          return;
        } catch (offlineError) {
          // Se falhar ao salvar offline também, mostra o erro original
        }
      }

      Alert.alert('Erro', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validTestsCount = formData.tests.filter(
    t => t.expectedOutput && t.expectedOutput.trim().length > 0
  ).length;

  const selectedDifficulty = difficultyOptions.find(d => d.value === formData.difficulty);

  return (
    <>
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: colors.textSecondary }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Criar Desafio
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.headerButton}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.headerButtonText, { color: colors.primary, fontWeight: '600' }]}>
                Criar
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.tabsContainer, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'info' && [styles.tabActive, { borderBottomColor: colors.primary }],
            ]}
            onPress={() => setActiveTab('info')}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={activeTab === 'info' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'info' ? colors.primary : colors.textSecondary },
              ]}
            >
              Informações
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'code' && [styles.tabActive, { borderBottomColor: colors.primary }],
            ]}
            onPress={() => setActiveTab('code')}
          >
            <Ionicons
              name="code-slash-outline"
              size={20}
              color={activeTab === 'code' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'code' ? colors.primary : colors.textSecondary },
              ]}
            >
              Código
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'tests' && [styles.tabActive, { borderBottomColor: colors.primary }],
            ]}
            onPress={() => setActiveTab('tests')}
          >
            <Ionicons
              name="flask-outline"
              size={20}
              color={activeTab === 'tests' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'tests' ? colors.primary : colors.textSecondary },
              ]}
            >
              Testes ({validTestsCount}/2)
            </Text>
          </TouchableOpacity>
        </View>

        {formError ? (
          <View style={[styles.errorBanner, { backgroundColor: '#fef2f2' }]}>
            <Ionicons name="alert-circle" size={20} color="#ef4444" />
            <Text style={styles.errorBannerText}>{formError}</Text>
          </View>
        ) : null}

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'info' && (
              <View style={styles.tabContent}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Título <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.card,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={formData.title}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                    placeholder="Digite o título do desafio"
                    placeholderTextColor={colors.textSecondary}
                    maxLength={100}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Assunto <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.card,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={formData.subject}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, subject: text }))}
                    placeholder="Ex: Algoritmos, Estrutura de Dados..."
                    placeholderTextColor={colors.textSecondary}
                    maxLength={50}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Linguagem <Text style={styles.required}>*</Text>
                  </Text>
                  {loadingLanguages ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.languageScroll}
                    >
                      {languages.map((lang) => (
                        <TouchableOpacity
                          key={lang.id}
                          style={[
                            styles.languageChip,
                            {
                              borderColor: formData.languageId === lang.id
                                ? colors.primary
                                : colors.border,
                              backgroundColor: formData.languageId === lang.id
                                ? `${colors.primary}20`
                                : colors.card,
                            },
                          ]}
                          onPress={() => handleLanguageChange(lang.id)}
                        >
                          <Text
                            style={[
                              styles.languageChipText,
                              {
                                color: formData.languageId === lang.id
                                  ? colors.primary
                                  : colors.text,
                              },
                            ]}
                          >
                            {lang.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Descrição <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      {
                        backgroundColor: colors.card,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={formData.description}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                    placeholder="Descreva o desafio detalhadamente..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={2000}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Dificuldade <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.difficultyContainer}>
                    {difficultyOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.difficultyOption,
                          {
                            borderColor: formData.difficulty === option.value
                              ? option.color
                              : colors.border,
                            backgroundColor: formData.difficulty === option.value
                              ? `${option.color}15`
                              : colors.card,
                          },
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, difficulty: option.value }))}
                      >
                        <Text
                          style={[
                            styles.difficultyLabel,
                            {
                              color: formData.difficulty === option.value
                                ? option.color
                                : colors.text,
                            },
                          ]}
                        >
                          {option.label}
                        </Text>
                        <Text
                          style={[
                            styles.difficultyXp,
                            {
                              color: formData.difficulty === option.value
                                ? option.color
                                : colors.textSecondary,
                            },
                          ]}
                        >
                          {option.xp} XP
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={[styles.xpInfo, { backgroundColor: colors.card }]}>
                    <Ionicons name="trophy" size={18} color={selectedDifficulty?.color || colors.primary} />
                    <Text style={[styles.xpInfoText, { color: colors.text }]}>
                      XP Base: <Text style={{ fontWeight: '700', color: selectedDifficulty?.color }}>
                        {getBaseXpByDifficulty(formData.difficulty)} XP
                      </Text>
                    </Text>
                  </View>
                </View>

                {!groupId && (
                  <View style={styles.inputGroup}>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: colors.primary,
                            backgroundColor: formData.isPublic ? colors.primary : 'transparent',
                          },
                        ]}
                      >
                        {formData.isPublic && (
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        )}
                      </View>
                      <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                        Desafio público (visível para todos)
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {activeTab === 'code' && (
              <View style={styles.tabContent}>
                <View style={styles.inputGroup}>
                  <View style={styles.codeHeader}>
                    <Text style={[styles.label, { color: colors.text }]}>
                      Template de Código
                    </Text>
                    <TouchableOpacity
                      style={[styles.testButton, { backgroundColor: colors.primary }]}
                      onPress={handleTestCode}
                      disabled={isTesting}
                    >
                      {isTesting ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="play" size={16} color="#fff" />
                          <Text style={styles.testButtonText}>Testar</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.codeEditorContainer, { backgroundColor: '#1e1e1e' }]}>
                    <TextInput
                      style={styles.codeEditor}
                      value={formData.codeTemplate}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, codeTemplate: text }))}
                      placeholder="// Escreva seu código aqui..."
                      placeholderTextColor="#6b7280"
                      multiline
                      textAlignVertical="top"
                      autoCapitalize="none"
                      autoCorrect={false}
                      spellCheck={false}
                    />
                  </View>
                </View>

                <View style={styles.consoleContainer}>
                  <View style={styles.consoleRow}>
                    <View style={[styles.consolePanel, { borderColor: '#3b82f6' }]}>
                      <View style={[styles.consolePanelHeader, { backgroundColor: '#1e3a8a' }]}>
                        <Ionicons name="enter-outline" size={14} color="#93c5fd" />
                        <Text style={styles.consolePanelHeaderText}>Input (stdin)</Text>
                      </View>
                      <TextInput
                        style={[styles.consoleInput, { backgroundColor: colors.card, color: colors.text }]}
                        value={testInput}
                        onChangeText={setTestInput}
                        placeholder="Digite as entradas&#10;Uma por linha"
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        textAlignVertical="top"
                      />
                    </View>

                    <View style={[styles.consolePanel, { borderColor: '#10b981' }]}>
                      <View style={[styles.consolePanelHeader, { backgroundColor: '#065f46' }]}>
                        <Ionicons name="exit-outline" size={14} color="#6ee7b7" />
                        <Text style={[styles.consolePanelHeaderText, { color: '#6ee7b7' }]}>
                          Output
                        </Text>
                      </View>
                      <View style={[styles.consoleOutput, { backgroundColor: colors.card }]}>
                        {isTesting ? (
                          <Text style={[styles.consoleOutputText, { color: colors.textSecondary }]}>
                            Executando...
                          </Text>
                        ) : testResult ? (
                          <Text style={[styles.consoleOutputText, { color: '#10b981' }]}>
                            {testResult}
                          </Text>
                        ) : testError ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <IconImage type="error" size={16} />
                            <Text style={[styles.consoleOutputText, { color: '#ef4444' }]}>
                              {testError}
                            </Text>
                          </View>
                        ) : (
                          <Text style={[styles.consoleOutputText, { color: colors.textSecondary }]}>
                            Execute para ver o resultado...
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'tests' && (
              <View style={styles.tabContent}>
                <View style={[styles.testsInfo, { backgroundColor: colors.card }]}>
                  <View style={styles.testsInfoHeader}>
                    <Ionicons name="flask" size={20} color={colors.primary} />
                    <Text style={[styles.testsInfoTitle, { color: colors.text }]}>
                      Testes do Desafio
                    </Text>
                  </View>
                  <Text style={[styles.testsInfoDesc, { color: colors.textSecondary }]}>
                    Adicione pelo menos <Text style={{ fontWeight: '700' }}>2 testes obrigatórios</Text> para 
                    validar o código dos usuários. Cada teste deve ter uma{' '}
                    <Text style={{ fontWeight: '700' }}>saída esperada</Text>.
                  </Text>
                  <View style={styles.testsInfoStatus}>
                    {validTestsCount >= 2 ? (
                      <>
                        <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                        <Text style={[styles.testsInfoStatusText, { color: '#10b981' }]}>
                          {validTestsCount} teste(s) válido(s) - Mínimo atingido!
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="warning" size={18} color="#f59e0b" />
                        <Text style={[styles.testsInfoStatusText, { color: '#f59e0b' }]}>
                          {validTestsCount} de 2 testes obrigatórios
                        </Text>
                      </>
                    )}
                  </View>
                </View>

                {formData.tests.map((test, index) => (
                  <View
                    key={index}
                    style={[styles.testCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <View style={styles.testCardHeader}>
                      <Text style={[styles.testCardTitle, { color: colors.text }]}>
                        Teste #{index + 1}
                      </Text>
                      {formData.tests.length > 2 && (
                        <TouchableOpacity
                          style={styles.removeTestButton}
                          onPress={() => removeTest(index)}
                        >
                          <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.testField}>
                      <Text style={[styles.testFieldLabel, { color: colors.text }]}>
                        Entrada (stdin){' '}
                        <Text style={{ color: colors.textSecondary, fontWeight: '400' }}>
                          Opcional
                        </Text>
                      </Text>
                      <TextInput
                        style={[
                          styles.testFieldInput,
                          { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                        ]}
                        value={test.input}
                        onChangeText={(text) => updateTest(index, 'input', text)}
                        placeholder="Ex: 5 10 ou deixe vazio"
                        placeholderTextColor={colors.textSecondary}
                        multiline
                      />
                    </View>

                    <View style={styles.testField}>
                      <Text style={[styles.testFieldLabel, { color: colors.text }]}>
                        Saída Esperada (stdout){' '}
                        <Text style={{ color: '#ef4444' }}>*</Text>
                      </Text>
                      <TextInput
                        style={[
                          styles.testFieldInput,
                          {
                            backgroundColor: colors.background,
                            color: colors.text,
                            borderColor: !test.expectedOutput.trim() ? '#ef4444' : colors.border,
                          },
                        ]}
                        value={test.expectedOutput}
                        onChangeText={(text) => updateTest(index, 'expectedOutput', text)}
                        placeholder="Ex: 15 ou Hello World"
                        placeholderTextColor={colors.textSecondary}
                        multiline
                      />
                      {!test.expectedOutput.trim() && (
                        <Text style={styles.testFieldError}>
                          Saída esperada é obrigatória
                        </Text>
                      )}
                    </View>

                    <View style={styles.testField}>
                      <Text style={[styles.testFieldLabel, { color: colors.text }]}>
                        Descrição{' '}
                        <Text style={{ color: colors.textSecondary, fontWeight: '400' }}>
                          Opcional
                        </Text>
                      </Text>
                      <TextInput
                        style={[
                          styles.testFieldInput,
                          { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                        ]}
                        value={test.description || ''}
                        onChangeText={(text) => updateTest(index, 'description', text)}
                        placeholder="Ex: Testa soma de números positivos"
                        placeholderTextColor={colors.textSecondary}
                      />
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.addTestButton, { borderColor: colors.border }]}
                  onPress={addTest}
                >
                  <Ionicons name="add" size={20} color={colors.primary} />
                  <Text style={[styles.addTestButtonText, { color: colors.primary }]}>
                    Adicionar Teste
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>

    {/* Modal de Sucesso */}
    <Modal
      visible={showSuccessModal}
      transparent
      animationType="fade"
      onRequestClose={() => {
        setShowSuccessModal(false);
        onSuccess(createdExercise || { publicCode: successCode });
        handleClose();
      }}
    >
      <TouchableWithoutFeedback onPress={() => {
        setShowSuccessModal(false);
        onSuccess(createdExercise || { publicCode: successCode });
        handleClose();
      }}>
        <View style={styles.successModalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.successModalContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.successIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <IconImage type="celebration" size={60} />
              </View>
              <Text style={[styles.successTitle, { color: colors.text }]}>Sucesso!</Text>
              <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
                {successCode
                  ? `Desafio criado com sucesso!\n\nCódigo: ${successCode}`
                  : 'Desafio criado com sucesso!'}
              </Text>
              <TouchableOpacity
                style={[styles.successButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setShowSuccessModal(false);
                  onSuccess(createdExercise || { publicCode: successCode });
                  handleClose();
                }}
              >
                <Text style={styles.successButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    minWidth: 70,
  },
  headerButtonText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  errorBannerText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  tabContent: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1.5,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  languageScroll: {
    flexGrow: 0,
  },
  languageChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  languageChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  difficultyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  difficultyOption: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  difficultyLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  difficultyXp: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  xpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 8,
  },
  xpInfoText: {
    fontSize: 14,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 15,
    flex: 1,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  codeEditorContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  codeEditor: {
    minHeight: 250,
    padding: 14,
    color: '#e2e8f0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  consoleContainer: {
    marginTop: 8,
  },
  consoleRow: {
    flexDirection: 'column',
    gap: 12,
  },
  consolePanel: {
    borderRadius: 10,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  consolePanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  consolePanelHeaderText: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '600',
  },
  consoleInput: {
    minHeight: 80,
    padding: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
  },
  consoleOutput: {
    minHeight: 80,
    padding: 12,
  },
  consoleOutputText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 18,
  },
  testsInfo: {
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  testsInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testsInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  testsInfoDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  testsInfoStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  testsInfoStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  testCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  testCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  removeTestButton: {
    padding: 6,
  },
  testField: {
    gap: 6,
  },
  testFieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  testFieldInput: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    minHeight: 50,
  },
  testFieldError: {
    color: '#ef4444',
    fontSize: 12,
  },
  addTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 8,
  },
  addTestButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  successButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  successButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

